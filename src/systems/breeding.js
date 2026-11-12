const FEEDS={cow:'wheat',sheep:'wheat',pig:'carrot',chicken:'wheat_seeds'};
export class BreedingSystem {
  feed(mob,itemId){if(!mob||mob.baby||FEEDS[mob.type]!==itemId||(mob.breedingCooldown??0)>0)return false;mob.loveTicks=600;return true;}
  tick(mobs){
    const babies=[];
    for(const mob of [...mobs.entities]){
      if(mob.loveTicks>0)mob.loveTicks-=1;if(mob.breedingCooldown>0)mob.breedingCooldown-=1;
      if(mob.baby){mob.growth=Math.max(0,(mob.growth??24000)-1);const scale=.5+.5*(1-mob.growth/24000);mob.mesh.scale.setScalar(scale);if(!mob.growth){mob.baby=false;mob.maxHealth=mob.stats.hp;}continue;}
      if(!mob.loveTicks||mob.partnerId)continue;
      const partner=mobs.entities.find(other=>other.id!==mob.id&&other.type===mob.type&&!other.baby&&other.loveTicks>0&&Math.hypot(other.position.x-mob.position.x,other.position.z-mob.position.z)<8);if(!partner)continue;
      mob.partnerId=partner.id;partner.partnerId=mob.id;
    }
    for(const mob of [...mobs.entities]){
      if(!mob.partnerId)continue;const partner=mobs.entities.find(other=>other.id===mob.partnerId);if(!partner){mob.partnerId=null;continue;}if(mob.id>partner.id)continue;
      const dx=partner.position.x-mob.position.x,dz=partner.position.z-mob.position.z,distance=Math.hypot(dx,dz)||.001;
      if(distance>1.2){mob.position.x+=dx/distance*mob.stats.speed/20;mob.position.z+=dz/distance*mob.stats.speed/20;partner.position.x-=dx/distance*partner.stats.speed/20;partner.position.z-=dz/distance*partner.stats.speed/20;continue;}
      const nearby=mobs.entities.filter(other=>Math.hypot(other.position.x-mob.position.x,other.position.z-mob.position.z)<16&&['cow','sheep','pig','chicken'].includes(other.type)).length;
      if(nearby>=32){mob.loveTicks=partner.loveTicks=0;mob.partnerId=partner.partnerId=null;continue;}
      const baby=mobs.spawn(mob.type,(mob.position.x+partner.position.x)/2,(mob.position.y+partner.position.y)/2,(mob.position.z+partner.position.z)/2);baby.baby=true;baby.growth=24000;baby.maxHealth=mob.stats.hp/2;baby.hp=baby.maxHealth;baby.mesh.scale.setScalar(.5);mob.loveTicks=partner.loveTicks=0;mob.breedingCooldown=partner.breedingCooldown=6000;mob.partnerId=partner.partnerId=null;babies.push(baby);
    }
    return babies;
  }
}
