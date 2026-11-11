import assert from 'node:assert/strict';
import { WorldMap } from '../src/world/world.js';
import { BLOCKS } from '../data/blocks.js';

function fixture() { const world = new WorldMap(8); world.addChunk(0, 0, new Uint16Array(16 * 384 * 16)); return world; }
const place = (world, name, x, y, z, state = null) => world.setBlock(x, y, z, BLOCKS[name].id, state);

{
  const world = fixture();
  place(world, 'lever', 0, 64, 0);
  for (let x = 1; x <= 5; x += 1) place(world, 'redstone_wire', x, 64, 0);
  place(world, 'redstone_lamp', 6, 64, 0);
  assert.equal(world.getBlockState(6, 64, 0)?.powered ?? false, false);
  world.redstone.interact(0, 64, 0);
  assert.equal(world.getBlockState(1, 64, 0).power, 15);
  assert.equal(world.getBlockState(2, 64, 0).power, 14);
  assert.equal(world.getBlockState(5, 64, 0).power, 11);
  assert.equal(world.getBlockState(6, 64, 0).powered, true);
  world.redstone.interact(0, 64, 0);
  assert.equal(world.getBlockState(1, 64, 0).power, 0, 'source removal clears stale power');
  assert.equal(world.getBlockState(6, 64, 0).powered, false);
  world.redstone.interact(0, 64, 0);
  world.setBlock(3, 64, 0, 0);
  assert.equal(world.getBlockState(5, 64, 0).power, 0, 'broken dust disconnects downstream wire');
}

{
  const world = fixture();
  place(world, 'redstone_block', 0, 64, 1);
  place(world, 'redstone_wire', 0, 64, 2);
  assert.equal(world.getBlockState(0, 64, 2).power, 15);
  place(world, 'stone_button', 2, 64, 2);
  place(world, 'redstone_lamp', 3, 64, 2);
  world.redstone.interact(2, 64, 2);
  assert.equal(world.getBlockState(3, 64, 2).powered, true);
  for (let tick = 0; tick < 19; tick += 1) world.redstone.tick();
  assert.equal(world.getBlockState(2, 64, 2).powered, true);
  world.redstone.tick();
  assert.equal(world.getBlockState(2, 64, 2).powered, false);
  assert.equal(world.getBlockState(3, 64, 2).powered, false);
}

{
  const world = fixture();
  place(world, 'lever', 0, 64, 4);
  place(world, 'redstone_wire', 1, 64, 4);
  place(world, 'redstone_repeater', 2, 64, 4, { facing: 'east', delay: 1 });
  place(world, 'redstone_lamp', 3, 64, 4);
  world.redstone.interact(0, 64, 4);
  assert.equal(world.getBlockState(2, 64, 4).input, true);
  world.redstone.tick();
  assert.notEqual(world.getBlockState(3, 64, 4)?.powered, true, 'repeater waits two ticks');
  world.redstone.tick();
  assert.equal(world.getBlockState(2, 64, 4).powered, true);
  assert.equal(world.getBlockState(3, 64, 4).powered, true);
  world.redstone.interact(0, 64, 4);
  world.redstone.tick(); world.redstone.tick();
  assert.equal(world.getBlockState(2, 64, 4).powered, false);
  assert.equal(world.getBlockState(3, 64, 4).powered, false);
}

{
  const world = fixture();
  place(world, 'observer', 4, 64, 6, { facing: 'east' });
  place(world, 'redstone_lamp', 5, 64, 6);
  place(world, 'stone', 4, 65, 6);
  world.redstone.tick();
  assert.equal(world.getBlockState(4, 64, 6).powered, true);
  assert.equal(world.getBlockState(5, 64, 6).powered, true);
  world.redstone.tick();
  assert.equal(world.getBlockState(4, 64, 6).powered, false);
  assert.equal(world.getBlockState(5, 64, 6).powered, false);
}

{
  const world = fixture();
  place(world, 'lever', 0, 64, 8, { powered: true });
  place(world, 'oak_door', 1, 64, 8, { half: 'lower', open: false });
  assert.equal(world.getBlockState(1, 64, 8).open, true);
  world.redstone.interact(0, 64, 8);
  assert.equal(world.getBlockState(1, 64, 8).open, false);
}

console.log('Redstone checks passed: source power, 0–15 dust decay, disconnection, buttons, repeater delays, observer pulses, lamps, and powered doors.');
