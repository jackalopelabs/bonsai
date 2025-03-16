import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Jackalope 3D Game
 * A simple Three.js game where a jackalope collects carrots while avoiding obstacles
 */
export default function jackalope3DGame() {
  // Create a non-reactive game instance that won't be proxied by Alpine
  const game = createGameInstance();
  
  // Return the Alpine component with minimal reactive properties
  return {
    // Reactive state (these will be proxied by Alpine)
    score: 0,
    isPaused: false,
    showInstructions: true,
    gameOver: false,
    
    // Initialize the game
    initGame() {
      // Initialize the game with references to the reactive state
      game.init(this.$refs.gameCanvas, {
        onScoreChange: (newScore) => { this.score = newScore; },
        onPauseChange: (isPaused) => { this.isPaused = isPaused; },
        onInstructionsChange: (show) => { this.showInstructions = show; },
        onGameOverChange: (isOver) => { this.gameOver = isOver; }
      });
    },
    
    // Game control methods
    startGame() {
      game.start();
    },
    
    togglePause() {
      game.togglePause();
    },
    
    resetGame() {
      game.reset();
    },
    
    // Clean up resources when component is destroyed
    destroy() {
      game.destroy();
    }
  };
}

/**
 * Create a non-reactive game instance that won't be proxied by Alpine
 */
