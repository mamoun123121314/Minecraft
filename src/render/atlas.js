import * as THREE from '../../vendor/three.module.js';
import { generateTextures } from './texturegen.js';

export function buildAtlas() {
  const textures = generateTextures();
  const names = Object.keys(textures);
  const columns = 16;
  const rows = Math.ceil(names.length / columns);
  const canvas = document.createElement('canvas');
  canvas.width = columns * 16;
  canvas.height = rows * 16;
  const context = canvas.getContext('2d', { alpha: true });
  context.imageSmoothingEnabled = false;
  const uvTable = {};
  names.forEach((name, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    context.drawImage(textures[name], column * 16, row * 16);
    const u0 = (column * 16 + 0.5) / canvas.width;
    const u1 = ((column + 1) * 16 - 0.5) / canvas.width;
    const v0 = 1 - (((row + 1) * 16 - 0.5) / canvas.height);
    const v1 = 1 - ((row * 16 + 0.5) / canvas.height);
    uvTable[name] = [u0, v0, u1, v1];
  });
  const atlas = new THREE.CanvasTexture(canvas);
  atlas.magFilter = THREE.NearestFilter;
  atlas.minFilter = THREE.NearestFilter;
  atlas.generateMipmaps = false;
  atlas.colorSpace = THREE.SRGBColorSpace;
  atlas.wrapS = THREE.ClampToEdgeWrapping;
  atlas.wrapT = THREE.ClampToEdgeWrapping;
  atlas.needsUpdate = true;
  return { atlas, canvas, names, textures, uvTable, columns, rows };
}

export function showAtlasDebug(root) {
  const { names, textures } = buildAtlas();
  document.body.classList.add('atlas-page');
  root.replaceChildren();
  const header = document.createElement('header');
  header.innerHTML = '<h1>Procedural Texture Atlas</h1><p>16 × 16 texels · nearest-neighbour · generated at boot</p>';
  const grid = document.createElement('section');
  grid.className = 'atlas-grid';
  for (const name of names) {
    const figure = document.createElement('figure');
    const preview = document.createElement('canvas');
    preview.width = 16;
    preview.height = 16;
    preview.getContext('2d').drawImage(textures[name], 0, 0);
    const caption = document.createElement('figcaption');
    caption.textContent = name;
    figure.append(preview, caption);
    grid.append(figure);
  }
  root.append(header, grid);
  window.__cubeworld = { ready: true, phase: 1, atlasCount: names.length };
}
