import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Procedural Tiny Planets Explorer
 */
export default function tinyPlanetsGame() {
  // Store references for cleanup
  let scene, camera, renderer, controls, animationFrameId;
  
  return {
    isFullscreen: false,
    isPaused: false,
    showInstructions: true,
    gameOver: false,
    gameWon: false,
    score: 0,
    planetsVisited: 0,
    totalPlanets: 1,
    fuelRemaining: 100,
    
    initGame() {
      this.setupScene(this.$refs.gameCanvas);
      
      // Handle fullscreen change
      document.addEventListener('fullscreenchange', () => {
        this.isFullscreen = !!document.fullscreenElement;
        this.onResize();
      });
    },
    
    setupScene(canvas) {
      // Basic Three.js setup
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000011);
      
      camera = new THREE.PerspectiveCamera(
        75, 
        canvas.clientWidth / canvas.clientHeight, 
        0.1, 
        1000
      );
      camera.position.set(0, 5, 10);
      
      renderer = new THREE.WebGLRenderer({ 
        canvas,
        antialias: true
      });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      
      // Add lights
      const ambientLight = new THREE.AmbientLight(0x333333, 0.5);
      scene.add(ambientLight);
      
      // Main sun light
      const sunLight = new THREE.DirectionalLight(0xFFFFAA, 1.5);
      sunLight.position.set(50, 30, 50);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 500;
      sunLight.shadow.camera.left = -30;
      sunLight.shadow.camera.right = 30;
      sunLight.shadow.camera.top = 30;
      sunLight.shadow.camera.bottom = -30;
      scene.add(sunLight);
      
      // Add a secondary light for better illumination
      const secondaryLight = new THREE.DirectionalLight(0x8888FF, 0.5);
      secondaryLight.position.set(-30, -10, -30);
      scene.add(secondaryLight);
      
      // Add a subtle point light to simulate ambient occlusion
      const fillLight = new THREE.PointLight(0xFFFFFF, 0.3);
      fillLight.position.set(0, 0, 0);
      scene.add(fillLight);
      
      // Create stars
      this.createStars(scene);
      
      // Create procedural planet
      this.createProceduralPlanet();
      
      // Add orbit controls for easy navigation
      controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 5;
      controls.maxDistance = 20;
      
      // Handle window resize
      this.onResize = () => {
        // Update camera
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        
        // Update renderer
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      };
      
      window.addEventListener('resize', this.onResize);
      
      // Animation loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        
        if (!this.isPaused) {
          // Rotate the planet slowly
          if (this.planetGroup) {
            this.planetGroup.rotation.y += 0.001;
          }
          
          // Animate water level
          if (this.water) {
            this.waterTime += 0.01;
            
            // Create a breathing effect for the water
            const waterPulse = Math.sin(this.waterTime) * 0.01;
            
            // Apply the pulse to the water radius
            const newWaterRadius = this.waterBaseRadius * (1 + waterPulse);
            
            // Scale the water sphere
            this.water.scale.set(
              1 + waterPulse,
              1 + waterPulse,
              1 + waterPulse
            );
            
            // Slightly change water opacity for wave effect
            this.water.material.opacity = 0.7 + Math.sin(this.waterTime * 2) * 0.1;
            
            // Animate water material properties for better reflections
            this.water.material.roughness = 0.1 + Math.sin(this.waterTime * 3) * 0.05;
            this.water.material.clearcoat = 0.8 + Math.sin(this.waterTime * 2.5) * 0.2;
          }
          
          // Animate clouds
          if (this.clouds) {
            this.clouds.rotation.y += 0.0005; // Rotate clouds slightly faster than planet
            this.clouds.rotation.x += 0.0001; // Add slight tilt to cloud rotation
            
            // Pulse cloud opacity slightly
            this.clouds.material.opacity = 0.7 + Math.sin(this.waterTime * 1.5) * 0.1;
          }
          
          // Animate atmosphere
          if (this.atmosphere) {
            // Subtle pulsing of the atmosphere
            const pulseFactor = 1 + Math.sin(this.waterTime * 0.5) * 0.02;
            this.atmosphere.scale.set(pulseFactor, pulseFactor, pulseFactor);
            
            // Vary atmosphere opacity
            this.atmosphere.material.opacity = 0.1 + Math.sin(this.waterTime * 0.7) * 0.05;
          }
        
        // Update controls
        controls.update();
        }
        
        // Render scene
        renderer.render(scene, camera);
      };
      
      // Start animation loop
      animate();
    },
    
    createStars(scene) {
      const starsGeometry = new THREE.BufferGeometry();
      const starCount = 2000;
      
      const positions = new Float32Array(starCount * 3);
      const sizes = new Float32Array(starCount);
      
      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 200;
        positions[i3 + 1] = (Math.random() - 0.5) * 200;
        positions[i3 + 2] = (Math.random() - 0.5) * 200;
        
        sizes[i] = Math.random() * 2;
      }
      
      starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      
      const starsMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.1,
        sizeAttenuation: true
      });
      
      const starfield = new THREE.Points(starsGeometry, starsMaterial);
      scene.add(starfield);
    },
    
    createProceduralPlanet() {
      // Create a group to hold the planet and its features
      const planetGroup = new THREE.Group();
      scene.add(planetGroup);
      
      // Create the planet geometry
      const radius = 4;
      const detail = 3;
      const geometry = new THREE.IcosahedronGeometry(radius, detail);
      
      // Create noise for terrain generation
      const noise = new SimplexNoise();
      const biomeNoise = new SimplexNoise();
      
      // Arrays to store positions for trees, rocks, and grass
      const treePositions = [];
      const rockPositions = [];
      const grassPositions = [];
      const specialFeaturePositions = [];
      const biomeTypes = [];
      
      // Deform the geometry based on noise
      const positions = geometry.attributes.position;
      const vertexCount = positions.count;
      
      for (let i = 0; i < vertexCount; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        
        // Get the normalized position (direction from center)
        const normPos = new THREE.Vector3(x, y, z).normalize();
        
        // Generate biome type based on position
        const biomeValue = biomeNoise.noise3d(normPos.x * 1.5, normPos.y * 1.5, normPos.z * 1.5);
        
        // Determine biome type
        let biomeType;
        if (biomeValue < -0.6) {
          biomeType = 'ocean';
        } else if (biomeValue < -0.3) {
          biomeType = 'beach';
        } else if (biomeValue < 0) {
          biomeType = 'plains';
        } else if (biomeValue < 0.3) {
          biomeType = 'forest';
        } else if (biomeValue < 0.5) {
          biomeType = 'jungle';
        } else if (biomeValue < 0.7) {
          biomeType = 'savanna';
        } else if (biomeValue < 0.85) {
          biomeType = 'desert';
        } else {
          biomeType = 'mesa';
        }
        
        biomeTypes[i] = biomeType;
        
        // Generate elevation based on noise and biome
        let elevation = noise.noise3d(normPos.x * 2, normPos.y * 2, normPos.z * 2);
        
        // Modify elevation based on biome
        switch(biomeType) {
          case 'ocean':
            elevation = elevation * 0.2 - 0.2; // Deeper ocean
            break;
          case 'beach':
            elevation = elevation * 0.1 - 0.05; // Flatter beaches
            break;
          case 'plains':
            elevation = elevation * 0.3; // Gentle plains
            break;
          case 'forest':
            elevation = elevation * 0.5; // Rolling forest
            break;
          case 'jungle':
            elevation = elevation * 0.7; // Varied jungle
            break;
          case 'savanna':
            elevation = elevation * 0.4; // Mostly flat with some hills
            break;
          case 'desert':
            // Add dunes to desert
            const duneNoise = noise.noise3d(normPos.x * 8, normPos.y * 8, normPos.z * 8) * 0.2;
            elevation = elevation * 0.3 + duneNoise;
            break;
          case 'mesa':
            // Create mesa formations
            const mesaNoise = noise.noise3d(normPos.x * 4, normPos.y * 4, normPos.z * 4);
            if (mesaNoise > 0.2) {
              elevation = 0.5 + mesaNoise * 0.5; // Mesa plateaus
            } else {
              elevation = elevation * 0.3; // Lower areas
            }
            break;
        }
        
        // Apply elevation to vertex
        const newPos = normPos.multiplyScalar(radius * (1 + elevation * 0.2));
        positions.setXYZ(i, newPos.x, newPos.y, newPos.z);
        
        // Randomly place trees, rocks, and grass based on biome and elevation
        if (Math.random() > 0.995) {
          // Determine what to place based on biome
          switch(biomeType) {
            case 'forest':
              if (elevation > 0) {
                treePositions.push({
                  position: newPos.clone(),
                  type: Math.random() > 0.7 ? 'pine' : 'normal',
                  scale: 0.25 + Math.random() * 0.15
                });
              }
              break;
            case 'jungle':
              if (elevation > 0) {
                treePositions.push({
                  position: newPos.clone(),
                  type: 'jungle',
                  scale: 0.25 + Math.random() * 0.15
                });
              }
              break;
            case 'savanna':
              if (elevation > 0 && Math.random() > 0.7) {
                treePositions.push({
                  position: newPos.clone(),
                  type: 'savanna',
                  scale: 0.25 + Math.random() * 0.15
                });
              }
              break;
            case 'desert':
              if (elevation > 0 && Math.random() > 0.7) {
                specialFeaturePositions.push({
                  position: newPos.clone(),
                  type: 'cactus',
                  scale: 0.15 + Math.random() * 0.1
                });
              }
              break;
          }
        }
        
        // Place rocks
        if (Math.random() > 0.997) {
          let rockType;
          
          switch(biomeType) {
            case 'desert':
              rockType = 'desert';
              break;
            case 'mesa':
              rockType = 'mesa';
              break;
            default:
              rockType = ['small', 'medium', 'large'][Math.floor(Math.random() * 3)];
              break;
          }
          
          rockPositions.push({
            position: newPos.clone(),
            type: rockType,
            scale: 0.12 + Math.random() * 0.1
          });
        }
        
        // Place grass in appropriate biomes
        if (Math.random() > 0.99 && (biomeType === 'plains' || biomeType === 'forest' || biomeType === 'savanna')) {
          grassPositions.push({
            position: newPos.clone(),
            type: biomeType === 'savanna' ? 'tall' : 'normal',
            scale: 0.08 + Math.random() * 0.07
          });
        }
      }
      
      // Update normals after deformation
      geometry.computeVertexNormals();
      
      // Create color array for vertices
      const colors = new Float32Array(vertexCount * 3);
      
      // Apply colors based on elevation and biome
      for (let i = 0; i < vertexCount; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        
        // Calculate elevation as distance from center
        const elevation = new THREE.Vector3(x, y, z).length() - radius;
        const normalizedElevation = elevation / (radius * 0.2);
        
        // Get biome type for this vertex
        const biomeType = biomeTypes[i];
        
        // Set color based on biome and elevation
        let color = new THREE.Color();
        
        switch(biomeType) {
          case 'ocean':
            color.setRGB(0.1, 0.3, 0.6);
            break;
          case 'beach':
            color.setRGB(0.95, 0.9, 0.7);
            break;
          case 'plains':
            color.setRGB(0.4, 0.7, 0.3);
            break;
          case 'forest':
            color.setRGB(0.3, 0.5, 0.25);
            break;
          case 'jungle':
            color.setRGB(0.2, 0.6, 0.3);
            break;
          case 'savanna':
            color.setRGB(0.8, 0.7, 0.4);
            break;
          case 'desert':
            color.setRGB(0.9, 0.8, 0.5);
            break;
          case 'mesa':
            color.setRGB(0.8, 0.5, 0.3);
            break;
          default:
            // Fallback color
            color.setRGB(0.5, 0.5, 0.5);
        }
        
        // Apply color to vertex
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }
      
      // Add colors to geometry
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      // Create material with vertex colors
      const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: true,
        roughness: 0.8,
        metalness: 0.1
      });
      
      // Create mesh and add to scene
      const planetMesh = new THREE.Mesh(geometry, material);
      planetMesh.castShadow = true;
      planetMesh.receiveShadow = true;
      planetGroup.add(planetMesh);
      
      // Create water
      this.createWater(planetGroup, radius);
      
      // Create clouds
      this.createClouds(planetGroup, radius * 1.1);
      
      // Create trees
      this.createTrees(planetGroup, treePositions);
      
      // Create rocks
      this.createRocks(planetGroup, rockPositions);
      
      // Create grass
      this.createGrass(planetGroup, grassPositions);
      
      // Create special features (cacti, etc.)
      this.createSpecialFeatures(planetGroup, specialFeaturePositions);
      
      // Store reference to planet group
      this.planetGroup = planetGroup;
      
      return planetGroup;
    },
    
    createTrees(planetGroup, treePositions) {
      // Limit the number of trees for performance
      const maxTrees = 100;
      if (treePositions.length > maxTrees) {
        treePositions = treePositions.sort(() => 0.5 - Math.random()).slice(0, maxTrees);
      }
      
      // Create tree geometries
      const normalTreeGeometry = this.createNormalTreeGeometry();
      const pineTreeGeometry = this.createPineTreeGeometry();
      const smallTreeGeometry = this.createSmallTreeGeometry();
      const jungleTreeGeometry = this.createJungleTreeGeometry();
      const savannaTreeGeometry = this.createSavannaTreeGeometry();
      
      // Create tree materials
      const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        flatShading: true,
        roughness: 0.9,
        metalness: 0.0
      });
      
      const lightTrunkMaterial = new THREE.MeshStandardMaterial({
        color: 0xAA8866,
        flatShading: true,
        roughness: 0.9,
        metalness: 0.0
      });
      
      const leafMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d6a1e,
        flatShading: true,
        roughness: 0.8,
        metalness: 0.0
      });
      
      const darkLeafMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a4313,
        flatShading: true,
        roughness: 0.8,
        metalness: 0.0
      });
      
      const jungleLeafMaterial = new THREE.MeshStandardMaterial({
        color: 0x1e5c10,
        flatShading: true,
        roughness: 0.7,
        metalness: 0.0
      });
      
      const savannaLeafMaterial = new THREE.MeshStandardMaterial({
        color: 0xbfb05b,
        flatShading: true,
        roughness: 0.9,
        metalness: 0.0
      });
      
      // Create tree instances
      treePositions.forEach(treeData => {
        let treeMesh;
        
        switch(treeData.type) {
          case 'normal':
            treeMesh = this.createTreeInstance(normalTreeGeometry, trunkMaterial, leafMaterial);
            break;
          case 'pine':
            treeMesh = this.createTreeInstance(pineTreeGeometry, trunkMaterial, darkLeafMaterial);
            break;
          case 'jungle':
            treeMesh = this.createTreeInstance(jungleTreeGeometry, trunkMaterial, jungleLeafMaterial);
            break;
          case 'savanna':
            treeMesh = this.createTreeInstance(savannaTreeGeometry, lightTrunkMaterial, savannaLeafMaterial);
            break;
          case 'small':
          default:
            treeMesh = this.createTreeInstance(smallTreeGeometry, trunkMaterial, leafMaterial);
            break;
        }
        
        // Get the original position from the terrain
        const originalPos = treeData.position.clone();
        
        // Get the normalized direction from center to position
        const direction = originalPos.clone().normalize();
        
        // Calculate the planet radius (4 is the base radius used in createProceduralPlanet)
        const planetRadius = 4;
        
        // Position the tree on the surface with a slight offset to ensure it's visible
        // Use the actual terrain position rather than recalculating it
        const surfaceOffset = 0.05; // Small offset to prevent z-fighting
        const treePos = originalPos.clone().add(direction.multiplyScalar(surfaceOffset));
        treeMesh.position.copy(treePos);
        
        // Create a quaternion that rotates from the up vector (0,1,0) to the direction from center to tree
        const upVector = new THREE.Vector3(0, 1, 0);
        const normalVector = direction.clone();
        
        // Create a quaternion to rotate from up vector to normal vector
        const quaternion = new THREE.Quaternion().setFromUnitVectors(upVector, normalVector);
        treeMesh.setRotationFromQuaternion(quaternion);
        
        // Add random rotation around the normal axis
        const rotationAxis = normalVector.clone();
        const angle = Math.random() * Math.PI * 2;
        const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angle);
        
        // Apply both quaternions
        treeMesh.quaternion.premultiply(rotationQuaternion);
        
        // Scale the tree
        treeMesh.scale.set(treeData.scale, treeData.scale, treeData.scale);
        
        // Add to planet group
        planetGroup.add(treeMesh);
      });
    },
    
    createNormalTreeGeometry() {
      const treeGroup = new THREE.Group();
      
      // Create trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 5);
      trunkGeometry.translate(0, 1, 0);
      
      // Create foliage (low poly)
      const foliageGeometry = new THREE.ConeGeometry(1, 2, 6);
      foliageGeometry.translate(0, 2.5, 0);
      
      return { trunk: trunkGeometry, foliage: foliageGeometry };
    },
    
    createPineTreeGeometry() {
      // Create trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.2, 1.5, 5);
      trunkGeometry.translate(0, 0.75, 0);
      
      // Create multiple layers of foliage (without using BufferGeometryUtils)
      // Create three separate cones instead of merging them
      const foliageGeometry1 = new THREE.ConeGeometry(0.8, 1.2, 6);
      foliageGeometry1.translate(0, 1.8, 0);
      
      const foliageGeometry2 = new THREE.ConeGeometry(0.6, 1, 6);
      foliageGeometry2.translate(0, 2.4, 0);
      
      const foliageGeometry3 = new THREE.ConeGeometry(0.4, 0.8, 6);
      foliageGeometry3.translate(0, 3, 0);
      
      return { 
        trunk: trunkGeometry, 
        foliage: foliageGeometry1,
        foliage2: foliageGeometry2,
        foliage3: foliageGeometry3
      };
    },
    
    createSmallTreeGeometry() {
      // Create trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.8, 5);
      trunkGeometry.translate(0, 0.4, 0);
      
      // Create foliage (low poly)
      const foliageGeometry = new THREE.SphereGeometry(0.5, 4, 4);
      foliageGeometry.translate(0, 0.9, 0);
      
      return { trunk: trunkGeometry, foliage: foliageGeometry };
    },
    
    createJungleTreeGeometry() {
      // Create trunk (taller and thinner)
      const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.25, 3, 5);
      trunkGeometry.translate(0, 1.5, 0);
      
      // Create foliage (more spherical)
      const foliageGeometry = new THREE.SphereGeometry(1.2, 4, 4);
      foliageGeometry.translate(0, 3, 0);
      
      // Create additional smaller foliage clusters
      const foliageGeometry2 = new THREE.SphereGeometry(0.8, 4, 4);
      foliageGeometry2.translate(0.7, 2.5, 0);
      
      const foliageGeometry3 = new THREE.SphereGeometry(0.8, 4, 4);
      foliageGeometry3.translate(-0.7, 2.3, 0);
      
      return { 
        trunk: trunkGeometry, 
        foliage: foliageGeometry,
        foliage2: foliageGeometry2,
        foliage3: foliageGeometry3
      };
    },
    
    createSavannaTreeGeometry() {
      // Create trunk (wider at the bottom, narrower at the top)
      const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.4, 1.8, 5);
      trunkGeometry.translate(0, 0.9, 0);
      
      // Create flat-topped foliage
      const foliageGeometry = new THREE.CylinderGeometry(1.5, 1.2, 0.5, 6);
      foliageGeometry.translate(0, 2.1, 0);
      
      return { trunk: trunkGeometry, foliage: foliageGeometry };
    },
    
    createTreeInstance(geometries, trunkMaterial, leafMaterial) {
      const treeGroup = new THREE.Group();
      
      // Create trunk
      const trunk = new THREE.Mesh(geometries.trunk, trunkMaterial);
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      treeGroup.add(trunk);
      
      // Create foliage
      const foliage = new THREE.Mesh(geometries.foliage, leafMaterial);
      foliage.castShadow = true;
      foliage.receiveShadow = true;
      treeGroup.add(foliage);
      
      // Add additional foliage layers for pine trees if they exist
      if (geometries.foliage2) {
        const foliage2 = new THREE.Mesh(geometries.foliage2, leafMaterial);
        foliage2.castShadow = true;
        foliage2.receiveShadow = true;
        treeGroup.add(foliage2);
      }
      
      if (geometries.foliage3) {
        const foliage3 = new THREE.Mesh(geometries.foliage3, leafMaterial);
        foliage3.castShadow = true;
        foliage3.receiveShadow = true;
        treeGroup.add(foliage3);
      }
      
      return treeGroup;
    },
    
    createRocks(planetGroup, rockPositions) {
      // Limit the number of rocks for performance
      const maxRocks = 80;
      if (rockPositions.length > maxRocks) {
        rockPositions = rockPositions.sort(() => 0.5 - Math.random()).slice(0, maxRocks);
      }
      
      // Create rock geometries
      const smallRockGeometry = this.createRockGeometry('small');
      const mediumRockGeometry = this.createRockGeometry('medium');
      const largeRockGeometry = this.createRockGeometry('large');
      const desertRockGeometry = this.createRockGeometry('desert');
      const mesaRockGeometry = this.createRockGeometry('mesa');
      
      // Create rock materials
      const rockMaterial = new THREE.MeshStandardMaterial({
        color: 0x8c8c8c,
        flatShading: true,
        roughness: 0.9,
        metalness: 0.1
      });
      
      const darkRockMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        flatShading: true,
        roughness: 0.8,
        metalness: 0.2
      });
      
      const redRockMaterial = new THREE.MeshStandardMaterial({
        color: 0x9e6359,
        flatShading: true,
        roughness: 0.9,
        metalness: 0.1
      });
      
      const mesaRockMaterial = new THREE.MeshStandardMaterial({
        color: 0xc17753,
        flatShading: true,
        roughness: 0.7,
        metalness: 0.1
      });
      
      // Create rock instances
      rockPositions.forEach(rockData => {
        let rockGeometry;
        let material;
        
        switch(rockData.type) {
          case 'large':
            rockGeometry = largeRockGeometry;
            material = Math.random() > 0.5 ? rockMaterial : darkRockMaterial;
            break;
          case 'medium':
            rockGeometry = mediumRockGeometry;
            material = Math.random() > 0.5 ? rockMaterial : darkRockMaterial;
            break;
          case 'desert':
            rockGeometry = desertRockGeometry;
            material = redRockMaterial;
            break;
          case 'mesa':
            rockGeometry = mesaRockGeometry;
            material = mesaRockMaterial;
            break;
          case 'small':
          default:
            rockGeometry = smallRockGeometry;
            material = Math.random() > 0.5 ? rockMaterial : darkRockMaterial;
            break;
        }
        
        const rockMesh = new THREE.Mesh(rockGeometry, material);
        rockMesh.castShadow = true;
        rockMesh.receiveShadow = true;
        
        // Get the original position from the terrain
        const originalPos = rockData.position.clone();
        
        // Get the normalized direction from center to position
        const direction = originalPos.clone().normalize();
        
        // Position the rock on the surface with a slight offset to prevent z-fighting
        const surfaceOffset = 0.03;
        const rockPos = originalPos.clone().add(direction.multiplyScalar(surfaceOffset));
        rockMesh.position.copy(rockPos);
        
        // Create a quaternion that rotates from the up vector (0,1,0) to the direction from center to rock
        const upVector = new THREE.Vector3(0, 1, 0);
        const normalVector = direction.clone();
        
        // Create a quaternion to rotate from up vector to normal vector
        const quaternion = new THREE.Quaternion().setFromUnitVectors(upVector, normalVector);
        rockMesh.setRotationFromQuaternion(quaternion);
        
        // Add random rotation around the normal axis
        const rotationAxis = normalVector.clone();
        const angle = Math.random() * Math.PI * 2;
        const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angle);
        
        // Apply both quaternions
        rockMesh.quaternion.premultiply(rotationQuaternion);
        
        // Scale the rock
        rockMesh.scale.set(rockData.scale, rockData.scale, rockData.scale);
        
        // Add to planet group
        planetGroup.add(rockMesh);
      });
    },
    
    createRockGeometry(size) {
      let geometry;
      
      switch(size) {
        case 'large':
          // Create a more complex rock shape for large rocks
          geometry = new THREE.IcosahedronGeometry(1, 0);
          break;
        case 'medium':
          // Medium rocks use octahedron
          geometry = new THREE.OctahedronGeometry(1, 0);
          break;
        case 'desert':
          // Desert rocks are more eroded and flat-topped
          geometry = new THREE.CylinderGeometry(0.7, 1, 1, 6, 1);
          break;
        case 'mesa':
          // Mesa rocks are flat-topped formations
          geometry = new THREE.CylinderGeometry(0.8, 1, 1.5, 6, 1);
          break;
        case 'small':
        default:
          // Small rocks use tetrahedron
          geometry = new THREE.TetrahedronGeometry(1, 0);
          break;
      }
      
      // Deform the geometry to make it look more like a rock
      const positions = geometry.attributes.position;
      const vertexCount = positions.count;
      
      for (let i = 0; i < vertexCount; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        
        // Add random displacement to each vertex
        let displacement;
        
        if (size === 'desert' || size === 'mesa') {
          // Less deformation on top for flat-topped rocks
          if (y > 0.5) {
            displacement = (Math.random() - 0.5) * 0.1;
          } else {
            displacement = (Math.random() - 0.5) * 0.3;
          }
        } else {
          displacement = (Math.random() - 0.5) * 0.3;
        }
        
        positions.setX(i, x * (1 + displacement));
        positions.setY(i, y * (1 + displacement));
        positions.setZ(i, z * (1 + displacement));
      }
      
      // Update normals
      geometry.computeVertexNormals();
      
      return geometry;
    },
    
    createGrass(planetGroup, grassPositions) {
      // Limit the number of grass clumps for performance
      const maxGrass = 120;
      if (grassPositions.length > maxGrass) {
        grassPositions = grassPositions.sort(() => 0.5 - Math.random()).slice(0, maxGrass);
      }
      
      // Create grass geometries
      const beachGrassGeometry = this.createGrassGeometry('beach');
      const plainsGrassGeometry = this.createGrassGeometry('plains');
      
      // Create grass materials
      const beachGrassMaterial = new THREE.MeshStandardMaterial({
        color: 0xd9c07e,
        flatShading: true,
        roughness: 0.9,
        metalness: 0.0
      });
      
      const plainsGrassMaterial = new THREE.MeshStandardMaterial({
        color: 0x7caa2d,
        flatShading: true,
        roughness: 0.9,
        metalness: 0.0
      });
      
      // Create grass instances
      grassPositions.forEach(grassData => {
        let geometry, material;
        
        if (grassData.type === 'beach') {
          geometry = beachGrassGeometry;
          material = beachGrassMaterial;
        } else {
          geometry = plainsGrassGeometry;
          material = plainsGrassMaterial;
        }
        
        const grassMesh = new THREE.Mesh(geometry, material);
        grassMesh.castShadow = true;
        grassMesh.receiveShadow = true;
        
        // Get the original position from the terrain
        const originalPos = grassData.position.clone();
        
        // Get the normalized direction from center to position
        const direction = originalPos.clone().normalize();
        
        // Position the grass on the surface with a slight offset
        const surfaceOffset = 0.02;
        const grassPos = originalPos.clone().add(direction.multiplyScalar(surfaceOffset));
        grassMesh.position.copy(grassPos);
        
        // Create a quaternion that rotates from the up vector (0,1,0) to the direction from center to grass
        const upVector = new THREE.Vector3(0, 1, 0);
        const normalVector = direction.clone();
        
        // Create a quaternion to rotate from up vector to normal vector
        const quaternion = new THREE.Quaternion().setFromUnitVectors(upVector, normalVector);
        grassMesh.setRotationFromQuaternion(quaternion);
        
        // Add random rotation around the normal axis
        const rotationAxis = normalVector.clone();
        const angle = Math.random() * Math.PI * 2;
        const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angle);
        
        // Apply both quaternions
        grassMesh.quaternion.premultiply(rotationQuaternion);
        
        // Scale the grass
        grassMesh.scale.set(grassData.scale, grassData.scale, grassData.scale);
        
        // Add to planet group
        planetGroup.add(grassMesh);
      });
    },
    
    createGrassGeometry(type) {
      // Create a simple grass clump
      const grassGroup = new THREE.Group();
      
      if (type === 'beach') {
        // Beach grass is taller and sparser
        const bladeCount = 5;
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        
        for (let i = 0; i < bladeCount; i++) {
          const angle = (i / bladeCount) * Math.PI * 2;
          const radius = 0.1 + Math.random() * 0.1;
          
          // Base of blade
          vertices.push(
            Math.cos(angle) * radius, 0, Math.sin(angle) * radius,
            Math.cos(angle) * radius * 0.8, 0.5 + Math.random() * 0.5, Math.sin(angle) * radius * 0.8,
            Math.cos(angle + 0.1) * radius, 0, Math.sin(angle + 0.1) * radius
          );
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();
        
        return geometry;
      } else {
        // Plains grass is shorter and denser
        const geometry = new THREE.ConeGeometry(0.2, 0.4, 4, 1);
        geometry.translate(0, 0.2, 0);
        
        // Deform the geometry to make it look more natural
        const positions = geometry.attributes.position;
        const vertexCount = positions.count;
        
        for (let i = 0; i < vertexCount; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const z = positions.getZ(i);
          
          // Add random displacement to each vertex
          if (y > 0.1) { // Don't deform the base too much
            const displacement = (Math.random() - 0.5) * 0.2;
            positions.setX(i, x * (1 + displacement));
            positions.setZ(i, z * (1 + displacement));
          }
        }
        
        geometry.computeVertexNormals();
        return geometry;
      }
    },
    
    createSpecialFeatures(planetGroup, specialFeaturePositions) {
      // Limit the number of special features for performance
      const maxFeatures = 50;
      if (specialFeaturePositions.length > maxFeatures) {
        specialFeaturePositions = specialFeaturePositions.sort(() => 0.5 - Math.random()).slice(0, maxFeatures);
      }
      
      // Create special feature geometries
      const cactusGeometry = this.createCactusGeometry();
      
      // Create materials
      const cactusMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d8659,
        flatShading: true,
        roughness: 0.9,
        metalness: 0.0
      });
      
      // Create special feature instances
      specialFeaturePositions.forEach(featureData => {
        let featureMesh;
        
        switch(featureData.type) {
          case 'cactus':
            featureMesh = this.createCactusInstance(cactusGeometry, cactusMaterial);
            break;
          default:
            // Default to a simple sphere if type is unknown
            const geometry = new THREE.SphereGeometry(1, 4, 4);
            featureMesh = new THREE.Mesh(geometry, cactusMaterial);
            break;
        }
        
        // Get the original position from the terrain
        const originalPos = featureData.position.clone();
        
        // Get the normalized direction from center to position
        const direction = originalPos.clone().normalize();
        
        // Position the feature on the surface with a slight offset
        const surfaceOffset = 0.04;
        const featurePos = originalPos.clone().add(direction.multiplyScalar(surfaceOffset));
        featureMesh.position.copy(featurePos);
        
        // Create a quaternion that rotates from the up vector (0,1,0) to the direction from center to feature
        const upVector = new THREE.Vector3(0, 1, 0);
        const normalVector = direction.clone();
        
        // Create a quaternion to rotate from up vector to normal vector
        const quaternion = new THREE.Quaternion().setFromUnitVectors(upVector, normalVector);
        featureMesh.setRotationFromQuaternion(quaternion);
        
        // Add random rotation around the normal axis
        const rotationAxis = normalVector.clone();
        const angle = Math.random() * Math.PI * 2;
        const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angle);
        
        // Apply both quaternions
        featureMesh.quaternion.premultiply(rotationQuaternion);
        
        // Scale the feature
        featureMesh.scale.set(featureData.scale, featureData.scale, featureData.scale);
        
        // Add to planet group
        planetGroup.add(featureMesh);
      });
    },
    
    createCactusGeometry() {
      // Create main body
      const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 6);
      bodyGeometry.translate(0, 1, 0);
      
      // Create arms (50% chance for each arm)
      const hasLeftArm = Math.random() > 0.5;
      const hasRightArm = Math.random() > 0.5;
      
      let leftArmGeometry = null;
      let rightArmGeometry = null;
      
      if (hasLeftArm) {
        leftArmGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 6);
        leftArmGeometry.translate(-0.5, 1.5, 0);
        leftArmGeometry.rotateZ(Math.PI / 4);
      }
      
      if (hasRightArm) {
        rightArmGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 6);
        rightArmGeometry.translate(0.5, 1.3, 0);
        rightArmGeometry.rotateZ(-Math.PI / 4);
      }
      
      return {
        body: bodyGeometry,
        leftArm: leftArmGeometry,
        rightArm: rightArmGeometry
      };
    },
    
    createCactusInstance(geometries, material) {
      const cactusGroup = new THREE.Group();
      
      // Create body
      const body = new THREE.Mesh(geometries.body, material);
      body.castShadow = true;
      body.receiveShadow = true;
      cactusGroup.add(body);
      
      // Add arms if they exist
      if (geometries.leftArm) {
        const leftArm = new THREE.Mesh(geometries.leftArm, material);
        leftArm.castShadow = true;
        leftArm.receiveShadow = true;
        cactusGroup.add(leftArm);
      }
      
      if (geometries.rightArm) {
        const rightArm = new THREE.Mesh(geometries.rightArm, material);
        rightArm.castShadow = true;
        rightArm.receiveShadow = true;
        cactusGroup.add(rightArm);
      }
      
      return cactusGroup;
    },
    
    startGame() {
      this.showInstructions = false;
      this.isPaused = false;
      this.gameOver = false;
      this.gameWon = false;
      this.score = 0;
      this.planetsVisited = 0;
      this.fuelRemaining = 100;
    },
    
    togglePause() {
      if (this.showInstructions || this.gameOver) return;
      this.isPaused = !this.isPaused;
    },
    
    resetGame() {
      this.showInstructions = true;
      this.isPaused = true;
      this.gameOver = false;
      this.gameWon = false;
      this.score = 0;
      this.planetsVisited = 0;
      this.fuelRemaining = 100;
    },
    
    toggleFullscreen() {
      const container = this.$refs.gameCanvas.closest('.tiny-planets-game-container');
      
      if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
          container.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    },
    
    onResize() {
      if (!camera || !renderer || !this.$refs.gameCanvas) return;
      
      const canvas = this.$refs.gameCanvas;
      
      // Update camera
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      
      // Update renderer
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    },
    
    destroy() {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      if (controls) {
        controls.dispose();
      }
      
      window.removeEventListener('resize', this.onResize);
      document.removeEventListener('fullscreenchange', () => {});
      
      // Clean up Three.js resources
      if (renderer) {
        renderer.dispose();
      }
      
      scene = null;
      camera = null;
      renderer = null;
      controls = null;
      this.planetGroup = null;
    },
    
    createWater(planetGroup, radius) {
      // Create noise for water level calculation
      const noise = new SimplexNoise();
      
      // Create water sphere
      const waterGeometry = new THREE.IcosahedronGeometry(radius * 0.99, 3);
      const waterMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x0077be,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.9,
        transparent: true,
        opacity: 0.7,
        clearcoat: 1.0,
        clearcoatRoughness: 0.2,
        envMapIntensity: 1.5,
        ior: 1.4, // Water has an IOR of ~1.33
        reflectivity: 0.7,
        iridescence: 0.3,
        iridescenceIOR: 1.5
      });
      
      const water = new THREE.Mesh(waterGeometry, waterMaterial);
      
      // Only show water where terrain is below water level
      const waterVertices = waterGeometry.attributes.position;
      const waterVertexCount = waterVertices.count;
      
      // Create a visibility array for water vertices
      const waterVisibility = new Float32Array(waterVertexCount);
      
      for (let i = 0; i < waterVertexCount; i++) {
        const x = waterVertices.getX(i);
        const y = waterVertices.getY(i);
        const z = waterVertices.getZ(i);
        
        // Normalize the position
        const nx = x / radius;
        const ny = y / radius;
        const nz = z / radius;
        
        // Calculate height at this point
        let elevation = 0;
        elevation += noise.noise3d(nx * 1.5, ny * 1.5, nz * 1.5) * 0.5;
        elevation += noise.noise3d(nx * 3, ny * 3, nz * 3) * 0.25;
        elevation += noise.noise3d(nx * 6, ny * 6, nz * 6) * 0.125;
        elevation += noise.noise3d(nx * 12, ny * 12, nz * 12) * 0.0625;
        
        // If terrain is above water level, hide water at this point
        if (elevation > -0.1) {
          // Move water vertex inward to hide it
          waterVertices.setX(i, x * 0.95);
          waterVertices.setY(i, y * 0.95);
          waterVertices.setZ(i, z * 0.95);
        }
      }
      
      water.castShadow = false;
      water.receiveShadow = true;
      planetGroup.add(water);
      
      // Store water reference for animation
      this.water = water;
      this.waterBaseRadius = radius * 0.99;
      this.waterLevel = -0.1;
      this.waterTime = 0;
    },
    
    createClouds(planetGroup, radius) {
      // Create cloud particles
      const cloudCount = 200;
      const cloudGeometry = new THREE.BufferGeometry();
      const cloudPositions = new Float32Array(cloudCount * 3);
      const cloudSizes = new Float32Array(cloudCount);
      
      // Create noise for cloud distribution
      const noise = new SimplexNoise();
      
      // Generate cloud positions on the sphere
      for (let i = 0; i < cloudCount; i++) {
        // Generate random point on sphere
        const phi = Math.acos(-1 + (2 * i) / cloudCount);
        const theta = Math.sqrt(cloudCount * Math.PI) * phi;
        
        // Convert to Cartesian coordinates
        let x = radius * Math.sin(phi) * Math.cos(theta);
        let y = radius * Math.sin(phi) * Math.sin(theta);
        let z = radius * Math.cos(phi);
        
        // Add some noise to the positions
        const nx = x / radius;
        const ny = y / radius;
        const nz = z / radius;
        
        // Only place clouds where noise is positive (creates cloud clusters)
        const cloudNoise = noise.noise3d(nx * 2, ny * 2, nz * 2);
        
        if (cloudNoise > 0.1) {
          cloudPositions[i * 3] = x;
          cloudPositions[i * 3 + 1] = y;
          cloudPositions[i * 3 + 2] = z;
          
          // Vary cloud size based on noise
          cloudSizes[i] = 0.2 + cloudNoise * 0.3;
        } else {
          // Place cloud below planet (will not be visible)
          cloudPositions[i * 3] = 0;
          cloudPositions[i * 3 + 1] = -radius * 2;
          cloudPositions[i * 3 + 2] = 0;
          cloudSizes[i] = 0;
        }
      }
      
      cloudGeometry.setAttribute('position', new THREE.BufferAttribute(cloudPositions, 3));
      cloudGeometry.setAttribute('size', new THREE.BufferAttribute(cloudSizes, 1));
      
      // Create cloud material
      const cloudMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.3,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true,
        depthWrite: false
      });
      
      // Create cloud system
      const clouds = new THREE.Points(cloudGeometry, cloudMaterial);
      planetGroup.add(clouds);
      
      // Store reference for animation
      this.clouds = clouds;
    }
  };
} 