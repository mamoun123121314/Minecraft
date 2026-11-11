export const BLOCKS = Object.freeze({
  air: { id: 0, name: 'air', solid: false, opaque: false, texture: 'glass' },
  grass_block: { id: 1, name: 'grass_block', solid: true, opaque: true, textures: { top: 'grass_top', bottom: 'dirt', side: 'grass_side' } },
  dirt: { id: 2, name: 'dirt', solid: true, opaque: true, texture: 'dirt' },
  stone: { id: 3, name: 'stone', solid: true, opaque: true, texture: 'stone' },
  bedrock: { id: 4, name: 'bedrock', solid: true, opaque: true, texture: 'bedrock' }
});
export const BLOCK_BY_ID = Object.freeze(Object.fromEntries(Object.values(BLOCKS).map((block) => [block.id, block])));
