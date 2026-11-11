import { generateChunk } from '../world/generation.js';
self.onmessage = ({ data }) => {
  const generated = generateChunk(data.seed, data.cx, data.cz);
  self.postMessage(generated, [generated.blocks.buffer, generated.biomes.buffer]);
};
