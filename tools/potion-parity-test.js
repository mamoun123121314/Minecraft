import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import { brewResult, BrewingSystem } from '../src/systems/brewing.js';
import { EffectSystem, EnvironmentalEffectSystem, PotionUseSystem, potionDefinition } from '../src/systems/effects.js';
import { SurvivalSystem } from '../src/systems/survival.js';
import { ThrownPotionSystem } from '../src/systems/potions.js';

const potion = (name, extra={}) => ({id:'potion',count:1,meta:{potion:name,...extra}});
assert.equal(brewResult(potion('swiftness'),'gunpowder').kind,'splash');
assert.equal(brewResult(potion('swiftness',{kind:'splash'}),'dragon_breath').kind,'lingering');
assert.equal(brewResult(potion('swiftness'),'redstone').extended,true);
assert.equal(brewResult(potion('swiftness'),'glowstone_dust').amplifier,1);
assert.equal(brewResult(potion('swiftness',{extended:true}),'glowstone_dust'),null);
assert.equal(brewResult(potion('swiftness',{amplifier:1}),'redstone'),null);
assert.equal(brewResult(potion('healing'),'redstone'),null);
assert.equal(brewResult(potion('weakness'),'glowstone_dust'),null);
assert.equal(brewResult(potion('water',{kind:'splash'}),'nether_wart'),null,'splash water cannot skip directly to splash awkward');
assert.equal(potionDefinition(potion('swiftness',{extended:true})).duration,9600);
assert.equal(potionDefinition(potion('poison',{amplifier:1})).duration,420);
assert.equal(potionDefinition(potion('slowness',{amplifier:1})).duration,400);
const survival=new SurvivalSystem();survival.health=10;const effects=new EffectSystem();effects.applyPotion(potion('healing',{amplifier:1}),survival);assert.equal(survival.health,18);
assert.equal(new PotionUseSystem().start(potion('swiftness',{kind:'splash'})),false);

const environment=new EnvironmentalEffectSystem();const swimmer=new SurvivalSystem();const noEffects=new EffectSystem();for(let i=0;i<340;i+=1)environment.tick(swimmer,noEffects,{headInWater:true});assert.equal(swimmer.health,18);assert.equal(swimmer.air,-1);
for(let i=0;i<76;i+=1)environment.tick(swimmer,noEffects);assert.equal(swimmer.air,300);
const breathing=new EffectSystem();breathing.add('water_breathing',1000);for(let i=0;i<400;i+=1)environment.tick(swimmer,breathing,{headInWater:true});assert.equal(swimmer.air,300);
const diver=new SurvivalSystem();for(let i=0;i<20;i+=1)environment.tick(diver,noEffects,{inLava:true});assert.equal(diver.health,16);
const fireproof=new SurvivalSystem(),resistance=new EffectSystem();resistance.add('fire_resistance',1000);for(let i=0;i<40;i+=1)environment.tick(fireproof,resistance,{inLava:true});assert.equal(fireproof.health,20);

const machines=new BrewingSystem(),first=machines.at({x:1,y:64,z:2}),second=machines.at({x:9,y:64,z:2});first.inputs[0]=potion('water');first.ingredient={id:'nether_wart',count:1};first.fuelUses=1;first.progress=399;assert.equal(machines.tick(),1);assert.equal(first.inputs[0].meta.potion,'awkward');assert.equal(second.progress,0);const restored=new BrewingSystem();restored.restore(machines.serialize());assert.equal(restored.at({x:1,y:64,z:2}).inputs[0].meta.potion,'awkward');assert.equal(restored.positions.size,2);

const scene=new THREE.Scene(),thrown=new ThrownPotionSystem(scene);const player={position:{x:0,y:0,z:0}},playerEffects=new EffectSystem(),mob={hp:20,hurtTicks:0,position:{x:1,y:0,z:0},stats:{height:2,hp:20},effects:new EffectSystem()},mobs={entities:[mob],kill(){}},combat={hurt(target,amount){target.hp-=amount;return{amount};}};
const projectile=thrown.throwPotion(potion('swiftness',{kind:'lingering'}),{x:0,y:1,z:0},{x:0,y:0,z:1});assert.ok(projectile);assert.equal(thrown.throwPotion(potion('swiftness'),{x:0,y:0,z:0},{x:0,y:0,z:1}),null);
thrown.detonate(projectile,mobs,player,playerEffects,new SurvivalSystem(),combat);assert.equal(playerEffects.level('speed'),1);assert.equal(mob.effects.level('speed'),1);assert.equal(thrown.clouds.length,1);
playerEffects.clear();mob.effects.clear();for(let i=0;i<590;i+=1)thrown.tick({getBlock(){return 0;}},mobs,player,playerEffects,new SurvivalSystem(),combat);assert.equal(playerEffects.active.get('speed').duration,900);assert.equal(thrown.clouds[0].ticks,10);
console.log('Potion parity OK: splash/lingering, upgrades, environmental effects, per-position machines, area effects and cloud scaling');
