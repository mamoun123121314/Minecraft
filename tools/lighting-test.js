import{brightness,combinedLight,propagateLight,buildLightmap}from'../src/render/lighting.js';import{WorldTime}from'../src/systems/time.js';
if(Math.abs(brightness(15)-1)>1e-9||brightness(0)!==0)throw Error('Brightness curve endpoints failed');
if(combinedLight(0,15,.05)!==1)throw Error('Block light changed with daylight');
const light=propagateLight(new Uint8Array(27),3,3,3,[{x:1,y:1,z:1,level:15}],()=>false);if(light[(1*3+1)*3+2]!==14)throw Error('Light falloff failed');
const noon=new WorldTime(6000),night=new WorldTime(18000);if(noon.daylight!==1||night.daylight!==.05)throw Error('Daylight factors failed');if(buildLightmap(.05).length!==1024)throw Error('Lightmap dimensions failed');console.log('Lighting checks passed.');
