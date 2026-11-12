import assert from 'node:assert/strict';
import { anvilPreview, AnvilSystem, grindstonePreview, GrindstoneSystem } from '../src/systems/smithing.js';
import { EnchantingSystem } from '../src/systems/enchanting.js';
import { SurvivalSystem } from '../src/systems/survival.js';
import { Inventory } from '../src/player/inventory.js';

const table=new EnchantingSystem();table.power=15;table.input={id:'book',count:1};table.lapis={id:'lapis_lazuli',count:3};const enchanter=new SurvivalSystem();enchanter.level=20;assert.ok(table.enchant(0,enchanter));assert.equal(table.input.id,'enchanted_book');assert.ok(Object.keys(table.input.meta.enchantments).length);
const sword={id:'diamond_sword',count:1,damage:7,meta:{enchantments:{sharpness:2}}},book={id:'enchanted_book',count:1,meta:{enchantments:{sharpness:2,unbreaking:3}}};let preview=anvilPreview(sword,book);assert.equal(preview.result.meta.enchantments.sharpness,3);assert.equal(preview.result.meta.enchantments.unbreaking,3);assert.equal(preview.result.damage,7);assert.equal(preview.cost,6);
assert.equal(anvilPreview(sword,{id:'enchanted_book',count:1,meta:{enchantments:{protection:1}}}),null,'incompatible book has no anvil result');
const left={id:'diamond_pickaxe',count:1,damage:1500,meta:{enchantments:{efficiency:2}}},right={id:'diamond_pickaxe',count:1,damage:1500,meta:{enchantments:{efficiency:2}}};preview=anvilPreview(left,right);assert.equal(preview.result.meta.enchantments.efficiency,3);assert.equal(preview.result.damage,1252);assert.equal(anvilPreview(left,{id:'iron_pickaxe',count:1}),null);
const anvil=new AnvilSystem(),survival=new SurvivalSystem();survival.level=20;anvil.left=sword;anvil.right=book;const result=anvil.take(survival);assert.equal(result.meta.enchantments.sharpness,3);assert.equal(survival.level,14);assert.equal(anvil.left,null);assert.equal(anvil.right,null);assert.equal(anvil.take(survival),null);
const grind=new GrindstoneSystem();grind.input=result;const cleaned=grind.preview;assert.equal(cleaned.result.id,'diamond_sword');assert.equal(cleaned.result.damage,7);assert.equal(cleaned.result.meta.enchantments,undefined);assert.equal(cleaned.xp,12);const beforeXp=survival.xp,beforeLevel=survival.level;const output=grind.take(survival);assert.equal(output.id,'diamond_sword');assert.equal(grind.input,null);assert.ok(survival.xp>beforeXp||survival.level>beforeLevel);assert.equal(grindstonePreview(output),null);
grind.input=book;assert.equal(grind.take(survival).id,'book');
const inventory=new Inventory();inventory.slots.fill(null);anvil.left={...sword};anvil.close(inventory);assert.equal(inventory.slots[0].damage,7);assert.equal(inventory.slots[0].meta.enchantments.sharpness,2);
console.log('Smithing OK: enchanted books, compatible anvil merges, same-item repair, XP costs, grindstone disenchanting and metadata preservation');
