import * as THREE from '../../vendor/three.module.js';
import { buildAtlas } from './atlas.js';
import { createSky } from './sky.js';


export async function createTerrainScene(game) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x78a7ff);
  scene.fog = new THREE.Fog(0xc6daff, 28, 80);
  const sky=createSky(scene,scene.fog);
  const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.05, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  game.prepend(renderer.domElement);
  const { atlas, uvTable } = buildAtlas();
  const worldWorker = new Worker(new URL('../workers/world.worker.js', import.meta.url), { type: 'module' });
  const generated = await new Promise((resolve, reject) => {
    worldWorker.onerror = reject;
    worldWorker.onmessage = ({ data }) => resolve(data);
    worldWorker.postMessage({ seed: 'Cubeworld', cx: 0, cz: 0 });
  });
  worldWorker.terminate();
  const physicsBlocks = generated.blocks.slice();
  const worker = new Worker(new URL('../workers/mesh.worker.js', import.meta.url), { type: 'module' });
  const result = await new Promise((resolve, reject) => {
    worker.onerror = reject;
    worker.onmessage = ({ data }) => resolve(data);
    worker.postMessage({ blocks: generated.blocks.buffer, uvTable }, [generated.blocks.buffer]);
  });
  worker.terminate();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(result.positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(result.normals, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(result.colors, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(result.uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(result.indices, 1));
  geometry.computeBoundingSphere();
  const material = new THREE.MeshBasicMaterial({ map: atlas, vertexColors: true });
  const terrain = new THREE.Mesh(geometry, material);
  scene.add(terrain);
  camera.rotation.order = 'YXZ';
  function render() { renderer.render(scene, camera); requestAnimationFrame(render); }
  function resize() { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); }
  addEventListener('resize', resize, { passive: true });
  requestAnimationFrame(render);
  return { renderer, scene, camera, geometry, physicsBlocks, sky, meshDuration: result.duration, terrainHash: generated.hash, biomeData: generated.biomes, drawCalls: () => renderer.info.render.calls };
}
