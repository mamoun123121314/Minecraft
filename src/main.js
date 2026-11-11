import { showAtlasDebug } from './render/atlas.js';
import { createTerrainScene } from './render/renderer.js';
import { Player } from './player/player.js';
import {Inventory} from './player/inventory.js';import{MiningSystem,raycast}from'./player/mining.js';import{createHighlight}from'./render/highlight.js';import{createHud}from'./ui/hud.js';
const game=document.querySelector('#game');
if(new URLSearchParams(location.search).has('atlas'))showAtlasDebug(game);
else{
 const loading=document.querySelector('#loading'),fpsLabel=document.querySelector('#fps');
 const terrain=await createTerrainScene(game);const player=new Player(terrain.camera,terrain.physicsBlocks);
 const inventory=new Inventory(),hud=createHud(inventory),mining=new MiningSystem(terrain.physicsBlocks),highlight=createHighlight(terrain.scene);let miningHeld=false;addEventListener('mousedown',e=>{if(e.button===0)miningHeld=true});addEventListener('mouseup',e=>{if(e.button===0)miningHeld=false});addEventListener('keydown',e=>{if(/^Digit[1-9]$/.test(e.code)){inventory.select(+e.code.at(-1)-1);hud.select(inventory.selected);}});
 let frames=0,sampleStart=performance.now(),previous=performance.now(),accumulator=0;const STEP=50;
 function loop(now){accumulator=Math.min(accumulator+now-previous,250);previous=now;while(accumulator>=STEP){player.tick();const direction={x:-Math.sin(player.yaw)*Math.cos(player.pitch),y:Math.sin(player.pitch),z:-Math.cos(player.yaw)*Math.cos(player.pitch)};const target=raycast(terrain.physicsBlocks,terrain.camera.position,direction);highlight.update(target);mining.tick(target,miningHeld,{speed:2,harvest:true});accumulator-=STEP;}frames+=1;if(now-sampleStart>=500){fpsLabel.textContent=`FPS: ${Math.round(frames*1000/(now-sampleStart))}`;frames=0;sampleStart=now;}requestAnimationFrame(loop);}
 terrain.renderer.domElement.addEventListener('click',()=>terrain.renderer.domElement.requestPointerLock());
 window.__cubeworld={ready:true,phase:4,...terrain,player,tickMs:STEP};loading.classList.add('hidden');requestAnimationFrame(loop);
}
