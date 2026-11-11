import assert from 'node:assert/strict';
import { WorldMap } from '../src/world/world.js';
import { BLOCKS } from '../data/blocks.js';
import { fluidAt, useBucket, FLUID_TICKS } from '../src/world/fluids.js';
import { meshChunk } from '../src/world/mesher.js';
import { CHUNK_VOLUME, blockIndex } from '../src/world/chunk.js';

function fixture() {
  const world = new WorldMap(42);
  world.addChunk(0, 0, new Uint16Array(16 * 384 * 16));
  world.addChunk(-1, 0, new Uint16Array(16 * 384 * 16));
  for (let x = -4; x < 12; x += 1) for (let z = 0; z < 8; z += 1) world.setBlock(x, 63, z, BLOCKS.stone.id);
  return world;
}
const advance = (world, ticks) => { const changed = []; for (let i = 0; i < ticks; i += 1) changed.push(...world.fluids.tick()); return changed; };

{
  const world = fixture();
  assert.equal(world.fluids.setFluid(2, 65, 2, 'water'), true);
  assert.equal(world.getBlockState(2, 65, 2).level, 0);
  advance(world, FLUID_TICKS.water - 1);
  assert.equal(world.getBlock(2, 64, 2), 0, 'water must wait five ticks');
  advance(world, 1);
  assert.equal(world.getBlock(2, 64, 2), BLOCKS.water.id);
  assert.equal(world.getBlockState(2, 64, 2).falling, true);
  advance(world, 5);
  assert.equal(world.getBlock(3, 65, 2), BLOCKS.water.id, 'source spreads sideways over a floor');
  assert.equal(world.getBlockState(3, 65, 2).level, 1);
  assert.ok(world.fluids.queue.length < 100, 'coalescing prevents duplicate queue growth');
}

{
  const world = fixture();
  // A contained two-source pool: flowing water between sources becomes a source.
  world.fluids.setFluid(2, 64, 2, 'water');
  world.fluids.setFluid(4, 64, 2, 'water');
  world.setBlock(3, 64, 2, BLOCKS.water.id, { level: 1, falling: false });
  world.fluids.schedule(3, 64, 2);
  advance(world, 6);
  assert.equal(world.getBlockState(3, 64, 2)?.level, 0, 'two adjacent sources form water source');
}

{
  const world = fixture();
  world.fluids.setFluid(2, 64, 2, 'lava');
  advance(world, FLUID_TICKS.lava - 1);
  assert.equal(world.getBlock(3, 64, 2), 0);
  world.setBlock(3, 64, 2, BLOCKS.water.id, { level: 0, falling: false });
  world.fluids.schedule(2, 64, 2, 1);
  advance(world, 1);
  assert.equal(world.getBlock(2, 64, 2), BLOCKS.obsidian.id, 'source lava plus water forms obsidian');
}

{
  const world = fixture();
  world.fluids.setFluid(2, 64, 2, 'lava', 1);
  world.setBlock(3, 64, 2, BLOCKS.water.id, { level: 0, falling: false });
  world.fluids.schedule(2, 64, 2, 1);
  advance(world, 1);
  assert.equal(world.getBlock(2, 64, 2), BLOCKS.cobblestone.id, 'flowing lava plus water forms cobblestone');
}

{
  const world = fixture();
  world.setBlock(2, 64, 2, BLOCKS.oak_slab.id, { waterlogged: true });
  assert.deepEqual(fluidAt(world, 2, 64, 2), { name: 'water', source: true });
  const filled = useBucket(world, 'bucket', { x: 2, y: 64, z: 2 });
  assert.equal(filled.item, 'water_bucket');
  assert.equal(world.getBlock(2, 64, 2), BLOCKS.oak_slab.id);
  assert.equal(world.getBlockState(2, 64, 2).waterlogged, false);
  const emptied = useBucket(world, 'water_bucket', null, { x: 2, y: 65, z: 2 });
  assert.equal(emptied.item, 'bucket');
  assert.equal(world.getBlock(2, 65, 2), BLOCKS.water.id);
  assert.equal(useBucket(world, 'bucket', { x: 2, y: 65, z: 2 }).item, 'water_bucket');
}

{
  const world = fixture();
  world.setBlock(-1, 64, 2, BLOCKS.water.id, { level: 0, falling: false });
  world.fluids.schedule(-1, 64, 2);
  advance(world, 10);
  assert.equal(world.getBlock(0, 64, 2), BLOCKS.water.id, 'fluid crosses chunk boundaries');
  assert.equal(fluidAt(world, 15, 64, 2), null);
}

{
  const blocks = new Uint16Array(CHUNK_VOLUME), states = {};
  blocks[blockIndex(2, 64, 2)] = BLOCKS.water.id;
  blocks[blockIndex(3, 64, 2)] = BLOCKS.water.id;
  states[blockIndex(2, 64, 2)] = { level: 0, falling: false };
  states[blockIndex(3, 64, 2)] = { level: 2, falling: false };
  blocks[blockIndex(5, 64, 2)] = BLOCKS.wheat.id;
  states[blockIndex(5, 64, 2)] = { age: 7 };
  const uv = new Proxy({}, { get: () => [0, 0, 1, 1] });
  const mesh = meshChunk(blocks, uv, states);
  const heights = mesh.translucent.positions.filter((_, index) => index % 3 === 1);
  assert.ok(Math.max(...heights) <= 64.875);
  assert.ok(Math.min(...heights.filter(value => value > 64)) < 64.875, 'flowing liquid has lowered geometry');
  assert.ok(mesh.cutout.indices.length > 0, 'mature crop state selects a rendered texture');
}

console.log('Fluid checks passed: scheduling, flow, source formation, reactions, buckets, waterlogging, chunk boundaries, and liquid/crop geometry.');
