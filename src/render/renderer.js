import * as THREE from '../../vendor/three.module.js';
import {buildAtlas} from './atlas.js';
import {createSky} from './sky.js';
import {WorldMap} from '../world/world.js';

const RANGE=1;
function runWorker(url,message,transfer=[]){return new Promise((resolve,reject)=>{const worker=new Worker(url,{type:'module'});worker.onerror=reject;worker.onmessage=({data})=>{worker.terminate();resolve(data);};worker.postMessage(message,transfer);});}
function geometryFrom(result){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(result.positions,3));geometry.setAttribute('normal',new THREE.BufferAttribute(result.normals,3));geometry.setAttribute('color',new THREE.BufferAttribute(result.colors,3));geometry.setAttribute('uv',new THREE.BufferAttribute(result.uvs,2));geometry.setIndex(new THREE.BufferAttribute(result.indices,1));geometry.computeBoundingSphere();return geometry;}
export async function createTerrainScene(game){
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x78a7ff);scene.fog=new THREE.Fog(0xc6daff,42,118);const sky=createSky(scene,scene.fog);
  const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.05,1000),renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance',preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;game.prepend(renderer.domElement);
  const {atlas,uvTable}=buildAtlas(),material=new THREE.MeshBasicMaterial({map:atlas,vertexColors:true}),world=new WorldMap(),coordinates=[];for(let cz=-RANGE;cz<=RANGE;cz++)for(let cx=-RANGE;cx<=RANGE;cx++)coordinates.push({cx,cz});
  const generated=await Promise.all(coordinates.map(({cx,cz})=>runWorker(new URL('../workers/world.worker.js',import.meta.url),{seed:'Cubeworld',cx,cz})));
  generated.forEach((chunk,index)=>{const {cx,cz}=coordinates[index];world.addChunk(cx,cz,chunk.blocks,chunk.biomes);});
  const meshes=await Promise.all(generated.map((chunk,index)=>{const blocks=chunk.blocks.slice();return runWorker(new URL('../workers/mesh.worker.js',import.meta.url),{blocks:blocks.buffer,uvTable},[blocks.buffer]).then(result=>({...result,...coordinates[index]}));}));
  const terrainGroup=new THREE.Group();scene.add(terrainGroup);let centerGeometry=null,totalMeshDuration=0;for(const result of meshes){const geometry=geometryFrom(result),mesh=new THREE.Mesh(geometry,material);mesh.position.set(result.cx*16,0,result.cz*16);terrainGroup.add(mesh);totalMeshDuration+=result.duration;if(result.cx===0&&result.cz===0)centerGeometry=geometry;}
  camera.rotation.order='YXZ';function render(){renderer.render(scene,camera);requestAnimationFrame(render);}function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}addEventListener('resize',resize,{passive:true});requestAnimationFrame(render);
  const center=generated[coordinates.findIndex(({cx,cz})=>cx===0&&cz===0)];return{renderer,scene,camera,geometry:centerGeometry,physicsBlocks:world,world,terrainGroup,loadedChunks:coordinates.length,sky,meshDuration:totalMeshDuration,terrainHash:center.hash,biomeData:center.biomes,drawCalls:()=>renderer.info.render.calls};
}
