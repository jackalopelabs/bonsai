import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Jackalope 3D Game
 * A simple Three.js game where a jackalope collects carrots while avoiding obstacles
 */
export default function jackalope3DGame() {
  return {
    // Game state
    score: 0,
    isPaused: false,
    showInstructions: true,
    gameOver: false,
    
    // Three.js objects
    scene: null,
    camera: null,
    renderer: null,
    clock: null,
    mixer: null,
    
    // Game objects
    player: null,
    carrots: [],
    obstacles: [],
    ground: null,
    
    // Game settings
    playerSpeed: 0.1,
    carrotSpawnRate: 3000, // ms
    obstacleSpawnRate: 5000, // ms
    lastCarrotSpawn: 0,
    lastObstacleSpawn: 0,
    
    // Input state
    keys: {
      forward: false,
      backward: false,
      left: false,
      right: false,
    },
    
    /**
     * Initialize the game
     */
    initGame() {
      // Setup Three.js scene
      this.setupScene();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Start animation loop
      this.animate();
    },
    
    /**
     * Setup the Three.js scene
     */
    setupScene() {
      const canvas = this.$refs.gameCanvas;
      
      // Create scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
      
      // Create camera
      this.camera = new THREE.PerspectiveCamera(
        75, 
        canvas.clientWidth / canvas.clientHeight, 
        0.1, 
        1000
      );
      this.camera.position.set(0, 5, 10);
      this.camera.lookAt(0, 0, 0);
      
      // Create renderer
      this.renderer = new THREE.WebGLRenderer({ 
        canvas,
        antialias: true 
      });
      this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.shadowMap.enabled = true;
      
      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 10, 7.5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      this.scene.add(directionalLight);
      
      // Create ground
      const groundGeometry = new THREE.PlaneGeometry(50, 50);
      const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x7CFC00,
        roughness: 0.8,
      });
      this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
      this.ground.rotation.x = -Math.PI / 2;
      this.ground.receiveShadow = true;
      this.scene.add(this.ground);
      
      // Create player (temporary box until model is loaded)
      const playerGeometry = new THREE.BoxGeometry(1, 1, 2);
      const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x964B00 });
      this.player = new THREE.Mesh(playerGeometry, playerMaterial);
      this.player.position.y = 0.5;
      this.player.castShadow = true;
      this.scene.add(this.player);
      
      // Load jackalope model (replace the box when loaded)
      this.loadJackalopeModel();
      
      // Initialize clock for animations
      this.clock = new THREE.Clock();
      
      // Handle window resize
      window.addEventListener('resize', () => this.onWindowResize());
    },
    
    /**
     * Load the jackalope 3D model
     */
    loadJackalopeModel() {
      // In a real implementation, you would load a GLTF model
      // For now, we'll create a simple jackalope-like shape
      
      const body = new THREE.Group();
      
      // Body
      const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
      const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x964B00 });
      const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
      bodyMesh.rotation.x = Math.PI / 2;
      bodyMesh.castShadow = true;
      body.add(bodyMesh);
      
      // Head
      const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
      const headMaterial = new THREE.MeshStandardMaterial({ color: 0x964B00 });
      const headMesh = new THREE.Mesh(headGeometry, headMaterial);
      headMesh.position.set(0, 0, -0.8);
      headMesh.castShadow = true;
      body.add(headMesh);
      
      // Ears
      const earGeometry = new THREE.ConeGeometry(0.15, 0.5, 16);
      const earMaterial = new THREE.MeshStandardMaterial({ color: 0x964B00 });
      
      const leftEar = new THREE.Mesh(earGeometry, earMaterial);
      leftEar.position.set(-0.2, 0.3, -0.8);
      leftEar.castShadow = true;
      body.add(leftEar);
      
      const rightEar = new THREE.Mesh(earGeometry, earMaterial);
      rightEar.position.set(0.2, 0.3, -0.8);
      rightEar.castShadow = true;
      body.add(rightEar);
      
      // Antlers
      const antlerGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
      const antlerMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      
      const leftAntler = new THREE.Mesh(antlerGeometry, antlerMaterial);
      leftAntler.position.set(-0.2, 0.6, -0.7);
      leftAntler.rotation.x = -Math.PI / 4;
      leftAntler.rotation.z = -Math.PI / 8;
      leftAntler.castShadow = true;
      body.add(leftAntler);
      
      const rightAntler = new THREE.Mesh(antlerGeometry, antlerMaterial);
      rightAntler.position.set(0.2, 0.6, -0.7);
      rightAntler.rotation.x = -Math.PI / 4;
      rightAntler.rotation.z = Math.PI / 8;
      rightAntler.castShadow = true;
      body.add(rightAntler);
      
      // Legs
      const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8);
      const legMaterial = new THREE.MeshStandardMaterial({ color: 0x964B00 });
      
      const positions = [
        [-0.3, -0.5, 0.3],  // Front left
        [0.3, -0.5, 0.3],   // Front right
        [-0.3, -0.5, -0.3], // Back left
        [0.3, -0.5, -0.3],  // Back right
      ];
      
      positions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(...pos);
        leg.castShadow = true;
        body.add(leg);
      });
      
      // Replace the placeholder box with our jackalope model
      this.scene.remove(this.player);
      this.player = body;
      this.player.position.y = 0.8;
      this.scene.add(this.player);
    },
    
    /**
     * Setup event listeners for keyboard input
     */
    setupEventListeners() {
      // Keyboard events
      window.addEventListener('keydown', (e) => this.handleKeyDown(e));
      window.addEventListener('keyup', (e) => this.handleKeyUp(e));
      
      // Handle visibility change (pause when tab is not active)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && !this.isPaused && !this.showInstructions) {
          this.isPaused = true;
        }
      });
    },
    
    /**
     * Handle key down events
     */
    handleKeyDown(event) {
      if (this.showInstructions || this.gameOver) return;
      
      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          this.keys.forward = true;
          break;
        case 's':
        case 'arrowdown':
          this.keys.backward = true;
          break;
        case 'a':
        case 'arrowleft':
          this.keys.left = true;
          break;
        case 'd':
        case 'arrowright':
          this.keys.right = true;
          break;
        case 'p':
        case 'escape':
          this.togglePause();
          break;
      }
    },
    
    /**
     * Handle key up events
     */
    handleKeyUp(event) {
      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          this.keys.forward = false;
          break;
        case 's':
        case 'arrowdown':
          this.keys.backward = false;
          break;
        case 'a':
        case 'arrowleft':
          this.keys.left = false;
          break;
        case 'd':
        case 'arrowright':
          this.keys.right = false;
          break;
      }
    },
    
    /**
     * Start the game
     */
    startGame() {
      this.showInstructions = false;
      this.isPaused = false;
      this.gameOver = false;
      this.score = 0;
      
      // Clear existing game objects
      this.clearGameObjects();
      
      // Reset player position
      this.player.position.set(0, 0.8, 0);
      this.player.rotation.y = 0;
      
      // Reset timers
      this.lastCarrotSpawn = this.clock.getElapsedTime() * 1000;
      this.lastObstacleSpawn = this.clock.getElapsedTime() * 1000;
    },
    
    /**
     * Toggle pause state
     */
    togglePause() {
      if (this.showInstructions || this.gameOver) return;
      this.isPaused = !this.isPaused;
    },
    
    /**
     * Reset the game
     */
    resetGame() {
      this.showInstructions = true;
      this.isPaused = true;
      this.gameOver = false;
      this.score = 0;
      
      // Clear existing game objects
      this.clearGameObjects();
      
      // Reset player position
      this.player.position.set(0, 0.8, 0);
      this.player.rotation.y = 0;
    },
    
    /**
     * Clear all game objects (carrots and obstacles)
     */
    clearGameObjects() {
      // Remove all carrots
      this.carrots.forEach(carrot => {
        this.scene.remove(carrot);
      });
      this.carrots = [];
      
      // Remove all obstacles
      this.obstacles.forEach(obstacle => {
        this.scene.remove(obstacle);
      });
      this.obstacles = [];
    },
    
    /**
     * Handle window resize
     */
    onWindowResize() {
      const canvas = this.$refs.gameCanvas;
      
      // Update camera aspect ratio
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
      
      // Update renderer size
      this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    },
    
    /**
     * Spawn a carrot at a random position
     */
    spawnCarrot() {
      // Create carrot geometry
      const carrotGroup = new THREE.Group();
      
      // Carrot body
      const bodyGeometry = new THREE.ConeGeometry(0.2, 0.8, 8);
      const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xFF6347 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.rotation.x = Math.PI;
      body.position.y = 0.4;
      body.castShadow = true;
      carrotGroup.add(body);
      
      // Carrot leaves
      const leafGeometry = new THREE.ConeGeometry(0.1, 0.3, 8);
      const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
      
      for (let i = 0; i < 3; i++) {
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        leaf.position.set(
          Math.sin(i * Math.PI * 2 / 3) * 0.05,
          0.8,
          Math.cos(i * Math.PI * 2 / 3) * 0.05
        );
        leaf.rotation.x = -Math.PI / 6;
        leaf.rotation.z = i * Math.PI * 2 / 3;
        leaf.castShadow = true;
        carrotGroup.add(leaf);
      }
      
      // Position carrot randomly on the ground
      const x = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      carrotGroup.position.set(x, 0, z);
      
      // Add to scene and carrots array
      this.scene.add(carrotGroup);
      this.carrots.push(carrotGroup);
      
      // Update last spawn time
      this.lastCarrotSpawn = this.clock.getElapsedTime() * 1000;
    },
    
    /**
     * Spawn an obstacle at a random position
     */
    spawnObstacle() {
      // Create obstacle geometry (rock)
      const obstacleGeometry = new THREE.DodecahedronGeometry(0.8, 0);
      const obstacleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x808080,
        roughness: 0.9,
      });
      const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
      
      // Position obstacle randomly on the ground
      const x = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      obstacle.position.set(x, 0.8, z);
      
      // Random rotation for variety
      obstacle.rotation.y = Math.random() * Math.PI * 2;
      
      // Add to scene and obstacles array
      obstacle.castShadow = true;
      this.scene.add(obstacle);
      this.obstacles.push(obstacle);
      
      // Update last spawn time
      this.lastObstacleSpawn = this.clock.getElapsedTime() * 1000;
    },
    
    /**
     * Update player position based on input
     */
    updatePlayer(deltaTime) {
      if (this.isPaused || this.showInstructions || this.gameOver) return;
      
      // Calculate movement direction
      const moveX = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
      const moveZ = (this.keys.backward ? 1 : 0) - (this.keys.forward ? 1 : 0);
      
      if (moveX !== 0 || moveZ !== 0) {
        // Calculate movement angle
        const angle = Math.atan2(moveX, moveZ);
        
        // Rotate player to face movement direction
        this.player.rotation.y = angle;
        
        // Move player
        const speed = this.playerSpeed * deltaTime;
        this.player.position.x += Math.sin(angle) * speed;
        this.player.position.z += Math.cos(angle) * speed;
        
        // Keep player within bounds
        const boundaryLimit = 24;
        this.player.position.x = Math.max(-boundaryLimit, Math.min(boundaryLimit, this.player.position.x));
        this.player.position.z = Math.max(-boundaryLimit, Math.min(boundaryLimit, this.player.position.z));
      }
    },
    
    /**
     * Check for collisions between player and game objects
     */
    checkCollisions() {
      if (this.isPaused || this.showInstructions || this.gameOver) return;
      
      const playerPos = this.player.position.clone();
      const playerRadius = 0.8; // Approximate collision radius
      
      // Check carrot collisions
      for (let i = this.carrots.length - 1; i >= 0; i--) {
        const carrot = this.carrots[i];
        const carrotPos = carrot.position.clone();
        
        // Calculate distance (ignoring y-axis)
        carrotPos.y = playerPos.y;
        const distance = playerPos.distanceTo(carrotPos);
        
        // If collision detected
        if (distance < playerRadius + 0.4) {
          // Remove carrot
          this.scene.remove(carrot);
          this.carrots.splice(i, 1);
          
          // Increase score
          this.score += 10;
        }
      }
      
      // Check obstacle collisions
      for (let i = 0; i < this.obstacles.length; i++) {
        const obstacle = this.obstacles[i];
        const obstaclePos = obstacle.position.clone();
        
        // Calculate distance (ignoring y-axis)
        obstaclePos.y = playerPos.y;
        const distance = playerPos.distanceTo(obstaclePos);
        
        // If collision detected
        if (distance < playerRadius + 0.8) {
          // Game over
          this.gameOver = true;
          this.isPaused = true;
          
          // Show game over message
          setTimeout(() => {
            this.showInstructions = true;
          }, 1500);
          
          break;
        }
      }
    },
    
    /**
     * Main animation loop
     */
    animate() {
      requestAnimationFrame(() => this.animate());
      
      // Get delta time
      const deltaTime = this.clock.getDelta() * 1000; // ms
      
      // Update game logic if not paused
      if (!this.isPaused && !this.showInstructions) {
        // Spawn carrots
        const currentTime = this.clock.getElapsedTime() * 1000;
        if (currentTime - this.lastCarrotSpawn > this.carrotSpawnRate) {
          this.spawnCarrot();
        }
        
        // Spawn obstacles
        if (currentTime - this.lastObstacleSpawn > this.obstacleSpawnRate) {
          this.spawnObstacle();
        }
        
        // Update player position
        this.updatePlayer(deltaTime);
        
        // Check collisions
        this.checkCollisions();
      }
      
      // Update camera to follow player
      if (!this.showInstructions) {
        this.camera.position.x = this.player.position.x;
        this.camera.position.z = this.player.position.z + 10;
        this.camera.lookAt(this.player.position);
      }
      
      // Render scene
      this.renderer.render(this.scene, this.camera);
    }
  };
} 