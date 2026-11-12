import assert from 'node:assert/strict';
import { WorldMap } from '../src/world/world.js';
import { CHUNK_VOLUME } from '../src/world/chunk.js';
import { BLOCKS } from '../data/blocks.js';
import { collisionBoxes, pointCollides } from '../src/world/shapes.js';
import { raycast } from '../src/player/mining.js';
import { meshChunk } from '../src/world/mesher.js';

const world=new WorldMap();world.addChunk(0,0,new Uint16Array(CHUNK_VOLUME));
world.setBlock(5,64,5,BLOCKS.oak_stairs.id,{facing:'north',half:'bottom'});
assert.equal(world.getBlockState(5,64,5).shape??'straight','straight');
world.setBlock(5,64,6,BLOCKS.birch_stairs.id,{facing:'west',half:'bottom'});
assert.equal(world.getBlockState(5,64,5).shape,'inner_left');
assert.equal(collisionBoxes(BLOCKS.oak_stairs.id,world.getBlockState(5,64,5)).length,3);
assert.equal(pointCollides(BLOCKS.oak_stairs.id,{facing:'north',half:'bottom',shape:'inner_left'},.25,.75,.25),true);
assert.equal(pointCollides(BLOCKS.oak_stairs.id,{facing:'north',half:'bottom',shape:'straight'},.25,.75,.25),false);
world.setBlock(5,64,6,0);assert.equal(world.getBlockState(5,64,5).shape,'straight');
world.setBlock(5,64,4,BLOCKS.birch_stairs.id,{facing:'west',half:'bottom'});
assert.equal(world.getBlockState(5,64,5).shape,'outer_left');
assert.equal(pointCollides(BLOCKS.oak_stairs.id,world.getBlockState(5,64,5),.75,.75,.75),false);
assert.equal(pointCollides(BLOCKS.oak_stairs.id,world.getBlockState(5,64,5),.25,.75,.75),true);
world.setBlock(5,64,4,0);
const vectors={north:[0,-1],south:[0,1],west:[-1,0],east:[1,0]},left={north:'west',west:'south',south:'east',east:'north'};
for(const [index,facing] of ['north','east','south','west'].entries()){const x=1+index*2,z=10,[bx,bz]=vectors[facing];world.setBlock(x,70,z,BLOCKS.oak_stairs.id,{facing,half:'bottom'});world.setBlock(x-bx,70,z-bz,BLOCKS.birch_stairs.id,{facing:left[facing],half:'bottom'});assert.equal(world.getBlockState(x,70,z).shape,'inner_left',`${facing} inner corner`);world.setBlock(x-bx,70,z-bz,BLOCKS.birch_stairs.id,{facing:left[facing],half:'top'});assert.equal(world.getBlockState(x,70,z).shape,'straight','different halves do not form corners');}
world.setBlock(8,64,5,BLOCKS.oak_stairs.id,{facing:'east',half:'top',shape:'inner_right'});
assert.equal(pointCollides(BLOCKS.oak_stairs.id,world.getBlockState(8,64,5),.5,.25,.5),true);
assert.equal(pointCollides(BLOCKS.oak_stairs.id,world.getBlockState(8,64,5),.5,.75,.5),true,'top stair base remains solid');

world.setBlock(1,64,1,BLOCKS.oak_slab.id,{type:'bottom',half:'bottom'});
let hit=raycast(world,{x:1.5,y:65,z:1.5},{x:0,y:-1,z:0});assert.equal(hit.distance,.5);assert.deepEqual(hit.prevPos,{x:1,y:65,z:1});assert.deepEqual(hit.normal,{y:1});
assert.equal(raycast(world,{x:0,y:64.75,z:1.5},{x:1,y:0,z:0},3),null,'ray above bottom slab misses');
world.setBlock(2,64,1,BLOCKS.oak_door.id,{facing:'north',open:false});
hit=raycast(world,{x:2.5,y:64.5,z:-1},{x:0,y:0,z:1});assert.equal(hit.block,BLOCKS.oak_door.id);assert.equal(hit.distance,2);assert.deepEqual(hit.prevPos,{x:2,y:64,z:0});
assert.equal(raycast(world,{x:2.5,y:64.5,z:2},{x:0,y:0,z:-1},.5),null,'short ray stops before thin closed door rear face');
world.setBlock(3,64,1,BLOCKS.oak_fence_gate.id,{facing:'north',open:true});assert.equal(raycast(world,{x:3.5,y:64.5,z:0},{x:0,y:0,z:1})?.block,BLOCKS.oak_fence_gate.id,'open gate remains selectable');

world.setBlock(10,64,10,BLOCKS.oak_stairs.id,{facing:'north',half:'bottom',shape:'inner_left'});
const chunk=world.getChunk(0,0),states=Object.fromEntries([...chunk.states].map(([key,value])=>[key,value])),uv=new Proxy({}, {get:()=>[0,0,1,1]}),mesh=meshChunk(chunk.blocks,uv,states);assert.ok(mesh.cutout.positions.length>0);
console.log('Shape targeting OK: inner/outer stairs, live updates, shared models, exact slab/door/gate raycasts and hit normals');
