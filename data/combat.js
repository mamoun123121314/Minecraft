const tools = {
  wooden: { sword: [4, 1.6], axe: [7, 0.8], pickaxe: [2, 1.2], shovel: [2.5, 1], hoe: [1, 1] },
  stone: { sword: [5, 1.6], axe: [9, 0.8], pickaxe: [3, 1.2], shovel: [3.5, 1], hoe: [1, 2] },
  iron: { sword: [6, 1.6], axe: [9, 0.9], pickaxe: [4, 1.2], shovel: [4.5, 1], hoe: [1, 3] },
  golden: { sword: [4, 1.6], axe: [7, 1], pickaxe: [2, 1.2], shovel: [2.5, 1], hoe: [1, 1] },
  diamond: { sword: [7, 1.6], axe: [9, 1], pickaxe: [5, 1.2], shovel: [5.5, 1], hoe: [1, 4] },
  netherite: { sword: [8, 1.6], axe: [10, 1], pickaxe: [6, 1.2], shovel: [6.5, 1], hoe: [1, 4] },
};
export const WEAPONS = Object.freeze(Object.fromEntries([
  ...Object.entries(tools).flatMap(([material, kinds]) => Object.entries(kinds).map(([kind, values]) => [`${material}_${kind}`, { damage: values[0], attackSpeed: values[1] }])),
  ['trident', { damage: 9, attackSpeed: 1.1 }],
]));
export const ARMOR = Object.freeze({
  leather_helmet: [1, 0], leather_chestplate: [3, 0], leather_leggings: [2, 0], leather_boots: [1, 0],
  chainmail_helmet: [2, 0], chainmail_chestplate: [5, 0], chainmail_leggings: [4, 0], chainmail_boots: [1, 0],
  iron_helmet: [2, 0], iron_chestplate: [6, 0], iron_leggings: [5, 0], iron_boots: [2, 0],
  golden_helmet: [2, 0], golden_chestplate: [5, 0], golden_leggings: [3, 0], golden_boots: [1, 0],
  diamond_helmet: [3, 2], diamond_chestplate: [8, 2], diamond_leggings: [6, 2], diamond_boots: [3, 2],
  netherite_helmet: [3, 3], netherite_chestplate: [8, 3], netherite_leggings: [6, 3], netherite_boots: [3, 3],
});
export const armorPiece = name => ['helmet', 'chestplate', 'leggings', 'boots'].find(piece => name?.endsWith(`_${piece}`));
export function armorProtection(equipment = {}) {
  let armor = 0, toughness = 0;
  for (const stack of Object.values(equipment)) {
    const values = ARMOR[stack?.id ?? stack];
    if (values) { armor += values[0]; toughness += values[1]; }
  }
  return { armor, toughness };
}
export function mitigateDamage(amount, protection) {
  const armor = Math.max(0, (protection?.armor ?? 0) * 4);
  const toughness = Math.max(0, protection?.toughness ?? 0);
  const effective = Math.min(20, Math.max(armor / 5, armor - amount / (2 + toughness / 4)));
  return amount * (1 - effective / 25);
}
