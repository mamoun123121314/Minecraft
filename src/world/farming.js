import { BLOCKS, BLOCK_BY_ID } from '../../data/blocks.js';
import { seeded } from '../core/rng.js';

export const CROPS = Object.freeze({
  wheat: Object.freeze({ maxAge: 7, seed: 'wheat_seeds', product: 'wheat', substrate: ['farmland', 'wet_farmland'] }),
  carrots: Object.freeze({ maxAge: 7, seed: 'carrot', product: 'carrot', substrate: ['farmland', 'wet_farmland'] }),
  potatoes: Object.freeze({ maxAge: 7, seed: 'potato', product: 'potato', substrate: ['farmland', 'wet_farmland'] }),
  beetroots: Object.freeze({ maxAge: 3, seed: 'beetroot_seeds', product: 'beetroot', substrate: ['farmland', 'wet_farmland'] }),
  nether_wart: Object.freeze({ maxAge: 3, seed: 'nether_wart', product: 'nether_wart', substrate: ['soul_sand'] }),
  pumpkin_stem: Object.freeze({ maxAge: 7, seed: 'pumpkin_seeds', product: null, substrate: ['farmland', 'wet_farmland'] }),
  melon_stem: Object.freeze({ maxAge: 7, seed: 'melon_seeds', product: null, substrate: ['farmland', 'wet_farmland'] }),
  cocoa: Object.freeze({ maxAge: 2, seed: 'cocoa_beans', product: 'cocoa_beans', substrate: ['jungle_log'] }),
});
const CARDINAL = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export function isHydrated(world, x, y, z) {
  for (let dy = 0; dy <= 1; dy += 1) for (let dz = -4; dz <= 4; dz += 1) for (let dx = -4; dx <= 4; dx += 1) {
    if (world.getBlock(x + dx, y + dy, z + dz) === BLOCKS.water.id) return true;
  }
  return false;
}

export const grassDrop = random => random() < 0.125 ? 'wheat_seeds' : null;

export function matureDrops(blockName, state, random = () => 0.5) {
  const crop = CROPS[blockName];
  if (!crop || (state?.age ?? 0) < crop.maxAge) return crop ? [{ id: crop.seed, count: 1 }] : [];
  if (blockName === 'wheat') return [{ id: 'wheat', count: 1 }, { id: 'wheat_seeds', count: 1 + Math.floor(random() * 4) }];
  if (blockName === 'beetroots') return [{ id: 'beetroot', count: 1 }, { id: 'beetroot_seeds', count: 1 + Math.floor(random() * 4) }];
  if (blockName === 'carrots' || blockName === 'potatoes') return [{ id: crop.product, count: 1 + Math.floor(random() * 4) }];
  if (blockName === 'nether_wart') return [{ id: 'nether_wart', count: 2 + Math.floor(random() * 3) }];
  if (blockName === 'cocoa') return [{ id: 'cocoa_beans', count: 3 }];
  return [{ id: crop.seed, count: 1 }];
}

/** Crop, farmland and tall-plant rules driven only by fixed ticks and the supplied world seed. */
export class FarmingSystem {
  constructor(world, seed = 1) {
    this.world = world;
    this.random = seeded(seed);
    this.queue = [];
    this.pending = new Set();
    this.tickCount = 0;
  }

  schedule(x, y, z, delay = 1) {
    const key = `${x},${y},${z}`;
    if (this.pending.has(key)) return;
    this.pending.add(key);
    this.queue.push({ x, y, z, key, due: this.tickCount + delay });
  }

  updateFarmland(x, y, z) {
    const id = this.world.getBlock(x, y, z);
    if (id !== BLOCKS.farmland.id && id !== BLOCKS.wet_farmland.id) return null;
    const hydrated = isHydrated(this.world, x, y, z);
    const target = hydrated ? BLOCKS.wet_farmland.id : BLOCKS.farmland.id;
    if (id !== target) { this.world.setBlock(x, y, z, target); return { x, y, z }; }
    return null;
  }

  grow(x, y, z, amount = 1) {
    const id = this.world.getBlock(x, y, z);
    const name = BLOCK_BY_ID[id]?.name;
    const crop = CROPS[name];
    if (!crop) return false;
    const oldAge = this.world.getBlockState(x, y, z)?.age ?? 0;
    if (oldAge >= crop.maxAge) return false;
    const age = Math.min(crop.maxAge, oldAge + amount);
    this.world.setBlock(x, y, z, id, { ...this.world.getBlockState(x, y, z), age });
    return true;
  }

  growTall(x, y, z, amount = 1) {
    const id = this.world.getBlock(x, y, z);
    const name = BLOCK_BY_ID[id]?.name;
    if (name !== 'sugar_cane' && name !== 'cactus') return false;
    const maximum = name === 'cactus' ? 3 : 3;
    let baseY = y, height = 0;
    while (this.world.getBlock(x, baseY - 1, z) === id) baseY -= 1;
    while (this.world.getBlock(x, baseY + height, z) === id) height += 1;
    if (height >= maximum || this.world.getBlock(x, baseY + height, z) !== 0) return false;
    const age = (this.world.getBlockState(x, baseY, z)?.age ?? 0) + amount;
    if (age < 15) { this.world.setBlock(x, baseY, z, id, { age }); return true; }
    this.world.setBlock(x, baseY + height, z, id, { age: 0 });
    this.world.setBlock(x, baseY, z, id, { age: 0 });
    return true;
  }

