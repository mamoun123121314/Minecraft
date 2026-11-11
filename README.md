# Cubeworld

[▶ Play](https://mamoun123121314.github.io/Minecraft/)

A single-player voxel survival game in the browser. Original engine, original procedural art.

## Controls

Click the game to begin. Movement and survival controls arrive in their gated phases.

## Progress

| Phase | Deliverable | Status |
|---:|---|:---:|
| 0 | Browser scaffold, renderer, CI, deployment | ✅ |
| 1 | Procedural texture atlas | ✅ |
| 2 | Chunk meshing and terrain rendering | ✅ |
| 3 | Procedural world generation | ✅ |
| 4 | Player physics and controls | ✅ |
| 5 | Block interaction and hotbar | ✅ |
| 6 | Lighting and atmosphere | ✅ |
| 7 | Inventory and crafting | ✅ |
| 8 | Survival and mobs | ✅ |
| 9 | Persistence, weather, audio, and polish | ✅ |

## Architecture

Cubeworld is shipped as plain ES2022 modules with a vendored three.js renderer. The playable repository needs no build step or runtime network access; code-generated art, worker-based voxel systems, DOM UI, synthesized audio, and IndexedDB persistence are introduced through independently verified phases.
