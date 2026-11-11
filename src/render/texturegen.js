import { seeded } from '../core/rng.js';
import { lerpHex } from '../core/math.js';
import { P } from '../../data/palette.js';

export class TexturePainter {
  constructor() {
    this.canvas = typeof OffscreenCanvas === 'function' ? new OffscreenCanvas(16, 16) : document.createElement('canvas');
    this.canvas.width = 16;
    this.canvas.height = 16;
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.ctx.imageSmoothingEnabled = false;
  }
  fill(hex) { this.ctx.fillStyle = hex; this.ctx.fillRect(0, 0, 16, 16); return this; }
  clear() { this.ctx.clearRect(0, 0, 16, 16); return this; }
  px(x, y, hex) { this.ctx.fillStyle = hex; this.ctx.fillRect(x | 0, y | 0, 1, 1); return this; }
  rect(x, y, width, height, hex) { this.ctx.fillStyle = hex; this.ctx.fillRect(x | 0, y | 0, width | 0, height | 0); return this; }
  noise(seed, hexes, density) {
    const random = seeded(seed);
    const total = Math.floor(256 * density);
    for (let i = 0; i < total; i += 1) this.px(Math.floor(random() * 16), Math.floor(random() * 16), hexes[Math.floor(random() * hexes.length)]);
    return this;
  }
  speckle(seed, hex, count) {
    const random = seeded(seed);
    for (let i = 0; i < count; i += 1) this.px(Math.floor(random() * 16), Math.floor(random() * 16), hex);
    return this;
  }
  border(hex, inset = 0) {
    this.rect(inset, inset, 16 - inset * 2, 1, hex).rect(inset, 15 - inset, 16 - inset * 2, 1, hex);
    this.rect(inset, inset, 1, 16 - inset * 2, hex).rect(15 - inset, inset, 1, 16 - inset * 2, hex);
    return this;
  }
  gradientV(hexA, hexB) { for (let y = 0; y < 16; y += 1) this.rect(0, y, 16, 1, lerpHex(hexA, hexB, y / 15)); return this; }
  blob(cx, cy, radius, hex) {
    for (let y = -radius; y <= radius; y += 1) for (let x = -radius; x <= radius; x += 1) if (x * x + y * y <= radius * radius + ((x + y) & 1)) this.px(cx + x, cy + y, hex);
    return this;
  }
  cracks(seed, hex, count) {
    const random = seeded(seed);
    for (let line = 0; line < count; line += 1) {
      let x = 2 + Math.floor(random() * 12); let y = 2 + Math.floor(random() * 12);
      for (let step = 0; step < 3 + Math.floor(random() * 5); step += 1) { this.px(x, y, hex); x += Math.floor(random() * 3) - 1; y += Math.floor(random() * 3) - 1; }
    }
    return this;
  }
  rings(cx, cy, hexA, hexB) {
    this.fill(hexA);
    for (let radius = 6; radius >= 2; radius -= 2) {
      this.ctx.strokeStyle = radius % 4 ? hexB : hexA;
      this.ctx.strokeRect(cx - radius, cy - radius, radius * 2, radius * 2);
    }
    return this;
  }
  overlay(baseCanvas, maskHex, alpha) { this.ctx.drawImage(baseCanvas, 0, 0); this.ctx.globalAlpha = alpha; this.rect(0, 0, 16, 4, maskHex); this.ctx.globalAlpha = 1; return this; }
}

const texture = (paint) => { const painter = new TexturePainter(); paint(painter); return painter.canvas; };
const dither = (base, dark, light, seed) => texture((t) => t.fill(base).noise(seed, [dark], 0.23).noise(seed + 1, [light], 0.15));
const ore = (color, seed) => texture((t) => {
  t.fill(P.STONE).noise(seed, [P.STONE_DARK], 0.2).noise(seed + 1, [P.STONE_LIGHT], 0.12);
  const random = seeded(seed + 2);
  for (let i = 0; i < 5; i += 1) { const x = 3 + Math.floor(random() * 10); const y = 3 + Math.floor(random() * 10); t.blob(x, y, 1, color).px(x + 1, y + 1, P.STONE_DARK); }
});

