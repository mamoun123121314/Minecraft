import{JAVA_ITEM_PROPERTIES}from'./java-properties.js';
import{BLOCKS}from'./blocks.js';
const item=(name,options={})=>Object.freeze({name:name.split('_').map(word=>word[0].toUpperCase()+word.slice(1)).join(' '),stack:JAVA_ITEM_PROPERTIES[name]?.stackSize??64,...options});
const catalog={};
for(const block of Object.values(BLOCKS))if(block.name!=='air'&&!['water','lava'].includes(block.name))catalog[block.name]=item(block.name,{block:block.id});
const materials=['wooden','stone','iron','golden','diamond','netherite'];for(const material of materials)for(const tool of['pickaxe','axe','shovel','sword','hoe'])catalog[`${material}_${tool}`]=item(`${material}_${tool}`,{stack:1,durability:{wooden:59,stone:131,iron:250,golden:32,diamond:1561,netherite:2031}[material]});
for(const material of['leather','chainmail','iron','golden','diamond','netherite'])for(const piece of['helmet','chestplate','leggings','boots'])catalog[`${material}_${piece}`]=item(`${material}_${piece}`,{stack:1});
for(const name of['stick','coal','charcoal','raw_iron','raw_gold','raw_copper','iron_ingot','gold_ingot','copper_ingot','diamond','emerald','lapis_lazuli','redstone','flint','quartz','netherite_scrap','netherite_ingot','brick','clay_ball','wheat','string','feather','leather','paper','book','bone','gunpowder','slime_ball','ender_pearl','blaze_rod','apple','bread','carrot','potato','baked_potato','beetroot','melon_slice','beef','cooked_beef','porkchop','cooked_porkchop','chicken','cooked_chicken','mutton','cooked_mutton','egg','arrow','bow','shield','shears','flint_and_steel','fishing_rod','clock','compass','bucket','water_bucket','lava_bucket','milk_bucket','oak_boat','oak_sign','white_bed','oak_trapdoor','oak_fence','oak_stairs','oak_slab','minecart'])catalog[name]=item(name);
export const ITEMS=Object.freeze(catalog);
export const ITEM_COUNT=Object.keys(ITEMS).length;
export class ItemStack{constructor(id,count=1,durability=null,meta={}){if(!ITEMS[id])throw new Error(`Unknown item: ${id}`);this.id=id;this.count=Math.min(count,ITEMS[id].stack);this.durability=durability;this.meta=meta;}clone(){return new ItemStack(this.id,this.count,this.durability,{...this.meta});}}