function createGameInstance() {
  // Game state
  let score = 0;
  let isPaused = false;
  let showInstructions = true;
  let gameOver = false;
  let callbacks = {};
  
  // Three.js objects
  let scene = null;
  let camera = null;
  let renderer = null;
  let clock = null;
  
  // Game objects
  let player = null;
  let carrots = [];
  let obstacles = [];
  let ground = null;
  
  // Game settings
  const playerSpeed = 0.1;
  const carrotSpawnRate = 3000; // ms
  const obstacleSpawnRate = 5000; // ms
  let lastCarrotSpawn = 0;
  let lastObstacleSpawn = 0;
  
  // Input state
  const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };
  
  // Animation frame ID for cancellation
  let animationFrameId = null;
  
  // Event handler references for cleanup
  let handleKeyDown = null;
  let handleKeyUp = null;
  let handleResize = null;
  
  /**
   * Initialize the game
   */
  function init(canvas, stateCallbacks) {
    callbacks = stateCallbacks;
    
    // Setup Three.js scene
    setupScene(canvas);
    
    // Setup event listeners
    setupEventListeners();
    
    // Start animation loop
    animate();
  }
  
  /**
   * Setup the Three.js scene
   */
  function setupScene(canvas) {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    
    // Create camera
    camera = new THREE.PerspectiveCamera(
      75, 
      canvas.clientWidth / canvas.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ 
      canvas,
      antialias: true,
      alpha: true
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);
    
    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x7CFC00,
      roughness: 0.8,
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Create player (temporary box until model is loaded)
    const playerGeometry = new THREE.BoxGeometry(1, 1, 2);
    const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x964B00 });
    player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.y = 0.5;
    player.castShadow = true;
    scene.add(player);
    
    // Load jackalope model (replace the box when loaded)
    loadJackalopeModel();
    
    // Initialize clock for animations
    clock = new THREE.Clock();
    
    // Handle window resize
    handleResize = () => onWindowResize(canvas);
    window.addEventListener('resize', handleResize);
    
    // Force initial resize to ensure correct dimensions
    setTimeout(() => {
      onWindowResize(canvas);
    }, 100);
  }
  
  /**
   * Load the jackalope 3D model
   */
  function loadJackalopeModel() {
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
    scene.remove(player);
    player = body;
    player.position.y = 0.8;
    scene.add(player);
  }
  
  /**
   * Setup event listeners for keyboard input
   */
  function setupEventListeners() {
    // Keyboard events
    handleKeyDown = (event) => {
      if (showInstructions || gameOver) return;
      
      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          keys.forward = true;
          break;
        case 's':
        case 'arrowdown':
          keys.backward = true;
          break;
        case 'a':
        case 'arrowleft':
          keys.left = true;
          break;
        case 'd':
        case 'arrowright':
          keys.right = true;
          break;
        case 'p':
        case 'escape':
          togglePause();
          break;
      }
    };
    
    handleKeyUp = (event) => {
      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          keys.forward = false;
          break;
        case 's':
        case 'arrowdown':
          keys.backward = false;
          break;
        case 'a':
        case 'arrowleft':
          keys.left = false;
          break;
        case 'd':
        case 'arrowright':
          keys.right = false;
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Handle visibility change (pause when tab is not active)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !isPaused && !showInstructions) {
        setIsPaused(true);
      }
    });
  }
  
  /**
   * Start the game
   */
  function start() {
    setShowInstructions(false);
    setIsPaused(false);
    setGameOver(false);
    setScore(0);
    
    // Clear existing game objects
    clearGameObjects();
    
    // Reset player position
    player.position.set(0, 0.8, 0);
    player.rotation.y = 0;
    
    // Reset timers
    lastCarrotSpawn = clock.getElapsedTime() * 1000;
    lastObstacleSpawn = clock.getElapsedTime() * 1000;
  }
  
  /**
   * Toggle pause state
   */
  function togglePause() {
    if (showInstructions || gameOver) return;
    setIsPaused(!isPaused);
  }
  
  /**
   * Reset the game
   */
  function reset() {
    setShowInstructions(true);
    setIsPaused(true);
    setGameOver(false);
    setScore(0);
    
    // Clear existing game objects
    clearGameObjects();
    
    // Reset player position
    player.position.set(0, 0.8, 0);
    player.rotation.y = 0;
  }
  
  /**
   * Clear all game objects (carrots and obstacles)
   */
  function clearGameObjects() {
    // Remove all carrots
    for (let i = carrots.length - 1; i >= 0; i--) {
      scene.remove(carrots[i]);
    }
    carrots = [];
    
    // Remove all obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      scene.remove(obstacles[i]);
    }
    obstacles = [];
  }
  
  /**
   * Handle window resize
   */
  function onWindowResize(canvas) {
    if (!canvas || !camera || !renderer) return;
    
    // Update camera aspect ratio
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    
    // Update renderer size
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }
  
  /**
   * Spawn a carrot at a random position
   */
  function spawnCarrot() {
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
    scene.add(carrotGroup);
    carrots.push(carrotGroup);
    
    // Update last spawn time
    lastCarrotSpawn = clock.getElapsedTime() * 1000;
  }
  
  /**
   * Spawn an obstacle at a random position
   */
  function spawnObstacle() {
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
    scene.add(obstacle);
    obstacles.push(obstacle);
    
    // Update last spawn time
    lastObstacleSpawn = clock.getElapsedTime() * 1000;
  }
  
  /**
   * Update player position based on input
   */
  function updatePlayer(deltaTime) {
    if (isPaused || showInstructions || gameOver) return;
    
    // Calculate movement direction
    const moveX = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    const moveZ = (keys.backward ? 1 : 0) - (keys.forward ? 1 : 0);
    
    if (moveX !== 0 || moveZ !== 0) {
      // Calculate movement angle
      const angle = Math.atan2(moveX, moveZ);
      
      // Rotate player to face movement direction
      player.rotation.y = angle;
      
      // Move player
      const speed = playerSpeed * deltaTime;
      player.position.x += Math.sin(angle) * speed;
      player.position.z += Math.cos(angle) * speed;
      
      // Keep player within bounds
      const boundaryLimit = 24;
      player.position.x = Math.max(-boundaryLimit, Math.min(boundaryLimit, player.position.x));
      player.position.z = Math.max(-boundaryLimit, Math.min(boundaryLimit, player.position.z));
    }
  }
  
  /**
   * Check for collisions between player and game objects
   */
  function checkCollisions() {
    if (isPaused || showInstructions || gameOver) return;
    
    const playerPos = new THREE.Vector3().copy(player.position);
    const playerRadius = 0.8; // Approximate collision radius
    
    // Check carrot collisions
    for (let i = carrots.length - 1; i >= 0; i--) {
      const carrot = carrots[i];
      const carrotPos = new THREE.Vector3().copy(carrot.position);
      
      // Calculate distance (ignoring y-axis)
      carrotPos.y = playerPos.y;
      const distance = playerPos.distanceTo(carrotPos);
      
      // If collision detected
      if (distance < playerRadius + 0.4) {
        // Remove carrot
        scene.remove(carrot);
        carrots.splice(i, 1);
        
        // Increase score
        setScore(score + 10);
      }
    }
    
    // Check obstacle collisions
    for (let i = 0; i < obstacles.length; i++) {
      const obstacle = obstacles[i];
      const obstaclePos = new THREE.Vector3().copy(obstacle.position);
      
      // Calculate distance (ignoring y-axis)
      obstaclePos.y = playerPos.y;
      const distance = playerPos.distanceTo(obstaclePos);
      
      // If collision detected
      if (distance < playerRadius + 0.8) {
        // Game over
        setGameOver(true);
        setIsPaused(true);
        
        // Show game over message
        setTimeout(() => {
          setShowInstructions(true);
        }, 1500);
        
        break;
      }
    }
  }
  
  /**
   * Main animation loop
   */
  function animate() {
    // Request next frame
    animationFrameId = requestAnimationFrame(animate);
    
    // Skip rendering if elements aren't ready
    if (!scene || !camera || !renderer || !clock) return;
    
    try {
      // Get delta time
      const deltaTime = clock.getDelta() * 1000; // ms
      
      // Update game logic if not paused
      if (!isPaused && !showInstructions) {
        // Spawn carrots
        const currentTime = clock.getElapsedTime() * 1000;
        if (currentTime - lastCarrotSpawn > carrotSpawnRate) {
          spawnCarrot();
        }
        
        // Spawn obstacles
        if (currentTime - lastObstacleSpawn > obstacleSpawnRate) {
          spawnObstacle();
        }
        
        // Update player position
        updatePlayer(deltaTime);
        
        // Check collisions
        checkCollisions();
      }
      
      // Update camera to follow player
      if (!showInstructions && player) {
        camera.position.x = player.position.x;
        camera.position.z = player.position.z + 10;
        camera.lookAt(player.position);
      }
      
      // Render scene
      renderer.render(scene, camera);
    } catch (error) {
      console.error('Error in animation loop:', error);
    }
  }
  
  /**
   * Clean up resources when component is destroyed
   */
  function destroy() {
    // Cancel animation frame
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    
    // Remove event listeners
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    
    // Dispose of Three.js resources
    if (renderer) {
      renderer.dispose();
    }
    
    // Clear references
    scene = null;
    camera = null;
    renderer = null;
    clock = null;
    player = null;
    carrots = [];
    obstacles = [];
    ground = null;
  }
  
  // State update helpers with callbacks
  function setScore(newScore) {
    score = newScore;
    if (callbacks.onScoreChange) {
      callbacks.onScoreChange(score);
    }
  }
  
  function setIsPaused(newIsPaused) {
    isPaused = newIsPaused;
    if (callbacks.onPauseChange) {
      callbacks.onPauseChange(isPaused);
    }
  }
  
  function setShowInstructions(newShowInstructions) {
    showInstructions = newShowInstructions;
    if (callbacks.onInstructionsChange) {
      callbacks.onInstructionsChange(showInstructions);
    }
  }
  
  function setGameOver(newGameOver) {
    gameOver = newGameOver;
    if (callbacks.onGameOverChange) {
      callbacks.onGameOverChange(gameOver);
    }
  }
  
  // Return public API
  return {
    init,
    start,
    togglePause,
    reset,
    destroy
  };
} 