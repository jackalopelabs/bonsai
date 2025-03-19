import * as THREE from 'three';
import { createAtmosphereMaterial } from './materials/AtmosphereMaterial.js';
import { PlanetMaterialWithCaustics } from './materials/OceanCausticsMaterial.js';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';

// Helper function to create a color gradient
class ColorGradient {
  constructor(colors) {
    this.colors = colors.sort((a, b) => a[0] - b[0]);
  }

  get(value) {
    // Find the two colors to interpolate between
    let lowIndex = 0;
    let highIndex = this.colors.length - 1;

    for (let i = 0; i < this.colors.length; i++) {
      if (value < this.colors[i][0]) {
        highIndex = i;
        if (i > 0) {
          lowIndex = i - 1;
        }
        break;
      }
    }

    if (lowIndex === highIndex) {
      return new THREE.Color(this.colors[lowIndex][1]);
    }

    // Normalize the value between the two colors
    const lowValue = this.colors[lowIndex][0];
    const highValue = this.colors[highIndex][0];
    const normalizedValue = (value - lowValue) / (highValue - lowValue);

    // Convert hex colors to THREE.Color
    const lowColor = new THREE.Color(this.colors[lowIndex][1]);
    const highColor = new THREE.Color(this.colors[highIndex][1]);

    // Interpolate between the two colors
    return lowColor.lerp(highColor, normalizedValue);
  }
}

export class Planet {
  constructor(options = {}) {
    this.options = options;
    this.biome = options.biome || {};
  }

