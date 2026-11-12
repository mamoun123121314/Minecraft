import * as THREE from '../../vendor/three.module.js';
import { WEAPONS, armorProtection, mitigateDamage } from '../../data/combat.js';
import { enchantmentLevel } from './enchanting.js';

export const MOB_DROPS = Object.freeze({ zombie: 'rotten_flesh', skeleton: 'bone', creeper: 'gunpowder', cow: 'beef', pig: 'porkchop', sheep: 'mutton', chicken: 'chicken' });
export const attackCharge = cooldown => Math.max(0, Math.min(1, cooldown));
export const chargedDamage = (base, charge, critical = false) => (0.2 + 0.8 * charge * charge) * base * (critical && charge > 0.9 ? 1.5 : 1);

export class CombatSystem {
  constructor(scene, seedRandom = () => 0.5) {
    this.scene = scene; this.random = seedRandom; this.cooldown = 0; this.maximumCooldown = 1; this.projectiles = []; this.blocking = false;
  }
  get charge() { return attackCharge(this.cooldown / this.maximumCooldown); }
  protection(inventory) { return armorProtection(inventory.equipment); }
  receiveDamage(survival, amount, inventory, frontal = false, effects = null) {
    amount *= 1 - (effects?.level('resistance') ?? 0) * .2;
    const shielded = this.blocking && frontal && inventory.equipment.offhand?.id === 'shield' ? Math.max(0, amount - 5) : amount;
    const epf = Object.values(inventory.equipment).reduce((sum,stack)=>sum+enchantmentLevel(stack,'protection'),0);
    const reduced = mitigateDamage(shielded, this.protection(inventory)) * (1-Math.min(20,epf)*.04);
    return survival.damage(reduced, 'combat');
  }
  attack(mob, itemId, player, mobs, inventory, effects = null) {
    if (!mob || mob.hp <= 0 || mob.hurtTicks > 0 || this.cooldown < this.maximumCooldown) return null;
    const dx = mob.position.x - player.position.x, dy = mob.position.y + mob.stats.height / 2 - (player.position.y + 1.62), dz = mob.position.z - player.position.z;
    if (dx * dx + dy * dy + dz * dz > 9) return null;
    const weapon = WEAPONS[itemId] ?? { damage: 1, attackSpeed: 4 };
    const charge = this.charge, critical = player.velocity.y < 0 && !player.onGround && !player.sprinting;
    const damage = Math.max(0, chargedDamage(weapon.damage, charge, critical) + (enchantmentLevel(inventory.held,'sharpness')*.5+.5*(enchantmentLevel(inventory.held,'sharpness')>0)) + (effects?.level('strength') ?? 0) * 3 - (effects?.level('weakness') ?? 0) * 4);
    this.maximumCooldown = Math.max(1, Math.round(20 / weapon.attackSpeed)); this.cooldown = 0;
    if (WEAPONS[itemId]) inventory.damageSelected(1,this.random);
    return this.hurt(mob, damage, mobs, { x: dx, z: dz }, 6 + (critical ? 2 : 0));
  }
  hurt(mob, amount, mobs, direction = { x: 0, z: 0 }, knockback = 0) {
    if (mob.hurtTicks > 0 || mob.hp <= 0) return null;
    mob.hp = Math.max(0, mob.hp - amount); mob.hurtTicks = 10;
    const length = Math.hypot(direction.x, direction.z) || 1;
    mob.knockback = { x: direction.x / length * knockback / 20, y: 0.4, z: direction.z / length * knockback / 20 };
    if (mob.hp === 0) return { amount, killed: true, drop: mobs.kill(mob) };
    return { amount, killed: false };
  }
  nearestEntity(mobs, origin, direction, maximum = 3) {
    let best = null, bestDistance = maximum;
    for (const mob of mobs.entities) {
      if (mob.hp <= 0) continue;
      const center = { x: mob.position.x - origin.x, y: mob.position.y + mob.stats.height / 2 - origin.y, z: mob.position.z - origin.z };
      const along = center.x * direction.x + center.y * direction.y + center.z * direction.z;
      if (along < 0 || along > bestDistance) continue;
      const perpendicular2 = center.x * center.x + center.y * center.y + center.z * center.z - along * along;
      if (perpendicular2 <= Math.max(0.35, mob.stats.width) ** 2) { best = mob; bestDistance = along; }
    }
    return best;
  }
  shoot(kind, origin, direction, charge = 1) {
    if (kind !== 'arrow' && kind !== 'trident') return null;
    const speed = kind === 'arrow' ? 3 * Math.max(0.1, charge) : 2.5;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(kind === 'arrow' ? 0.06 : 0.12, 0.06, kind === 'arrow' ? 0.7 : 1.2), new THREE.MeshBasicMaterial({ color: kind === 'arrow' ? 0xc8b89a : 0x4fa99b }));
    mesh.position.set(origin.x, origin.y, origin.z); mesh.lookAt(origin.x + direction.x, origin.y + direction.y, origin.z + direction.z); this.scene.add(mesh);
    const projectile = { kind, position: { ...origin }, velocity: { x: direction.x * speed, y: direction.y * speed, z: direction.z * speed }, mesh, ticks: 0, charge };
    this.projectiles.push(projectile); return projectile;
  }
  tick(world, mobs) {
    this.cooldown = Math.min(this.maximumCooldown, this.cooldown + 1);
    for (let index = this.projectiles.length - 1; index >= 0; index -= 1) {
      const projectile = this.projectiles[index]; projectile.ticks += 1; projectile.velocity.y -= projectile.kind === 'arrow' ? 0.05 : 0.03;
      const steps = 4; let remove = projectile.ticks > 1200;
      for (let step = 0; step < steps && !remove; step += 1) {
        projectile.position.x += projectile.velocity.x / steps; projectile.position.y += projectile.velocity.y / steps; projectile.position.z += projectile.velocity.z / steps;
        const block = world.getBlock(Math.floor(projectile.position.x), Math.floor(projectile.position.y), Math.floor(projectile.position.z));
        if (block && block !== 5 && block !== 11) remove = true;
        for (const mob of mobs.entities) {
          if (mob.hp <= 0) continue;
          const dx = mob.position.x - projectile.position.x, dy = mob.position.y + mob.stats.height / 2 - projectile.position.y, dz = mob.position.z - projectile.position.z;
          if (dx * dx + dy * dy + dz * dz < (mob.stats.width * 0.75 + 0.15) ** 2) {
            const damage = projectile.kind === 'trident' ? 8 : projectile.charge >= 0.95 ? 6 + Math.floor(this.random() * 6) : 2 + Math.floor(this.random() * 4);
            this.hurt(mob, damage, mobs, projectile.velocity, 3); remove = true; break;
          }
        }
      }
      projectile.mesh.position.set(projectile.position.x, projectile.position.y, projectile.position.z);
      if (remove) { this.scene.remove(projectile.mesh); projectile.mesh.geometry.dispose(); projectile.mesh.material.dispose(); this.projectiles.splice(index, 1); }
    }
  }
}
