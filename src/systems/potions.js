import * as THREE from '../../vendor/three.module.js';
import { EffectSystem, potionDefinition } from './effects.js';

const distanceSquared = (a, b) => (a.x-b.x) ** 2 + (a.y-b.y) ** 2 + (a.z-b.z) ** 2;
const colorFor = id => { let hash = 0; for (const character of id) hash = (hash * 31 + character.charCodeAt(0)) >>> 0; return 0x6060c0 + hash % 0x909020; };

export class ThrownPotionSystem {
  constructor(scene) { this.scene = scene; this.projectiles = []; this.clouds = []; }
  throwPotion(stack, origin, direction) {
    if (stack?.id !== 'potion' || !['splash','lingering'].includes(stack.meta?.kind)) return null;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(.18,.24,.18), new THREE.MeshBasicMaterial({ color: colorFor(stack.meta.potion) }));
    mesh.position.set(origin.x,origin.y,origin.z); this.scene.add(mesh);
    const projectile = { stack: { ...stack, meta: { ...stack.meta } }, position: { ...origin }, velocity: { x: direction.x*1.5, y: direction.y*1.5+.15, z: direction.z*1.5 }, mesh, ticks: 0 };
    this.projectiles.push(projectile); return projectile;
  }
  affect(stack, position, mobs, player, effects, survival, combat, durationScale = 1) {
    const definition = potionDefinition(stack); if (!definition) return 0;
    let affected = 0;
    if (distanceSquared(position,{x:player.position.x,y:player.position.y+.9,z:player.position.z}) <= 16) {
      effects.applyPotion(stack,survival,durationScale); affected += 1;
    }
    for (const mob of [...mobs.entities]) {
      if (distanceSquared(position,{x:mob.position.x,y:mob.position.y+mob.stats.height/2,z:mob.position.z}) > 16) continue;
      mob.effects ??= new EffectSystem();
      if (definition.effect === 'instant_health') mob.hp = Math.min(mob.stats.hp,mob.hp+4*2**definition.amplifier);
      else if (definition.effect === 'instant_damage') combat.hurt(mob,6*2**definition.amplifier,mobs);
      else mob.effects.add(definition.effect,Math.max(1,Math.floor(definition.duration*durationScale)),definition.amplifier);
      affected += 1;
    }
    return affected;
  }
  detonate(projectile, mobs, player, effects, survival, combat) {
    const affected = this.affect(projectile.stack,projectile.position,mobs,player,effects,survival,combat);
    if (projectile.stack.meta.kind === 'lingering') {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(3,12,8),new THREE.MeshBasicMaterial({color:colorFor(projectile.stack.meta.potion),transparent:true,opacity:.12,depthWrite:false}));
      mesh.position.set(projectile.position.x,projectile.position.y,projectile.position.z);this.scene.add(mesh);
      this.clouds.push({stack:projectile.stack,position:{...projectile.position},mesh,ticks:600});
    }
    return affected;
  }
  tick(world,mobs,player,effects,survival,combat) {
    for (let index=this.projectiles.length-1;index>=0;index-=1) {
      const p=this.projectiles[index];p.ticks+=1;p.velocity.y-=.05;let impact=p.ticks>1200;
      for(let step=0;step<4&&!impact;step+=1){p.position.x+=p.velocity.x/4;p.position.y+=p.velocity.y/4;p.position.z+=p.velocity.z/4;const block=world.getBlock(Math.floor(p.position.x),Math.floor(p.position.y),Math.floor(p.position.z));if(block&&block!==5&&block!==15)impact=true;for(const mob of mobs.entities)if(mob.hp>0&&distanceSquared(p.position,{x:mob.position.x,y:mob.position.y+mob.stats.height/2,z:mob.position.z})<.5){impact=true;break;}}
      p.mesh.position.set(p.position.x,p.position.y,p.position.z);
      if(impact){this.detonate(p,mobs,player,effects,survival,combat);this.scene.remove(p.mesh);p.mesh.geometry.dispose();p.mesh.material.dispose();this.projectiles.splice(index,1);}
    }
    for(let index=this.clouds.length-1;index>=0;index-=1){const cloud=this.clouds[index];cloud.ticks-=1;if(cloud.ticks%10===0)this.affect(cloud.stack,cloud.position,mobs,player,effects,survival,combat,.25);cloud.mesh.scale.setScalar(Math.max(.1,cloud.ticks/600));if(cloud.ticks<=0){this.scene.remove(cloud.mesh);cloud.mesh.geometry.dispose();cloud.mesh.material.dispose();this.clouds.splice(index,1);}}
  }
}
