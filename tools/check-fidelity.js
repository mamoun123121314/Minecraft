import { readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { parse } from 'acorn';
import { execFileSync } from 'node:child_process';

const roots = ['src', 'vendor'];
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
for (const required of ['index.html', 'style.css', 'src/main.js', 'vendor/three.module.js', 'SPEC.md', 'README.md', 'LICENSE']) {
  await readFile(required);
}
console.log(`Fidelity checks passed (${files.length} source files checked).`);
