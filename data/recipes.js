export const RECIPES=[
 {pattern:['L'],key:{L:'oak_log'},out:{id:'oak_planks',count:4}},
 {pattern:['P','P'],key:{P:'oak_planks'},out:{id:'stick',count:4}},
 {pattern:['PP','PP'],key:{P:'oak_planks'},out:{id:'crafting_table',count:1}},
 {pattern:['CCC','C C','CCC'],key:{C:'cobblestone'},out:{id:'furnace',count:1}},
 {pattern:['PPP','P P','PPP'],key:{P:'oak_planks'},out:{id:'chest',count:1}},
 {pattern:['PPP',' S ',' S '],key:{P:'oak_planks',S:'stick'},out:{id:'wooden_pickaxe',count:1}},
 {pattern:['CCC',' S ',' S '],key:{C:'cobblestone',S:'stick'},out:{id:'stone_pickaxe',count:1}},
 {pattern:['III',' S ',' S '],key:{I:'iron_ingot',S:'stick'},out:{id:'iron_pickaxe',count:1}},
 {pattern:['C','S'],key:{C:'coal',S:'stick'},out:{id:'torch',count:4}},
 {pattern:['WWW'],key:{W:'wheat'},out:{id:'bread',count:1}},
 {pattern:['III','III','III'],key:{I:'iron_ingot'},out:{id:'iron_block',count:1}},
 {pattern:['I I',' I '],key:{I:'iron_ingot'},out:{id:'bucket',count:1}}
];
export const SMELTING=Object.freeze({sand:{out:'glass',ticks:200,xp:.1},iron_ore:{out:'iron_ingot',ticks:200,xp:.7},cobblestone:{out:'stone',ticks:200,xp:.1}});
export const FUELS=Object.freeze({coal:1600,oak_planks:300,oak_log:300,stick:100,lava_bucket:20000});
