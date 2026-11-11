import { BLOCKS, BLOCK_BY_ID } from '../../data/blocks.js';
const intersectsPlayer = (position, player) => { const half = .3, minX = player.position.x - half, maxX = player.position.x + half, minY = player.position.y, maxY = player.position.y + 1.8, minZ = player.position.z - half, maxZ = player.position.z + half; return position.x < maxX && position.x + 1 > minX && position.y < maxY && position.y + 1 > minY && position.z < maxZ && position.z + 1 > minZ; };
export const facingFromYaw = yaw => ['south', 'west', 'north', 'east'][Math.round((((yaw ?? 0) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI / 2)) % 4];
const directional = block => ['stairs', 'door', 'fence_gate'].includes(block.model) || ['redstone_repeater', 'observer', 'lever'].includes(block.name);
export function placeBlock(world, position, itemId, player) {
  const block = BLOCKS[itemId], existing = world.getBlock(position.x, position.y, position.z), existingState = world.getBlockState(position.x, position.y, position.z);
  if (block?.model === 'slab' && existing === block.id && existingState?.type !== 'double') return world.setBlock(position.x, position.y, position.z, block.id, { ...existingState, type: 'double' });
  if (!block || block.id === 0 || block.renderLayer === 'none' || block.name === 'water' || block.name === 'lava' || !(existing === 0 || existing === BLOCKS.water.id && block.waterloggable) || block.solid && intersectsPlayer(position, player)) return false;
  const state = directional(block) ? { facing: facingFromYaw(player.yaw) } : {};
  if (['slab', 'stairs', 'trapdoor'].includes(block.model)) state.half = player.pitch > 0 ? 'top' : 'bottom';
  if (block.model === 'slab') state.type = state.half;
  if (existing === BLOCKS.water.id) state.waterlogged = true;
  if (block.model === 'door') {
    if (world.getBlock(position.x, position.y + 1, position.z) !== 0) return false;
    if (!world.setBlock(position.x, position.y, position.z, block.id, { ...state, half: 'lower', hinge: 'left', open: false })) return false;
    return world.setBlock(position.x, position.y + 1, position.z, block.id, { ...state, half: 'upper', hinge: 'left', open: false });
  }
  return world.setBlock(position.x, position.y, position.z, block.id, state);
}
export function interactShapedBlock(world, position) {
  const { x, y, z } = position, id = world.getBlock(x, y, z), block = BLOCK_BY_ID[id];
  if (!block || !['door', 'trapdoor', 'fence_gate'].includes(block.model)) return false;
  const state = world.getBlockState(x, y, z) ?? {}; if (block.model === 'door' && state.powered) return false; const open = !state.open;
  world.setBlock(x, y, z, id, { ...state, open });
  if (block.model === 'door') { const otherY = state.half === 'upper' ? y - 1 : y + 1; if (world.getBlock(x, otherY, z) === id) world.setBlock(x, otherY, z, id, { ...world.getBlockState(x, otherY, z), open }); }
  return true;
}
export function updateConnections(world, x, y, z) {
  const id = world.getBlock(x, y, z), model = BLOCK_BY_ID[id]?.model;
  if (!['fence', 'wall'].includes(model)) return;
  const state = { ...world.getBlockState(x, y, z) };
  for (const [direction, dx, dz] of [['north', 0, -1], ['south', 0, 1], ['east', 1, 0], ['west', -1, 0]]) { const neighbor = world.getBlock(x + dx, y, z + dz), definition = BLOCK_BY_ID[neighbor]; state[direction] = Boolean(definition && (definition.solid || ['fence', 'wall', 'fence_gate'].includes(definition.model))); }
  world.setBlock(x, y, z, id, state, false);
}
export function pickBlockItem(blockId) { return Object.values(BLOCKS).find(block => block.id === blockId)?.name ?? null; }
