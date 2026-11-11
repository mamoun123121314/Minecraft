import { BREWING_RECIPES, BREW_TICKS, BREW_FUEL_USES } from '../../data/brewing.js';

export class BrewingStand {
  constructor() { this.inputs = [null, null, null]; this.ingredient = null; this.fuel = null; this.fuelUses = 0; this.progress = 0; }
  recipeFor(stack) { return stack?.id === 'potion' && this.ingredient ? BREWING_RECIPES[`${stack.meta?.potion ?? 'water'}:${this.ingredient.id}`] : null; }
  canBrew() { return this.fuelUses > 0 && this.inputs.some(stack => this.recipeFor(stack)); }
  tick() {
    if (this.fuelUses <= 0 && this.fuel?.id === 'blaze_powder' && this.inputs.some(stack => this.recipeFor(stack))) {
      this.fuelUses = BREW_FUEL_USES;
      if (--this.fuel.count <= 0) this.fuel = null;
    }
    if (!this.canBrew()) { this.progress = 0; return false; }
    this.progress += 1;
    if (this.progress < BREW_TICKS) return false;
    for (let index = 0; index < 3; index += 1) { const result = this.recipeFor(this.inputs[index]); if (result) this.inputs[index] = { id: 'potion', count: 1, meta: { potion: result } }; }
    if (--this.ingredient.count <= 0) this.ingredient = null;
    this.fuelUses -= 1; this.progress = 0; return true;
  }
  serialize() { return { inputs: this.inputs.map(stack => stack ? { ...stack, meta: { ...stack.meta } } : null), ingredient: this.ingredient, fuel: this.fuel, fuelUses: this.fuelUses, progress: this.progress }; }
}
export function fillBottle(stack) { return stack?.id === 'glass_bottle' ? { id: 'potion', count: 1, meta: { potion: 'water' } } : null; }
