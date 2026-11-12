import assert from 'node:assert/strict';
import { WorldMap } from '../src/world/world.js';
import { CHUNK_VOLUME } from '../src/world/chunk.js';
import { BLOCKS } from '../data/blocks.js';
import { ITEMS } from '../data/items.js';
import { EnchantingSystem, enchantmentOffers, bookshelfPower } from '../src/systems/enchanting.js';
import { SurvivalSystem } from '../src/systems/survival.js';
import { Inventory } from '../src/player/inventory.js';
import { miningProfile } from '../src/player/mining.js';
import { CombatSystem } from '../src/systems/combat.js';
import * as THREE from '../vendor/three.module.js';

const world=new WorldMap();world.addChunk(0,0,new Uint16Array(CHUNK_VOLUME));const position={x:8,y:64,z:8};world.setBlock(10,64,8,BLOCKS.bookshelf.id);assert.equal(bookshelfPower(world,position),1);world.setBlock(9,64,8,BLOCKS.stone.id);assert.equal(bookshelfPower(world,position),0);world.setBlock(9,64,8,0);for(let dy=0;dy<2;dy+=1)for(let dx=-2;dx<=2;dx+=1)for(let dz=-2;dz<=2;dz+=1)if(Math.max(Math.abs(dx),Math.abs(dz))===2)world.setBlock(8+dx,64+dy,8+dz,BLOCKS.bookshelf.id);assert.equal(bookshelfPower(world,position),15);
const pick={id:'diamond_pickaxe',count:1,damage:5},offers=enchantmentOffers(pick,15,42);assert.equal(offers.length,3);assert.deepEqual(enchantmentOffers(pick,15,42),offers);assert.ok(offers.every(offer=>offer.enchantments.efficiency||offer.enchantments.unbreaking));assert.ok(enchantmentOffers({id:'diamond_sword'},15,42).some(offer=>offer.enchantments.sharpness));assert.ok(enchantmentOffers({id:'diamond_chestplate'},15,42).some(offer=>offer.enchantments.protection));
const system=new EnchantingSystem();system.power=15;system.input={...pick};system.lapis={id:'lapis_lazuli',count:3};const survival=new SurvivalSystem();survival.level=20;const before=system.offers;assert.ok(system.enchant(0,survival));assert.equal(survival.level,20-before[0].level);assert.equal(system.lapis.count,2);assert.ok(system.input.meta.enchantments);assert.notDeepEqual(system.offers,before,'successful enchant rerolls offers');
const inventory=new Inventory();inventory.slots.fill(null);system.close(inventory);assert.equal(inventory.slots[0].damage,5);assert.equal(inventory.slots[1].id,'lapis_lazuli');
const poor=new SurvivalSystem(),failed=new EnchantingSystem();failed.power=15;failed.input={id:'diamond_sword',count:1};failed.lapis={id:'lapis_lazuli',count:3};assert.equal(failed.enchant(2,poor),null);assert.equal(failed.lapis.count,3);

const efficient={id:'iron_pickaxe',meta:{enchantments:{efficiency:5}}};assert.equal(miningProfile(BLOCKS.stone.id,efficient).speed,32);
const combat=new CombatSystem(new THREE.Scene()),armored=new Inventory(),victim=new SurvivalSystem();armored.equipment.chestplate={id:'iron_chestplate',meta:{enchantments:{protection:4}}};assert.ok(Math.abs(combat.receiveDamage(victim,10,armored)-2.016)<1e-10);
const swordInventory=new Inventory();swordInventory.slots.fill(null);swordInventory.slots[0]={id:'diamond_sword',count:1,meta:{enchantments:{sharpness:5}}};combat.cooldown=combat.maximumCooldown;const mob={hp:20,hurtTicks:0,position:{x:0,y:0,z:0},stats:{height:2}},player={position:{x:0,y:0,z:1},velocity:{y:0},onGround:true,sprinting:false};assert.equal(combat.attack(mob,'diamond_sword',player,{kill(){}},swordInventory).amount,10);
const tool=new Inventory();tool.slots[0]={id:'iron_pickaxe',count:1,meta:{enchantments:{unbreaking:3}}};tool.damageSelected(1,()=>0);assert.equal(tool.held.damage,undefined);tool.damageSelected(1,()=>.99);assert.equal(tool.held.damage,1);
const armor=new Inventory();armor.equipment.helmet={id:'leather_helmet',count:1,meta:{enchantments:{unbreaking:1}}};assert.equal(ITEMS.leather_helmet.durability,55);armor.damageEquipment('helmet',1,()=>0);assert.equal(armor.equipment.helmet.damage,undefined);armor.damageEquipment('helmet',1,()=>.99);assert.equal(armor.equipment.helmet.damage,1);for(let i=0;i<54;i+=1)armor.damageEquipment('helmet');assert.equal(armor.equipment.helmet,null);
const xp=new SurvivalSystem();xp.addXp(30);assert.equal(xp.level,3);assert.equal(xp.xp,3);
console.log('Enchanting OK: bookshelf power, deterministic offers/costs, Efficiency, Sharpness, Protection, Unbreaking, armor durability and XP');
