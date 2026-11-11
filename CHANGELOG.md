# Changelog

## 1.17.0 — Deterministic Redstone
- Added levers, stone buttons, redstone blocks, torches, dust, repeaters, observers, lamps, and powered-door behavior with eight crafting recipes.
- Added 0–15 dust propagation, disconnection/source-removal rebuilds, directional repeater output, configurable delay scheduling, two-tick observer pulses, and fixed-tick device updates.
- Added original device textures, horizontal dust geometry, lamp lit-state rendering, placement facing, world-edit notifications, live interaction/remeshing, and deterministic redstone CI.

## 1.16.0 — Interactive Containers
- Replaced display-only inventory/chest controls with cursor pickup, swapping, merging, right-click splitting/single placement, shift-click transfers, and overflow-safe movement.
- Added consumable 2×2 crafting outputs, safe item return on close, usable furnace input/fuel/output slots, output merging, fuel gating, and full-output protection.
- Added position-keyed chest inventories, chest/furnace world opening, autosave serialization, and deterministic plus browser-level interaction tests.

## 1.15.0 — Combat and Equipment
- Added Java-calibrated tool/weapon attack damage and speed, cooldown charge scaling, three-block entity targeting, falling critical hits, knockback, and ten-tick hurt invulnerability.
- Added equipable armor and offhand shields, armor/toughness mitigation with an 80% cap, durability consumption for combat/mining/equipment, and equipped-item death drops.
- Added bow arrows and thrown tridents with original procedural mesh geometry, gravity, entity/world collision, deterministic damage, and geometry/material disposal.
- Added mob death drops and edible rotten flesh, plus a deterministic combat suite in local and GitHub CI.

## 1.14.0 — Fluids and Farming
- Added fixed-tick water and lava scheduling, downward and horizontal propagation, seven flowing levels, falling state, water source formation, obsidian/cobblestone reactions, source-only bucket pickup, bucket placement, and slab/stair waterlogging.
- Added level-aware lowered and sloped liquid geometry and live chunk remeshing for fluid edits.
- Added hoe durability use, farmland conversion, four-block hydration, trampling, wheat/carrot/potato/beetroot/nether-wart/cocoa growth, pumpkin/melon stems and fruit, sugar-cane/cactus growth, bone meal, mature loot, grass seed drops, and seed/bone-meal recipes.
- Added eight crop blocks with per-stage original procedural textures, six seed/material items, deterministic fluid/farming test suites, and Java 26.1.2 calibration for all 113 overlapping blocks and 226 overlapping items.

## Phase 0 — Scaffold
- Added the static browser entry point, WebGL renderer, loading screen, FPS counter, CI checks, and Pages deployment.

## Phase 1 — Procedural Art Foundation
- Added deterministic RNG, math helpers, the locked palette, procedural 16×16 textures, and a labeled atlas debug page.

## Phase 2 — Chunk Rendering
- Added a superflat voxel chunk, worker-hosted face-culling mesher, textured merged geometry, directional shading, fog, and orbit camera.

## Phase 3 — Procedural World Generation
- Added seeded climate biomes, octave terrain, caves, depth-banded ores, sea-level water, trees, world-generation workers, and deterministic terrain hashes.

## Phase 4 — Player Physics and Controls
- Added first-person pointer-lock controls, normalized movement, sprint, sneak, creative flight, fixed 20 Hz physics, swept collision, and locked gameplay constants.

## Phase 5 — Block Interaction
- Added DDA-style reach raycasting, selection outlines, timed mining, mutable blocks, nine-slot hotbar, hearts, and crosshair.

## Phase 6 — Lighting and Atmosphere
- Added a 24,000-tick sky cycle, gradient dome, sun, phased moon, 1,500 stars, scrolling clouds, synchronized fog, BFS light propagation, and exact two-channel brightness mapping.

## Phase 7 — Inventory and Crafting
- Added item stacks, recipe matching, inventory crafting, furnace fuel and smelting, chest storage panels, tool recipes, and interactive container UI.

