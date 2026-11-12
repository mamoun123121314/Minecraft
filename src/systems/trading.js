import { TRADE_OFFERS } from '../../data/trading.js';

export const itemCount = (inventory,id) => inventory.slots.reduce((sum,stack)=>sum+(stack?.id===id?stack.count:0),0);
export class TradingSystem {
  constructor(){this.lastTime=0;}
  offers(mob){return TRADE_OFFERS[mob?.profession]??[];}
  stock(mob){if(!mob.tradeStock)mob.tradeStock=this.offers(mob).map(offer=>offer.maxUses);return mob.tradeStock;}
  canTrade(mob,index,inventory){const offer=this.offers(mob)[index];return Boolean(offer&&this.stock(mob)[index]>0&&offer.inputs.every(input=>itemCount(inventory,input.id)>=input.count));}
  trade(mob,index,inventory,survival){
    const offer=this.offers(mob)[index];if(!this.canTrade(mob,index,inventory))return null;
    const snapshot=structuredClone(inventory.slots),stock=this.stock(mob)[index];
    for(const input of offer.inputs)inventory.remove(input.id,input.count);
    const remaining=inventory.add(offer.output.id,offer.output.count,offer.output.meta);
    if(remaining){inventory.slots=snapshot;mob.tradeStock[index]=stock;return null;}
    mob.tradeStock[index]-=1;mob.experience=(mob.experience??0)+2;survival.addXp(2);return{...offer.output};
  }
  tick(mobs,ticks){if(ticks<this.lastTime)for(const mob of mobs.entities)if(mob.type==='villager'){mob.tradeStock=null;this.stock(mob);}this.lastTime=ticks;}
}
