# Deviations

| Value chosen | Where | Why | Reference behavior |
|---|---|---|---|
| Nine chunk meshes active | `src/render/renderer.js` | A moving 3×3 window streams indefinitely while retaining generated chunk data; the active radius is kept small for mobile performance | Configurable 2–32 chunk render distance |
| Simplified box mob models | `src/systems/mobs.js` | Keeps the initial entity renderer compact | Articulated head, body, and limb box models |
| Compact recipe registry | `data/recipes.js` | Implements the tested wood-to-pickaxe and furnace progression | Approximately 60 required recipes |
| CSS weather overlay | `src/systems/weather.js` | Avoids per-frame WebGL allocations | 800 instanced world-space precipitation quads |
| Position-scheduled fluid ticks | `src/world/fluids.js` | Bounded deterministic work within the existing single-player world | Java uses chunk tick lists with additional fluid edge and dimension rules |
| Scheduled seeded crop attempts | `src/world/farming.js` | Reproducible bounded growth without random block selection over every loaded chunk | Java selects random block positions in ticking chunks and applies crop-specific random tick rules |
| Separate wet farmland id | `data/blocks.js` | Preserves the pre-existing registry while sharing farmland behavior | Java represents moisture as farmland block state 0–7 |
