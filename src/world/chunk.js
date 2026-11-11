export const CHUNK_SIZE=16;
export const CHUNK_MIN_Y=-64;
export const CHUNK_MAX_Y=319;
export const CHUNK_HEIGHT=384;
export const CHUNK_VOLUME=CHUNK_SIZE*CHUNK_HEIGHT*CHUNK_SIZE;
export const blockIndex=(x,y,z)=>(y-CHUNK_MIN_Y)*CHUNK_SIZE*CHUNK_SIZE+z*CHUNK_SIZE+x;
export const storageIndex=(x,storageY,z)=>storageY*CHUNK_SIZE*CHUNK_SIZE+z*CHUNK_SIZE+x;
export class Chunk{
 constructor(cx=0,cz=0){this.cx=cx;this.cz=cz;this.blocks=new Uint16Array(CHUNK_VOLUME);}
 get(x,y,z){if(x<0||x>=CHUNK_SIZE||y<CHUNK_MIN_Y||y>CHUNK_MAX_Y||z<0||z>=CHUNK_SIZE)return 0;return this.blocks[blockIndex(x,y,z)];}
 set(x,y,z,id){if(x>=0&&x<CHUNK_SIZE&&y>=CHUNK_MIN_Y&&y<=CHUNK_MAX_Y&&z>=0&&z<CHUNK_SIZE)this.blocks[blockIndex(x,y,z)]=id;}
 static superflat(){const chunk=new Chunk();for(let z=0;z<CHUNK_SIZE;z++)for(let x=0;x<CHUNK_SIZE;x++){for(let y=CHUNK_MIN_Y;y<=-60;y++)chunk.set(x,y,z,4);for(let y=-59;y<60;y++)chunk.set(x,y,z,3);for(let y=60;y<63;y++)chunk.set(x,y,z,2);chunk.set(x,63,z,1);}return chunk;}
}
