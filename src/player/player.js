import { CHUNK_MIN_Y, CHUNK_MAX_Y, blockIndex } from '../world/chunk.js';

export const PLAYER_CONSTANTS = Object.freeze({
  width: 0.6, height: 1.8, sneakHeight: 1.5, eyeHeight: 1.62, sneakEyeHeight: 1.27,
  walkSpeed: 4.317, sprintSpeed: 5.612, sneakSpeed: 1.295, flySpeed: 10.89,
  jumpVelocity: 0.42, gravity: -0.08, verticalDrag: 0.98, airDrag: 0.91, reach: 4.5
});
const blockAt=(blocks,x,y,z)=>typeof blocks.getBlock==='function'?blocks.getBlock(x,y,z):blocks[blockIndex(x,y,z)];
const solidAt = (blocks, x, y, z) => {
  const bx=Math.floor(x), by=Math.floor(y), bz=Math.floor(z);
  if(by<CHUNK_MIN_Y||by>CHUNK_MAX_Y)return false;
  const id=blockAt(blocks,bx,by,bz);
  return id!==0 && id!==5 && id!==15;
};
export class Player {
  constructor(camera, blocks) {
    this.camera=camera; this.blocks=blocks; this.position={x:8.5,y:this.findSpawn(),z:8.5};
    this.velocity={x:0,y:0,z:0}; this.yaw=0; this.pitch=0; this.onGround=false; this.flying=false; this.sprinting=false; this.sneaking=false;
    this.keys=new Set(); this.lastSpace=0; this.bindInput(); this.updateCamera();
  }
  findSpawn(){ for(let y=CHUNK_MAX_Y-1;y>CHUNK_MIN_Y;y-=1) if(solidAt(this.blocks,8.5,y,8.5)) return y+1.01; return 90; }
  bindInput(){
    addEventListener('keydown',(e)=>{ this.keys.add(e.code); if(e.code==='Space'){const now=performance.now();if(now-this.lastSpace<300)this.flying=!this.flying;this.lastSpace=now;} if(e.code==='ControlLeft')this.sprinting=true; });
    addEventListener('keyup',(e)=>{this.keys.delete(e.code);if(e.code==='ControlLeft')this.sprinting=false;});
    this.camera.parent?.addEventListener?.('click',()=>document.body.requestPointerLock());
    addEventListener('mousemove',(e)=>{if(document.pointerLockElement){this.yaw-=e.movementX*0.002618;this.pitch=Math.max(-1.553,Math.min(1.553,this.pitch-e.movementY*0.002618));}});
  }
  collides(x,y,z){
    const half=PLAYER_CONSTANTS.width/2, height=this.sneaking?PLAYER_CONSTANTS.sneakHeight:PLAYER_CONSTANTS.height;
    for(const px of [x-half,x+half])for(const pz of [z-half,z+half])for(const py of [y+0.01,y+height-0.01])if(solidAt(this.blocks,px,py,pz))return true;
    return false;
  }
  moveAxis(axis,amount){
    const steps=Math.max(1,Math.ceil(Math.abs(amount)/0.4)), step=amount/steps;
    for(let i=0;i<steps;i+=1){const next={...this.position,[axis]:this.position[axis]+step};if(this.collides(next.x,next.y,next.z)){if(axis==='y'&&step<0)this.onGround=true;this.velocity[axis]=0;return;}this.position[axis]+=step;}
  }
  tick(){
    this.sneaking=this.keys.has('ShiftLeft')||this.keys.has('ShiftRight');
    const forward=(this.keys.has('KeyW')?1:0)-(this.keys.has('KeyS')?1:0), strafe=(this.keys.has('KeyD')?1:0)-(this.keys.has('KeyA')?1:0);
    const length=Math.hypot(forward,strafe)||1, speed=this.flying?PLAYER_CONSTANTS.flySpeed:this.sneaking?PLAYER_CONSTANTS.sneakSpeed:this.sprinting?PLAYER_CONSTANTS.sprintSpeed:PLAYER_CONSTANTS.walkSpeed;
    const f=forward/length, s=strafe/length;
    this.velocity.x=(Math.sin(this.yaw)*f+Math.cos(this.yaw)*s)*speed/20; this.velocity.z=(Math.cos(this.yaw)*f-Math.sin(this.yaw)*s)*speed/20;
    if(this.flying){this.velocity.y=((this.keys.has('Space')?1:0)-(this.sneaking?1:0))*speed/20;}
    else {if(this.keys.has('Space')&&this.onGround){this.velocity.y=PLAYER_CONSTANTS.jumpVelocity;this.onGround=false;}this.velocity.y=(this.velocity.y+PLAYER_CONSTANTS.gravity)*PLAYER_CONSTANTS.verticalDrag;}
    this.onGround=false; this.moveAxis('y',this.velocity.y);this.moveAxis('x',this.velocity.x);this.moveAxis('z',this.velocity.z);this.updateCamera();
  }
  updateCamera(){this.camera.position.set(this.position.x,this.position.y+(this.sneaking?PLAYER_CONSTANTS.sneakEyeHeight:PLAYER_CONSTANTS.eyeHeight),this.position.z);this.camera.rotation.order='YXZ';this.camera.rotation.set(this.pitch,this.yaw,0);}
}
export function simulateJumpApex(){let y=0,v=PLAYER_CONSTANTS.jumpVelocity,max=0;for(let i=0;i<40;i+=1){y+=v;max=Math.max(max,y);v=(v+PLAYER_CONSTANTS.gravity)*PLAYER_CONSTANTS.verticalDrag;if(y<=0&&i>2)break;}return max;}
