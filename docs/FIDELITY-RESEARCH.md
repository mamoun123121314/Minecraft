# Current Java Edition Fidelity Research

Baseline: **Java 26.1.2** from [PrismarineJS minecraft-data](https://github.com/PrismarineJS/minecraft-data) package 3.119.0, data version 4790. This source contains factual game protocol and registry data under MIT; Cubeworld does not copy Mojang textures, sounds, branding, or code.

## Measured scope

| Registry | Current Java | Cubeworld overlap | Coverage |
|---|---:|---:|---:|
| Blocks | 1168 | 153 | 13.10% |
| Items | 1506 | 278 | 18.46% |
| Recipes | 887 | 131 | 14.77% |
| Entities | 157 | 9 | 5.73% |
| Biomes | 65 | 5 | 7.69% |

## Behavior coverage

Registry overlap is not behavior parity. Cubeworld 1.21.0 remains approximately **26% behavior-complete** across the full requested Java scope. This engineering estimate weighs integrated mechanics, not names. Wood families have real placement, model and collision states. Stairs calculate inner/outer corner shapes from live neighbors, and selection uses voxel DDA plus exact shape-box ray intersections for slabs, stairs, doors, trapdoors, gates, fences and walls. Most non-wood families, entities, dimensions, structures and progression remain incomplete.

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

## Fidelity priorities

1. **World architecture:** 384-block height, infinite chunk streaming, border-aware meshing, independent dimensions, structures, and complete biome climate rules.
2. **Rendering:** separate opaque/cutout/translucent passes, block-state models, fluid levels, smooth two-channel lighting, AO, weather, particles, held items, entity parts, and post-processing-free pixel presentation.
3. **Interaction:** authoritative hardness/tool/harvest tables, block states, placement orientation, loot tables, status effects, enchantments, redstone, containers, farming, fluids, and explosions.
4. **Survival:** complete hunger/exhaustion, armor, combat cooldowns, projectiles, effects, XP, advancements, spawning, pathfinding, breeding, drops, and dimensions.
5. **Interface:** title/world flow, recipe book, every container, accessibility, keyboard/gamepad/touch parity, localization, and exact state feedback using original Cubeworld art.
6. **Validation:** deterministic world hashes, registry coverage locks, golden physics tests, visual snapshots at fixed seeds/times/biomes, save migrations, and sustained performance budgets.

## Honest current status

The deployed game is a voxel-survival prototype, not a complete reimplementation of Current Java Edition. The lock file records every known registry gap so progress can be measured rather than claimed. Visual and audio assets remain original.
