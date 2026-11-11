# Current Java Edition Fidelity Research

Baseline: **Java 26.1.2** from [PrismarineJS minecraft-data](https://github.com/PrismarineJS/minecraft-data) package 3.119.0, data version 4790. This source contains factual game protocol and registry data under MIT; Cubeworld does not copy Mojang textures, sounds, branding, or code.

## Measured scope

| Registry | Current Java | Cubeworld overlap | Coverage |
|---|---:|---:|---:|
| Blocks | 1168 | 100 | 8.56% |
| Items | 1506 | 217 | 14.41% |
| Recipes | 887 | 80 | 9.02% |
| Entities | 157 | 9 | 5.73% |
| Biomes | 65 | 5 | 7.69% |

## Fidelity priorities

1. **World architecture:** 384-block height, infinite chunk streaming, border-aware meshing, independent dimensions, structures, and complete biome climate rules.
2. **Rendering:** separate opaque/cutout/translucent passes, block-state models, fluid levels, smooth two-channel lighting, AO, weather, particles, held items, entity parts, and post-processing-free pixel presentation.
3. **Interaction:** authoritative hardness/tool/harvest tables, block states, placement orientation, loot tables, status effects, enchantments, redstone, containers, farming, fluids, and explosions.
4. **Survival:** complete hunger/exhaustion, armor, combat cooldowns, projectiles, effects, XP, advancements, spawning, pathfinding, breeding, drops, and dimensions.
5. **Interface:** title/world flow, recipe book, every container, accessibility, keyboard/gamepad/touch parity, localization, and exact state feedback using original Cubeworld art.
6. **Validation:** deterministic world hashes, registry coverage locks, golden physics tests, visual snapshots at fixed seeds/times/biomes, save migrations, and sustained performance budgets.

## Honest current status

The deployed game is a voxel-survival prototype, not a complete reimplementation of Current Java Edition. The lock file records every known registry gap so progress can be measured rather than claimed. Visual and audio assets remain original.
