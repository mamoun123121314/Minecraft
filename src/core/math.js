export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const lerp = (a, b, amount) => a + (b - a) * amount;
export const inverseLerp = (a, b, value) => clamp((value - a) / (b - a), 0, 1);
export const smoothstep = (edge0, edge1, value) => {
  const t = inverseLerp(edge0, edge1, value);
  return t * t * (3 - 2 * t);
};
export const easeInOut = (value) => value < 0.5 ? 2 * value * value : 1 - ((-2 * value + 2) ** 2) / 2;
export function hexToRgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >>> 16) & 255, (value >>> 8) & 255, value & 255];
}
export function rgbToHex(red, green, blue) {
  return `#${[red, green, blue].map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}
export function lerpHex(a, b, amount) {
  const ar = hexToRgb(a);
  const br = hexToRgb(b);
  return rgbToHex(lerp(ar[0], br[0], amount), lerp(ar[1], br[1], amount), lerp(ar[2], br[2], amount));
}
export const vec3 = (x = 0, y = 0, z = 0) => ({ x, y, z });
export const aabb = (minX, minY, minZ, maxX, maxY, maxZ) => ({ minX, minY, minZ, maxX, maxY, maxZ });
export const intersectsAabb = (a, b) => a.minX < b.maxX && a.maxX > b.minX && a.minY < b.maxY && a.maxY > b.minY && a.minZ < b.maxZ && a.maxZ > b.minZ;
