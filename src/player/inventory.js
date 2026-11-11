import{ITEMS}from'../../data/items.js';
export class Inventory{
 constructor(){this.slots=Array(36).fill(null);this.selected=0;this.add('stone',64);this.add('dirt',64);this.add('oak_planks',64);}
 select(i){this.selected=(i+9)%9;}
 get held(){return this.slots[this.selected];}
 add(id,count=1){const maximum=ITEMS[id]?.stack??64;let remaining=count;for(const slot of this.slots)if(slot?.id===id&&slot.count<maximum){const moved=Math.min(remaining,maximum-slot.count);slot.count+=moved;remaining-=moved;if(!remaining)return 0;}for(let index=0;index<this.slots.length&&remaining;index++)if(!this.slots[index]){const moved=Math.min(remaining,maximum);this.slots[index]={id,count:moved};remaining-=moved;}return remaining;}
 remove(id,count=1){let remaining=count;for(let index=this.slots.length-1;index>=0&&remaining;index--){const slot=this.slots[index];if(slot?.id!==id)continue;const moved=Math.min(remaining,slot.count);slot.count-=moved;remaining-=moved;if(slot.count===0)this.slots[index]=null;}return count-remaining;}
 consumeSelected(count=1){const slot=this.held;if(!slot||slot.count<count)return false;slot.count-=count;if(slot.count===0)this.slots[this.selected]=null;return true;}
}
