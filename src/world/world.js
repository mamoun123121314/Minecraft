import {CHUNK_SIZE,CHUNK_HEIGHT,blockIndex} from './chunk.js';
const floorDiv=(value,size)=>Math.floor(value/size);
const mod=(value,size)=>((value%size)+size)%size;
export class WorldMap{
  constructor(){this.chunks=new Map();}
  key(cx,cz){return`${cx},${cz}`;}
  addChunk(cx,cz,blocks,biomes=null){this.chunks.set(this.key(cx,cz),{cx,cz,blocks,biomes});}
  getChunk(cx,cz){return this.chunks.get(this.key(cx,cz));}
  getBlock(x,y,z){if(y<0||y>=CHUNK_HEIGHT)return y<0?4:0;const cx=floorDiv(x,CHUNK_SIZE),cz=floorDiv(z,CHUNK_SIZE),chunk=this.getChunk(cx,cz);if(!chunk)return 0;return chunk.blocks[blockIndex(mod(x,CHUNK_SIZE),y,mod(z,CHUNK_SIZE))];}
  setBlock(x,y,z,id){if(y<0||y>=CHUNK_HEIGHT)return false;const cx=floorDiv(x,CHUNK_SIZE),cz=floorDiv(z,CHUNK_SIZE),chunk=this.getChunk(cx,cz);if(!chunk)return false;chunk.blocks[blockIndex(mod(x,CHUNK_SIZE),y,mod(z,CHUNK_SIZE))]=id;return true;}
  highestSolid(x,z){for(let y=CHUNK_HEIGHT-1;y>=0;y-=1){const id=this.getBlock(x,y,z);if(id&&id!==5&&id!==15)return y;}return 0;}
}
