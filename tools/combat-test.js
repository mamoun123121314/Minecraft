import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import { CombatSystem, chargedDamage } from '../src/systems/combat.js';
import { WEAPONS, armorProtection, mitigateDamage } from '../data/combat.js';
import { Inventory } from '../src/player/inventory.js';
import { MobSystem } from '../src/systems/mobs.js';
import { SurvivalSystem } from '../src/systems/survival.js';
import { ITEMS } from '../data/items.js';
import { FOODS } from '../data/foods.js';

assert.equal(WEAPONS.diamond_sword.damage, 7);
assert.equal(WEAPONS.netherite_axe.damage, 10);
assert.equal(WEAPONS.iron_pickaxe.attackSpeed, 1.2);
assert.equal(ITEMS.bow.durability, 384);
assert.equal(ITEMS.trident.durability, 250);
assert.equal(ITEMS.shield.stack, 1);
assert.equal(FOODS.rotten_flesh.nutrition, 4);
assert.ok(Math.abs(chargedDamage(7, 0.5) - 2.8) < 1e-10);
assert.equal(chargedDamage(7, 1, true), 10.5);

const equipment = { helmet: { id: 'iron_helmet' }, chestplate: { id: 'iron_chestplate' }, leggings: { id: 'iron_leggings' }, boots: { id: 'iron_boots' } };
assert.deepEqual(armorProtection(equipment), { armor: 15, toughness: 0 });
assert.ok(Math.abs(mitigateDamage(10, armorProtection(equipment)) - 2) < 1e-10);
assert.ok(Math.abs(mitigateDamage(10, { armor: 20, toughness: 8 }) - 2) < 1e-10);
assert.ok(Math.abs(mitigateDamage(100, { armor: 20, toughness: 8 }) - 20) < 1e-10);

function fixture() {
  const scene = new THREE.Scene(), mobs = new MobSystem(scene), combat = new CombatSystem(scene, () => 0.99), inventory = new Inventory();
  inventory.slots.fill(null); inventory.add('diamond_sword'); inventory.add('bow'); inventory.add('arrow', 10);
  const player = { position: { x: 0, y: 64, z: 0 }, velocity: { x: 0, y: 0, z: 0 }, onGround: true, sprinting: false };
  const mob = mobs.spawn('zombie', 1, 64, 0);
  combat.tick({ getBlock: () => 0 }, mobs);
  return { scene, mobs, combat, inventory, player, mob };
}

{
  const { combat, mobs, inventory, player, mob } = fixture();
  const hit = combat.attack(mob, 'diamond_sword', player, mobs, inventory);
  assert.equal(hit.amount, 7);
  assert.equal(mob.hp, 13);
  assert.equal(mob.hurtTicks, 10);
  assert.ok(mob.knockback.x > 0);
  assert.equal(inventory.held.damage, 1);
  assert.equal(combat.attack(mob, 'diamond_sword', player, mobs, inventory), null, 'cooldown prevents immediate second attack');
  for (let i = 0; i < 13; i += 1) combat.tick({ getBlock: () => 0 }, mobs);
  assert.equal(combat.charge, 1);
}

{
  const { combat, mobs, inventory, player, mob } = fixture();
  player.onGround = false; player.velocity.y = -0.2;
  assert.equal(combat.attack(mob, 'diamond_sword', player, mobs, inventory).amount, 10.5);
}

{
  const { combat, mobs, inventory, player } = fixture();
  const distant = mobs.spawn('cow', 8, 64, 0);
  assert.equal(combat.attack(distant, 'diamond_sword', player, mobs, inventory), null, 'three block reach');
  const direction = { x: 1, y: 0, z: 0 };
  assert.equal(combat.nearestEntity(mobs, { x: 0, y: 64.8, z: 0 }, direction)?.type, 'zombie');
  combat.hurt(mobs.entities[0], 100, mobs);
  assert.equal(mobs.entities.length, 1);
}

{
  const { combat, mobs, inventory, player, mob } = fixture();
  combat.hurt(mob, 19, mobs);
  mob.hurtTicks = 0;
  const result = combat.hurt(mob, 19, mobs);
  assert.equal(result.killed, true);
  assert.deepEqual(result.drop, { id: 'rotten_flesh', count: 1 });
  assert.equal(mobs.entities.length, 0);
  assert.equal(mob.mesh.parent, null);
}

{
  const inventory = new Inventory(), survival = new SurvivalSystem(), combat = new CombatSystem(new THREE.Scene());
  inventory.slots.fill(null); inventory.add('iron_chestplate'); inventory.add('shield');
  assert.equal(inventory.equipSelected(), true);
  assert.equal(inventory.equipment.chestplate.id, 'iron_chestplate');
  inventory.select(1);
  assert.equal(inventory.equipSelected(), true);
  assert.equal(inventory.equipment.offhand.id, 'shield');
  combat.receiveDamage(survival, 10, inventory, true);
  assert.ok(Math.abs(survival.health - 17.6) < 1e-10, 'chestplate reduces raw damage');
  const first = survival.health;
  combat.receiveDamage(survival, 10, inventory, true);
  assert.equal(survival.health, first, 'ten tick hurt invulnerability');
  survival.invulnerable = 0; combat.blocking = true;
  combat.receiveDamage(survival, 10, inventory, true);
  assert.ok(Math.abs(survival.health - (first - 1)) < 1e-10, 'shield subtracts five before armor');
  survival.die(inventory, playerPosition());
  assert.equal(survival.drops.length, 2, 'equipped items join death drops');
  assert.equal(inventory.equipment.chestplate, null);
}
function playerPosition() { return { x: 1, y: 2, z: 3 }; }

{
  const { combat, mobs } = fixture();
  mobs.entities[0].position.x = 2;
  combat.shoot('arrow', { x: 0, y: 64.8, z: 0 }, { x: 1, y: 0, z: 0 }, 1);
  const world = { getBlock: () => 0 };
  for (let i = 0; i < 4; i += 1) combat.tick(world, mobs);
  assert.ok(mobs.entities[0].hp < 20);
  assert.equal(combat.projectiles.length, 0, 'arrow is removed after entity hit');
  combat.shoot('trident', { x: 0, y: 64, z: 0 }, { x: 1, y: 0, z: 0 });
  combat.tick({ getBlock: () => 1 }, mobs);
  assert.equal(combat.projectiles.length, 0, 'world collision disposes trident mesh');
}

console.log('Combat checks passed: weapon values, charge, cooldown, critical hits, reach, armor/toughness, shields, durability, invulnerability, drops, projectiles, and disposal.');
