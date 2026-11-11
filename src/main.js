import {showAtlasDebug} from './render/atlas.js';
import {createTerrainScene} from './render/renderer.js';
import {Player} from './player/player.js';
import {WorldTime} from './systems/time.js';
import {createInventoryUI} from './ui/inventoryui.js';
import {SurvivalSystem} from './systems/survival.js';
import {MobSystem} from './systems/mobs.js';
import {WeatherSystem} from './systems/weather.js';
import {AudioSystem} from './systems/audio.js';
import {Settings} from './core/settings.js';
import {WorldSaver} from './world/saver.js';
import {ParticleSystem} from './render/particles.js';
import {createSurvivalScreens,createPauseAndSettings} from './ui/screens.js';
import {createDebug} from './ui/debug.js';
import {Inventory} from './player/inventory.js';
import {MiningSystem,raycast} from './player/mining.js';
import {createHighlight} from './render/highlight.js';
import {createHud} from './ui/hud.js';
import {placeBlock,pickBlockItem} from './world/blockactions.js';
import {createTouchControls} from './ui/touchcontrols.js';
const gameRoot=document.querySelector('#game');
if(new URLSearchParams(location.search).has('atlas'))showAtlasDebug(gameRoot);
else{
 const loading=document.querySelector('#loading'),fpsLabel=document.querySelector('#fps'),settings=new Settings();
 const terrain=await createTerrainScene(gameRoot);terrain.camera.fov=settings.get('fov');terrain.camera.updateProjectionMatrix();
 const initialTime=Number(new URLSearchParams(location.search).get('time'))||6000,worldTime=new WorldTime(initialTime),player=new Player(terrain.camera,terrain.physicsBlocks);
 const inventory=new Inventory(),hud=createHud(inventory),survival=new SurvivalSystem(),mobs=new MobSystem(terrain.scene),inventoryUI=createInventoryUI(inventory),mining=new MiningSystem(terrain.physicsBlocks),highlight=createHighlight(terrain.scene),weather=new WeatherSystem(),audio=new AudioSystem(settings.get('volume')/100),particles=new ParticleSystem(terrain.scene),saver=new WorldSaver();
 mobs.populate(66);const screens=createSurvivalScreens(survival,()=>survival.respawn(player.position));let game;
 const pause=createPauseAndSettings(settings,()=>terrain.renderer.domElement.requestPointerLock()),debug=createDebug({get player(){return player},get worldTime(){return worldTime},get mining(){return mining}});
 let miningHeld=false,placeRequested=false,pickRequested=false,placeCooldown=0;const touchControls=createTouchControls(player,{onMine:active=>{miningHeld=active;if(active)audio.resume();},onPlace:()=>{placeRequested=true;},onInventory:()=>inventoryUI.toggle(),onPause:()=>pause.toggle()});addEventListener('contextmenu',e=>e.preventDefault());addEventListener('mousedown',e=>{if(e.button===0)miningHeld=true;if(e.button===1)pickRequested=true;if(e.button===2)placeRequested=true;audio.resume();});addEventListener('mouseup',e=>{if(e.button===0)miningHeld=false});addEventListener('keydown',e=>{if(e.code==='KeyE')inventoryUI.toggle();if(e.code==='Escape'){inventoryUI.close();pause.toggle();}if(e.code==='F3')debug.toggle();if(/^Digit[1-9]$/.test(e.code)){inventory.select(+e.code.at(-1)-1);hud.select(inventory.selected);}});
 let frames=0,sampleStart=performance.now(),previous=performance.now(),accumulator=0;const STEP=50;
 function tick(){worldTime.tick();weather.tick();particles.tick();inventoryUI.furnace.tick();survival.tick();mobs.tick(player,survival,worldTime.daylight<.25);for(const position of terrain.world.tickGravity())terrain.remeshAt(position.x,position.z);hud.updateSurvival(survival);screens.update();if(survival.health<=0&&!survival.drops.length)survival.die(inventory,player.position);terrain.sky.update(worldTime.ticks,worldTime.daylight,terrain.camera);terrain.updateDaylight(worldTime.daylight);player.tick();terrain.updateStreaming(player.position.x,player.position.z);const direction={x:-Math.sin(player.yaw)*Math.cos(player.pitch),y:Math.sin(player.pitch),z:-Math.cos(player.yaw)*Math.cos(player.pitch)},target=raycast(terrain.physicsBlocks,terrain.camera.position,direction);highlight.update(target);if(placeCooldown>0)placeCooldown--;const mined=mining.tick(target,miningHeld,inventory.held?.id);if(mined){if(mined.drop)inventory.add(mined.drop);audio.noise();particles.spawn(target.pos,'#7F7F7F');terrain.remeshAt(target.pos.x,target.pos.z);}if(placeRequested&&target&&placeCooldown===0){const held=inventory.held;if(held&&placeBlock(terrain.world,target.prevPos,held.id,player)){inventory.consumeSelected();audio.noise(.08,1600);terrain.remeshAt(target.prevPos.x,target.prevPos.z);placeCooldown=4;}placeRequested=false;}if(pickRequested&&target){const item=pickBlockItem(target.block);if(item)inventory.slots[inventory.selected]={id:item,count:64};pickRequested=false;}}
 function loop(now){accumulator=Math.min(accumulator+now-previous,250);previous=now;while(accumulator>=STEP){tick();accumulator-=STEP;}debug.update();frames++;if(now-sampleStart>=500){fpsLabel.textContent=`FPS: ${Math.round(frames*1000/(now-sampleStart))}`;frames=0;sampleStart=now;}requestAnimationFrame(loop);}
 terrain.renderer.domElement.addEventListener('click',()=>{if(!touchControls.visible)terrain.renderer.domElement.requestPointerLock();});
 game={ready:true,phase:9,...terrain,player,tickMs:STEP,worldTime,survival,mobs,mining,weather,settings,saver,touchControls};window.__cubeworld=game;loading.classList.add('hidden');requestAnimationFrame(loop);
 setInterval(()=>saver.saveWorld({id:'default',position:{...player.position},inventory:inventory.slots,health:survival.health,hunger:survival.hunger,hash:terrain.terrainHash}),60000);
}
