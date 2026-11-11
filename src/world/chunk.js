export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 128;
export const CHUNK_VOLUME = CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE;
export const blockIndex = (x, y, z) => y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x;

export class Chunk {
  constructor(cx = 0, cz = 0) {
    this.cx = cx;
    this.cz = cz;
    this.blocks = new Uint16Array(CHUNK_VOLUME);
  }
  get(x, y, z) {
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) return 0;
    return this.blocks[blockIndex(x, y, z)];
  }
  set(x, y, z, id) {
    if (x >= 0 && x < CHUNK_SIZE && y >= 0 && y < CHUNK_HEIGHT && z >= 0 && z < CHUNK_SIZE) this.blocks[blockIndex(x, y, z)] = id;
  }
  static superflat() {
    const chunk = new Chunk();
    for (let z = 0; z < CHUNK_SIZE; z += 1) for (let x = 0; x < CHUNK_SIZE; x += 1) {
      chunk.set(x, 0, z, 4);
      for (let y = 1; y < 4; y += 1) chunk.set(x, y, z, 3);
      for (let y = 4; y < 7; y += 1) chunk.set(x, y, z, 2);
      chunk.set(x, 7, z, 1);
    }
    return chunk;
  }
}
