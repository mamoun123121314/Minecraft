export const BLOCKS = Object.freeze({
  air:{id:0,name:'air',solid:false,opaque:false,texture:'glass'}, grass_block:{id:1,name:'grass_block',solid:true,opaque:true,textures:{top:'grass_top',bottom:'dirt',side:'grass_side'}},
  dirt:{id:2,name:'dirt',solid:true,opaque:true,texture:'dirt'}, stone:{id:3,name:'stone',solid:true,opaque:true,texture:'stone'}, bedrock:{id:4,name:'bedrock',solid:true,opaque:true,texture:'bedrock'},
  water:{id:5,name:'water',solid:false,opaque:false,texture:'water_still',renderLayer:'translucent'}, sand:{id:6,name:'sand',solid:true,opaque:true,texture:'sand'}, gravel:{id:7,name:'gravel',solid:true,opaque:true,texture:'gravel'},
  coal_ore:{id:8,name:'coal_ore',solid:true,opaque:true,texture:'coal_ore'}, iron_ore:{id:9,name:'iron_ore',solid:true,opaque:true,texture:'iron_ore'}, diamond_ore:{id:10,name:'diamond_ore',solid:true,opaque:true,texture:'diamond_ore'},
  snow:{id:12,name:'snow',solid:true,opaque:true,texture:'snow_block'}, deepslate:{id:13,name:'deepslate',solid:true,opaque:true,texture:'obsidian'}, oak_log:{id:14,name:'oak_log',solid:true,opaque:true,textures:{top:'oak_log_top',bottom:'oak_log_top',side:'oak_log_side'}}, oak_leaves:{id:15,name:'oak_leaves',solid:true,opaque:false,texture:'oak_leaves'}
});
export const BLOCK_BY_ID=Object.freeze(Object.fromEntries(Object.values(BLOCKS).map((block)=>[block.id,block])));
