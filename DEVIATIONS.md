# Deviations

| Value chosen | Where | Why | Reference behavior |
|---|---|---|---|
| 128-block loaded chunk height | `src/world/chunk.js` | Current browser prototype bounds its generated demonstration chunk to reduce startup memory | 384 blocks, Y −64 through 320 |
| One generated chunk loaded | `src/render/renderer.js` | Current release demonstrates deterministic generation and worker meshing in a bounded scene | Infinite chunks loaded around the player |
| Simplified box mob models | `src/systems/mobs.js` | Keeps the initial entity renderer compact | Articulated head, body, and limb box models |
| Compact recipe registry | `data/recipes.js` | Implements the tested wood-to-pickaxe and furnace progression | Approximately 60 required recipes |
| CSS weather overlay | `src/systems/weather.js` | Avoids per-frame WebGL allocations | 800 instanced world-space precipitation quads |
| Simplified single-pass materials | `src/render/renderer.js` | Current scene uses one merged terrain material | Separate opaque, cutout, and translucent passes |
