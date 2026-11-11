# Deviations

| Value chosen | Where | Why | Reference behavior |
|---|---|---|---|
| Nine chunk meshes active | `src/render/renderer.js` | A moving 3×3 window streams indefinitely while retaining generated chunk data; the active radius is kept small for mobile performance | Configurable 2–32 chunk render distance |
| Simplified box mob models | `src/systems/mobs.js` | Keeps the initial entity renderer compact | Articulated head, body, and limb box models |
| Compact recipe registry | `data/recipes.js` | Implements the tested wood-to-pickaxe and furnace progression | Approximately 60 required recipes |
| CSS weather overlay | `src/systems/weather.js` | Avoids per-frame WebGL allocations | 800 instanced world-space precipitation quads |
| Simplified single-pass materials | `src/render/renderer.js` | Current scene uses one merged terrain material | Separate opaque, cutout, and translucent passes |
