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
  await page.waitForFunction(() => window.__cubeworld?.ready === true, { timeout: 5000 });
  const phaseTwo = await page.evaluate(() => ({ phase: window.__cubeworld.phase, calls: window.__cubeworld.drawCalls(), vertices: window.__cubeworld.geometry.attributes.position.count }));
  if (phaseTwo.phase !== 2 || phaseTwo.calls > 12 || phaseTwo.vertices < 1000) errors.push(`Invalid Phase 2 scene: ${JSON.stringify(phaseTwo)}`);
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
  await page.goto(`http://127.0.0.1:${port}/?atlas`, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.__cubeworld?.ready === true && window.__cubeworld?.atlasCount >= 20, { timeout: 5000 });
  const atlasResult = await page.evaluate(() => ({ count: document.querySelectorAll('.atlas-grid figure').length, sizes: [...document.querySelectorAll('.atlas-grid canvas')].every((canvas) => canvas.width === 16 && canvas.height === 16) }));
  if (atlasResult.count < 20 || !atlasResult.sizes) errors.push(`Invalid atlas: ${JSON.stringify(atlasResult)}`);
  await page.screenshot({ path: 'artifacts/atlas.png', fullPage: true });
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`Smoke test passed: mean=${result.mean.toFixed(1)}, luminance deviation=${result.variation.toFixed(1)}.`);
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