  async create() {
    console.log('Creating planet with options:', this.options);
    
    // Create the planet mesh
    const planetMesh = new THREE.Group();

    // Create terrain geometry with detail levels based on options
    const detail = this.options.detail || 32;
    const geometry = new THREE.IcosahedronGeometry(1, Math.min(5, Math.max(1, Math.floor(detail / 10))));
    
    // Create terrain material
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.8
    });
    
    // Apply terrain noise and color
    this.applyTerrainNoise(geometry, this.biome);
    
    // Create the planet terrain mesh
    const terrainMesh = new THREE.Mesh(geometry, material);
    terrainMesh.castShadow = true;
    terrainMesh.receiveShadow = true;
    
    // Add terrain to planet group
    planetMesh.add(terrainMesh);
    
    // Create ocean if we have sea colors defined
    if (this.biome.seaColors) {
      const oceanGeometry = new THREE.IcosahedronGeometry(0.99, Math.min(4, Math.max(1, Math.floor(detail / 12))));
      
      // Add morph targets for ocean animation
      const oceanMorphPositions = new Float32Array(oceanGeometry.attributes.position.count * 3);
      const oceanMorphNormals = new Float32Array(oceanGeometry.attributes.normal.count * 3);
      
      // Create wave pattern for ocean
      const noise = new SimplexNoise();
      for (let i = 0; i < oceanGeometry.attributes.position.count; i++) {
        const x = oceanGeometry.attributes.position.getX(i);
        const y = oceanGeometry.attributes.position.getY(i);
        const z = oceanGeometry.attributes.position.getZ(i);
        
        const vertex = new THREE.Vector3(x, y, z).normalize();
        
        // Use noise to create wave pattern
        const waveHeight = 0.02 * noise.noise3d(
          vertex.x * 5, 
          vertex.y * 5, 
          vertex.z * 5
        );
        
        // Apply wave height to vertex
        const waveVertex = vertex.clone().multiplyScalar(1 + waveHeight);
        
        // Store morphed position
        oceanMorphPositions[i * 3] = waveVertex.x;
        oceanMorphPositions[i * 3 + 1] = waveVertex.y;
        oceanMorphPositions[i * 3 + 2] = waveVertex.z;
        
        // Calculate morphed normal (not accurate but sufficient for this demo)
        oceanMorphNormals[i * 3] = vertex.x;
        oceanMorphNormals[i * 3 + 1] = vertex.y;
        oceanMorphNormals[i * 3 + 2] = vertex.z;
      }
      
      // Add morph attributes to ocean geometry
      oceanGeometry.morphAttributes.position = [new THREE.Float32BufferAttribute(oceanMorphPositions, 3)];
      oceanGeometry.morphAttributes.normal = [new THREE.Float32BufferAttribute(oceanMorphNormals, 3)];
      
      // Apply ocean colors
      this.applyOceanColors(oceanGeometry, this.biome);
      
      // Create ocean material
      let oceanMaterial;
      if (this.options.material === "caustics") {
        oceanMaterial = new PlanetMaterialWithCaustics({
          vertexColors: true,
          transparent: true,
          opacity: 0.8,
          roughness: 0.2,
          shape: "sphere"
        });
      } else {
        oceanMaterial = new THREE.MeshStandardMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.8,
          roughness: 0.2
        });
      }
      
      // Create ocean mesh
      const oceanMesh = new THREE.Mesh(oceanGeometry, oceanMaterial);
      oceanMesh.castShadow = false;
      oceanMesh.receiveShadow = true;
      oceanMesh.morphTargetInfluences = [0]; // Start with no influence
      
      // Add ocean to planet group
      planetMesh.add(oceanMesh);
    }
    
    // Add atmosphere if enabled
    if (this.options.atmosphere?.enabled) {
      this.addAtmosphere(planetMesh);
    }
    
    return planetMesh;
  }
  
  addAtmosphere(planet) {
    // Create slightly larger sphere for atmosphere
    const height = this.options.atmosphere.height || 0.02;
    const geometry = new THREE.SphereGeometry(1 + height, 32, 32);
    
    // Create atmosphere material
    const material = createAtmosphereMaterial(
      this.options.atmosphere.color,
      new THREE.Vector3(1, 1, 0)
    );
    
    // Create atmosphere mesh
    const atmosphere = new THREE.Mesh(geometry, material);
    atmosphere.renderOrder = 10; // Render after the planet
    
    // Add atmosphere to planet group
    planet.add(atmosphere);
  }
  
  applyTerrainNoise(geometry, biome) {
    const positions = geometry.attributes.position;
    const noise = new SimplexNoise();
    
    // Create colors attribute
    const colors = new Float32Array(positions.count * 3);
    
    // Create color gradient
    const colorGradient = new ColorGradient(biome.colors || [
      [-0.5, 0x333333],
      [0, 0x666666],
      [0.5, 0x999999],
      [1, 0xcccccc]
    ]);
    
    // Apply noise to each vertex
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      
      const vertex = new THREE.Vector3(x, y, z);
      const direction = vertex.clone().normalize();
      
      // Generate noise settings from biome
      const noiseSettings = biome.noise || {
        min: -0.05,
        max: 0.05,
        octaves: 4,
        lacunarity: 2.0,
        warp: 0.3,
        scale: 1,
        power: 1.0
      };
      
      // Generate noise-based height
      let elevation = 0;
      let amplitude = 1;
      let frequency = noiseSettings.scale || 1;
      
      // Apply octaves of noise
      for (let o = 0; o < (noiseSettings.octaves || 4); o++) {
        const noiseValue = noise.noise3d(
          direction.x * frequency, 
          direction.y * frequency, 
          direction.z * frequency
        );
        
        elevation += noiseValue * amplitude;
        
        amplitude *= 0.5;
        frequency *= noiseSettings.lacunarity || 2.0;
      }
      
      // Apply power for more dramatic terrain
      elevation = Math.sign(elevation) * Math.pow(Math.abs(elevation), noiseSettings.power || 1.0);
      
      // Clamp elevation to min/max
      elevation = THREE.MathUtils.clamp(
        elevation,
        noiseSettings.min || -0.1,
        noiseSettings.max || 0.1
      );
      
      // Apply height to vertex
      vertex.add(direction.multiplyScalar(elevation));
      
      // Set modified position
      positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
      
      // Determine color based on height and apply it
      const normalizedHeight = (elevation - (noiseSettings.min || -0.1)) / 
        ((noiseSettings.max || 0.1) - (noiseSettings.min || -0.1));
      
      const color = colorGradient.get(normalizedHeight);
      
      // Apply tint color if defined in biome
      if (biome.tintColor) {
        // Calculate steepness for tint application
        const normal = direction.clone();
        const up = new THREE.Vector3(0, 1, 0);
        const steepness = Math.acos(normal.dot(up)) / Math.PI;
        
        // Apply tint based on steepness
        const tintColor = new THREE.Color(biome.tintColor);
        color.lerp(tintColor, steepness);
      }
      
      // Set color values
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    // Update geometry
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
  }
  
  applyOceanColors(geometry, biome) {
    const positions = geometry.attributes.position;
    const colors = new Float32Array(positions.count * 3);
    
    // Create color gradient for ocean
    const colorGradient = new ColorGradient(biome.seaColors || [
      [-1, 0x000066],
      [-0.5, 0x0000aa],
      [0, 0x00aaff]
    ]);
    
    // Apply colors based on height
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      
      const vertex = new THREE.Vector3(x, y, z);
      const direction = vertex.normalize();
      
      // Use noise to create varied ocean colors
      const noise = new SimplexNoise();
      const oceanNoise = biome.seaNoise || { min: -0.01, max: 0.01, scale: 4 };
      
      const noiseValue = noise.noise3d(
        direction.x * (oceanNoise.scale || 4), 
        direction.y * (oceanNoise.scale || 4), 
        direction.z * (oceanNoise.scale || 4)
      );
      
      // Normalize noise to 0-1 range
      const normalizedNoise = (noiseValue - (oceanNoise.min || -0.01)) / 
        ((oceanNoise.max || 0.01) - (oceanNoise.min || -0.01));
      
      // Get color from gradient
      const color = colorGradient.get(normalizedNoise - 0.5); // Offset for better blending
      
      // Set color values
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    // Add color attribute
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  }
  
  async addManualModels(planet) {
    // This is a simplified version that doesn't actually add models
    // In a real implementation, this would load and place vegetation models
    console.log('Adding manual models is not implemented in this simplified version');
  }
} 