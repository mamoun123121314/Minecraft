export class SleepSystem {
  constructor(){this.spawn=null;}
  use(worldTime,weather,position,mobs){this.spawn={x:position.x+.5,y:position.y+1,z:position.z+.5};if(worldTime.ticks<12542)return'day';const monster=mobs.entities.some(mob=>mob.stats.hostile&&mob.hp>0&&Math.hypot(mob.position.x-position.x,mob.position.y-position.y,mob.position.z-position.z)<8);if(monster)return'monsters';worldTime.set(0);weather.set('clear');return'slept';}
}
