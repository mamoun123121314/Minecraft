export const POTIONS = Object.freeze({
  water: null,
  awkward: null,
  healing: { effect: 'instant_health', amplifier: 0 },
  harming: { effect: 'instant_damage', amplifier: 0 },
  poison: { effect: 'poison', duration: 900, amplifier: 0 },
  regeneration: { effect: 'regeneration', duration: 900, amplifier: 0 },
  strength: { effect: 'strength', duration: 3600, amplifier: 0 },
  swiftness: { effect: 'speed', duration: 3600, amplifier: 0 },
  slowness: { effect: 'slowness', duration: 1800, amplifier: 0 },
  fire_resistance: { effect: 'fire_resistance', duration: 3600, amplifier: 0 },
  water_breathing: { effect: 'water_breathing', duration: 3600, amplifier: 0 },
  weakness: { effect: 'weakness', duration: 1800, amplifier: 0 },
});
export const BREWING_RECIPES = Object.freeze({
  'water:nether_wart': 'awkward',
  'awkward:glistering_melon_slice': 'healing',
  'awkward:spider_eye': 'poison',
  'awkward:ghast_tear': 'regeneration',
  'awkward:blaze_powder': 'strength',
  'awkward:sugar': 'swiftness',
  'awkward:fermented_spider_eye': 'weakness',
  'swiftness:fermented_spider_eye': 'slowness',
  'healing:fermented_spider_eye': 'harming',
  'poison:fermented_spider_eye': 'harming',
  'awkward:magma_cream': 'fire_resistance',
  'awkward:pufferfish': 'water_breathing',
});
export const BREW_TICKS = 400, BREW_FUEL_USES = 20;
