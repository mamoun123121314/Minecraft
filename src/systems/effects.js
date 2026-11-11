import { POTIONS, EXTENDED_POTIONS, AMPLIFIED_POTIONS, INSTANT_POTIONS } from '../../data/brewing.js';

export function potionDefinition(stack) {
  const base = POTIONS[stack?.meta?.potion];
  if (!base) return base;
  if (base.effect === 'instant_health' || base.effect === 'instant_damage') return { ...base, amplifier: stack.meta?.amplifier ?? 0 };
  const extended = stack.meta?.extended ?? false, amplifier = stack.meta?.amplifier ?? 0;
  return { ...base, duration: extended ? EXTENDED_POTIONS[stack.meta.potion] : amplifier ? AMPLIFIED_POTIONS[stack.meta.potion] : base.duration, amplifier };
}

export class EffectSystem {
  constructor() { this.active = new Map(); this.ticks = 0; }
  add(id, duration, amplifier = 0) {
    if (duration <= 0) return;
    const previous = this.active.get(id);
    if (!previous || previous.duration <= duration) this.active.set(id, { id, duration, amplifier });
  }
  level(id) { return (this.active.get(id)?.amplifier ?? -1) + 1; }
  remove(id) { this.active.delete(id); }
  clear() { this.active.clear(); }
  applyPotion(stack, survival, durationScale = 1) {
    const potion = potionDefinition(stack);
    if (stack?.id !== 'potion' || !Object.hasOwn(POTIONS, stack?.meta?.potion)) return false;
    if (!potion) return true;
    if (potion.effect === 'instant_health') survival.health = Math.min(20, survival.health + 4 * 2 ** potion.amplifier);
    else if (potion.effect === 'instant_damage') survival.damage(6 * 2 ** potion.amplifier, 'magic');
    else this.add(potion.effect, Math.max(1,Math.floor(potion.duration*durationScale)), potion.amplifier);
    return true;
  }
  tick(survival) {
    this.ticks += 1;
    for (const [id, effect] of this.active) {
      if (id === 'regeneration' && this.ticks % Math.max(1, 50 >> effect.amplifier) === 0 && survival.health > 0 && survival.health < (survival.maxHealth??20)) survival.health = Math.min(survival.maxHealth??20, survival.health + 1);
      if (id === 'poison' && this.ticks % Math.max(1, 25 >> effect.amplifier) === 0 && survival.health > 1) { survival.invulnerable = 0; survival.damage(1, 'poison'); survival.health = Math.max(1, survival.health); }
      if (id === 'wither' && this.ticks % Math.max(1, 40 >> effect.amplifier) === 0) { survival.invulnerable = 0; survival.damage(1, 'wither'); }
      if (id === 'hunger' && this.ticks % Math.max(1, 40 >> effect.amplifier) === 0) survival.exhaust(.1 * (effect.amplifier + 1));
      effect.duration -= 1;
      if (effect.duration <= 0) this.active.delete(id);
    }
  }
  serialize() { return [...this.active.values()].map(effect => ({ ...effect })); }
  restore(effects = []) { this.active.clear(); for (const effect of effects) if (effect.duration > 0) this.active.set(effect.id, { ...effect }); }
}

export class PotionUseSystem {
  constructor(duration = 32) { this.duration = duration; this.stack = null; this.ticks = 0; }
  start(stack) { if (stack?.id !== 'potion' || (stack.meta?.kind ?? 'drinkable') !== 'drinkable' || !Object.hasOwn(POTIONS, stack.meta?.potion)) { this.stack = null; return false; } this.stack = { ...stack, meta: { ...stack.meta } }; this.ticks = 0; return true; }
  cancel() { this.stack = null; this.ticks = 0; }
  tick(currentStack, effects, survival, inventory) {
    if (!this.stack) return false;
    if (currentStack?.id !== 'potion' || JSON.stringify(currentStack.meta) !== JSON.stringify(this.stack.meta)) { this.cancel(); return false; }
    if (++this.ticks < this.duration) return false;
    const potion = this.stack.meta.potion; effects.applyPotion(this.stack, survival); inventory.consumeSelected(); inventory.add('glass_bottle'); this.cancel(); return potion;
  }
}

export class EnvironmentalEffectSystem {
  constructor() { this.fireTicks = 0; this.drownTicks = 0; this.lavaTicks = 0; }
  tick(survival, effects, { headInWater = false, inLava = false } = {}) {
    if (survival.dead) return;
    if (headInWater && !effects.level('water_breathing')) {
      survival.air = Math.max(-20, survival.air - 1);
      if (survival.air <= -20 && ++this.drownTicks >= 20) { survival.invulnerable = 0; survival.damage(2, 'drowning'); this.drownTicks = 0; survival.air = 0; }
    } else { survival.air = Math.min(300, survival.air + 4); this.drownTicks = 0; }
    if (inLava) {
      this.fireTicks = 100;
      if (++this.lavaTicks >= 20) { if (!effects.level('fire_resistance')) { survival.invulnerable = 0; survival.damage(4, 'lava'); } this.lavaTicks = 0; }
    } else {
      this.lavaTicks = 0;
      if (this.fireTicks > 0) { this.fireTicks -= 1; if (!effects.level('fire_resistance') && this.fireTicks % 20 === 0) { survival.invulnerable = 0; survival.damage(1, 'fire'); } }
    }
  }
}

export const movementMultiplier = (effects, sprinting = false) => {
  let multiplier = 1 + effects.level('speed') * .2 - effects.level('slowness') * .15;
  if (sprinting) multiplier *= 1.3;
  return Math.max(.1, multiplier);
};
