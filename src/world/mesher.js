import { CHUNK_SIZE, CHUNK_HEIGHT, blockIndex } from './chunk.js';
import { BLOCK_BY_ID } from '../../data/blocks.js';

const FACES = [
  { normal: [1,0,0], shade: 0.6, key: 'side', corners: [[1,0,0],[1,0,1],[1,1,1],[1,1,0]] },
  { normal: [-1,0,0], shade: 0.6, key: 'side', corners: [[0,0,1],[0,0,0],[0,1,0],[0,1,1]] },
  { normal: [0,1,0], shade: 1, key: 'top', corners: [[0,1,1],[1,1,1],[1,1,0],[0,1,0]] },
  { normal: [0,-1,0], shade: 0.5, key: 'bottom', corners: [[0,0,0],[1,0,0],[1,0,1],[0,0,1]] },
  { normal: [0,0,1], shade: 0.8, key: 'side', corners: [[1,0,1],[0,0,1],[0,1,1],[1,1,1]] },
  { normal: [0,0,-1], shade: 0.8, key: 'side', corners: [[0,0,0],[1,0,0],[1,1,0],[0,1,0]] }
];
const INDEX_ORDER = [0,1,2,0,2,3];
const isOccluding=(blocks,x,y,z,currentId)=>{if(x<0||x>=CHUNK_SIZE||y<0||y>=CHUNK_HEIGHT||z<0||z>=CHUNK_SIZE)return false;const neighbour=blocks[blockIndex(x,y,z)];if(!neighbour)return false;if(neighbour===currentId&&!BLOCK_BY_ID[currentId]?.opaque)return true;return BLOCK_BY_ID[neighbour]?.opaque??false;};

export function meshChunk(blocks, uvTable) {
  const positions = [], normals = [], colors = [], uvs = [], indices = [];
  let vertex = 0;
  for (let y = 0; y < CHUNK_HEIGHT; y += 1) for (let z = 0; z < CHUNK_SIZE; z += 1) for (let x = 0; x < CHUNK_SIZE; x += 1) {
    const id = blocks[blockIndex(x,y,z)];
    if (!id) continue;
    for (let faceIndex = 0; faceIndex < FACES.length; faceIndex += 1) {
      const face = FACES[faceIndex];
      if (isOccluding(blocks,x+face.normal[0],y+face.normal[1],z+face.normal[2],id)) continue;
      const definition=BLOCK_BY_ID[id];if(!definition)continue;
      const texture=definition.textures?.[face.key]??definition.texture;
      const uv = uvTable[texture];
      const ao = face.key === 'top' ? 1 : 0.92;
      for (let corner = 0; corner < 4; corner += 1) {
        const point = face.corners[corner];
        positions.push(x + point[0], y + point[1], z + point[2]);
        normals.push(...face.normal);
        const brightness = face.shade * ao;
        colors.push(brightness, brightness, brightness);
      }
      uvs.push(uv[0],uv[1], uv[2],uv[1], uv[2],uv[3], uv[0],uv[3]);
      for (let i = 0; i < 6; i += 1) indices.push(vertex + INDEX_ORDER[i]);
      vertex += 4;
    }
  }
  return { positions: new Float32Array(positions), normals: new Float32Array(normals), colors: new Float32Array(colors), uvs: new Float32Array(uvs), indices: new Uint32Array(indices) };
}
