import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import { MobSystem } from '../src/systems/mobs.js';
import { TradingSystem, itemCount } from '../src/systems/trading.js';
import { Inventory } from '../src/player/inventory.js';
import { SurvivalSystem } from '../src/systems/survival.js';

const mobs=new MobSystem(new THREE.Scene()),trading=new TradingSystem(),inventory=new Inventory(),survival=new SurvivalSystem();inventory.slots.fill(null);
const farmer=mobs.spawn('villager',0,64,0,'farmer'),librarian=mobs.spawn('villager',1,64,0,'librarian'),toolsmith=mobs.spawn('villager',2,64,0,'toolsmith');assert.equal(farmer.id!==librarian.id,true);assert.equal(trading.offers(farmer).length,3);
inventory.add('wheat',20);assert.equal(trading.canTrade(farmer,0,inventory),true);const traded=trading.trade(farmer,0,inventory,survival);assert.equal(traded.id,'emerald');assert.equal(itemCount(inventory,'wheat'),0);assert.equal(itemCount(inventory,'emerald'),1);assert.equal(farmer.tradeStock[0],15);assert.equal(survival.xp,2);assert.equal(farmer.experience,2);
assert.equal(trading.trade(farmer,0,inventory,survival),null,'missing input rejects trade');assert.equal(farmer.tradeStock[0],15);
inventory.add('book',1);inventory.add('emerald',12);const book=trading.trade(librarian,1,inventory,survival);assert.equal(book.id,'enchanted_book');assert.equal(book.meta.enchantments.efficiency,1);assert.equal(itemCount(inventory,'book'),0);assert.equal(librarian.tradeStock[1],11);
inventory.add('emerald',12);const axe=trading.trade(toolsmith,2,inventory,survival);assert.equal(axe.meta.enchantments.efficiency,1);assert.equal(toolsmith.tradeStock[2],2);
const full=new Inventory();full.slots=Array(36).fill(null).map(()=>({id:'stone',count:64}));full.slots[0]={id:'wheat',count:40};const before=structuredClone(full.slots),stock=farmer.tradeStock[0];assert.equal(trading.trade(farmer,0,full,survival),null,'no output capacity rolls back transaction');assert.deepEqual(full.slots,before);assert.equal(farmer.tradeStock[0],stock);
farmer.tradeStock[0]=0;trading.tick(mobs,23999);assert.equal(farmer.tradeStock[0],0);trading.tick(mobs,0);assert.equal(farmer.tradeStock[0],16,'new day restocks villager');trading.tick(mobs,1);assert.equal(farmer.tradeStock[0],16,'same day does not duplicate stock reset');
console.log('Trading OK: professions, multi-input trades, enchanted outputs, stock, XP, atomic rollback and daily restock');
