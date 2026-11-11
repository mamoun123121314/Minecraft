import { BLOCKS, BLOCK_BY_ID } from '../../data/blocks.js';

const keyOf = (x, y, z) => `${x},${y},${z}`;
const NEIGHBORS = Object.freeze([[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]);
const DUST = new Set(['redstone_wire']);
const SOURCES = new Set(['redstone_block', 'redstone_torch', 'lever', 'stone_button']);
const DEVICES = new Set(['redstone_lamp', 'oak_door', 'redstone_repeater', 'observer']);
const FACING = Object.freeze({ north: [0, 0, -1], south: [0, 0, 1], east: [1, 0, 0], west: [-1, 0, 0] });
const tracked = name => DUST.has(name) || SOURCES.has(name) || DEVICES.has(name);

/** Deterministic dust propagation and scheduled device updates for edited/loaded redstone networks. */
export class RedstoneSystem {
  constructor(world) { this.world = world; this.positions = new Map(); this.power = new Map(); this.queue = []; this.tickCount = 0; }
  name(x, y, z) { return BLOCK_BY_ID[this.world.getBlock(x, y, z)]?.name; }
  state(x, y, z) { return this.world.getBlockState(x, y, z) ?? {}; }
  setState(x, y, z, state) { this.world.setBlock(x, y, z, this.world.getBlock(x, y, z), state, false); }
  onBlockChanged(x, y, z) {
    const name = this.name(x, y, z), key = keyOf(x, y, z);
    if (tracked(name)) this.positions.set(key, { x, y, z }); else this.positions.delete(key);
    for (const [dx, dy, dz] of NEIGHBORS) {
      const nx = x + dx, ny = y + dy, nz = z + dz, neighbor = this.name(nx, ny, nz);
      if (tracked(neighbor)) this.positions.set(keyOf(nx, ny, nz), { x: nx, y: ny, z: nz });
      if (neighbor === 'observer') this.schedule(nx, ny, nz, 1, 'pulse');
    }
    this.rebuild();
  }
  schedule(x, y, z, delay, action) { this.queue.push({ x, y, z, due: this.tickCount + delay, action }); }
  sourcePower(x, y, z) {
    let power = 0;
    for (const [dx, dy, dz] of NEIGHBORS) {
      const name = this.name(x + dx, y + dy, z + dz), state = this.state(x + dx, y + dy, z + dz);
      if (name === 'redstone_block' || name === 'redstone_torch' && state.powered !== false || (name === 'lever' || name === 'stone_button') && state.powered) power = 15;
      if ((name === 'redstone_repeater' || name === 'observer') && state.powered) { const facing = FACING[state.facing ?? 'north']; if (x - (x + dx) === facing[0] && z - (z + dz) === facing[2]) power = 15; }
    }
    return power;
  }
  directPower(x, y, z, network = this.power) {
    let power = this.sourcePower(x, y, z);
    for (const [dx, dy, dz] of NEIGHBORS) {
      const nx = x + dx, ny = y + dy, nz = z + dz, name = this.name(nx, ny, nz), state = this.state(nx, ny, nz);
      if (name === 'redstone_block' || name === 'redstone_torch' && state.powered !== false || (name === 'lever' || name === 'stone_button') && state.powered) power = 15;
      power = Math.max(power, network.get(keyOf(nx, ny, nz)) ?? 0);
    }
    return power;
  }
  rebuild() {
    const next = new Map(), queue = [];
    for (const position of this.positions.values()) {
      const { x, y, z } = position, name = this.name(x, y, z), state = this.state(x, y, z);
      if (DUST.has(name) && this.sourcePower(x, y, z) > 0) { next.set(keyOf(x, y, z), 15); queue.push({ x, y, z, power: 15 }); }
    }
    // Source-adjacent dust is seeded above; every edge consumes exactly one power level.
    for (let head = 0; head < queue.length; head += 1) {
      const current = queue[head];
      if (current.power <= 1) continue;
      for (const [dx, dy, dz] of NEIGHBORS) {
        const x = current.x + dx, y = current.y + dy, z = current.z + dz;
        if (!DUST.has(this.name(x, y, z))) continue;
        const key = keyOf(x, y, z), power = current.power - 1;
        if ((next.get(key) ?? 0) >= power) continue;
        next.set(key, power); queue.push({ x, y, z, power });
      }
    }
    const changed = [];
    for (const position of this.positions.values()) {
      const { x, y, z } = position, name = this.name(x, y, z), key = keyOf(x, y, z), oldPower = this.power.get(key) ?? 0, power = next.get(key) ?? 0;
      if (DUST.has(name)) {
        if (oldPower !== power) { this.setState(x, y, z, { ...this.state(x, y, z), power }); changed.push({ x, y, z }); }
      } else if (name === 'redstone_lamp' || name === 'oak_door') {
        const powered = this.directPower(x, y, z, next) > 0 || power > 0;
        const state = this.state(x, y, z);
        if (Boolean(state.powered) !== powered || name === 'oak_door' && Boolean(state.open) !== powered) { this.setState(x, y, z, { ...state, powered, ...(name === 'oak_door' ? { open: powered } : {}) }); changed.push({ x, y, z }); }
      } else if (name === 'redstone_repeater') {
        const facing = FACING[this.state(x, y, z).facing ?? 'north'], input = this.directPower(x - facing[0], y, z - facing[2], next) > 0;
        if (input !== Boolean(this.state(x, y, z).input) && !this.queue.some(job => job.action === 'repeater' && keyOf(job.x, job.y, job.z) === key)) {
          this.setState(x, y, z, { ...this.state(x, y, z), input });
          this.schedule(x, y, z, (this.state(x, y, z).delay ?? 1) * 2, 'repeater');
        }
      }
    }
    this.power = next;
    return changed;
  }
  interact(x, y, z) {
    const name = this.name(x, y, z), state = this.state(x, y, z);
    if (name === 'lever') { this.setState(x, y, z, { ...state, powered: !state.powered }); this.rebuild(); return true; }
    if (name === 'stone_button' && !state.powered) { this.setState(x, y, z, { ...state, powered: true }); this.schedule(x, y, z, 20, 'button'); this.rebuild(); return true; }
    if (name === 'oak_door') { this.setState(x, y, z, { ...state, open: !state.open }); return true; }
    return false;
  }
  tick() {
    this.tickCount += 1;
    const ready = this.queue.filter(job => job.due <= this.tickCount); this.queue = this.queue.filter(job => job.due > this.tickCount);
    const changed = [];
    for (const job of ready) {
      const name = this.name(job.x, job.y, job.z), state = this.state(job.x, job.y, job.z);
      if (job.action === 'button' && name === 'stone_button') this.setState(job.x, job.y, job.z, { ...state, powered: false });
      if (job.action === 'repeater' && name === 'redstone_repeater') this.setState(job.x, job.y, job.z, { ...state, powered: Boolean(state.input) });
      if (job.action === 'pulse' && name === 'observer') { this.setState(job.x, job.y, job.z, { ...state, powered: true }); this.schedule(job.x, job.y, job.z, 1, 'pulse-off'); }
      if (job.action === 'pulse-off' && name === 'observer') this.setState(job.x, job.y, job.z, { ...state, powered: false });
      changed.push({ x: job.x, y: job.y, z: job.z });
    }
    if (ready.length) changed.push(...this.rebuild());
    return changed;
  }
}
