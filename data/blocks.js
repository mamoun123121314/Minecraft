const block=(id,name,texture,options={})=>Object.freeze({id,name,solid:true,opaque:true,hardness:1.5,renderLayer:'opaque',texture,...options});
const entries=[
 block(0,'air','glass',{solid:false,opaque:false,hardness:0,renderLayer:'none'}),block(1,'grass_block','grass_side',{textures:{top:'grass_top',bottom:'dirt',side:'grass_side'},hardness:.6}),block(2,'dirt','dirt',{hardness:.5}),block(3,'stone','stone'),block(4,'bedrock','bedrock',{hardness:-1}),
 block(5,'water','water_still',{solid:false,opaque:false,hardness:100,renderLayer:'translucent'}),block(6,'sand','sand',{hardness:.5,gravity:true}),block(7,'gravel','gravel',{hardness:.6,gravity:true}),block(8,'coal_ore','coal_ore',{hardness:3}),block(9,'iron_ore','iron_ore',{hardness:3}),block(10,'diamond_ore','diamond_ore',{hardness:3}),block(11,'lava','lava_still',{solid:false,opaque:false,light:15,renderLayer:'translucent'}),block(12,'snow_block','snow_block',{hardness:.2}),block(13,'deepslate','deepslate',{hardness:3}),block(14,'oak_log','oak_log_side',{textures:{top:'oak_log_top',bottom:'oak_log_top',side:'oak_log_side'},hardness:2}),block(15,'oak_leaves','oak_leaves',{opaque:false,hardness:.2,renderLayer:'cutout'})
];
let id=16;
const simple={cobblestone:'cobblestone',sandstone:'sandstone',red_sand:'red_sand',clay:'clay',ice:'ice',obsidian:'obsidian',bricks:'bricks',stone_bricks:'stone_bricks',glass:'glass',glowstone:'glowstone',netherrack:'netherrack',soul_sand:'soul_sand',end_stone:'end_stone',purpur_block:'purpur',mossy_cobblestone:'mossy_cobblestone',andesite:'andesite',diorite:'diorite',granite:'granite',tuff:'tuff',calcite:'calcite',dripstone_block:'dripstone',amethyst_block:'amethyst',iron_block:'iron_block',gold_block:'gold_block',diamond_block:'diamond_block',emerald_block:'emerald_block',lapis_block:'lapis_block',coal_block:'coal_block',copper_block:'copper_block',farmland:'farmland_dry',wet_farmland:'farmland_wet',dirt_path:'path',mycelium:'mycelium'};
for(const [name,texture] of Object.entries(simple))entries.push(block(id++,name,texture,{opaque:!['glass','ice'].includes(name),renderLayer:['glass'].includes(name)?'cutout':['ice'].includes(name)?'translucent':'opaque'}));
for(const [name,texture] of Object.entries({copper_ore:'copper_ore',gold_ore:'gold_ore',redstone_ore:'redstone_ore',lapis_ore:'lapis_ore',emerald_ore:'emerald_ore'}))entries.push(block(id++,name,texture,{hardness:3}));
for(const wood of ['oak','birch','spruce','jungle','acacia','dark_oak']){
 if(wood!=='oak')entries.push(block(id++,`${wood}_log`,`${wood}_log_side`,{textures:{top:`${wood}_log_top`,bottom:`${wood}_log_top`,side:`${wood}_log_side`},hardness:2}));
 entries.push(block(id++,`${wood}_planks`,`${wood}_planks`,{hardness:2}));
 if(wood!=='oak')entries.push(block(id++,`${wood}_leaves`,`${wood}_leaves`,{opaque:false,hardness:.2,renderLayer:'cutout'}));
}
for(const color of ['white','black','red','blue','green','yellow','orange','purple','cyan','lime','pink','gray','light_gray','brown','magenta'])entries.push(block(id++,`${color}_wool`,`${color}_wool`,{hardness:.8}));
const utility={crafting_table:'crafting_table_side',furnace:'furnace_front',lit_furnace:'furnace_lit',chest:'chest',ladder:'ladder',bookshelf:'bookshelf',tnt:'tnt',pumpkin:'pumpkin',melon:'melon',cactus:'cactus_side',sugar_cane:'sugar_cane',torch:'torch'};
for(const [name,texture] of Object.entries(utility))entries.push(block(id++,name,texture,{opaque:!['ladder','sugar_cane','torch'].includes(name),solid:!['ladder','sugar_cane','torch'].includes(name),renderLayer:['ladder','sugar_cane','torch'].includes(name)?'cutout':'opaque',light:name==='torch'?14:0}));
for(const [name,texture] of Object.entries({oak_sapling:'oak_sapling',grass_tuft:'grass_tuft',dandelion:'dandelion',poppy:'poppy',fern:'fern',dead_bush:'dead_bush'}))entries.push(block(id++,name,texture,{solid:false,opaque:false,hardness:0,renderLayer:'cutout'}));
export const BLOCKS=Object.freeze(Object.fromEntries(entries.map(value=>[value.name,value])));
export const BLOCK_BY_ID=Object.freeze(Object.fromEntries(entries.map(value=>[value.id,value])));
export const BLOCK_COUNT=entries.length;
