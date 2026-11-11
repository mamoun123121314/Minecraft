import { ITEMS } from '../../data/items.js';
import { findRecipe } from '../systems/crafting.js';

export const cloneStack = stack => stack ? { ...stack } : null;
export const maximumStack = stack => ITEMS[stack?.id]?.stack ?? 64;
export class ItemContainer {
  constructor(size = 27, slots = null) { this.slots = slots ?? Array(size).fill(null); if (this.slots.length !== size) throw new Error('Container size mismatch'); }
  get size() { return this.slots.length; }
  add(id, count = 1) {
    let remaining = count;
    const maximum = ITEMS[id]?.stack ?? 64;
    for (const slot of this.slots) if (slot?.id === id && slot.count < maximum) { const moved = Math.min(remaining, maximum - slot.count); slot.count += moved; remaining -= moved; if (!remaining) return 0; }
    for (let index = 0; index < this.slots.length && remaining; index += 1) if (!this.slots[index]) { const moved = Math.min(remaining, maximum); this.slots[index] = { id, count: moved }; remaining -= moved; }
    return remaining;
  }
  serialize() { return this.slots.map(cloneStack); }
}

export function transferStack(source, index, destination) {
  const stack = source.slots[index];
  if (!stack) return false;
  let remaining = stack.count;
  const maximum = maximumStack(stack);
  for (const target of destination.slots) if (target?.id === stack.id && target.count < maximum) { const moved = Math.min(remaining, maximum - target.count); target.count += moved; remaining -= moved; if (!remaining) break; }
  for (let target = 0; target < destination.slots.length && remaining; target += 1) if (!destination.slots[target]) { const moved = Math.min(remaining, maximum); destination.slots[target] = { ...stack, count: moved }; remaining -= moved; }
  if (remaining === stack.count) return false;
  if (remaining) source.slots[index] = { ...stack, count: remaining }; else source.slots[index] = null;
  return true;
}

export class CursorStack {
  constructor() { this.held = null; }
  click(container, index, button = 'left', destination = null) {
    if (button === 'shift') return destination ? transferStack(container, index, destination) : false;
    const slot = container.slots[index];
    if (button === 'right') {
      if (!this.held) {
        if (!slot) return false;
        const taken = Math.ceil(slot.count / 2);
        this.held = { ...slot, count: taken };
        slot.count -= taken; if (!slot.count) container.slots[index] = null;
        return true;
      }
      if (slot && (slot.id !== this.held.id || slot.count >= maximumStack(slot))) return false;
      if (slot) slot.count += 1; else container.slots[index] = { ...this.held, count: 1 };
      this.held.count -= 1; if (!this.held.count) this.held = null;
      return true;
    }
    if (!this.held) { if (!slot) return false; this.held = slot; container.slots[index] = null; return true; }
    if (!slot) { container.slots[index] = this.held; this.held = null; return true; }
    if (slot.id === this.held.id) {
      const moved = Math.min(this.held.count, maximumStack(slot) - slot.count);
      if (moved <= 0) return false;
      slot.count += moved; this.held.count -= moved; if (!this.held.count) this.held = null;
      return true;
    }
    container.slots[index] = this.held; this.held = slot; return true;
  }
}

export class CraftingGrid {
  constructor(size = 2) { this.size = size; this.slots = Array(size * size).fill(null); }
  get output() { return findRecipe(this.slots, this.size); }
  takeOutput(cursor) {
    const output = this.output;
    if (!output || cursor.held && (cursor.held.id !== output.id || cursor.held.count + output.count > maximumStack(output))) return false;
    for (let index = 0; index < this.slots.length; index += 1) { const slot = this.slots[index]; if (slot && --slot.count <= 0) this.slots[index] = null; }
    if (cursor.held) cursor.held.count += output.count; else cursor.held = { ...output };
    return true;
  }
  returnItems(destination) { for (let index = 0; index < this.slots.length; index += 1) transferStack(this, index, destination); }
}

export class ContainerSystem {
  constructor() { this.positions = new Map(); }
  key(x, y, z) { return `${x},${y},${z}`; }
  at(position) { const key = this.key(position.x, position.y, position.z); if (!this.positions.has(key)) this.positions.set(key, new ItemContainer(27)); return this.positions.get(key); }
  serialize() { return Object.fromEntries([...this.positions].map(([key, container]) => [key, container.serialize()])); }
  restore(data = {}) { this.positions.clear(); for (const [key, slots] of Object.entries(data)) { const [x, y, z] = key.split(',').map(Number); this.positions.set(this.key(x, y, z), new ItemContainer(27, slots.map(cloneStack))); } }
}
