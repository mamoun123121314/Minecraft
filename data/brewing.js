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
  night_vision: { effect: 'night_vision', duration: 3600, amplifier: 0 },
  invisibility: { effect: 'invisibility', duration: 3600, amplifier: 0 },
  leaping: { effect: 'jump_boost', duration: 3600, amplifier: 0 },
  slow_falling: { effect: 'slow_falling', duration: 1800, amplifier: 0 },
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
  'awkward:golden_carrot': 'night_vision',
  'night_vision:fermented_spider_eye': 'invisibility',
  'awkward:rabbit_foot': 'leaping',
  'awkward:phantom_membrane': 'slow_falling',
});
export const EXTENDED_POTIONS = Object.freeze({ poison: 1800, regeneration: 1800, strength: 9600, swiftness: 9600, slowness: 4800, fire_resistance: 9600, water_breathing: 9600, weakness: 4800, night_vision: 9600, invisibility: 9600, leaping: 9600, slow_falling: 4800 });
export const AMPLIFIED_POTIONS = Object.freeze({ poison: 420, regeneration: 450, strength: 1800, swiftness: 1800, slowness: 400, leaping: 1800 });
export const INSTANT_POTIONS = Object.freeze({ healing: 1, harming: 1 });
export const BREW_TICKS = 400, BREW_FUEL_USES = 20;