export function generateTextures() {
  const dirt = dither(P.DIRT, P.DIRT_DARK, P.DIRT_LIGHT, 11);
  const textures = {
    grass_top: dither(P.GRASS_TOP, P.OAK_LEAF_D, P.GRASS_SIDE, 1),
    grass_side: texture((t) => { t.ctx.drawImage(dirt, 0, 0); t.rect(0, 0, 16, 3, P.GRASS_TOP); for (let x = 0; x < 16; x += 3) t.px(x, 3 + (x % 2), P.GRASS_SIDE); }),
    dirt,
    stone: dither(P.STONE, P.STONE_DARK, P.STONE_LIGHT, 21),
    cobblestone: texture((t) => t.fill(P.COBBLE).cracks(31, P.COBBLE_DARK, 12).speckle(32, P.COBBLE_LIGHT, 28)),
    bedrock: dither(P.BEDROCK, P.BEDROCK_DARK, P.STONE, 41),
    sand: dither(P.SAND, P.SAND_DARK, P.SANDSTONE, 51),
    gravel: dither(P.GRAVEL, P.GRAVEL_DARK, P.CLAY, 61),
    oak_planks: texture((t) => t.fill(P.OAK_PLANK).rect(0, 5, 16, 1, P.OAK_PLANK_D).rect(0, 11, 16, 1, P.OAK_PLANK_D).speckle(71, P.OAK_LOG_TOP, 24)),
    oak_log_side: texture((t) => { t.fill(P.OAK_LOG); for (let x = 1; x < 16; x += 2) t.rect(x, 0, 1, 16, x % 4 ? P.OAK_LOG_D : P.DIRT_LIGHT); }),
    oak_log_top: texture((t) => t.rings(8, 8, P.OAK_LOG_TOP, P.OAK_LOG_D).px(8, 8, P.OAK_LOG)),
    oak_leaves: texture((t) => t.clear().noise(81, [P.OAK_LEAF, P.OAK_LEAF_D], 0.64)),
    glass: texture((t) => t.clear().border(P.GLASS_EDGE).px(2, 2, P.GLASS).px(3, 2, P.GLASS)),
    bricks: texture((t) => { t.fill(P.BRICK); for (let y = 3; y < 16; y += 4) t.rect(0, y, 16, 1, P.BRICK_MORTAR); for (let y = 0; y < 16; y += 4) for (let x = (y / 4) % 2 ? 3 : 7; x < 16; x += 8) t.rect(x, y, 1, 3, P.BRICK_MORTAR); }),
    coal_ore: ore(P.COAL, 91),
    iron_ore: ore(P.IRON, 101),
    gold_ore: ore(P.GOLD, 111),
    redstone_ore: ore(P.REDSTONE, 121),
    diamond_ore: ore(P.DIAMOND, 131),
    water_still: texture((t) => t.fill(P.WATER).noise(141, [P.WATER_DEEP], 0.18).rect(0, 2, 16, 1, P.WATER_SURF)),
    lava_still: texture((t) => t.fill(P.LAVA).noise(151, [P.LAVA_DARK], 0.2).blob(6, 6, 2, P.LAVA_HOT).blob(12, 12, 1, P.LAVA_HOT)),
    snow_block: dither(P.SNOW, P.SNOW_DARK, P.CLOUD, 161),
    obsidian: dither(P.OBSIDIAN, P.OBSIDIAN_HI, P.NETHERITE, 171),
    crafting_table_top: texture((t) => t.fill(P.OAK_PLANK).border(P.OAK_PLANK_D).rect(4, 4, 8, 8, P.OAK_LOG_TOP).cracks(181, P.OAK_LOG_D, 3))
  };
  const solids = {
    deepslate:[P.BEDROCK,P.BEDROCK_DARK,P.STONE_DARK],sandstone:[P.SANDSTONE,P.SANDSTONE_DARK,P.SAND],red_sand:[P.RED_SAND,P.DIRT_DARK,P.LAVA],clay:[P.CLAY,P.STONE_DARK,P.GLASS_EDGE],ice:[P.ICE,P.ICE_DARK,P.GLASS],
    stone_bricks:[P.STONE_BRICK,P.STONE_BRICK_D,P.STONE_LIGHT],mossy_cobblestone:[P.COBBLE,P.OAK_LEAF_D,P.COBBLE_LIGHT],andesite:[P.STONE,P.STONE_DARK,P.CLAY],diorite:[P.CLAY,P.STONE,P.SNOW],granite:[P.BRICK,P.DIRT_DARK,P.DIRT_LIGHT],tuff:[P.STONE_DARK,P.BEDROCK,P.GRAVEL],calcite:[P.SNOW_DARK,P.CLAY,P.SNOW],dripstone:[P.DIRT,P.DIRT_DARK,P.DIRT_LIGHT],amethyst:[P.PURPUR,P.WOOL_PURPLE,P.WOOL_MAGENTA],
    iron_block:[P.IRON_BLOCK,P.STONE,P.SNOW],gold_block:[P.GOLD_BLOCK,P.RAW_GOLD,P.GOLD],diamond_block:[P.DIAMOND_BLOCK,P.DIAMOND,P.WATER_SURF],emerald_block:[P.EMERALD,P.OAK_LEAF_D,P.DIAMOND_BLOCK],lapis_block:[P.LAPIS,P.WOOL_BLUE,P.WATER_DEEP],coal_block:[P.COAL,P.OBSIDIAN,P.STONE_DARK],copper_block:[P.COPPER,P.BRICK,P.RAW_IRON],
    glowstone:[P.GLOWSTONE,P.GLOWSTONE_D,P.TORCH_FLAME],netherrack:[P.NETHERRACK,P.SOUL_SAND,P.BRICK],soul_sand:[P.SOUL_SAND,P.DIRT_DARK,P.DIRT],end_stone:[P.END_STONE,P.SANDSTONE_DARK,P.SAND],purpur:[P.PURPUR,P.WOOL_MAGENTA,P.CLAY],farmland_dry:[P.DIRT_DARK,P.DIRT,P.SOUL_SAND],farmland_wet:[P.DIRT_DARK,P.OBSIDIAN,P.DIRT],path:[P.DIRT_LIGHT,P.DIRT,P.SAND_DARK],mycelium:[P.STONE,P.PURPUR,P.DIRT_DARK]
  };
  let seed=300;for(const [name,colors] of Object.entries(solids))textures[name]=dither(colors[0],colors[1],colors[2],seed++);
  const ores={copper_ore:P.COPPER,lapis_ore:P.LAPIS,emerald_ore:P.EMERALD};for(const [name,color] of Object.entries(ores))textures[name]=ore(color,seed+=7);
  const woods={birch:[P.BIRCH_PLANK,P.BIRCH_LOG,P.BIRCH_LOG_D,P.BIRCH_LEAF],spruce:[P.SPRUCE_PLANK,P.SPRUCE_LOG,P.DARK_LOG,P.SPRUCE_LEAF],jungle:[P.JUNGLE_PLANK,P.JUNGLE_LOG,P.DIRT_DARK,P.JUNGLE_LEAF],acacia:[P.ACACIA_PLANK,P.ACACIA_LOG,P.DIRT_DARK,P.ACACIA_LEAF],dark_oak:[P.DARK_PLANK,P.DARK_LOG,P.OBSIDIAN,P.DARK_LEAF]};
  for(const [name,[plank,log,dark,leaf]] of Object.entries(woods)){textures[`${name}_planks`]=texture(t=>t.fill(plank).rect(0,5,16,1,dark).rect(0,11,16,1,dark).speckle(seed++,log,18));textures[`${name}_log_side`]=texture(t=>{t.fill(log);for(let x=1;x<16;x+=3)t.rect(x,0,1,16,dark);});textures[`${name}_log_top`]=texture(t=>t.rings(8,8,plank,dark).px(8,8,log));textures[`${name}_leaves`]=texture(t=>t.clear().noise(seed++,[leaf,dark],.63));}
  const wool={white:P.WOOL_WHITE,black:P.WOOL_BLACK,red:P.WOOL_RED,blue:P.WOOL_BLUE,green:P.WOOL_GREEN,yellow:P.WOOL_YELLOW,orange:P.WOOL_ORANGE,purple:P.WOOL_PURPLE,cyan:P.WOOL_CYAN,lime:P.WOOL_LIME,pink:P.WOOL_PINK,gray:P.WOOL_GRAY,light_gray:P.WOOL_LIGHTGRAY,brown:P.WOOL_BROWN,magenta:P.WOOL_MAGENTA};for(const [name,color] of Object.entries(wool))textures[`${name}_wool`]=dither(color,P.UI_SLOT_DARK,P.UI_SLOT_LIGHT,seed++);
  const utility=['crafting_table_side','crafting_table_front','furnace_front','furnace_lit','furnace_side','furnace_top','chest','ladder','bookshelf','tnt','pumpkin','melon','cactus_side','cactus_top','sugar_cane','torch','water_flow','lava_flow','sandstone_top','sandstone_bottom'];for(const name of utility)textures[name]=texture(t=>t.fill(name.includes('lava')||name==='furnace_lit'?P.LAVA:name.includes('water')?P.WATER:name.includes('cactus')||name==='sugar_cane'?P.OAK_LEAF:name==='tnt'?P.WOOL_RED:name==='furnace_front'||name==='furnace_side'||name==='furnace_top'?P.STONE:name==='bookshelf'?P.OAK_PLANK:P.OAK_PLANK).border(P.UI_SLOT_DARK,seed++%3).noise(seed++,[P.UI_SLOT_LIGHT,P.UI_SLOT_DARK],.13));
  const plants=['oak_sapling','grass_tuft','dandelion','poppy','fern','dead_bush'];for(const name of plants)textures[name]=texture(t=>{t.clear();for(let y=3;y<16;y++)t.px(8+(y%3)-1,y,name==='poppy'?P.WOOL_RED:name==='dandelion'?P.WOOL_YELLOW:P.OAK_LEAF);});
  textures.redstone_dust=texture(t=>{t.clear();t.rect(7,7,2,2,P.REDSTONE).rect(7,0,2,16,P.REDSTONE).rect(0,7,16,2,P.REDSTONE).speckle(701,P.WOOL_RED,18);});
  textures.redstone_torch=texture(t=>{t.clear();t.rect(7,7,2,9,P.OAK_LOG).rect(6,4,4,4,P.REDSTONE).px(7,3,P.LAVA_HOT);});
  textures.redstone_lamp=dither(P.DIRT_LIGHT,P.DIRT_DARK,P.GLOWSTONE,702);textures.redstone_lamp_on=dither(P.GLOWSTONE,P.GLOWSTONE_D,P.TORCH_FLAME,703);
  textures.redstone_block=dither(P.REDSTONE,P.WOOL_RED,P.LAVA_DARK,704);textures.lever=texture(t=>{t.clear();t.rect(3,10,10,5,P.STONE).rect(7,2,2,9,P.OAK_LOG).px(7,2,P.REDSTONE);});
  textures.stone_button=texture(t=>{t.clear();t.border(P.STONE_DARK,3).rect(5,5,6,6,P.STONE);});textures.redstone_repeater=texture(t=>{t.clear();t.border(P.STONE_DARK,1).rect(7,2,2,12,P.REDSTONE).rect(3,7,10,2,P.STONE_LIGHT);});textures.observer=dither(P.STONE,P.STONE_DARK,P.REDSTONE,705);
  const cropAges={wheat:7,carrots:7,potatoes:7,beetroots:3,nether_wart:3,pumpkin_stem:7,melon_stem:7,cocoa:2};
  for(const [name,maxAge]of Object.entries(cropAges))for(let age=0;age<=maxAge;age++)textures[`${name}_${age}`]=texture(t=>{t.clear();const mature=age===maxAge,height=3+Math.floor(age/maxAge*10),color=name==='wheat'&&mature?P.WOOL_YELLOW:name==='beetroots'&&mature?P.WOOL_RED:name==='nether_wart'?P.WOOL_RED:name==='cocoa'?P.DIRT_LIGHT:P.OAK_LEAF;if(name==='cocoa'){t.rect(7,2,2,14,P.OAK_LOG).rect(4,6,8,height,mature?P.WOOL_ORANGE:color).border(P.DIRT_DARK);return;}for(let y=15-height;y<16;y++){t.px(8,y,color);if(age>1){t.px(5+(y%3),y,color);t.px(10-(y%3),y,color);}}if(mature&&name==='wheat')for(let y=4;y<9;y++)t.rect(7,y,3,1,P.SAND);});
  return textures;
}
