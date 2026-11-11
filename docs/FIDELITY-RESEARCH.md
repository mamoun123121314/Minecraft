# Current Java Edition Fidelity Research

Baseline: **Java 26.1.2** from [PrismarineJS minecraft-data](https://github.com/PrismarineJS/minecraft-data) package 3.119.0, data version 4790. This source contains factual game protocol and registry data under MIT; Cubeworld does not copy Mojang textures, sounds, branding, or code.

## Measured scope

| Registry | Current Java | Cubeworld overlap | Coverage |
|---|---:|---:|---:|
| Blocks | 1168 | 113 | 9.67% |
| Items | 1506 | 228 | 15.14% |
| Recipes | 887 | 83 | 9.36% |
| Entities | 157 | 9 | 5.73% |
| Biomes | 65 | 5 | 7.69% |

## Behavior coverage

Registry overlap is not behavior parity. Cubeworld 1.16.0 remains approximately **19% behavior-complete** across the full requested Java scope. This engineering estimate weighs complete systems and their integration, not names. Fluids, farming, melee combat, armor, shields and projectiles are useful subsets, not complete Java systems. Missing mechanics include exact projectile ballistics/pickup and charging, attack attributes and enchantments, most entity interactions, redstone, dimensions/structures, brewing, and most containers.

## Fidelity priorities

1. **World architecture:** 384-block height, infinite chunk streaming, border-aware meshing, independent dimensions, structures, and complete biome climate rules.
2. **Rendering:** separate opaque/cutout/translucent passes, block-state models, fluid levels, smooth two-channel lighting, AO, weather, particles, held items, entity parts, and post-processing-free pixel presentation.
3. **Interaction:** authoritative hardness/tool/harvest tables, block states, placement orientation, loot tables, status effects, enchantments, redstone, containers, farming, fluids, and explosions.
4. **Survival:** complete hunger/exhaustion, armor, combat cooldowns, projectiles, effects, XP, advancements, spawning, pathfinding, breeding, drops, and dimensions.
5. **Interface:** title/world flow, recipe book, every container, accessibility, keyboard/gamepad/touch parity, localization, and exact state feedback using original Cubeworld art.
6. **Validation:** deterministic world hashes, registry coverage locks, golden physics tests, visual snapshots at fixed seeds/times/biomes, save migrations, and sustained performance budgets.

## Honest current status

The deployed game is a voxel-survival prototype, not a complete reimplementation of Current Java Edition. The lock file records every known registry gap so progress can be measured rather than claimed. Visual and audio assets remain original.
