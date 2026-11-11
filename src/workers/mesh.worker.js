import{meshChunk}from'../world/mesher.js';
self.onmessage=({data})=>{const started=performance.now(),layers=meshChunk(new Uint16Array(data.blocks),data.uvTable,data.states),transfer=[];for(const layer of Object.values(layers))for(const value of Object.values(layer))transfer.push(value.buffer);self.postMessage({layers,duration:performance.now()-started},transfer);};
