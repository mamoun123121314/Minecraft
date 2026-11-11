import assert from 'node:assert/strict';
import { ItemContainer, CursorStack, CraftingGrid, ContainerSystem, transferStack } from '../src/player/containers.js';
import { Furnace } from '../src/systems/crafting.js';
import { WorldSaver } from '../src/world/saver.js';

{
  const chest = new ItemContainer(27), cursor = new CursorStack();
  chest.slots[0] = { id: 'stone', count: 5 };
  cursor.click(chest, 0, 'right');
  assert.deepEqual(cursor.held, { id: 'stone', count: 3 });
  assert.equal(chest.slots[0].count, 2);
  cursor.click(chest, 1, 'right');
  assert.equal(chest.slots[1].count, 1);
  assert.equal(cursor.held.count, 2);
  cursor.click(chest, 1);
  assert.equal(chest.slots[1].count, 3);
  assert.equal(cursor.held, null);
  chest.slots[2] = { id: 'dirt', count: 1 };
  cursor.click(chest, 1); cursor.click(chest, 2); cursor.click(chest, 1);
  assert.equal(chest.slots[1].id, 'dirt');
  assert.equal(chest.slots[2].id, 'stone');
}

{
  const source = new ItemContainer(2), destination = new ItemContainer(2);
  source.slots[0] = { id: 'stone', count: 64 };
  destination.slots[0] = { id: 'stone', count: 63 };
  destination.slots[1] = { id: 'dirt', count: 64 };
  assert.equal(transferStack(source, 0, destination), true);
  assert.equal(source.slots[0].count, 63);
  assert.equal(destination.slots[0].count, 64);
  const cursor = new CursorStack();
  assert.equal(cursor.click(source, 0, 'shift', destination), false, 'full destination leaves source untouched');
}

{
  const inventory = new ItemContainer(36), grid = new CraftingGrid(2), cursor = new CursorStack();
  grid.slots = Array.from({ length: 4 }, () => ({ id: 'oak_planks', count: 2 }));
  const output = grid.output;
  assert.equal(output.id, 'crafting_table');
  assert.equal(grid.takeOutput(cursor), true);
  assert.equal(cursor.held.id, 'crafting_table');
  assert.ok(grid.slots.every(slot => slot.count === 1));
  assert.equal(grid.takeOutput(cursor), true);
  assert.ok(grid.slots.every(slot => slot === null));
  assert.equal(grid.output, null);
  grid.slots[0] = { id: 'oak_log', count: 3 };
  grid.returnItems(inventory);
  assert.equal(grid.slots[0], null);
  assert.equal(inventory.slots[0].count, 3);
}

{
  const furnace = new Furnace();
  furnace.fuel = { id: 'coal', count: 1 };
  furnace.tick();
  assert.equal(furnace.fuel.count, 1, 'fuel is not consumed without input');
  furnace.input = { id: 'sand', count: 3 };
  furnace.output = { id: 'glass', count: 63 };
  furnace.tick();
  assert.equal(furnace.fuel, null);
  for (let tick = 1; tick < 200; tick += 1) furnace.tick();
  assert.equal(furnace.output.count, 64);
  assert.equal(furnace.input.count, 2);
  furnace.fuel = { id: 'coal', count: 1 };
  furnace.tick();
  assert.equal(furnace.fuel.count, 1, 'full incompatible output blocks fuel use');
  furnace.output = { id: 'stone', count: 1 };
  furnace.tick();
  assert.equal(furnace.fuel.count, 1, 'different output blocks smelting');
}

{
  const containers = new ContainerSystem(), chest = containers.at({ x: -2, y: 64, z: 9 });
  chest.add('diamond', 3); chest.add('stone', 64);
  const serialized = containers.serialize();
  const restored = new ContainerSystem(); restored.restore(JSON.parse(JSON.stringify(serialized)));
  const copy = restored.at({ x: -2, y: 64, z: 9 });
  assert.equal(copy.slots[0].id, 'diamond');
  assert.equal(copy.slots[1].count, 64);
  assert.notEqual(copy.slots[0], chest.slots[0], 'restore does not alias live stacks');
  const saver = new WorldSaver();
  await saver.saveWorld({ id: 'container-test', containers: serialized });
  assert.deepEqual((await saver.loadWorld('container-test')).containers, serialized);
}

console.log('Container checks passed: cursor swap/merge/split, shift transfer, overflow, crafting consumption, furnace gating/output limits, chest persistence, and save round trips.');
