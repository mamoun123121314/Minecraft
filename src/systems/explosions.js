import * as THREE from '../../vendor/three.module.js';
import { BLOCKS, BLOCK_BY_ID } from '../../data/blocks.js';
import { miningProfile } from '../player/mining.js';

export class ExplosionSystem {
  constructor(scene,random=()=>.5){this.scene=scene;this.random=random;this.pending=[];}
  ignite(position,fuse=80){const mesh=new THREE.Mesh(new THREE.BoxGeometry(.9,.9,.9),new THREE.MeshBasicMaterial({color:0xc83c32}));mesh.position.set(position.x+.5,position.y+.5,position.z+.5);this.scene.add(mesh);const entity={position:{...position},fuse,mesh};this.pending.push(entity);return entity;}
  explode(entity,world,mobs,player,survival,combat){
    const changed=[],drops=[],radius=4;if(world.getBlock(entity.position.x,entity.position.y,entity.position.z)===BLOCKS.tnt.id){world.setBlock(entity.position.x,entity.position.y,entity.position.z,0);changed.push({...entity.position});}
    for(let dx=-radius;dx<=radius;dx+=1)for(let dy=-radius;dy<=radius;dy+=1)for(let dz=-radius;dz<=radius;dz+=1){if((dx===0&&dy===0&&dz===0)||Math.hypot(dx,dy,dz)>radius)continue;const x=entity.position.x+dx,y=entity.position.y+dy,z=entity.position.z+dz,id=world.getBlock(x,y,z),definition=BLOCK_BY_ID[id];if(!id||definition?.hardness<0)continue;if(id===BLOCKS.tnt.id){world.setBlock(x,y,z,0);changed.push({x,y,z});this.ignite({x,y,z},20+Math.floor(this.random()*30));continue;}world.setBlock(x,y,z,0);changed.push({x,y,z});const profile=miningProfile(id,'diamond_pickaxe');if(profile.drop&&this.random()<.25)drops.push({id:profile.drop,count:1});}
    const distance=Math.hypot(player.position.x-entity.position.x-.5,player.position.y+.9-entity.position.y-.5,player.position.z-entity.position.z-.5);if(distance<8){survival.invulnerable=0;survival.damage(Math.max(1,Math.floor(16*(1-distance/8))),'explosion');}
    for(const mob of [...mobs.entities]){const d=Math.hypot(mob.position.x-entity.position.x-.5,mob.position.y-entity.position.y-.5,mob.position.z-entity.position.z-.5);if(d<8)combat.hurt(mob,Math.max(1,16*(1-d/8)),mobs,{x:mob.position.x-entity.position.x,z:mob.position.z-entity.position.z},8);}
    return{position:entity.position,changed,drops};
  }
  tick(world,mobs,player,survival,combat){const events=[];for(let index=this.pending.length-1;index>=0;index-=1){const entity=this.pending[index];entity.fuse-=1;entity.mesh.scale.setScalar(1+(entity.fuse%10===0?.15:0));if(entity.fuse<=0){events.push(this.explode(entity,world,mobs,player,survival,combat));this.scene.remove(entity.mesh);entity.mesh.geometry.dispose();entity.mesh.material.dispose();this.pending.splice(index,1);}}return events;}
}
