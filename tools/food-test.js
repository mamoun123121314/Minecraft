import{FOODS,EatingSystem}from'../data/foods.js';
import{SurvivalSystem}from'../src/systems/survival.js';
import{Inventory}from'../src/player/inventory.js';
if(Object.keys(FOODS).length!==16)throw Error('Expected 15 calibrated foods');
const survival=new SurvivalSystem();survival.hunger=10;survival.saturation=0;const inventory=new Inventory();inventory.slots.fill(null);inventory.add('bread',2);inventory.select(0);const eating=new EatingSystem();
if(!eating.start('bread',survival))throw Error('Hungry player must be able to start eating');for(let tick=0;tick<31;tick++)if(eating.tick('bread',survival,inventory))throw Error('Food consumed before 32 ticks');if(eating.tick('bread',survival,inventory)!=='bread'||survival.hunger!==15||survival.saturation!==6||inventory.held.count!==1)throw Error('Bread nutrition, saturation, duration, or consumption incorrect');
survival.hunger=20;if(eating.start('bread',survival))throw Error('Full player must not eat ordinary food');survival.hunger=10;eating.start('bread',survival);eating.tick('bread',survival,inventory);inventory.slots[0]={id:'apple',count:1};if(eating.tick('apple',survival,inventory)||eating.item!==null)throw Error('Changing held item must cancel eating');
survival.hunger=19;survival.saturation=18;survival.eat(8,12.8);if(survival.hunger!==20||survival.saturation!==20)throw Error('Food levels must clamp to hunger and 20');
console.log('Food checks passed: values, 32-tick use, hunger gate, saturation clamp, consumption, and cancellation.');
