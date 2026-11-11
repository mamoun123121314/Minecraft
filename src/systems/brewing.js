import { BREWING_RECIPES, BREW_TICKS, BREW_FUEL_USES, EXTENDED_POTIONS, AMPLIFIED_POTIONS, INSTANT_POTIONS } from '../../data/brewing.js';

export function brewResult(stack, ingredient) {
  if (stack?.id !== 'potion' || !ingredient) return null;
  const meta = { potion: 'water', kind: 'drinkable', extended: false, amplifier: 0, ...stack.meta };
  const base = BREWING_RECIPES[`${meta.potion}:${ingredient}`];
  if (base && meta.kind === 'drinkable' && !meta.extended && meta.amplifier === 0) return { ...meta, potion: base };
  if (ingredient === 'gunpowder' && meta.kind === 'drinkable') return { ...meta, kind: 'splash' };
  if (ingredient === 'dragon_breath' && meta.kind === 'splash') return { ...meta, kind: 'lingering' };
  if (ingredient === 'redstone' && Object.hasOwn(EXTENDED_POTIONS, meta.potion) && !meta.extended && meta.amplifier === 0) return { ...meta, extended: true };
  if (ingredient === 'glowstone_dust' && (Object.hasOwn(AMPLIFIED_POTIONS, meta.potion) || Object.hasOwn(INSTANT_POTIONS, meta.potion)) && !meta.extended && meta.amplifier === 0) return { ...meta, amplifier: 1 };
  return null;
}

export class BrewingStand {
  constructor() { this.inputs = [null, null, null]; this.ingredient = null; this.fuel = null; this.fuelUses = 0; this.progress = 0; }
  recipeFor(stack) { return brewResult(stack, this.ingredient?.id); }
  canBrew() { return this.fuelUses > 0 && this.inputs.some(stack => this.recipeFor(stack)); }
  tick() {
    if (this.fuelUses <= 0 && this.fuel?.id === 'blaze_powder' && this.inputs.some(stack => this.recipeFor(stack))) {
      this.fuelUses = BREW_FUEL_USES;
      if (--this.fuel.count <= 0) this.fuel = null;
    }
    if (!this.canBrew()) { this.progress = 0; return false; }
    this.progress += 1;
    if (this.progress < BREW_TICKS) return false;
    for (let index = 0; index < 3; index += 1) { const result = this.recipeFor(this.inputs[index]); if (result) this.inputs[index] = { id: 'potion', count: 1, meta: result }; }
    if (--this.ingredient.count <= 0) this.ingredient = null;
    this.fuelUses -= 1; this.progress = 0; return true;
  }
  serialize() { return { inputs: this.inputs.map(stack => stack ? { ...stack, meta: { ...stack.meta } } : null), ingredient: this.ingredient, fuel: this.fuel, fuelUses: this.fuelUses, progress: this.progress }; }
}
export class BrewingSystem {
  constructor() { this.positions = new Map(); }
  at(position) { const key = position ? `${position.x},${position.y},${position.z}` : 'inventory'; if (!this.positions.has(key)) this.positions.set(key, new BrewingStand()); return this.positions.get(key); }
  tick() { let completed = 0; for (const stand of this.positions.values()) if (stand.tick()) completed += 1; return completed; }
  serialize() { return Object.fromEntries([...this.positions].map(([key, stand]) => [key, stand.serialize()])); }
  restore(data = {}) { this.positions.clear(); for (const [key, state] of Object.entries(data)) { const stand = this.at(key === 'inventory' ? null : Object.fromEntries(key.split(',').map((value, index) => [['x','y','z'][index], Number(value)]))); stand.inputs = state.inputs; stand.ingredient = state.ingredient; stand.fuel = state.fuel; stand.fuelUses = state.fuelUses; stand.progress = state.progress; } }
}
export function fillBottle(stack) { return stack?.id === 'glass_bottle' ? { id: 'potion', count: 1, meta: { potion: 'water' } } : null; }
