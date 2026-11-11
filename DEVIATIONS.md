# Deviations

| Value chosen | Where | Why | Reference behavior |
|---|---|---|---|
| 128-block loaded chunk height | `src/world/chunk.js` | Current browser prototype bounds its generated demonstration chunk to reduce startup memory | 384 blocks, Y −64 through 320 |
| Nine generated chunks loaded | `src/render/renderer.js` | The current mobile-focused release loads a bounded 3×3 region to keep startup predictable | Infinite chunks streamed around the player |
| Simplified box mob models | `src/systems/mobs.js` | Keeps the initial entity renderer compact | Articulated head, body, and limb box models |
| Compact recipe registry | `data/recipes.js` | Implements the tested wood-to-pickaxe and furnace progression | Approximately 60 required recipes |
| CSS weather overlay | `src/systems/weather.js` | Avoids per-frame WebGL allocations | 800 instanced world-space precipitation quads |
| Simplified single-pass materials | `src/render/renderer.js` | Current scene uses one merged terrain material | Separate opaque, cutout, and translucent passes |
