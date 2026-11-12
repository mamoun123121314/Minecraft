# Current Java Edition Fidelity Research

Baseline: **Java 26.1.2** from [PrismarineJS minecraft-data](https://github.com/PrismarineJS/minecraft-data) package 3.119.0, data version 4790. This source contains factual game protocol and registry data under MIT; Cubeworld does not copy Mojang textures, sounds, branding, or code.

## Measured scope

| Registry | Current Java | Cubeworld overlap | Coverage |
|---|---:|---:|---:|
| Blocks | 1168 | 157 | 13.44% |
| Items | 1506 | 279 | 18.53% |
| Recipes | 887 | 136 | 15.33% |
| Entities | 157 | 10 | 6.37% |
| Biomes | 65 | 5 | 7.69% |

## Behavior coverage

Registry overlap is not behavior parity. Cubeworld 1.25.0 remains approximately **35% behavior-complete** across the full requested Java scope. This engineering estimate weighs integrated mechanics, not names. Wood families have real placement, model and collision states. Stairs calculate inner/outer corner shapes from live neighbors, and selection uses voxel DDA plus exact shape-box ray intersections for slabs, stairs, doors, trapdoors, gates, fences and walls. Most non-wood families, entities, dimensions, structures and progression remain incomplete.

### Brewing and effects (1.20.0)

Gunpowder and dragon's breath convert drinkable potions to usable splash and lingering forms. Thrown potions collide with blocks and entities and apply effects within four blocks. Lingering clouds last 600 ticks and reapply effects every ten ticks at one-quarter duration. Redstone extension and glowstone amplification have explicit compatibility and exclusivity rules; upgraded instant and timed potions use their modified values. Brewing stands are independent position-keyed machines and all machine states are saved.

Underwater air depletion/refill, drowning, lava and residual fire damage are live. Fire resistance and water breathing suppress their corresponding environmental effects. Splash and lingering effects also apply to mobs; mob regeneration, poison, strength, weakness, speed and slowness participate in their ticks, movement and attacks. The HUD displays remaining air.

Java parity gaps remain: dragon's breath has no Ender Dragon acquisition path, undead instant-health/harming inversion is absent, clouds do not reproduce Java's exact shrinking radius and per-entity application immunity, area attenuation and potion projectile launch values are approximate, and additional effect families remain unimplemented.

### Base brewing (1.19.0)

Twelve brewing transformations convert water bottles to awkward potions and then to base healing, harming, poison, regeneration, strength, swiftness, slowness, fire-resistance, water-breathing and weakness potions. Blaze powder provides 20 operations; each operation lasts 400 ticks and independently transforms up to three valid bottles. Drinking lasts 32 ticks, returns one glass bottle, and is cancelled when the held stack changes. Regeneration, poison, strength, weakness, resistance, speed and slowness have deterministic gameplay effects; potion metadata survives inventory operations and saves.

This is not full Java brewing parity: turtle-master, invisibility, night-vision, leaping, slow-falling, luck and decay are not implemented. Other geometry and interaction limitations remain documented below.

### Shaped geometry and targeting (1.21.0)

Stairs use straight, inner-left/right and outer-left/right state derived from adjacent stair facing and half. Placement and removal update affected neighbors, including across chunk lookups. A shared stair-box model drives both collision and meshing. Selection traverses voxels with DDA and intersects the actual shape boxes rather than sampling full voxels; returned hit normals determine the adjacent placement cell. Open doors and gates remain selectable, and fence/wall selection follows posts and rails while collision retains its 1.5-block movement barrier.

Remaining geometry differences include exact Java corner-resolution edge cases for unusual multi-stair arrangements, shaped highlight outlines, contextual slab placement and full Java selection shapes for every non-wood block. Placement still rejects the whole voxel when intersecting the player.

### Enchanting progression (1.22.0)

An original enchanting-table block and interface provide three deterministic offers based on table position, item and bookshelf power. Bookshelves use a two-high ring, obstruction checks and a 15-shelf cap. Enchanting consumes one to three lapis and displayed XP levels, rerolls offers, preserves item damage/metadata, and returns machine inputs when closed. Ore mining and mob kills award XP; the HUD displays levels.

Efficiency adds level-squared-plus-one speed with a correct tool, Sharpness adds 0.5×level+0.5 melee damage, Protection supplies capped post-armor EPF reduction, and Unbreaking uses separate tool/armor durability-save probabilities. Armor now has material/piece durability values and breaks through the existing equipment path.

This is not the complete Java enchantment system: only four enchantment families are available, offer generation is deterministic but not Java's exact enchantability/seed algorithm, XP costs reset the current level's progress, and villager trading and most treasure/specialized enchantments remain unimplemented.

### Books, anvils and grindstones (1.23.0)

Paper and leather craft books; enchanting a book creates an enchanted-book item with typed metadata. Anvils apply compatible book enchantments, merge equal levels up to caps, combine same-item enchantments, and repair same-item durability using both remaining durabilities plus 12% of maximum. Taking a result validates and deducts levels and consumes both inputs atomically. Grindstones remove enchantments without changing damage, convert enchanted books back to books, and return two XP per enchantment level. Both interfaces preserve item metadata/damage and return unused inputs on close. Stone slabs and their recipe support the grindstone recipe.

Remaining differences include material-based repair, renaming, prior-work cost scaling, anvil damage/falling physics, Java's exact conflict/cost rules, grindstone two-item repair and precise XP formulas, and most enchantment families.

### Villager trading (1.24.0)

Farmer, librarian and toolsmith villagers spawn with stable IDs and professions. Right-click entity targeting opens a trading interface showing inputs, outputs, stock and affordability. Offers include crop/coal/paper sales, food and tools, and librarian enchanted books. Multi-input trades validate inventory and stock, consume inputs, add typed outputs and award player/villager XP. Output-capacity failure rolls back inventory and stock. Limited uses rebuild when the 24,000-tick clock wraps into a new day.

This is a compact trading system, not full villager parity: offers are fixed rather than unlocked through profession levels, stock is not tied to workstations or work schedules, and exact Java prices/trade pools differ. Village generation, pathfinding, breeding, gossip/reputation, raids, zombie curing and the remaining professions remain unimplemented.

### Animals, fishing, beds, TNT and effects (1.25.0)

Cows, sheep, pigs and chickens consume species-specific food, seek partners in love mode, produce half-scale babies, mature after 24,000 ticks and obey breeding cooldowns and local animal caps. Fishing rods cast at raycast water, wait 100–600 ticks, and retrieve weighted fish, treasure or junk with durability and XP. Beds set a persistent respawn point and, after the night threshold with no nearby living hostile, reset time and weather. Flint and steel primes TNT for 80 ticks; blasts remove destructible blocks in a radius-four sphere, preserve bedrock, damage players/mobs, drop a deterministic quarter of mined drops and chain neighboring charges. Night vision, invisibility, jump boost and slow falling now affect rendering, hostile aggro, jumping and gravity. Cod, salmon and pufferfish are edible; golden carrots and additional brewing ingredients/recipes are available.

These are compact mechanics, not complete Java parity: fishing uses a simplified loot table without Luck of the Sea or open-water rules; breeding lacks complete AI/pathfinding and all other species; sleeping is instantaneous and single-player-only; TNT uses deterministic spherical damage/destruction rather than Java ray sampling, blast resistance and entity physics. Potions still omit undead inversion and many effects.

## Fidelity priorities

1. **World architecture:** 384-block height, infinite chunk streaming, border-aware meshing, independent dimensions, structures, and complete biome climate rules.
2. **Rendering:** separate opaque/cutout/translucent passes, block-state models, fluid levels, smooth two-channel lighting, AO, weather, particles, held items, entity parts, and post-processing-free pixel presentation.
3. **Interaction:** authoritative hardness/tool/harvest tables, block states, placement orientation, loot tables, status effects, enchantments, redstone, containers, farming, fluids, and explosions.
4. **Survival:** complete hunger/exhaustion, armor, combat cooldowns, projectiles, effects, XP, advancements, spawning, pathfinding, breeding, drops, and dimensions.
5. **Interface:** title/world flow, recipe book, every container, accessibility, keyboard/gamepad/touch parity, localization, and exact state feedback using original Cubeworld art.
6. **Validation:** deterministic world hashes, registry coverage locks, golden physics tests, visual snapshots at fixed seeds/times/biomes, save migrations, and sustained performance budgets.

## Honest current status

The deployed game is a voxel-survival prototype, not a complete reimplementation of Current Java Edition. The lock file records every known registry gap so progress can be measured rather than claimed. Visual and audio assets remain original.
