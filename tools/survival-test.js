import{SurvivalSystem}from'../src/systems/survival.js';import{MobSystem}from'../src/systems/mobs.js';
const survival=new SurvivalSystem();survival.fall(10);if(Math.abs(survival.health-13)>1)throw Error(`Fall health ${survival.health}`);
const fake={slots:[{id:'stone',count:8},null]},drops=[];const pos={x:1,y:2,z:3};survival.invulnerable=0;survival.die(fake,pos);if(fake.slots[0]!==null||survival.drops.length!==1)throw Error('Death drops failed');
const zombie={stats:{hostile:true},position:{x:0,z:0}},player={position:{x:15,z:0}};const can=MobSystem.prototype.canAggro.call({},zombie,player,true);if(!can)throw Error('Zombie aggro failed');console.log('Survival checks passed: fall damage, aggro, death drops.');
