import assert from 'node:assert/strict';
import { WorldMap } from '../src/world/world.js';
import { BLOCKS } from '../data/blocks.js';
import { placeBlock, interactShapedBlock } from '../src/world/blockactions.js';
import { collisionBoxes, pointCollides } from '../src/world/shapes.js';
import { meshChunk } from '../src/world/mesher.js';
import { CHUNK_VOLUME, blockIndex } from '../src/world/chunk.js';
import { MiningSystem } from '../src/player/mining.js';

function fixture() { const world = new WorldMap(12); world.addChunk(0, 0, new Uint16Array(CHUNK_VOLUME)); return { world, player: { position: { x: 12, y: 80, z: 12 }, yaw: 0, pitch: 0 } }; }
for (const wood of ['oak', 'birch', 'spruce', 'jungle', 'acacia', 'dark_oak']) for (const model of ['slab', 'stairs', 'fence', 'fence_gate', 'door', 'trapdoor']) assert.ok(BLOCKS[`${wood}_${model}`], `Missing ${wood}_${model}`);

{
  const { world, player } = fixture();
  player.pitch = -1;
  assert.equal(placeBlock(world, { x: 1, y: 64, z: 1 }, 'birch_slab', player), true);
  assert.equal(world.getBlockState(1, 64, 1).type, 'bottom');
  assert.equal(placeBlock(world, { x: 1, y: 64, z: 1 }, 'birch_slab', player), true);
  assert.equal(world.getBlockState(1, 64, 1).type, 'double');
  assert.deepEqual(collisionBoxes(BLOCKS.birch_slab.id, { type: 'double' }), [[[0, 0, 0], [1, 1, 1]]]);
  player.pitch = 1;
  placeBlock(world, { x: 2, y: 64, z: 1 }, 'spruce_slab', player);
  assert.equal(world.getBlockState(2, 64, 1).half, 'top');
  assert.equal(pointCollides(BLOCKS.spruce_slab.id, { half: 'top' }, .5, .25, .5), false);
  assert.equal(pointCollides(BLOCKS.spruce_slab.id, { half: 'top' }, .5, .75, .5), true);
}

{
  const { world, player } = fixture();
  world.setBlock(3, 64, 3, BLOCKS.water.id, { level: 0 });
  placeBlock(world, { x: 3, y: 64, z: 3 }, 'acacia_stairs', player);
  assert.equal(world.getBlockState(3, 64, 3).waterlogged, true);
  placeBlock(world, { x: 4, y: 64, z: 3 }, 'jungle_door', player);
  assert.equal(world.getBlockState(4, 65, 3).half, 'upper');
  interactShapedBlock(world, { x: 4, y: 65, z: 3 });
  assert.equal(world.getBlockState(4, 64, 3).open, true);
  assert.equal(world.getBlockState(4, 65, 3).open, true);
  assert.deepEqual(collisionBoxes(BLOCKS.jungle_door.id, { open: true }), []);
  placeBlock(world, { x: 5, y: 64, z: 3 }, 'dark_oak_trapdoor', player);
  interactShapedBlock(world, { x: 5, y: 64, z: 3 });
  assert.equal(world.getBlockState(5, 64, 3).open, true);
  placeBlock(world, { x: 6, y: 64, z: 3 }, 'oak_fence_gate', player);
  interactShapedBlock(world, { x: 6, y: 64, z: 3 });
  assert.deepEqual(collisionBoxes(BLOCKS.oak_fence_gate.id, { open: true }), []);
}

{
  const { world } = fixture();
  world.setBlock(7, 64, 7, BLOCKS.oak_fence.id);
  assert.equal(world.getBlockState(7, 64, 7).north, false);
  world.setBlock(8, 64, 7, BLOCKS.birch_fence.id);
  assert.equal(world.getBlockState(7, 64, 7).east, true);
  assert.equal(world.getBlockState(8, 64, 7).west, true);
  world.setBlock(8, 64, 7, 0);
  assert.equal(world.getBlockState(7, 64, 7).east, false);
}

{
  const blocks = new Uint16Array(CHUNK_VOLUME), states = {};
  blocks[blockIndex(1, 64, 1)] = BLOCKS.oak_slab.id; states[blockIndex(1, 64, 1)] = { type: 'top' };
  blocks[blockIndex(2, 64, 1)] = BLOCKS.oak_trapdoor.id; states[blockIndex(2, 64, 1)] = { half: 'bottom', open: false };
  blocks[blockIndex(3, 64, 1)] = BLOCKS.oak_door.id; states[blockIndex(3, 64, 1)] = { facing: 'north', open: true };
  const uv = new Proxy({}, { get: () => [0, 0, 1, 1] }), mesh = meshChunk(blocks, uv, states), ys = mesh.cutout.positions.filter((_, index) => index % 3 === 1);
  assert.ok(ys.includes(64.1875));
  assert.ok(ys.includes(64.5));
  assert.ok(ys.some(y => y > 64.9));
}

{
  const { world } = fixture();
  world.setBlock(9, 64, 9, BLOCKS.oak_door.id, { half: 'lower' });
  world.setBlock(9, 65, 9, BLOCKS.oak_door.id, { half: 'upper' });
  const mining = new MiningSystem(world), target = { block: BLOCKS.oak_door.id, pos: { x: 9, y: 65, z: 9 } };
  let result; for (let tick = 0; tick < 100 && !result; tick += 1) result = mining.tick(target, true, 'iron_axe');
  assert.equal(result.drop, null);
  assert.equal(world.getBlock(9, 64, 9), 0);
  assert.equal(world.getBlock(9, 65, 9), 0);
}

console.log('Block-family checks passed: six woods, slab merging/half states, waterlogging, doors, trapdoors, gates, collision boxes, fence connections, models, and synchronized breaking.');
