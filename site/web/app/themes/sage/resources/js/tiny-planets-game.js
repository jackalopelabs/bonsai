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
      this.createProceduralPlanet(scene);
      
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
          if (this.planet) {
            this.planet.rotation.y += 0.001;
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
    
    createProceduralPlanet(scene) {
      // Create a planet group to hold all components
      const planetGroup = new THREE.Group();
      
      // Create the land mass (higher detail terrain)
      const radius = 4;
      const detail = 3; // Increased from 2 for higher fidelity
      
      // Create base geometry
      const geometry = new THREE.IcosahedronGeometry(radius, detail);
      
      // Create noise for terrain generation
      const noise = new SimplexNoise();
      
      // Get vertices and modify them with noise
      const vertices = geometry.attributes.position;
      const vertexCount = vertices.count;
      
      // Arrays to store terrain data for coloring
      const terrainHeight = [];
      const maxHeight = radius * 0.25; // Increased height variation
      
      // Store positions for nature assets
      const treePositions = [];
      const rockPositions = [];
      const grassPositions = [];
      
      // Apply noise to vertices
      for (let i = 0; i < vertexCount; i++) {
        const x = vertices.getX(i);
        const y = vertices.getY(i);
        const z = vertices.getZ(i);
        
        // Normalize the position to get direction from center
        const nx = x / radius;
        const ny = y / radius;
        const nz = z / radius;
        
        // Apply multiple layers of noise for more interesting terrain
        let elevation = 0;
        // More octaves of noise for more detailed terrain
        elevation += noise.noise3d(nx * 1.5, ny * 1.5, nz * 1.5) * 0.5;
        elevation += noise.noise3d(nx * 3, ny * 3, nz * 3) * 0.25;
        elevation += noise.noise3d(nx * 6, ny * 6, nz * 6) * 0.125;
        elevation += noise.noise3d(nx * 12, ny * 12, nz * 12) * 0.0625;
        
        // Scale the elevation
        const displacement = elevation * maxHeight;
        
        // Store the height for coloring
        terrainHeight[i] = elevation;
        
        // Apply the displacement in the direction of the normal
        vertices.setX(i, x * (1 + displacement / radius));
        vertices.setY(i, y * (1 + displacement / radius));
        vertices.setZ(i, z * (1 + displacement / radius));
      }
      
      // Update normals
      geometry.computeVertexNormals();
      
      // Create color array for terrain
      const colors = new Float32Array(vertexCount * 3);
      
      // Define terrain colors with more variety
      const deepWater = new THREE.Color(0x0055aa);
      const shallowWater = new THREE.Color(0x00a9cc);
      const sand = new THREE.Color(0xdbc380);
      const grass = new THREE.Color(0x7caa2d);
      const forest = new THREE.Color(0x2d6a1e); // Added forest color
      const rock = new THREE.Color(0x8c8c8c);
      const darkRock = new THREE.Color(0x555555); // Added dark rock color
      const snow = new THREE.Color(0xffffff);
      
      // Water level threshold
      const waterLevel = -0.1;
      
      // Apply colors based on height with smoother transitions
      for (let i = 0; i < vertexCount; i++) {
        const height = terrainHeight[i];
        let color = new THREE.Color();
        
        if (height < waterLevel - 0.08) {
          // Deep water
          color.copy(deepWater);
        } else if (height < waterLevel - 0.02) {
          // Transition from deep to shallow water
          const t = (height - (waterLevel - 0.08)) / 0.06;
          color.lerpColors(deepWater, shallowWater, t);
        } else if (height < waterLevel) {
          // Shallow water
          color.copy(shallowWater);
        } else if (height < waterLevel + 0.03) {
          // Sand/beach
          color.copy(sand);
          
          // Add some grass clumps on beaches
          if (Math.random() < 0.05) {
            const pos = new THREE.Vector3(
              vertices.getX(i),
              vertices.getY(i),
              vertices.getZ(i)
            );
            grassPositions.push({
              position: pos,
              scale: 0.02 + Math.random() * 0.02,
              type: 'beach'
            });
          }
        } else if (height < waterLevel + 0.1) {
          // Transition from sand to grass
          const t = (height - (waterLevel + 0.03)) / 0.07;
          color.lerpColors(sand, grass, t);
          
          // Add some grass clumps in transition zone
          if (Math.random() < 0.07) {
            const pos = new THREE.Vector3(
              vertices.getX(i),
              vertices.getY(i),
              vertices.getZ(i)
            );
            grassPositions.push({
              position: pos,
              scale: 0.02 + Math.random() * 0.02,
              type: Math.random() > 0.5 ? 'beach' : 'plains'
            });
          }
        } else if (height < 0.15) {
          // Grass/plains
          color.copy(grass);
          
          // Add grass clumps in plains
          if (Math.random() < 0.1) {
            const pos = new THREE.Vector3(
              vertices.getX(i),
              vertices.getY(i),
              vertices.getZ(i)
            );
            grassPositions.push({
              position: pos,
              scale: 0.03 + Math.random() * 0.03,
              type: 'plains'
            });
          }
        } else if (height < 0.2) {
          // Transition from grass to forest
          const t = (height - 0.15) / 0.05;
          color.lerpColors(grass, forest, t);
          
          // Add small trees in transition zone
          if (Math.random() < 0.15) {
            const pos = new THREE.Vector3(
              vertices.getX(i),
              vertices.getY(i),
              vertices.getZ(i)
            );
            treePositions.push({
              position: pos,
              scale: 0.05 + Math.random() * 0.05,
              type: 'small'
            });
          }
        } else if (height < 0.3) {
          // Forest
          color.copy(forest);
          
          // Add trees in forest
          if (Math.random() < 0.2) {
            const pos = new THREE.Vector3(
              vertices.getX(i),
              vertices.getY(i),
              vertices.getZ(i)
            );
            treePositions.push({
              position: pos,
              scale: 0.08 + Math.random() * 0.07,
              type: 'normal'
            });
          }
        } else if (height < 0.35) {
          // Transition from forest to rock
          const t = (height - 0.3) / 0.05;
          color.lerpColors(forest, rock, t);
          
          // Add small rocks and sparse trees
          if (Math.random() < 0.1) {
            const pos = new THREE.Vector3(
              vertices.getX(i),
              vertices.getY(i),
              vertices.getZ(i)
            );
            if (Math.random() < 0.3) {
              treePositions.push({
                position: pos,
                scale: 0.06 + Math.random() * 0.04,
                type: 'pine'
              });
            } else {
              rockPositions.push({
                position: pos,
                scale: 0.05 + Math.random() * 0.05,
                type: 'small'
              });
            }
          }
        } else if (height < 0.45) {
          // Rock/mountains
          color.copy(rock);
          
          // Add rocks in mountains
          if (Math.random() < 0.15) {
            const pos = new THREE.Vector3(
              vertices.getX(i),
              vertices.getY(i),
              vertices.getZ(i)
            );
            rockPositions.push({
              position: pos,
              scale: 0.07 + Math.random() * 0.08,
              type: 'medium'
            });
          }
        } else if (height < 0.5) {
          // Transition from rock to dark rock
          const t = (height - 0.45) / 0.05;
          color.lerpColors(rock, darkRock, t);
          
          // Add large rocks
          if (Math.random() < 0.1) {
            const pos = new THREE.Vector3(
              vertices.getX(i),
              vertices.getY(i),
              vertices.getZ(i)
            );
            rockPositions.push({
              position: pos,
              scale: 0.1 + Math.random() * 0.1,
              type: 'large'
            });
          }
        } else if (height < 0.55) {
          // Dark rock
          color.copy(darkRock);
        } else if (height < 0.6) {
          // Transition from dark rock to snow
          const t = (height - 0.55) / 0.05;
          color.lerpColors(darkRock, snow, t);
        } else {
          // Snow caps
          color.copy(snow);
        }
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }
      
      // Add colors to geometry
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      // Create material with vertex colors
      const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: true, // Important for low-poly look
        roughness: 0.8,
        metalness: 0.1
      });
      
      // Create the terrain mesh
      const terrain = new THREE.Mesh(geometry, material);
      terrain.castShadow = true;
      terrain.receiveShadow = true;
      planetGroup.add(terrain);
      
      // Add nature assets
      this.addNatureAssets(planetGroup, treePositions, rockPositions, grassPositions);
      
      // Create higher detail water sphere
      const waterGeometry = new THREE.IcosahedronGeometry(radius * 0.99, 3); // Increased detail level
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
        if (elevation > waterLevel) {
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
      this.waterLevel = waterLevel;
      this.waterTime = 0;
      
      // Add atmosphere glow
      const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.1, 32, 32);
      const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x88aaff,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide
      });
      
      const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      planetGroup.add(atmosphere);
      this.atmosphere = atmosphere; // Store for animation
      
      // Add clouds
      this.createClouds(planetGroup, radius * 1.05);
      
      // Add the planet to the scene
      scene.add(planetGroup);
      
      // Store reference to the planet
      this.planet = planetGroup;
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
      this.planet = null;
    },
    
    addNatureAssets(planetGroup, treePositions, rockPositions, grassPositions) {
      // Create tree meshes
      this.createTrees(planetGroup, treePositions);
      
      // Create rock meshes
      this.createRocks(planetGroup, rockPositions);
      
      // Create grass meshes
      this.createGrass(planetGroup, grassPositions);
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
      
      // Create tree materials
      const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
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
          case 'small':
          default:
            treeMesh = this.createTreeInstance(smallTreeGeometry, trunkMaterial, leafMaterial);
            break;
        }
        
        // Position and scale the tree
        const pos = treeData.position.clone().normalize();
        const scale = treeData.scale;
        
        // Calculate the up direction (normal to the planet surface)
        const up = pos.clone().normalize();
        
        // Position the tree on the surface
        const treePos = pos.multiplyScalar(4 + scale * 2); // Adjust based on planet radius
        treeMesh.position.copy(treePos);
        
        // Orient the tree to stand on the planet surface
        treeMesh.lookAt(new THREE.Vector3(0, 0, 0));
        treeMesh.rotateX(Math.PI / 2); // Adjust rotation to point away from center
        
        // Scale the tree
        treeMesh.scale.set(scale, scale, scale);
        
        // Add random rotation around the up axis
        treeMesh.rotateOnAxis(up, Math.random() * Math.PI * 2);
        
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
      
      // Create rock instances
      rockPositions.forEach(rockData => {
        let rockGeometry;
        let material = Math.random() > 0.5 ? rockMaterial : darkRockMaterial;
        
        switch(rockData.type) {
          case 'large':
            rockGeometry = largeRockGeometry;
            break;
          case 'medium':
            rockGeometry = mediumRockGeometry;
            break;
          case 'small':
          default:
            rockGeometry = smallRockGeometry;
            break;
        }
        
        const rockMesh = new THREE.Mesh(rockGeometry, material);
        rockMesh.castShadow = true;
        rockMesh.receiveShadow = true;
        
        // Position and scale the rock
        const pos = rockData.position.clone().normalize();
        const scale = rockData.scale;
        
        // Position the rock on the surface
        const rockPos = pos.multiplyScalar(4 + scale * 0.5); // Adjust based on planet radius
        rockMesh.position.copy(rockPos);
        
        // Orient the rock to lie on the planet surface
        rockMesh.lookAt(new THREE.Vector3(0, 0, 0));
        rockMesh.rotateX(Math.PI / 2); // Adjust rotation to point away from center
        
        // Add random rotation for variety
        rockMesh.rotation.z = Math.random() * Math.PI * 2;
        
        // Scale the rock
        rockMesh.scale.set(scale, scale, scale);
        
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
        const displacement = (Math.random() - 0.5) * 0.3;
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
        
        // Position and scale the grass
        const pos = grassData.position.clone().normalize();
        const scale = grassData.scale;
        
        // Position the grass on the surface
        const grassPos = pos.multiplyScalar(4 + scale * 0.2); // Adjust based on planet radius
        grassMesh.position.copy(grassPos);
        
        // Orient the grass to stand on the planet surface
        grassMesh.lookAt(new THREE.Vector3(0, 0, 0));
        grassMesh.rotateX(Math.PI / 2); // Adjust rotation to point away from center
        
        // Add random rotation for variety
        grassMesh.rotation.z = Math.random() * Math.PI * 2;
        
        // Scale the grass
        grassMesh.scale.set(scale, scale, scale);
        
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
    }
  };
} 