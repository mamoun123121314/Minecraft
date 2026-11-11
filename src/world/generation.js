import { fnv1a, valueNoise2D, seeded } from '../core/rng.js';
import { CHUNK_SIZE, CHUNK_HEIGHT, blockIndex } from './chunk.js';

export const SEA_LEVEL = 63;
const noise = (seed, x, z, octaves, frequency, persistence = 0.5) => {
  let value = 0, amplitude = 1, scale = frequency, total = 0;
  for (let octave = 0; octave < octaves; octave += 1) { value += (valueNoise2D(seed + octave * 1013, x * scale, z * scale) * 2 - 1) * amplitude; total += amplitude; amplitude *= persistence; scale *= 2; }
  return value / total;
};
export function sampleClimate(seed, x, z) {
  const continental = noise(seed + 11, x, z, 5, 1 / 256);
  const temperature = noise(seed + 23, x, z, 3, 1 / 512) * 0.5 + 0.5;
  const humidity = noise(seed + 37, x, z, 3, 1 / 512) * 0.5 + 0.5;
  if (continental < -0.32) return 'ocean';
  if (temperature > 0.68 && humidity < 0.48) return 'desert';
  if (temperature < 0.34) return 'snowy_taiga';
  if (humidity > 0.58) return 'forest';
  return 'plains';
}
export function terrainHeight(seed, x, z) {
  const continental = noise(seed + 11, x, z, 5, 1 / 256);
  const erosion = noise(seed + 53, x, z, 4, 1 / 128);
  const peaks = Math.abs(noise(seed + 71, x, z, 4, 1 / 64));
  return Math.max(24, Math.min(112, Math.floor(62 + continental * 25 + erosion * 9 + peaks * Math.max(0, continental) * 20)));
}
export function generateChunk(seedText, cx, cz) {
  const seed = typeof seedText === 'number' ? seedText : fnv1a(seedText);
  const blocks = new Uint16Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
  const biomes = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE);
  const biomeNames = ['plains','forest','desert','snowy_taiga','ocean'];
  for (let z = 0; z < CHUNK_SIZE; z += 1) for (let x = 0; x < CHUNK_SIZE; x += 1) {
    const wx = cx * 16 + x, wz = cz * 16 + z;
    const biome = sampleClimate(seed, wx, wz);
    biomes[z * 16 + x] = biomeNames.indexOf(biome);
    const height = terrainHeight(seed, wx, wz);
    for (let y = 0; y < CHUNK_HEIGHT; y += 1) {
      let id = 0;
      if (y === 0) id = 4;
      else if (y < height - 4) id = y < 12 ? 13 : 3;
      else if (y < height) id = biome === 'desert' || biome === 'ocean' ? 6 : 2;
      else if (y === height) id = biome === 'desert' ? 6 : biome === 'snowy_taiga' ? 12 : biome === 'ocean' ? 7 : 1;
      else if (y <= SEA_LEVEL) id = 5;
      const cave = y > 8 && y < height - 3 && noise(seed + y * 17, wx, wz, 2, 1 / 38) > 0.57;
      if (cave) id = 0;
      if (id === 3 && y < 52) {
        const oreRoll = valueNoise2D(seed + y * 919, wx * 0.18, wz * 0.18);
        if (y < 24 && oreRoll > 0.86) id = 10;
        else if (oreRoll > 0.8) id = 9;
        else if (oreRoll < 0.08) id = 8;
      }
      blocks[blockIndex(x,y,z)] = id;
    }
  }
  const random = seeded(seed ^ Math.imul(cx, 73856093) ^ Math.imul(cz, 19349663));
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const x = 2 + Math.floor(random() * 12), z = 2 + Math.floor(random() * 12), wx = cx*16+x, wz=cz*16+z;
    const biome = sampleClimate(seed, wx, wz), ground = terrainHeight(seed, wx, wz);
    if ((biome === 'forest' || biome === 'plains') && random() < (biome === 'forest' ? 0.8 : 0.2) && ground + 6 < CHUNK_HEIGHT) {
      for (let y = 1; y <= 5; y += 1) blocks[blockIndex(x,ground+y,z)] = 14;
      for (let oy = 3; oy <= 6; oy += 1) for (let oz = -2; oz <= 2; oz += 1) for (let ox = -2; ox <= 2; ox += 1) if (Math.abs(ox)+Math.abs(oz)+(oy===6?2:0) < 5) blocks[blockIndex(x+ox,ground+oy,z+oz)] = 15;
    }
  }
  return { blocks, biomes, hash: hashBlocks(blocks), seed };
}
export function hashBlocks(blocks) { let hash = 0x811c9dc5; for (let i=0;i<blocks.length;i+=1) { hash ^= blocks[i]; hash = Math.imul(hash,0x01000193); } return hash>>>0; }
