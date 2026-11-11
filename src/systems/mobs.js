import * as THREE from '../../vendor/three.module.js';
import{MOB_TYPES}from'../../data/mobs.js';
import{seeded}from'../core/rng.js';
export class MobSystem{
 constructor(scene,seed='mobs'){this.scene=scene;this.random=seeded(seed);this.entities=[];this.group=new THREE.Group();scene.add(this.group);}
 spawn(type,x,y,z){const stats=MOB_TYPES[type],mesh=new THREE.Mesh(new THREE.BoxGeometry(stats.width,stats.height,stats.width),new THREE.MeshBasicMaterial({color:stats.color}));mesh.position.set(x,y+stats.height/2,z);this.group.add(mesh);const mob={type,stats,hp:stats.hp,position:{x,y,z},mesh,target:null,attackCooldown:0};this.entities.push(mob);return mob;}
 canAggro(mob,player,isNight){if(!mob.stats.hostile||!isNight)return false;const dx=player.position.x-mob.position.x,dz=player.position.z-mob.position.z;return dx*dx+dz*dz<=16*16;}
 tick(player,survival,isNight){for(const mob of this.entities){if(mob.attackCooldown>0)mob.attackCooldown--;if(this.canAggro(mob,player,isNight)){const dx=player.position.x-mob.position.x,dz=player.position.z-mob.position.z,d=Math.hypot(dx,dz)||1;mob.position.x+=dx/d*mob.stats.speed/20;mob.position.z+=dz/d*mob.stats.speed/20;if(d<1.3&&mob.attackCooldown===0){survival.damage(mob.stats.damage,'mob');mob.attackCooldown=20;}}mob.mesh.position.x=mob.position.x;mob.mesh.position.z=mob.position.z;}}
 populate(y=66){this.spawn('zombie',4,y,4);this.spawn('creeper',12,y,5);this.spawn('cow',5,y,12);this.spawn('pig',11,y,11);}
}
