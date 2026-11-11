export function fnv1a(value) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < String(value).length; i += 1) {
    hash ^= String(value).charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function seeded(seed) {
  return mulberry32(typeof seed === 'number' ? seed : fnv1a(seed));
}

export function valueNoise2D(seed, x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const tx = x - xi;
  const ty = y - yi;
  const smooth = (t) => t * t * (3 - 2 * t);
  const sample = (sx, sy) => {
    let n = Math.imul(sx, 0x1f123bb5) ^ Math.imul(sy, 0x5f356495) ^ seed;
    n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  const a = sample(xi, yi);
  const b = sample(xi + 1, yi);
  const c = sample(xi, yi + 1);
  const d = sample(xi + 1, yi + 1);
  const ux = smooth(tx);
  const uy = smooth(ty);
  return (a + (b - a) * ux) + ((c + (d - c) * ux) - (a + (b - a) * ux)) * uy;
}
