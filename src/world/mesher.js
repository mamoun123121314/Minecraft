import { CHUNK_SIZE, CHUNK_HEIGHT, blockIndex } from './chunk.js';

const FACES = [
  { normal: [1,0,0], shade: 0.6, key: 'side', corners: [[1,0,0],[1,0,1],[1,1,1],[1,1,0]] },
  { normal: [-1,0,0], shade: 0.6, key: 'side', corners: [[0,0,1],[0,0,0],[0,1,0],[0,1,1]] },
  { normal: [0,1,0], shade: 1, key: 'top', corners: [[0,1,1],[1,1,1],[1,1,0],[0,1,0]] },
  { normal: [0,-1,0], shade: 0.5, key: 'bottom', corners: [[0,0,0],[1,0,0],[1,0,1],[0,0,1]] },
  { normal: [0,0,1], shade: 0.8, key: 'side', corners: [[1,0,1],[0,0,1],[0,1,1],[1,1,1]] },
  { normal: [0,0,-1], shade: 0.8, key: 'side', corners: [[0,0,0],[1,0,0],[1,1,0],[0,1,0]] }
];
const IDS = { 1: { top: 'grass_top', bottom: 'dirt', side: 'grass_side' }, 2: { top: 'dirt', bottom: 'dirt', side: 'dirt' }, 3: { top: 'stone', bottom: 'stone', side: 'stone' }, 4: { top: 'bedrock', bottom: 'bedrock', side: 'bedrock' } };
const INDEX_ORDER = [0,1,2,0,2,3];
const isSolid = (blocks, x, y, z) => x >= 0 && x < CHUNK_SIZE && y >= 0 && y < CHUNK_HEIGHT && z >= 0 && z < CHUNK_SIZE && blocks[blockIndex(x,y,z)] !== 0;

export function meshChunk(blocks, uvTable) {
  const positions = [], normals = [], colors = [], uvs = [], indices = [];
  let vertex = 0;
  for (let y = 0; y < CHUNK_HEIGHT; y += 1) for (let z = 0; z < CHUNK_SIZE; z += 1) for (let x = 0; x < CHUNK_SIZE; x += 1) {
    const id = blocks[blockIndex(x,y,z)];
    if (!id) continue;
    for (let faceIndex = 0; faceIndex < FACES.length; faceIndex += 1) {
      const face = FACES[faceIndex];
      if (isSolid(blocks, x + face.normal[0], y + face.normal[1], z + face.normal[2])) continue;
      const texture = IDS[id][face.key];
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
