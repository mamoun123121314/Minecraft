export const BIOMES = Object.freeze({
  plains: { topBlock: 1, fillerBlock: 2, treeDensity: 0.025, treeType: 'oak', grassTint: '#91BD59', waterTint: '#3F76E4', fogTint: '#C6DAFF', mobSpawnWeights: { cow: 8, sheep: 10 } },
  forest: { topBlock: 1, fillerBlock: 2, treeDensity: 0.12, treeType: 'oak', grassTint: '#79A94B', waterTint: '#3F76E4', fogTint: '#C6DAFF', mobSpawnWeights: { cow: 6, sheep: 8 } },
  desert: { topBlock: 6, fillerBlock: 6, treeDensity: 0.008, treeType: 'cactus', grassTint: '#BFB755', waterTint: '#3F76E4', fogTint: '#E6D9A8', mobSpawnWeights: {} },
  snowy_taiga: { topBlock: 12, fillerBlock: 2, treeDensity: 0.07, treeType: 'spruce', grassTint: '#80B497', waterTint: '#4A79C9', fogTint: '#DDE9EC', mobSpawnWeights: { sheep: 8 } },
  ocean: { topBlock: 7, fillerBlock: 7, treeDensity: 0, treeType: null, grassTint: '#91BD59', waterTint: '#2C55B0', fogTint: '#8FB4DC', mobSpawnWeights: {} }
});
