export const FOODS=Object.freeze({
 rotten_flesh:{nutrition:4,saturation:.8},apple:{nutrition:4,saturation:2.4},bread:{nutrition:5,saturation:6},carrot:{nutrition:3,saturation:3.6},potato:{nutrition:1,saturation:.6},baked_potato:{nutrition:5,saturation:6},beetroot:{nutrition:1,saturation:1.2},melon_slice:{nutrition:2,saturation:1.2},
 beef:{nutrition:3,saturation:1.8},cooked_beef:{nutrition:8,saturation:12.8},porkchop:{nutrition:3,saturation:1.8},cooked_porkchop:{nutrition:8,saturation:12.8},chicken:{nutrition:2,saturation:1.2},cooked_chicken:{nutrition:6,saturation:7.2},mutton:{nutrition:2,saturation:1.2},cooked_mutton:{nutrition:6,saturation:9.6}
});
export class EatingSystem{
 constructor(duration=32){this.duration=duration;this.item=null;this.ticks=0;}
 start(itemId,survival){if(!FOODS[itemId]||survival.hunger>=20)return false;this.item=itemId;this.ticks=0;return true;}
 cancel(){this.item=null;this.ticks=0;}
 tick(currentItemId,survival,inventory){if(!this.item)return false;if(currentItemId!==this.item){this.cancel();return false;}if(++this.ticks<this.duration)return false;const food=FOODS[this.item];survival.eat(food.nutrition,food.saturation);inventory.consumeSelected();const eaten=this.item;this.cancel();return eaten;}
}
