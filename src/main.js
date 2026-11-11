import { showAtlasDebug } from './render/atlas.js';
import * as THREE from '../vendor/three.module.js';

const game = document.querySelector('#game');
if (new URLSearchParams(location.search).has('atlas')) {
  showAtlasDebug(game);
} else {
const loading = document.querySelector('#loading');
const fpsLabel = document.querySelector('#fps');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.05, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x78a7ff, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
game.prepend(renderer.domElement);

const skyGeometry = new THREE.PlaneGeometry(2, 2);
const skyMaterial = new THREE.ShaderMaterial({
  depthTest: false,
  depthWrite: false,
  vertexShader: 'void main(){gl_Position=vec4(position,1.0);}',
  fragmentShader: 'void main(){vec3 low=vec3(0.776,0.855,1.0);vec3 high=vec3(0.471,0.655,1.0);gl_FragColor=vec4(mix(low,high,gl_FragCoord.y/900.0),1.0);}'
});
scene.add(new THREE.Mesh(skyGeometry, skyMaterial));

let frames = 0;
let sampleStart = performance.now();
function frame(now) {
  renderer.render(scene, camera);
  frames += 1;
  if (now - sampleStart >= 500) {
    fpsLabel.textContent = `FPS: ${Math.round(frames * 1000 / (now - sampleStart))}`;
    frames = 0;
    sampleStart = now;
  }
  requestAnimationFrame(frame);
}
function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
}
addEventListener('resize', resize, { passive: true });
window.__cubeworld = { ready: true, renderer, phase: 0 };
loading.classList.add('hidden');
requestAnimationFrame(frame);
}
