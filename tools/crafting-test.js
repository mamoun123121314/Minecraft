import{findRecipe,Furnace}from'../src/systems/crafting.js';
const stack=id=>({id,count:1});
const table=findRecipe([stack('oak_planks'),stack('oak_planks'),stack('oak_planks'),stack('oak_planks')],2);if(table?.id!=='crafting_table')throw Error('Crafting table recipe failed');
const pick=findRecipe([stack('oak_planks'),stack('oak_planks'),stack('oak_planks'),null,stack('stick'),null,null,stack('stick'),null],3);if(pick?.id!=='wooden_pickaxe')throw Error('Pick recipe failed');
const furnace=new Furnace();furnace.input={id:'sand',count:1};furnace.fuel={id:'coal',count:1};for(let i=0;i<200;i++)furnace.tick();if(furnace.output?.id!=='glass')throw Error('Smelting failed');console.log('Crafting and furnace checks passed.');
