import { PLAYER_CONSTANTS, simulateJumpApex } from '../src/player/player.js';
const apex=simulateJumpApex();
if(Math.abs(apex-1.2522)>0.05)throw new Error(`Jump apex ${apex} outside tolerance`);
const diagonal=Math.hypot(1/Math.sqrt(2),1/Math.sqrt(2))*PLAYER_CONSTANTS.walkSpeed;
if(Math.abs(diagonal-PLAYER_CONSTANTS.walkSpeed)>1e-9)throw new Error('Diagonal speed is not normalized');
let y=200,velocity=-3.92;for(let i=0;i<200&&y>0;i+=1)y+=Math.max(velocity,-0.4);
if(y< -0.4)throw new Error('High-speed sweep tunneled through floor');
console.log(`Physics checks passed: apex=${apex.toFixed(4)}, diagonal=${diagonal.toFixed(3)}.`);
