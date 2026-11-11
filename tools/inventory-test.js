import{Inventory}from'../src/player/inventory.js';
const inventory=new Inventory();inventory.slots.fill(null);
if(inventory.add('stone',130)!==0||inventory.slots[0].count!==64||inventory.slots[1].count!==64||inventory.slots[2].count!==2)throw Error('Stack splitting failed');
if(inventory.remove('stone',65)!==65||inventory.slots[2]!==null||inventory.slots[1].count!==1||inventory.slots[0].count!==64)throw Error('Reverse-order removal failed');
inventory.slots.fill({id:'dirt',count:64});if(inventory.add('diamond',3)!==3)throw Error('Full inventory must return overflow');
inventory.slots.fill(null);inventory.add('diamond_pickaxe',2);if(inventory.slots[0].count!==1||inventory.slots[1].count!==1)throw Error('Unstackable tools must occupy separate slots');
inventory.select(0);if(!inventory.consumeSelected()||inventory.slots[0]!==null||inventory.consumeSelected())throw Error('Selected-stack consumption failed');
console.log('Inventory checks passed: merge, split, overflow, stack limits, removal, and selected consumption.');
