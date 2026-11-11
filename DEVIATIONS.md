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
| Click-to-full-power bow | `src/main.js` | Fits the existing single-action input path without adding a hold/charge HUD | Java charges bows over time and scales arrow speed/damage by draw time |
| Projectile lifetime and pickup | `src/systems/combat.js` | Provides deterministic collision and bounded mesh lifetime without a ground-item entity system | Java arrows embed in blocks and tridents remain as recoverable throws with distinct loyalty behavior |
| Simplified equipment input | `src/player/inventory.js` | Right-click equips armor/shield within the existing inventory UI | Java also supports dedicated armor/offhand slot dragging and creative inventory interactions |
| Edited-network redstone rebuild | `src/systems/redstone.js` | Deterministic propagation for tracked player-edited components without chunk tick-list infrastructure | Java uses directional/shape-aware neighbor updates, quasi-connectivity, locational ordering and additional scheduled tick types |
| Static redstone dust model | `src/world/mesher.js` | Preserves power behavior with a compact original crossed-line texture | Java computes dot/line/cross/corner/T connection models from neighboring dust |
