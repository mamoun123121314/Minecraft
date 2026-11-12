export const TRADE_OFFERS = Object.freeze({
  farmer: [
    { inputs:[{id:'wheat',count:20}], output:{id:'emerald',count:1}, maxUses:16 },
    { inputs:[{id:'carrot',count:22}], output:{id:'emerald',count:1}, maxUses:16 },
    { inputs:[{id:'emerald',count:1}], output:{id:'bread',count:6}, maxUses:16 },
  ],
  librarian: [
    { inputs:[{id:'paper',count:24}], output:{id:'emerald',count:1}, maxUses:16 },
    { inputs:[{id:'book',count:1},{id:'emerald',count:12}], output:{id:'enchanted_book',count:1,meta:{enchantments:{efficiency:1}}}, maxUses:12 },
    { inputs:[{id:'book',count:1},{id:'emerald',count:16}], output:{id:'enchanted_book',count:1,meta:{enchantments:{protection:2}}}, maxUses:12 },
  ],
  toolsmith: [
    { inputs:[{id:'coal',count:15}], output:{id:'emerald',count:1}, maxUses:16 },
    { inputs:[{id:'emerald',count:8}], output:{id:'iron_pickaxe',count:1}, maxUses:3 },
    { inputs:[{id:'emerald',count:12}], output:{id:'iron_axe',count:1,meta:{enchantments:{efficiency:1}}}, maxUses:3 },
  ],
});