## Phase 8 — Survival and Mobs
- Added health, hunger, exhaustion, fall and mob damage, XP, death drops, respawning, passive and hostile mobs, nighttime aggro, and death UI.

## Phase 9 — Persistence and Polish
- Added IndexedDB world saves with RLE, local settings, synthesized audio, particles, rain and snow, pause and settings menus, autosave, and populated F3 diagnostics.

## 1.1.0 — Expanded World and Mobile Controls
- Expanded the initial world from one chunk to a worker-generated 3×3 region, added cross-chunk collision and raycasting, and introduced dual-stick-style mobile movement, look, jump, mining, inventory, and pause controls.

## 1.2.0 — Block and Texture Expansion
- Expanded the data-driven registry to 103 blocks and the procedural atlas to more than 110 original 16×16 textures, covering stones, ores, six wood families, colored wool, utility blocks, plants, liquids, Nether and End materials. The item registry now contains 215 block items, tools, armor, materials, foods, and equipment, and 80 crafting plus 7 smelting recipes, with automated registry, mapping, stack-limit, recipe-output, fuel-value, texture-size, and visual-uniqueness checks.

## 1.3.0 — Current Java Fidelity Baseline
- Established a reproducible Java 26.1.2 research baseline from the MIT-licensed PrismarineJS factual registry dataset, measured every content gap, calibrated 100 overlapping block property sets and 217 item stack limits, and added immutable registry hashes plus CI drift detection.

## 1.4.0 — Full-Height Streaming Overworld
- Replaced the 128-block bounded demonstration with 384-block chunks spanning Y −64 through 319, ragged deep bedrock, deepslate transition, current ore depth bands, broader continental terrain, and on-demand 3×3 chunk streaming that follows the player indefinitely.

## 1.5.0 — Live Block Interaction
- Added survival placement with occupancy and player-collision rejection, middle-click block picking, four-tick placement cooldowns, inventory consumption, touchscreen placement, and live target-plus-neighbor worker remeshing after every break or placement.

## 1.6.0 — Layered Voxel Rendering
- Split every chunk mesh into opaque, alpha-tested cutout, and depth-write-disabled translucent geometry, with dedicated materials for solid terrain, leaves and plants, and water, glass, and ice.

## 1.7.0 — Ambient Occlusion and Night Shading
- Added true per-vertex three-neighbor ambient occlusion with 0.55/0.78/0.92/1.0 tiers on every visible face, retained directional face shading, and connected daylight to terrain, foliage, and translucent material brightness so the world becomes genuinely dark beneath the night sky.

## 1.8.0 — Two-Channel Voxel Lighting
- Added per-chunk skylight columns, opacity-aware block-light flood fill, per-vertex sky and block light attributes, an exact brightness-curve voxel shader, warm emitter tinting, daylight-independent block light, and placeable non-solid light sources.

## 1.9.0 — Specialized Block Models
- Replaced full-cube stand-ins with crossed plant quads, 0.875-height liquid surfaces, slim torch cuboids, and wall-flat ladders while retaining cutout/translucent lighting, interaction, and remeshing behavior.

## 1.10.0 — Falling Blocks
- Added deterministic scheduled gravity for sand and gravel, including one-block-per-tick descent, solid landing and stacking, replaceable-fluid displacement, support-removal updates, bounded tick work, and live remeshing.

## 1.11.0 — Harvest and Loot
- Added tool-class mining speeds, harvest tiers, canonical basic block drops, ore loot, no-drop handling for insufficient tools, and stack-aware inventory insertion, removal, overflow, and consumption. Mined loot now enters the player inventory.

## 1.12.0 — Food and Eating
- Added calibrated nutrition and saturation for 15 foods, 32-tick eating, full-hunger gating, held-item cancellation, inventory consumption, saturation clamping, live hunger HUD, and live hotbar counts.

## 1.13.0 — Block States and Shapes
- Added persistent per-block orientation state, cardinal player-facing placement, half-height slabs, oriented two-step stairs, post-and-rail fences, connected-form walls, thin rotated doors, and atomic two-block door placement with upper-space validation.
