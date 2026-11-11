import {CHUNK_SIZE,CHUNK_MIN_Y,CHUNK_MAX_Y,blockIndex} from './chunk.js';
import {BLOCK_BY_ID} from '../../data/blocks.js';
const floorDiv=(value,size)=>Math.floor(value/size);
const mod=(value,size)=>((value%size)+size)%size;
export class WorldMap{
  constructor(){this.chunks=new Map();this.gravityQueue=[];this.gravityPending=new Set();}
  key(cx,cz){return`${cx},${cz}`;}
  addChunk(cx,cz,blocks,biomes=null){this.chunks.set(this.key(cx,cz),{cx,cz,blocks,biomes,states:new Map()});}
  getChunk(cx,cz){return this.chunks.get(this.key(cx,cz));}
  getBlock(x,y,z){if(y<CHUNK_MIN_Y||y>CHUNK_MAX_Y)return 0;const cx=floorDiv(x,CHUNK_SIZE),cz=floorDiv(z,CHUNK_SIZE),chunk=this.getChunk(cx,cz);if(!chunk)return 0;return chunk.blocks[blockIndex(mod(x,CHUNK_SIZE),y,mod(z,CHUNK_SIZE))];}
  setBlock(x,y,z,id,state=null){if(y<CHUNK_MIN_Y||y>CHUNK_MAX_Y)return false;const cx=floorDiv(x,CHUNK_SIZE),cz=floorDiv(z,CHUNK_SIZE),chunk=this.getChunk(cx,cz);if(!chunk)return false;const index=blockIndex(mod(x,CHUNK_SIZE),y,mod(z,CHUNK_SIZE));chunk.blocks[index]=id;if(state)chunk.states.set(index,state);else chunk.states.delete(index);this.scheduleGravity(x,y,z);this.scheduleGravity(x,y+1,z);return true;}
  getBlockState(x,y,z){const chunk=this.getChunk(floorDiv(x,CHUNK_SIZE),floorDiv(z,CHUNK_SIZE));return chunk?.states.get(blockIndex(mod(x,CHUNK_SIZE),y,mod(z,CHUNK_SIZE)))??null;}
  scheduleGravity(x,y,z){if(y<CHUNK_MIN_Y||y>CHUNK_MAX_Y)return;const key=`${x},${y},${z}`;if(!this.gravityPending.has(key)){this.gravityPending.add(key);this.gravityQueue.push({x,y,z,key});}}
  tickGravity(limit=32){const changed=[],scheduled=Math.min(limit,this.gravityQueue.length);for(let count=0;count<scheduled;count++){const position=this.gravityQueue.shift();this.gravityPending.delete(position.key);const id=this.getBlock(position.x,position.y,position.z),definition=BLOCK_BY_ID[id],below=this.getBlock(position.x,position.y-1,position.z);if(!definition?.gravity||position.y<=CHUNK_MIN_Y||![0,5,11].includes(below))continue;const destinationChunk=this.getChunk(floorDiv(position.x,CHUNK_SIZE),floorDiv(position.z,CHUNK_SIZE));if(!destinationChunk)continue;destinationChunk.blocks[blockIndex(mod(position.x,CHUNK_SIZE),position.y-1,mod(position.z,CHUNK_SIZE))]=id;destinationChunk.blocks[blockIndex(mod(position.x,CHUNK_SIZE),position.y,mod(position.z,CHUNK_SIZE))]=0;changed.push({x:position.x,y:position.y,z:position.z},{x:position.x,y:position.y-1,z:position.z});this.scheduleGravity(position.x,position.y-1,position.z);this.scheduleGravity(position.x,position.y+1,position.z);}return changed;}
  highestSolid(x,z){for(let y=CHUNK_MAX_Y;y>=CHUNK_MIN_Y;y-=1){const id=this.getBlock(x,y,z);if(id&&id!==5&&id!==15)return y;}return 0;}
}
