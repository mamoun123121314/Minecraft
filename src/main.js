import { showAtlasDebug } from './render/atlas.js';
import { createTerrainScene } from './render/renderer.js';

const game = document.querySelector('#game');
if (new URLSearchParams(location.search).has('atlas')) {
  showAtlasDebug(game);
} else {
  const loading = document.querySelector('#loading');
  const fpsLabel = document.querySelector('#fps');
  const terrain = await createTerrainScene(game);
  let frames = 0;
  let sampleStart = performance.now();
  function countFrame(now) {
    frames += 1;
    if (now - sampleStart >= 500) {
      fpsLabel.textContent = `FPS: ${Math.round(frames * 1000 / (now - sampleStart))}`;
      frames = 0;
      sampleStart = now;
    }
    requestAnimationFrame(countFrame);
  }
  window.__cubeworld = { ready: true, phase: 2, ...terrain };
  loading.classList.add('hidden');
  requestAnimationFrame(countFrame);
}
