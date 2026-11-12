import { ITEMS } from '../../data/items.js';
import { ENCHANTMENTS } from './enchanting.js';

const enchants = stack => stack?.meta?.enchantments ?? {};
function mergeEnchantments(left,right,compatible) {
  const result={...enchants(left)};let cost=0;
  for(const [id,level] of Object.entries(enchants(right))){if(compatible&&!ENCHANTMENTS[id]?.applies(left.id))continue;const previous=result[id]??0,definition=ENCHANTMENTS[id],next=Math.min(definition?.max??level,previous===level?level+1:Math.max(previous,level));if(next>previous){cost+=next;result[id]=next;}}
  return{enchantments:result,cost};
}
export function anvilPreview(left,right) {
  if(!left||!right)return null;
  if(right.id==='enchanted_book'){
    if(left.id==='book')return null;const merged=mergeEnchantments(left,right,true);if(merged.cost<=0)return null;return{result:{...left,meta:{...left.meta,enchantments:merged.enchantments}},cost:Math.max(1,merged.cost)};
  }
  if(left.id!==right.id)return null;
  const merged=mergeEnchantments(left,right,false),maximum=ITEMS[left.id]?.durability;let damage=left.damage??0;
  if(maximum){const remaining=(maximum-(left.damage??0))+(maximum-(right.damage??0))+Math.floor(maximum*.12);damage=Math.max(0,maximum-remaining);}
  return{result:{...left,damage,meta:{...left.meta,enchantments:merged.enchantments}},cost:Math.max(1,merged.cost+(maximum?2:0))};
}
export function grindstonePreview(stack) {
  const enchantments=enchants(stack);if(!stack||!Object.keys(enchantments).length)return null;
  const meta={...stack.meta};delete meta.enchantments;
  return{result:{...stack,id:stack.id==='enchanted_book'?'book':stack.id,meta},xp:Object.values(enchantments).reduce((sum,level)=>sum+level*2,0)};
}
const returnStack=(inventory,stack)=>{if(!stack)return null;const remaining=inventory.add(stack.id,stack.count,stack.meta,stack.damage);return remaining?{...stack,count:remaining}:null;};
export class AnvilSystem {
  constructor(){this.left=null;this.right=null;}
  get preview(){return anvilPreview(this.left,this.right);}
  take(survival){const preview=this.preview;if(!preview||survival.level<preview.cost)return null;survival.level-=preview.cost;survival.xp=0;this.left=null;this.right=null;return preview.result;}
  close(inventory){this.left=returnStack(inventory,this.left);this.right=returnStack(inventory,this.right);}
  serialize(){return{left:this.left,right:this.right};}
}
export class GrindstoneSystem {
  constructor(){this.input=null;}
  get preview(){return grindstonePreview(this.input);}
  take(survival){const preview=this.preview;if(!preview)return null;survival.addXp(preview.xp);this.input=null;return preview.result;}
  close(inventory){this.input=returnStack(inventory,this.input);}
  serialize(){return{input:this.input};}
}
