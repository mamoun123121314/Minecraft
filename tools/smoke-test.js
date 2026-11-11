import { mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import puppeteer from 'puppeteer';

const port = 4173;
const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { stdio: 'ignore' });
const errors = [];
let browser;
try {
  await new Promise((resolve) => setTimeout(resolve, 500));
  browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => { if (new URL(request.url()).origin !== `http://127.0.0.1:${port}`) errors.push(`External request: ${request.url()}`); });
  await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__cubeworld?.ready === true, { timeout: 10000 });
  const phaseTwo = await page.evaluate(() => ({ phase: window.__cubeworld.phase, calls: window.__cubeworld.drawCalls(), vertices: window.__cubeworld.geometry.attributes.position.count, hash: window.__cubeworld.terrainHash }));
  if (phaseTwo.phase !== 9 || phaseTwo.calls > 40 || phaseTwo.vertices < 1000 || !phaseTwo.hash) errors.push(`Invalid Phase 2 scene: ${JSON.stringify(phaseTwo)}`);
  const renderLayers = await page.evaluate(() => Object.fromEntries(Object.entries(window.__cubeworld.materials).map(([name, material]) => [name, { transparent: material.transparent, depthWrite: material.depthWrite, alphaTest: material.alphaTest }])));
  if (!renderLayers.opaque || !renderLayers.translucent || renderLayers.translucent.depthWrite || !renderLayers.cutout || renderLayers.cutout.alphaTest !== 0.5) errors.push(`Invalid material layers: ${JSON.stringify(renderLayers)}`);
  const remesh = await page.evaluate(async () => { const before = window.__cubeworld.terrainGroup.children.find(mesh => mesh.userData.cx === 0 && mesh.userData.cz === 0)?.uuid; const y = window.__cubeworld.world.highestSolid(8, 8) + 1; window.__cubeworld.world.setBlock(8, y, 8, 3); await window.__cubeworld.remeshAt(8, 8); const after = window.__cubeworld.terrainGroup.children.find(mesh => mesh.userData.cx === 0 && mesh.userData.cz === 0)?.uuid; return { before, after, id: window.__cubeworld.world.getBlock(8, y, 8) }; });
  if (!remesh.before || !remesh.after || remesh.before === remesh.after || remesh.id !== 3) errors.push(`Invalid live block remesh: ${JSON.stringify(remesh)}`);
  const streaming = await page.evaluate(async () => { window.__cubeworld.player.position.x = 40; window.__cubeworld.player.position.z = 8; await window.__cubeworld.updateStreaming(40, 8); return { chunks: window.__cubeworld.terrainGroup.children.length, generated: !!window.__cubeworld.world.getChunk(2, 0), volume: window.__cubeworld.world.getChunk(2, 0)?.blocks.length }; });
  if (streaming.chunks !== 9 || !streaming.generated || streaming.volume !== 98304) errors.push(`Invalid streaming world: ${JSON.stringify(streaming)}`);
  const result = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const fps = document.querySelector('#fps');
    if (!canvas || !fps) return { canvas: false, fps: false, variation: 0 };
    const pixels = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const sample = new Uint8Array(4);
    const values = [];
    for (let i = 0; i < 500; i += 1) {
      const x = (i * 97) % canvas.width;
      const y = (i * 53) % canvas.height;
      pixels.readPixels(x, y, 1, 1, pixels.RGBA, pixels.UNSIGNED_BYTE, sample);
      values.push((sample[0] + sample[1] + sample[2]) / 3);
    }
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variation = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
    return { canvas: true, fps: getComputedStyle(fps).display !== 'none', variation, mean };
  });
  if (!result.canvas || !result.fps || result.variation <= 8) errors.push(`Invalid rendered scene: ${JSON.stringify(result)}`);
  await mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/screenshot.png' });
  await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__cubeworld?.ready === true, { timeout: 10000 });
  const mobileControls = await page.evaluate(() => ({ visible: getComputedStyle(document.querySelector('.touch-controls')).display !== 'none', chunks: window.__cubeworld.loadedChunks }));
  if (!mobileControls.visible || mobileControls.chunks < 9) errors.push(`Invalid mobile/world experience: ${JSON.stringify(mobileControls)}`);
  await page.screenshot({ path: 'artifacts/mobile.png' });
  await page.setViewport({ width: 1280, height: 720, isMobile: false, hasTouch: false });
  await page.goto(`http://127.0.0.1:${port}/?time=18000`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__cubeworld?.ready === true, { timeout: 10000 });
  await page.waitForFunction(() => window.__cubeworld.materials.opaque.color.r < 0.3, { timeout: 3000 });
  const nightLighting = await page.evaluate(() => ({ terrain: window.__cubeworld.materials.opaque.color.r, stars: window.__cubeworld.sky.stars.opacity }));
  if (nightLighting.terrain >= 0.3 || nightLighting.stars <= 0.8) errors.push(`Invalid nighttime lighting: ${JSON.stringify(nightLighting)}`);
  await page.screenshot({ path: 'artifacts/night.png' });
  await page.goto(`http://127.0.0.1:${port}/?atlas`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__cubeworld?.ready === true && window.__cubeworld?.atlasCount >= 110, { timeout: 10000 });
  const atlasResult = await page.evaluate(() => ({ count: document.querySelectorAll('.atlas-grid figure').length, sizes: [...document.querySelectorAll('.atlas-grid canvas')].every((canvas) => canvas.width === 16 && canvas.height === 16), blocks: window.__cubeworld.blockCount, missing: window.__cubeworld.missingTextures, unique: window.__cubeworld.uniqueTextures }));
  if (atlasResult.count < 110 || atlasResult.blocks < 100 || atlasResult.missing.length || atlasResult.unique < 100 || !atlasResult.sizes) errors.push(`Invalid atlas: ${JSON.stringify(atlasResult)}`);
  await page.screenshot({ path: 'artifacts/atlas.png', fullPage: true });
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`Smoke test passed: mean=${result.mean.toFixed(1)}, luminance deviation=${result.variation.toFixed(1)}.`);
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
