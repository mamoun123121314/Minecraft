import { BLOCK_BY_ID } from '../../data/blocks.js';

const rotate = (box, facing) => {
  const [min, max] = box;
  if (facing === 'south') return [[1 - max[0], min[1], 1 - max[2]], [1 - min[0], max[1], 1 - min[2]]];
  if (facing === 'east') return [[1 - max[2], min[1], min[0]], [1 - min[2], max[1], max[0]]];
  if (facing === 'west') return [[min[2], min[1], 1 - max[0]], [max[2], max[1], 1 - min[0]]];
  return box;
};
export function collisionBoxes(blockId, state = {}) {
  const model = BLOCK_BY_ID[blockId]?.model;
  if (model === 'slab') return state.type === 'double' ? [[[0, 0, 0], [1, 1, 1]]] : [state.half === 'top' ? [[0, .5, 0], [1, 1, 1]] : [[0, 0, 0], [1, .5, 1]]];
  if (model === 'stairs') {
    const top = state.half === 'top';
    return [top ? [[0, .5, 0], [1, 1, 1]] : [[0, 0, 0], [1, .5, 1]], rotate(top ? [[0, 0, .5], [1, .5, 1]] : [[0, .5, .5], [1, 1, 1]], state.facing)];
  }
  if (model === 'door') {
    if (state.open) return [];
    return [rotate([[0, 0, 0], [1, 1, .1875]], state.facing)];
  }
  if (model === 'trapdoor') {
    if (state.open) return [rotate([[0, 0, 0], [1, 1, .1875]], state.facing)];
    return [state.half === 'top' ? [[0, .8125, 0], [1, 1, 1]] : [[0, 0, 0], [1, .1875, 1]]];
  }
  if (model === 'fence_gate') return state.open ? [] : [rotate([[0, 0, .375], [1, 1.5, .625]], state.facing)];
  if (model === 'fence' || model === 'wall') return [[[0, 0, 0], [1, 1.5, 1]]];
  return null;
}
export function pointCollides(blockId, state, x, y, z) {
  const boxes = collisionBoxes(blockId, state);
  if (!boxes) return Boolean(BLOCK_BY_ID[blockId]?.solid);
  return boxes.some(([min, max]) => x >= min[0] && x <= max[0] && y >= min[1] && y <= max[1] && z >= min[2] && z <= max[2]);
}
