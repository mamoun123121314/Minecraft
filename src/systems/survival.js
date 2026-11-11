export class SurvivalSystem{
 constructor(){this.health=20;this.hunger=20;this.saturation=5;this.exhaustion=0;this.xp=0;this.level=0;this.air=300;this.invulnerable=0;this.dead=false;this.deathTicks=0;this.drops=[];}
 damage(amount,source='generic'){if(this.dead||this.invulnerable>0)return 0;this.health=Math.max(0,this.health-amount);this.invulnerable=10;if(this.health<=0){this.dead=true;this.deathTicks=20;}return amount;}
 fall(distance){return distance>3?this.damage(Math.floor(distance-3),'fall'):0;}
 exhaust(amount){this.exhaustion+=amount;while(this.exhaustion>=4){this.exhaustion-=4;if(this.saturation>0)this.saturation=Math.max(0,this.saturation-1);else this.hunger=Math.max(0,this.hunger-1);}}
 eat(nutrition,saturation){if(this.dead||this.hunger>=20)return false;this.hunger=Math.min(20,this.hunger+nutrition);this.saturation=Math.min(this.hunger,this.saturation+saturation);return true;}
 addXp(amount){this.xp+=amount;const needed=7+this.level*2;while(this.xp>=needed){this.xp-=needed;this.level++;}}
 die(inventory,position){this.dead=true;this.health=0;this.deathTicks=20;this.drops=[...inventory.slots,...Object.values(inventory.equipment??{})].flatMap((stack)=>stack?[{...stack,position:{...position},despawn:6000}]:[]);inventory.slots.fill(null);if(inventory.equipment)for(const piece of Object.keys(inventory.equipment))inventory.equipment[piece]=null;return this.drops;}
 respawn(position){this.health=20;this.hunger=20;this.saturation=5;this.dead=false;this.deathTicks=0;this.invulnerable=60;position.x=8.5;position.y=100;position.z=8.5;}
 tick(){if(this.invulnerable>0)this.invulnerable--;if(this.dead){this.deathTicks--;return;}if(this.hunger>=18&&this.health<20&&this.invulnerable===0&&this._ticks%80===0)this.health++;if(this.hunger===0&&this._ticks%80===0)this.damage(1,'starvation');this._ticks=(this._ticks??0)+1;}
}
