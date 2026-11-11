import { showAtlasDebug } from './render/atlas.js';
import { createTerrainScene } from './render/renderer.js';
import { Player } from './player/player.js';
const game=document.querySelector('#game');
if(new URLSearchParams(location.search).has('atlas'))showAtlasDebug(game);
else{
 const loading=document.querySelector('#loading'),fpsLabel=document.querySelector('#fps');
 const terrain=await createTerrainScene(game);const player=new Player(terrain.camera,terrain.physicsBlocks);
 let frames=0,sampleStart=performance.now(),previous=performance.now(),accumulator=0;const STEP=50;
 function loop(now){accumulator=Math.min(accumulator+now-previous,250);previous=now;while(accumulator>=STEP){player.tick();accumulator-=STEP;}frames+=1;if(now-sampleStart>=500){fpsLabel.textContent=`FPS: ${Math.round(frames*1000/(now-sampleStart))}`;frames=0;sampleStart=now;}requestAnimationFrame(loop);}
 terrain.renderer.domElement.addEventListener('click',()=>terrain.renderer.domElement.requestPointerLock());
 window.__cubeworld={ready:true,phase:4,...terrain,player,tickMs:STEP};loading.classList.add('hidden');requestAnimationFrame(loop);
}
