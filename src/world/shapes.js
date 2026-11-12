import { BLOCK_BY_ID } from '../../data/blocks.js';

const rotate = (box, facing) => {
  const [min, max] = box;
  if (facing === 'south') return [[1 - max[0], min[1], 1 - max[2]], [1 - min[0], max[1], 1 - min[2]]];
  if (facing === 'east') return [[1 - max[2], min[1], min[0]], [1 - min[2], max[1], max[0]]];
  if (facing === 'west') return [[min[2], min[1], 1 - max[0]], [max[2], max[1], 1 - min[0]]];
  return box;
};
export function stairBoxes(state = {}) {
  const top = state.half === 'top', base = top ? [[0,.5,0],[1,1,1]] : [[0,0,0],[1,.5,1]];
  const box = (x0,z0,x1,z1) => [[x0,top?0:.5,z0],[x1,1,z1]];
  const shape = state.shape ?? 'straight';
  if (shape === 'outer_left') return [base,box(0,.5,.5,1)];
  if (shape === 'outer_right') return [base,box(.5,.5,1,1)];
  const boxes = [base,box(0,.5,1,1)];
  if (shape === 'inner_left') boxes.push(box(0,0,.5,.5));
  if (shape === 'inner_right') boxes.push(box(.5,0,1,.5));
  return boxes;
}
export function collisionBoxes(blockId, state = {}) {
  const model = BLOCK_BY_ID[blockId]?.model;
  if (model === 'slab') return state.type === 'double' ? [[[0, 0, 0], [1, 1, 1]]] : [state.half === 'top' ? [[0, .5, 0], [1, 1, 1]] : [[0, 0, 0], [1, .5, 1]]];
  if (model === 'stairs') return stairBoxes(state).map(box => rotate(box, state.facing));
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
export function selectionBoxes(blockId, state = {}) {
  const model = BLOCK_BY_ID[blockId]?.model;
  if (model === 'fence_gate') return [rotate([[0,0,.375],[1,1,.625]],state.facing)];
  if (model === 'door') return [rotate([[0,0,0],[1,1,.1875]],state.open ? {north:'west',east:'north',south:'east',west:'south'}[state.facing??'north'] : state.facing)];
  if (model === 'fence' || model === 'wall') {
    const post = model === 'fence' ? [[.375,0,.375],[.625,1,.625]] : [[.25,0,.25],[.75,1,.75]], boxes = [post];
    const connected = state && ['north','south','east','west'].some(key => key in state);
    for (const direction of connected ? ['north','south','east','west'].filter(key => state[key]) : ['north','south','east','west']) {
      if (direction === 'north') boxes.push([[.375,.375,0],[.625,.9375,.5]]);
      if (direction === 'south') boxes.push([[.375,.375,.5],[.625,.9375,1]]);
      if (direction === 'east') boxes.push([[.5,.375,.375],[1,.9375,.625]]);
      if (direction === 'west') boxes.push([[0,.375,.375],[.5,.9375,.625]]);
    }
    return boxes;
  }
  return collisionBoxes(blockId,state);
}
export function pointCollides(blockId, state, x, y, z) {
  const boxes = collisionBoxes(blockId, state);
  if (!boxes) return Boolean(BLOCK_BY_ID[blockId]?.solid);
  return boxes.some(([min, max]) => x >= min[0] && x <= max[0] && y >= min[1] && y <= max[1] && z >= min[2] && z <= max[2]);
}
