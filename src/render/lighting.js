export const AO_TIERS=[.55,.78,.92,1];
export function brightness(level){const f=level/15;return f/(4-3*f);}
export function combinedLight(sky,block,daylight){return brightness(Math.max(sky*daylight,block));}
