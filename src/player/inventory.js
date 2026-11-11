import{ITEMS}from'../../data/items.js';
import{armorPiece}from'../../data/combat.js';
export class Inventory{
 constructor(){this.slots=Array(36).fill(null);this.equipment={helmet:null,chestplate:null,leggings:null,boots:null,offhand:null};this.selected=0;this.add('stone',64);this.add('dirt',64);this.add('oak_planks',64);}
 select(i){this.selected=(i+9)%9;}
 get held(){return this.slots[this.selected];}
 add(id,count=1,meta=null){const maximum=ITEMS[id]?.stack??64;let remaining=count;for(const slot of this.slots)if(slot?.id===id&&slot.count<maximum&&JSON.stringify(slot.meta??null)===JSON.stringify(meta)){const moved=Math.min(remaining,maximum-slot.count);slot.count+=moved;remaining-=moved;if(!remaining)return 0;}for(let index=0;index<this.slots.length&&remaining;index++)if(!this.slots[index]){const moved=Math.min(remaining,maximum);this.slots[index]={id,count:moved,...(meta?{meta:{...meta}}:{})};remaining-=moved;}return remaining;}
 remove(id,count=1){let remaining=count;for(let index=this.slots.length-1;index>=0&&remaining;index--){const slot=this.slots[index];if(slot?.id!==id)continue;const moved=Math.min(remaining,slot.count);slot.count-=moved;remaining-=moved;if(slot.count===0)this.slots[index]=null;}return count-remaining;}
 consumeSelected(count=1){const slot=this.held;if(!slot||slot.count<count)return false;slot.count-=count;if(slot.count===0)this.slots[this.selected]=null;return true;}
 damageSelected(amount=1){const slot=this.held,maximum=ITEMS[slot?.id]?.durability;if(!slot||!maximum)return false;slot.damage=(slot.damage??0)+amount;if(slot.damage>=maximum)this.slots[this.selected]=null;return true;}
 equipSelected(){const slot=this.held;if(!slot)return false;const piece=armorPiece(slot.id)??(slot.id==='shield'?'offhand':null);if(!piece)return false;this.slots[this.selected]=this.equipment[piece];this.equipment[piece]=slot;return true;}
 damageEquipment(piece,amount=1){const slot=this.equipment[piece],maximum=ITEMS[slot?.id]?.durability;if(!slot)return false;slot.damage=(slot.damage??0)+amount;if(maximum&&slot.damage>=maximum)this.equipment[piece]=null;return true;}
}
