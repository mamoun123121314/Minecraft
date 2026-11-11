# Cubeworld

[▶ Play](https://mamoun123121314.github.io/Minecraft/)

A single-player voxel survival game in the browser. Original engine, original procedural art.

## Controls

| Input | Action |
|---|---|
| Click | Lock pointer / enable audio |
| W A S D | Move |
| Mouse | Look |
| Space | Jump; double-tap to toggle flight |
| Shift | Sneak / descend while flying |
| Ctrl | Sprint |
| Left mouse | Mine targeted block |
| 1–9 | Select hotbar slot |
| E | Open or close inventory |
| Esc | Pause / close inventory |
| F3 | Toggle diagnostics |

The atlas inspection page is available at [`?atlas`](https://mamoun123121314.github.io/Minecraft/?atlas).

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

Cubeworld ships as plain ES2022 modules with a vendored three.js renderer and no runtime build step. Procedural art is generated into a nearest-neighbour texture atlas, deterministic world generation and meshing use module workers, simulation runs at a fixed 20 Hz, interface layers use DOM and CSS, audio is synthesized with WebAudio, and saves are stored in IndexedDB using run-length compression.

## Verification

CI parses every module, scans for runtime networking and binary assets, validates the frozen palette, launches a headless browser, captures day/night/atlas screenshots, and runs deterministic tests for physics, mining, lighting, crafting, survival, and save round trips.
