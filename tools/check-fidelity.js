import { readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { parse } from 'acorn';
import { execFileSync } from 'node:child_process';

const roots = ['src', 'data', 'vendor'];
const files = [];
async function walk(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const next = join(path, entry.name);
    if (entry.isDirectory()) await walk(next);
    else files.push(next);
  }
}
for (const root of roots) await walk(root);
const forbidden = /TODO|FIXME|implement here|similar for|omitted for brevity|^\s*\.\.\.\s*$/m;
for (const file of files.filter((name) => extname(name) === '.js')) {
  const source = await readFile(file, 'utf8');
  if (file.startsWith('src') && forbidden.test(source)) throw new Error(`Placeholder text in ${file}`);
  if (file.startsWith('src') && /Math\.random\s*\(/.test(source)) throw new Error(`Unseeded randomness in ${file}`);
  if (file.startsWith('src') && /(fetch\s*\(|XMLHttpRequest|new WebSocket|EventSource|https?:\/\/)/.test(source)) throw new Error(`Runtime network code in ${file}`);
  parse(source, { ecmaVersion: 2022, sourceType: 'module' });
}
const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' });
if (/\.(png|jpe?g|gif|webp|ogg|mp3|wav|glb|gltf|ttf|woff2?)$/im.test(tracked)) throw new Error('Binary asset is tracked');
for (const required of ['index.html', 'style.css', 'src/main.js', 'src/core/rng.js', 'src/core/math.js', 'src/render/texturegen.js', 'src/render/atlas.js', 'src/render/renderer.js', 'src/world/chunk.js', 'src/world/mesher.js', 'src/workers/mesh.worker.js', 'data/blocks.js', 'data/biomes.js', 'src/world/generation.js', 'src/workers/world.worker.js', 'src/player/player.js', 'src/render/sky.js', 'src/render/lighting.js', 'src/systems/time.js', 'src/systems/crafting.js', 'src/ui/inventoryui.js', 'data/items.js', 'data/recipes.js', 'data/mobs.js', 'src/systems/survival.js', 'src/systems/mobs.js', 'src/ui/screens.js', 'src/core/settings.js', 'src/core/eventbus.js', 'src/world/saver.js', 'src/systems/audio.js', 'src/systems/weather.js', 'src/render/particles.js', 'src/ui/debug.js', 'src/ui/touchcontrols.js', 'src/world/world.js', 'tools/constants.lock.json', 'data/palette.js', 'tools/palette.lock.json', 'vendor/three.module.js', 'SPEC.md', 'README.md', 'LICENSE']) {
  await readFile(required);
}
console.log(`Fidelity checks passed (${files.length} source files checked).`);

const paletteSource = await readFile('data/palette.js', 'utf8');
const paletteMatch = paletteSource.match(/export const P = (\{[\s\S]*\});/);
if (!paletteMatch) throw new Error('Palette export not found');
const palette = Function(`return (${paletteMatch[1]})`)();
const paletteLock = JSON.parse(await readFile('tools/palette.lock.json', 'utf8'));
if (JSON.stringify(palette) !== JSON.stringify(paletteLock)) throw new Error('Palette lock mismatch');
console.log(`Palette lock passed (${Object.keys(palette).length} colors).`);
