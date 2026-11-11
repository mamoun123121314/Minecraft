import { BLOCKS, BLOCK_BY_ID } from '../../data/blocks.js';
import { CHUNK_MIN_Y, CHUNK_MAX_Y } from './chunk.js';

export const FLUID_TICKS = Object.freeze({ water: 5, lava: 30 });
const DIRECTIONS = Object.freeze([[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]]);
const keyOf = (x, y, z) => `${x},${y},${z}`;

export function fluidAt(world, x, y, z) {
  const id = world.getBlock(x, y, z);
  const name = BLOCK_BY_ID[id]?.name;
  if (name === 'water' || name === 'lava') return { name, source: (world.getBlockState(x, y, z)?.level ?? 0) === 0 };
  if (world.getBlockState(x, y, z)?.waterlogged) return { name: 'water', source: true };
  return null;
}

export function canDisplaceFluid(world, x, y, z) {
  const id = world.getBlock(x, y, z);
  if (id === 0 || id === BLOCKS.water.id || id === BLOCKS.lava.id) return true;
  const definition = BLOCK_BY_ID[id];
  return Boolean(definition && !definition.solid && !definition.waterloggable);
}

/** Fixed-tick cellular fluid simulation. Queue order is stable and duplicate positions coalesce. */
export class FluidSystem {
  constructor(world) {
    this.world = world;
    this.tickCount = 0;
    this.queue = [];
    this.pending = new Map();
  }

  schedule(x, y, z, delay = null) {
    if (y < CHUNK_MIN_Y || y > CHUNK_MAX_Y) return;
    const fluid = fluidAt(this.world, x, y, z);
    if (!fluid) return;
    const key = keyOf(x, y, z);
    const due = this.tickCount + (delay ?? FLUID_TICKS[fluid.name]);
    const previous = this.pending.get(key);
    if (previous !== undefined && previous <= due) return;
    this.pending.set(key, due);
    this.queue.push({ x, y, z, key, due });
  }

  scheduleNeighbors(x, y, z) {
    this.schedule(x, y + 1, z, 1);
    this.schedule(x, y - 1, z, 1);
    for (const [dx, , dz] of DIRECTIONS) this.schedule(x + dx, y, z + dz, 1);
  }

  setFluid(x, y, z, name, level = 0, falling = false) {
    const id = BLOCKS[name]?.id;
    if (id === undefined || !canDisplaceFluid(this.world, x, y, z)) return false;
    if (!this.world.setBlock(x, y, z, id, { level, falling })) return false;
    this.schedule(x, y, z);
    return true;
  }

  react(x, y, z, name) {
    const other = name === 'water' ? 'lava' : 'water';
    const contacts = [[0, 1, 0], [0, -1, 0], ...DIRECTIONS]
      .filter(([dx, dy, dz]) => fluidAt(this.world, x + dx, y + dy, z + dz)?.name === other);
    if (!contacts.length) return false;
    if (name === 'lava') {
      const source = (this.world.getBlockState(x, y, z)?.level ?? 0) === 0;
      this.world.setBlock(x, y, z, BLOCKS[source ? 'obsidian' : 'cobblestone'].id);
    } else {
      const aboveLava = fluidAt(this.world, x, y + 1, z)?.name === 'lava';
      if (aboveLava) this.world.setBlock(x, y + 1, z, BLOCKS.obsidian.id);
    }
    this.pending.delete(keyOf(x, y, z));
    return true;
  }

  spread(position) {
    const { x, y, z } = position;
    const id = this.world.getBlock(x, y, z);
    const name = BLOCK_BY_ID[id]?.name;
    if (name !== 'water' && name !== 'lava') return [];
    const state = this.world.getBlockState(x, y, z) ?? { level: 0, falling: false };
    if (this.react(x, y, z, name)) return [{ x, y, z }];
    const changed = [];
    const level = state.level ?? 0;
    const belowFluid = fluidAt(this.world, x, y - 1, z);
    if (y > CHUNK_MIN_Y && canDisplaceFluid(this.world, x, y - 1, z) && belowFluid?.name !== name) {
      if (this.setFluid(x, y - 1, z, name, level, true)) changed.push({ x, y: y - 1, z });
    }

    if (name === 'water' && level > 0 && !state.falling) {
      let sources = 0;
      for (const [dx, , dz] of DIRECTIONS) {
        const neighbor = fluidAt(this.world, x + dx, y, z + dz);
        if (neighbor?.name === 'water' && neighbor.source) sources += 1;
      }
      const foundation = this.world.getBlock(x, y - 1, z);
      if (sources >= 2 && (BLOCK_BY_ID[foundation]?.solid || fluidAt(this.world, x, y - 1, z)?.name === 'water')) {
        this.world.setBlock(x, y, z, BLOCKS.water.id, { level: 0, falling: false });
        this.schedule(x, y, z);
        return [{ x, y, z }];
      }
    }

    const canFall = y > CHUNK_MIN_Y && canDisplaceFluid(this.world, x, y - 1, z) && belowFluid?.name !== name;
    if (state.falling || canFall) return changed;
    if (level >= 7) return changed;
    for (const [dx, , dz] of DIRECTIONS) {
      const nx = x + dx, nz = z + dz;
      const neighbor = fluidAt(this.world, nx, y, nz);
      if (neighbor?.name === name && (this.world.getBlockState(nx, y, nz)?.level ?? 0) <= level + 1) continue;
      if (canDisplaceFluid(this.world, nx, y, nz) && this.setFluid(nx, y, nz, name, level + 1, false)) changed.push({ x: nx, y, z: nz });
    }
    return changed;
  }

  tick(limit = 64) {
    this.tickCount += 1;
    const changed = [];
    let ready = 0;
    // Compaction also removes stale coalesced entries without making update order hash-dependent.
    const remaining = [];
    for (const position of this.queue) {
      if (this.pending.get(position.key) !== position.due) continue;
      if (position.due > this.tickCount || ready >= limit) { remaining.push(position); continue; }
      this.pending.delete(position.key);
      ready += 1;
      changed.push(...this.spread(position));
    }
    this.queue = remaining;
    return changed;
  }
}

export function useBucket(world, itemId, target, placement) {
  if (itemId === 'bucket') {
    if (!target) return null;
    const { x, y, z } = target;
    const fluid = fluidAt(world, x, y, z);
    if (!fluid?.source) return null;
    if (world.getBlockState(x, y, z)?.waterlogged) {
      const state = { ...world.getBlockState(x, y, z), waterlogged: false };
      world.setBlock(x, y, z, world.getBlock(x, y, z), state);
    } else world.setBlock(x, y, z, 0);
    return { item: `${fluid.name}_bucket`, changed: [{ x, y, z }] };
  }
  const name = itemId === 'water_bucket' ? 'water' : itemId === 'lava_bucket' ? 'lava' : null;
  if (!name || !placement || !canDisplaceFluid(world, placement.x, placement.y, placement.z)) return null;
  const { x, y, z } = placement;
  world.setBlock(x, y, z, BLOCKS[name].id, { level: 0, falling: false });
  world.fluids?.schedule(x, y, z);
  return { item: 'bucket', changed: [{ x, y, z }] };
}
