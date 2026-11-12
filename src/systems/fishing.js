const LOOT=[{id:'cod',weight:60},{id:'salmon',weight:25},{id:'pufferfish',weight:2},{id:'bow',weight:1},{id:'enchanted_book',weight:1},{id:'name_tag',weight:1},{id:'leather',weight:10}];
export class FishingSystem{
  constructor(random=Math.random){this.random=random;this.active=null;}
  cast(position){if(this.active)return false;this.active={position:{...position},wait:100+Math.floor(this.random()*501)};return true;}
  retrieve(){if(!this.active||this.active.wait>0)return null;this.active=null;let roll=this.random()*LOOT.reduce((sum,entry)=>sum+entry.weight,0);for(const entry of LOOT){roll-=entry.weight;if(roll<0)return{id:entry.id,count:1};}return{id:'cod',count:1};}
  tick(){if(this.active&&this.active.wait>0)this.active.wait-=1;return this.active?.wait===0;}
}
