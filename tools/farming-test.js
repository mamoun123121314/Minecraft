import assert from 'node:assert/strict';
import { WorldMap } from '../src/world/world.js';
import { BLOCKS } from '../data/blocks.js';
import { isHydrated, matureDrops, grassDrop } from '../src/world/farming.js';

function fixture(seed = 1234) {
  const world = new WorldMap(seed);
  world.addChunk(0, 0, new Uint16Array(16 * 384 * 16));
  world.addChunk(-1, 0, new Uint16Array(16 * 384 * 16));
  world.setBlock(2, 63, 2, BLOCKS.dirt.id);
  return world;
}

{
  const world = fixture();
  const result = world.farming.interact({ pos: { x: 2, y: 63, z: 2 }, prevPos: { x: 2, y: 64, z: 2 } }, 'iron_hoe');
  assert.equal(result.durability, 1);
  assert.equal(world.getBlock(2, 63, 2), BLOCKS.farmland.id);
  const planted = world.farming.interact({ pos: { x: 2, y: 63, z: 2 }, prevPos: { x: 2, y: 64, z: 2 } }, 'wheat_seeds');
  assert.equal(planted.consumed, 1);
  assert.equal(world.getBlock(2, 64, 2), BLOCKS.wheat.id);
  assert.equal(world.getBlockState(2, 64, 2).age, 0);
  assert.equal(world.farming.interact({ pos: { x: 2, y: 64, z: 2 }, prevPos: { x: 3, y: 64, z: 2 } }, 'wheat_seeds'), null, 'seeds require empty space above farmland');
}

{
  const world = fixture();
  assert.equal(isHydrated(world, 2, 63, 2), false);
  world.setBlock(6, 63, 2, BLOCKS.water.id, { level: 0, falling: false });
  assert.equal(isHydrated(world, 2, 63, 2), true, 'four-block horizontal hydration');
  world.farming.updateFarmland(2, 63, 2);
  assert.equal(world.getBlock(2, 63, 2), BLOCKS.dirt.id, 'ordinary dirt is unchanged by hydration update');
  world.setBlock(2, 63, 2, BLOCKS.farmland.id);
  world.farming.updateFarmland(2, 63, 2);
  assert.equal(world.getBlock(2, 63, 2), BLOCKS.wet_farmland.id);
  world.setBlock(6, 63, 2, 0);
  world.farming.updateFarmland(2, 63, 2);
  assert.equal(world.getBlock(2, 63, 2), BLOCKS.farmland.id);
  world.setBlock(2, 64, 2, BLOCKS.wheat.id, { age: 4 });
  assert.equal(world.farming.trample(2, 63, 2, true), true);
  assert.equal(world.getBlock(2, 63, 2), BLOCKS.dirt.id);
  assert.equal(world.getBlock(2, 64, 2), 0);
}

{
  const world = fixture();
  world.setBlock(2, 63, 2, BLOCKS.farmland.id);
  world.setBlock(2, 64, 2, BLOCKS.wheat.id, { age: 0 });
  const used = world.farming.interact({ pos: { x: 2, y: 64, z: 2 } }, 'bone_meal');
  assert.equal(used.consumed, 1);
  const age = world.getBlockState(2, 64, 2).age;
  assert.ok(age >= 2 && age <= 4);
  assert.equal(world.farming.grow(2, 64, 2, 20), true);
  assert.equal(world.getBlockState(2, 64, 2).age, 7);
  assert.equal(world.farming.useBoneMeal(2, 64, 2), false, 'mature crops do not consume bone meal');
  assert.deepEqual(matureDrops('wheat', { age: 7 }, () => 0.99), [{ id: 'wheat', count: 1 }, { id: 'wheat_seeds', count: 4 }]);
  assert.deepEqual(matureDrops('wheat', { age: 2 }), [{ id: 'wheat_seeds', count: 1 }]);
}

{
  const world = fixture(99);
  for (const [name, seed, maximum] of [['carrots', 'carrot', 7], ['potatoes', 'potato', 7], ['beetroots', 'beetroot_seeds', 3]]) {
    const z = name.length + 3;
    world.setBlock(2, 63, z, BLOCKS.farmland.id);
    world.setBlock(2, 64, z, BLOCKS[name].id, { age: 0 });
    world.farming.grow(2, 64, z, maximum);
    assert.equal(world.getBlockState(2, 64, z).age, maximum);
    assert.equal(matureDrops(name, { age: maximum }, () => 0)[0].id, seed === 'beetroot_seeds' ? 'beetroot' : seed);
  }
  world.setBlock(2, 63, 12, BLOCKS.soul_sand.id);
  world.setBlock(2, 64, 12, BLOCKS.nether_wart.id, { age: 0 });
  world.farming.grow(2, 64, 12, 3);
  assert.equal(matureDrops('nether_wart', { age: 3 }, () => 0)[0].count, 2);
}

{
  const world = fixture();
  world.setBlock(4, 63, 4, BLOCKS.farmland.id);
  for (const [x, z] of [[5, 4], [3, 4], [4, 5], [4, 3]]) world.setBlock(x, 63, z, BLOCKS.dirt.id);
  world.setBlock(4, 64, 4, BLOCKS.pumpkin_stem.id, { age: 7 });
  assert.equal(world.farming.tryFruit(4, 64, 4), true);
  const fruit = [[5, 4], [3, 4], [4, 5], [4, 3]].some(([x, z]) => world.getBlock(x, 64, z) === BLOCKS.pumpkin.id);
  assert.equal(fruit, true);
  assert.equal(world.farming.tryFruit(4, 64, 4), false, 'an existing attached fruit prevents duplicates');
}

{
  const world = fixture();
  world.setBlock(8, 63, 2, BLOCKS.sand.id);
  world.setBlock(8, 64, 2, BLOCKS.cactus.id, { age: 14 });
  assert.equal(world.farming.growTall(8, 64, 2), true);
  assert.equal(world.getBlock(8, 65, 2), BLOCKS.cactus.id);
  world.setBlock(10, 63, 2, BLOCKS.sand.id);
  world.setBlock(10, 64, 2, BLOCKS.sugar_cane.id, { age: 0 });
  assert.equal(world.farming.useBoneMeal(10, 64, 2), true);
  assert.equal(world.getBlock(10, 65, 2), BLOCKS.sugar_cane.id);
}

{
  const world = fixture();
  world.setBlock(2, 64, 8, BLOCKS.jungle_log.id);
  const placed = world.farming.interact({ pos: { x: 2, y: 64, z: 8 }, prevPos: { x: 3, y: 64, z: 8 } }, 'cocoa_beans', 'west');
  assert.equal(placed.consumed, 1);
  world.farming.grow(3, 64, 8, 2);
  assert.deepEqual(matureDrops('cocoa', { age: 2 }), [{ id: 'cocoa_beans', count: 3 }]);
}

assert.equal(grassDrop(() => 0.124), 'wheat_seeds');
assert.equal(grassDrop(() => 0.125), null);

console.log('Farming checks passed: hoes, hydration, trampling, planting, growth, bone meal, mature loot, stems, tall crops, cocoa, and nether wart.');
