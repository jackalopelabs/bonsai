import * as THREE from 'three';

// Planet presets for different biomes

// Beach planet preset
const beachBiome = {
  noise: {
    min: -0.05,
    max: 0.05,
    octaves: 4,
    lacunarity: 2.0,
    gain: {
      min: 0.1,
      max: 0.8,
      scale: 2,
    },
    warp: 0.3,
    scale: 1,
    power: 1.5,
  },

  colors: [
    [-0.5, 0x994400],
    [-0.0, 0xccaa00],
    [0.4, 0xcc7700],
    [1.0, 0x002222],
  ],

  seaColors: [
    [-1, 0x000066],
    [-0.55, 0x0000aa],
    [-0.1, 0x00f2e5],
  ],
  seaNoise: {
    min: -0.008,
    max: 0.008,
    scale: 6,
  }
};

// Forest planet preset
const forestBiome = {
  noise: {
    min: -0.05,
    max: 0.05,
    octaves: 4,
    lacunarity: 2.0,
    gain: {
      min: 0.1,
      max: 0.8,
      scale: 2,
    },
    warp: 0.3,
    scale: 1,
    power: 0.8,
  },

  tintColor: 0x113322,

  colors: [
    [-0.5, 0x332200],
    [-0.0, 0x115512],
    [0.4, 0x224411],
    [1.0, 0x006622],
  ],

  seaColors: [
    [-1, 0x000066],
    [-0.52, 0x0000aa],
    [-0.1, 0x0042a5],
  ],
  seaNoise: {
    min: -0.005,
    max: 0.005,
    scale: 5,
  }
};

// Snow forest planet preset
const snowForestBiome = {
  noise: {
    min: -0.05,
    max: 0.05,
    octaves: 4,
    lacunarity: 2.0,
    gain: {
      min: 0.1,
      max: 0.8,
      scale: 2,
    },
    warp: 0.3,
    scale: 1,
    power: 0.8,
  },

  tintColor: 0x119922,

  colors: [
    [-0.5, 0xff99ff],
    [-0.0, 0xffffff],
    [0.4, 0xeeffff],
    [1.0, 0xffffff],
  ],

  seaColors: [
    [-1, 0x8899cc],
    [-0.52, 0xaaccff],
    [-0.1, 0xaaccff],
  ],
  seaNoise: {
    min: -0.0,
    max: 0.001,
    scale: 5,
  }
};

// Planet presets combining biome settings with other planet options
export const planetPresets = {
  beach: {
    detail: 32,
    atmosphere: {
      enabled: true,
      color: new THREE.Vector3(0.3, 0.5, 0.8),
      height: 0.03
    },
    material: "caustics",
    biome: beachBiome
  },
  
  forest: {
    detail: 32,
    atmosphere: {
      enabled: true,
      color: new THREE.Vector3(0.0, 0.5, 0.2),
      height: 0.03
    },
    material: "caustics",
    biome: forestBiome
  },
  
  snowForest: {
    detail: 32,
    atmosphere: {
      enabled: true,
      color: new THREE.Vector3(0.5, 0.7, 1.0),
      height: 0.03
    },
    material: "caustics",
    biome: snowForestBiome
  }
}; 