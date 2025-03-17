import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';

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
      
      // Add lights
      const ambientLight = new THREE.AmbientLight(0x333333, 0.5);
      scene.add(ambientLight);
      
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
      
      // Create the land mass (low-poly terrain)
      const radius = 4;
      const detail = 2; // Lower for more low-poly look
      
      // Create base geometry
      const geometry = new THREE.IcosahedronGeometry(radius, detail);
      
      // Create noise for terrain generation
      const noise = new SimplexNoise();
      
      // Get vertices and modify them with noise
      const vertices = geometry.attributes.position;
      const vertexCount = vertices.count;
      
      // Arrays to store terrain data for coloring
      const terrainHeight = [];
      const maxHeight = radius * 0.2; // Maximum height variation
      
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
        elevation += noise.noise3d(nx * 1.5, ny * 1.5, nz * 1.5) * 0.5;
        elevation += noise.noise3d(nx * 3, ny * 3, nz * 3) * 0.25;
        elevation += noise.noise3d(nx * 6, ny * 6, nz * 6) * 0.125;
        
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
      
      // Define terrain colors
      const deepWater = new THREE.Color(0x0077be);
      const shallowWater = new THREE.Color(0x00a9cc);
      const sand = new THREE.Color(0xdbc380);
      const grass = new THREE.Color(0x7caa2d);
      const rock = new THREE.Color(0x8c8c8c);
      const snow = new THREE.Color(0xffffff);
      
      // Water level threshold
      const waterLevel = -0.1;
      
      // Apply colors based on height
      for (let i = 0; i < vertexCount; i++) {
        const height = terrainHeight[i];
        let color = new THREE.Color();
        
        if (height < waterLevel - 0.05) {
          // Deep water
          color.copy(deepWater);
        } else if (height < waterLevel) {
          // Shallow water
          color.copy(shallowWater);
        } else if (height < waterLevel + 0.05) {
          // Sand/beach
          color.copy(sand);
        } else if (height < 0.2) {
          // Grass/plains
          color.copy(grass);
        } else if (height < 0.4) {
          // Rock/mountains
          color.copy(rock);
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
      
      // Create water sphere
      const waterGeometry = new THREE.IcosahedronGeometry(radius * 0.99, 1);
      const waterMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x0077be,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.9,
        transparent: true,
        opacity: 0.7,
        clearcoat: 1.0,
        clearcoatRoughness: 0.2
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
      
      // Add the planet to the scene
      scene.add(planetGroup);
      
      // Store reference to the planet
      this.planet = planetGroup;
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
    }
  };
} 