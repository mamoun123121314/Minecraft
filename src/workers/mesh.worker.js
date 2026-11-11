import { meshChunk } from '../world/mesher.js';
self.onmessage = ({ data }) => {
  const started = performance.now();
  const mesh = meshChunk(new Uint16Array(data.blocks), data.uvTable);
  self.postMessage({ ...mesh, duration: performance.now() - started }, [mesh.positions.buffer, mesh.normals.buffer, mesh.colors.buffer, mesh.uvs.buffer, mesh.indices.buffer]);
};
