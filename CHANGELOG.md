# Changelog

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