  useBoneMeal(x, y, z) {
    const id = this.world.getBlock(x, y, z);
    const name = BLOCK_BY_ID[id]?.name;
    if (CROPS[name]) {
      const grown = this.grow(x, y, z, 2 + Math.floor(this.random() * 3));
      if (grown && (name === 'pumpkin_stem' || name === 'melon_stem') && (this.world.getBlockState(x, y, z)?.age ?? 0) === 7) this.tryFruit(x, y, z);
      return grown;
    }
    return this.growTall(x, y, z, 15);
  }

  tryFruit(x, y, z) {
    const stem = BLOCK_BY_ID[this.world.getBlock(x, y, z)]?.name;
    if (stem !== 'pumpkin_stem' && stem !== 'melon_stem') return false;
    if ((this.world.getBlockState(x, y, z)?.age ?? 0) < 7) return false;
    const fruit = BLOCKS[stem === 'pumpkin_stem' ? 'pumpkin' : 'melon'].id;
    for (const [dx, dz] of CARDINAL) if (this.world.getBlock(x + dx, y, z + dz) === fruit) return false;
    const [dx, dz] = CARDINAL[Math.floor(this.random() * 4)];
    const below = BLOCK_BY_ID[this.world.getBlock(x + dx, y - 1, z + dz)]?.name;
    if (this.world.getBlock(x + dx, y, z + dz) !== 0 || !['dirt', 'grass_block', 'farmland', 'wet_farmland', 'coarse_dirt', 'podzol'].includes(below)) return false;
    this.world.setBlock(x + dx, y, z + dz, fruit);
    return true;
  }

  trample(x, y, z, force = false) {
    const id = this.world.getBlock(x, y, z);
    if ((id !== BLOCKS.farmland.id && id !== BLOCKS.wet_farmland.id) || (!force && this.random() >= 0.25)) return false;
    const aboveName = BLOCK_BY_ID[this.world.getBlock(x, y + 1, z)]?.name;
    if (CROPS[aboveName]) this.world.setBlock(x, y + 1, z, 0);
    this.world.setBlock(x, y, z, BLOCKS.dirt.id);
    return true;
  }

  interact(target, itemId, facing = 'north') {
    if (!target) return null;
    const { x, y, z } = target.pos ?? target;
    const id = this.world.getBlock(x, y, z);
    const name = BLOCK_BY_ID[id]?.name;
    if (itemId?.endsWith('_hoe')) {
      if (!['dirt', 'grass_block', 'dirt_path'].includes(name) || this.world.getBlock(x, y + 1, z) !== 0) return null;
      this.world.setBlock(x, y, z, BLOCKS[isHydrated(this.world, x, y, z) ? 'wet_farmland' : 'farmland'].id);
      return { consumed: 0, durability: 1, changed: [{ x, y, z }] };
    }
    if (itemId === 'bone_meal' && this.useBoneMeal(x, y, z)) return { consumed: 1, changed: [{ x, y, z }] };
    const cropName = Object.keys(CROPS).find(key => CROPS[key].seed === itemId);
    if (!cropName) return null;
    const placement = target.prevPos ?? { x, y: y + 1, z };
    const belowName = BLOCK_BY_ID[this.world.getBlock(placement.x, placement.y - 1, placement.z)]?.name;
    const cocoaSupport = cropName === 'cocoa' && CARDINAL.some(([dx, dz]) => this.world.getBlock(placement.x + dx, placement.y, placement.z + dz) === BLOCKS.jungle_log.id);
    if (this.world.getBlock(placement.x, placement.y, placement.z) !== 0 || (!cocoaSupport && !CROPS[cropName].substrate.includes(belowName))) return null;
    const state = { age: 0 };
    if (cropName === 'cocoa') state.facing = facing;
    this.world.setBlock(placement.x, placement.y, placement.z, BLOCKS[cropName].id, state);
    this.schedule(placement.x, placement.y, placement.z);
    return { consumed: 1, changed: [placement] };
  }

  tick(limit = 32) {
    this.tickCount += 1;
    const changed = [];
    const remaining = [];
    let processed = 0;
    for (const job of this.queue) {
      if (job.due > this.tickCount || processed >= limit) { remaining.push(job); continue; }
      this.pending.delete(job.key);
      processed += 1;
      const { x, y, z } = job;
      const name = BLOCK_BY_ID[this.world.getBlock(x, y, z)]?.name;
      if (name === 'farmland' || name === 'wet_farmland') {
        const change = this.updateFarmland(x, y, z);
        if (change) changed.push(change);
      } else if (CROPS[name]) {
        const hydrated = isHydrated(this.world, x, y - 1, z);
        const chance = hydrated ? 0.25 : 0.1;
        if (this.random() < chance && this.grow(x, y, z)) changed.push({ x, y, z });
        if (name === 'pumpkin_stem' || name === 'melon_stem') if (this.tryFruit(x, y, z)) changed.push({ x, y, z });
        this.schedule(x, y, z, 128);
      } else if (name === 'sugar_cane' || name === 'cactus') {
        if (this.growTall(x, y, z)) changed.push({ x, y, z });
        this.schedule(x, y, z, 256);
      }
    }
    this.queue = remaining;
    return changed;
  }
}
