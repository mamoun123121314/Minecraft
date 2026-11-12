import { BLOCKS } from '../../data/blocks.js';
import { ITEMS } from '../../data/items.js';
import { armorPiece } from '../../data/combat.js';

export const ENCHANTMENTS = Object.freeze({
  efficiency: { max: 5, applies: id => /_(pickaxe|axe|shovel)$/.test(id) },
  sharpness: { max: 5, applies: id => /_(sword|axe)$/.test(id) },
  protection: { max: 4, applies: id => Boolean(armorPiece(id)) },
  unbreaking: { max: 3, applies: id => Boolean(ITEMS[id]?.durability) },
});
export const enchantmentLevel = (stack,id) => stack?.meta?.enchantments?.[id] ?? 0;
const hash = text => { let value=2166136261;for(const character of text){value^=character.charCodeAt(0);value=Math.imul(value,16777619);}return value>>>0; };
export function bookshelfPower(world,position) {
  let power=0;
  for(let dy=0;dy<=1;dy+=1)for(let dx=-2;dx<=2;dx+=1)for(let dz=-2;dz<=2;dz+=1){if(Math.max(Math.abs(dx),Math.abs(dz))!==2)continue;const x=position.x+dx,y=position.y+dy,z=position.z+dz;if(world.getBlock(x,y,z)!==BLOCKS.bookshelf.id)continue;if(world.getBlock(position.x+Math.trunc(dx/2),y,position.z+Math.trunc(dz/2))===0)power+=1;}
  return Math.min(15,power);
}
export function enchantmentOffers(stack,power,seed=1) {
  if(!stack)return[];const available=Object.entries(ENCHANTMENTS).filter(([,definition])=>definition.applies(stack.id));if(!available.length)return[];
  const required=[Math.max(1,Math.floor(power/3)),Math.max(2,Math.floor(power*2/3)),Math.max(3,power)];
  return required.map((level,index)=>{let value=hash(`${seed}:${stack.id}:${power}:${index}`),primary=available[value%available.length][0],definition=ENCHANTMENTS[primary],enchantLevel=Math.max(1,Math.min(definition.max,Math.ceil(level/4)+((value>>>8)%2)));const enchantments={...stack.meta?.enchantments,[primary]:enchantLevel};if(level>=10&&primary!=='unbreaking'&&ITEMS[stack.id]?.durability)enchantments.unbreaking=Math.min(3,1+((value>>>16)%3));return{level,lapis:index+1,enchantments};});
}
export class EnchantingSystem {
  constructor(){this.input=null;this.lapis=null;this.power=0;this.seed=1;}
  open(world,position){this.power=bookshelfPower(world,position);this.seed=hash(`${position.x},${position.y},${position.z}`);}
  get offers(){return enchantmentOffers(this.input,this.power,this.seed);}
  enchant(index,survival){const offer=this.offers[index];if(!offer||this.lapis?.id!=='lapis_lazuli'||this.lapis.count<offer.lapis||survival.level<offer.level)return null;this.lapis.count-=offer.lapis;if(this.lapis.count<=0)this.lapis=null;survival.level-=offer.level;survival.xp=0;this.input={...this.input,meta:{...this.input.meta,enchantments:offer.enchantments}};this.seed+=1;return this.input;}
  close(inventory){for(const key of['input','lapis'])if(this[key]){const stack=this[key],remaining=inventory.add(stack.id,stack.count,stack.meta,stack.damage);this[key]=remaining?{...stack,count:remaining}:null;}}
  serialize(){return{input:this.input,lapis:this.lapis,power:this.power,seed:this.seed};}
}
