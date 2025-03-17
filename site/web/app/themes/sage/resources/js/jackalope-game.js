import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Jackalope 3D Game
 * A simple Three.js game where a jackalope collects carrots while avoiding obstacles
 */
export default function jackalope3DGame() {
  const game = createGameInstance();
  
  return {
    score: 0,
    isPaused: false,
    showInstructions: true,
    gameOver: false,
    isFullscreen: false,
    
    initGame() {
      game.init(this.$refs.gameCanvas, {
        onScoreChange: (newScore) => { this.score = newScore; },
        onPauseChange: (isPaused) => { this.isPaused = isPaused; },
        onInstructionsChange: (show) => { this.showInstructions = show; },
        onGameOverChange: (isOver) => { this.gameOver = isOver; },
        onFullscreenChange: (isFullscreen) => { this.isFullscreen = isFullscreen; }
      });
    },
    
    startGame() {
      game.start();
    },
    
    togglePause() {
      game.togglePause();
    },
    
    resetGame() {
      game.reset();
    },
    
    toggleFullscreen() {
      game.toggleFullscreen();
    },
    
    destroy() {
      game.destroy();
    }
  };
}

function createGameInstance() {
  let score = 0;
  let isPaused = false;
  let showInstructions = true;
  let gameOver = false;
  let isFullscreen = false;
  let callbacks = {};
  
  let scene = null;
  let camera = null;
  let renderer = null;
  let clock = null;
  
  let player = null;
  let carrots = [];
  let obstacles = [];
  let platforms = []; // Array to store platforms
  let ground = null;
  
  // DOM elements
  let canvas = null;
  let gameContainer = null;
  
  // Game settings - reduced speed for better control
  const playerSpeed = 0.05;
  const carrotSpawnRate = 3000; // ms
  const obstacleSpawnRate = 5000; // ms
  const platformCount = 8; // Number of platforms to create
  let lastCarrotSpawn = 0;
  let lastObstacleSpawn = 0;
  
  const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false
  };
  
  let animationFrameId = null;
  let handleKeyDown = null;
  let handleKeyUp = null;
  let handleResize = null;
  let handleFullscreenChange = null;
  
  // Bouncing animation state
  let velocityY = 0;
  let positionY = 0;
  const gravity = -0.03; // Reduced gravity for smoother jumps
  const bounceFactor = 0.5; // Reduced bounce for more control
  let isMoving = false; // Track if player is moving to trigger bounce
  
  // Jumping state
  let isJumping = false;
  const jumpForce = 0.4; // Increased from 0.2 for higher jumps
  const jumpCooldown = 500; // ms - reduced cooldown for more responsive jumps
  let lastJumpTime = 0;
  
  function init(canvasElement, stateCallbacks) {
    canvas = canvasElement;
    gameContainer = canvas.closest('.jackalope-game-container');
    callbacks = stateCallbacks;
    setupScene(canvas);
    setupEventListeners();
    animate();
  }
  
  function setupScene(canvas) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    
    camera = new THREE.PerspectiveCamera(
      75, 
      canvas.clientWidth / canvas.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    
    renderer = new THREE.WebGLRenderer({ 
      canvas,
      antialias: true,
      alpha: true
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);
    
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x7CFC00,
      roughness: 0.8,
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Create platforms
    createPlatforms();
    
    // Create the bouncing rabbit as the player
    createBouncingRabbit();
    
    clock = new THREE.Clock();
    
    handleResize = () => onWindowResize();
    window.addEventListener('resize', handleResize);
    
    setTimeout(() => {
      onWindowResize();
    }, 100);
  }
  
  function createPlatforms() {
    // Clear existing platforms
    for (let i = platforms.length - 1; i >= 0; i--) {
      scene.remove(platforms[i]);
    }
    platforms = [];
    
    // Create new platforms
    for (let i = 0; i < platformCount; i++) {
      // Create a low-poly platform
      const platformGroup = new THREE.Group();
      
      // Random size for variety but not too large
      const width = 2 + Math.random() * 2;
      const depth = 2 + Math.random() * 2;
      const height = 0.5 + Math.random() * 1.5;
      
      // Create the main platform shape
      const platformGeometry = new THREE.BoxGeometry(width, height, depth);
      
      // Use a brown/gray color palette for rocks
      const colorValue = 0.3 + Math.random() * 0.2;
      const platformMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(
          colorValue + Math.random() * 0.1,
          colorValue * (0.8 + Math.random() * 0.2),
          colorValue * (0.7 + Math.random() * 0.2)
        ),
        roughness: 0.8 + Math.random() * 0.2,
        flatShading: true
      });
      
      const platform = new THREE.Mesh(platformGeometry, platformMaterial);
      
      // Make it look more like a rock by randomly displacing vertices
      const positionAttribute = platform.geometry.getAttribute('position');
      
      for (let j = 0; j < positionAttribute.count; j++) {
        // Don't modify the bottom vertices to keep it flat for standing
        if (positionAttribute.getY(j) > -height/2 + 0.1) {
          // Add some random displacement to vertices for a more natural look
          positionAttribute.setX(j, positionAttribute.getX(j) + (Math.random() - 0.5) * 0.2);
          
          // Only displace the top vertices on Y axis
          if (positionAttribute.getY(j) > height/2 - 0.2) {
            positionAttribute.setY(j, positionAttribute.getY(j) + (Math.random() - 0.5) * 0.3);
          }
          
          positionAttribute.setZ(j, positionAttribute.getZ(j) + (Math.random() - 0.5) * 0.2);
        }
      }
      
      platform.geometry.computeVertexNormals();
      platform.castShadow = true;
      platform.receiveShadow = true;
      
      // Position the platform randomly in the scene but closer to the center and player
      const x = (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 15;
      
      // Vary the height of platforms
      const y = height / 2;
      
      platformGroup.position.set(x, y, z);
      
      // Add some random rotation for variety, but keep the top flat
      platformGroup.rotation.y = Math.random() * Math.PI * 2;
      
      // Store platform data for collision detection
      platformGroup.userData = {
        width: width,
        depth: depth,
        height: height
      };
      
      // Add a collision box for debugging (visible in development)
      const boxHelper = new THREE.BoxHelper(platform, 0xff0000);
      platformGroup.add(boxHelper);
      
      scene.add(platformGroup);
      platformGroup.add(platform);
      platforms.push(platformGroup);
    }
  }
  
  function createBouncingRabbit() {
    // Create the rabbit group
    player = new THREE.Group();
    
    // Body (low-poly elongated sphere)
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1, 6);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x964B00 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    player.add(body);
    
    // Head (smaller sphere)
    const headGeometry = new THREE.SphereGeometry(0.3, 6, 6);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0, 1.1, 0.3);
    head.castShadow = true;
    player.add(head);
    
    // Ears (two thin boxes)
    const earGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.05, 1, 1, 1);
    const ear1 = new THREE.Mesh(earGeometry, bodyMaterial);
    const ear2 = new THREE.Mesh(earGeometry, bodyMaterial);
    ear1.position.set(-0.15, 1.5, 0.3);
    ear2.position.set(0.15, 1.5, 0.3);
    ear1.rotation.z = -0.2;
    ear2.rotation.z = 0.2;
    ear1.castShadow = true;
    ear2.castShadow = true;
    player.add(ear1);
    player.add(ear2);
    
    // Legs (four small cylinders)
    const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 4);
    const leg1 = new THREE.Mesh(legGeometry, bodyMaterial);
    const leg2 = new THREE.Mesh(legGeometry, bodyMaterial);
    const leg3 = new THREE.Mesh(legGeometry, bodyMaterial);
    const leg4 = new THREE.Mesh(legGeometry, bodyMaterial);
    leg1.position.set(-0.25, 0.15, -0.25);
    leg2.position.set(0.25, 0.15, -0.25);
    leg3.position.set(-0.25, 0.15, 0.25);
    leg4.position.set(0.25, 0.15, 0.25);
    leg1.castShadow = true;
    leg2.castShadow = true;
    leg3.castShadow = true;
    leg4.castShadow = true;
    player.add(leg1);
    player.add(leg2);
    player.add(leg3);
    player.add(leg4);
    
    // Initial position
    player.position.y = 0.8;
    scene.add(player);
  }
  
  function setupEventListeners() {
    // Prevent spacebar from scrolling the page
    const preventSpacebarScroll = (e) => {
      if (e.key === ' ' && !showInstructions && !gameOver) {
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', preventSpacebarScroll);
    
    // Game controls
    handleKeyDown = (event) => {
      if (showInstructions || gameOver) return;
      
      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          keys.forward = true;
          event.preventDefault();
          break;
        case 's':
        case 'arrowdown':
          keys.backward = true;
          event.preventDefault();
          break;
        case 'a':
        case 'arrowleft':
          keys.left = true;
          event.preventDefault();
          break;
        case 'd':
        case 'arrowright':
          keys.right = true;
          event.preventDefault();
          break;
        case ' ': // Spacebar
          keys.jump = true;
          event.preventDefault();
          jump();
          break;
        case 'p':
        case 'escape':
          togglePause();
          event.preventDefault();
          break;
        case 'f':
          toggleFullscreen();
          event.preventDefault();
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
        case ' ': // Spacebar
          keys.jump = false;
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Handle fullscreen change
    handleFullscreenChange = () => {
      isFullscreen = !!document.fullscreenElement;
      
      if (isFullscreen && gameContainer) {
        // Apply fullscreen styles to container
        gameContainer.style.width = '100%';
        gameContainer.style.height = '100%';
        
        // Apply fullscreen styles to canvas
        if (canvas) {
          canvas.style.width = '100%';
          canvas.style.height = '100%';
        }
      } else {
        // Reset container styles
        if (gameContainer) {
          gameContainer.style.width = '';
          gameContainer.style.height = '';
        }
        
        // Reset canvas styles
        if (canvas) {
          canvas.style.width = '';
          canvas.style.height = '';
        }
      }
      
      // Force resize to update renderer
      setTimeout(() => {
        onWindowResize();
      }, 100);
      
      if (callbacks.onFullscreenChange) {
        callbacks.onFullscreenChange(isFullscreen);
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !isPaused && !showInstructions) {
        setIsPaused(true);
      }
    });
  }
  
  function toggleFullscreen() {
    if (!gameContainer) return;
    
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (gameContainer.requestFullscreen) {
        gameContainer.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
  
  function jump() {
    if (isPaused || showInstructions || gameOver) return;
    
    const currentTime = clock.getElapsedTime() * 1000;
    
    // Check if player is on ground or on a platform
    const playerPos = new THREE.Vector3().copy(player.position);
    let canJump = positionY < 0.1; // On ground
    
    // Check if on a platform
    if (!canJump) {
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i];
        const platformPos = platform.position.clone();
        const platformData = platform.userData;
        
        // Calculate platform boundaries
        const halfWidth = platformData.width / 2;
        const halfDepth = platformData.depth / 2;
        const platformTop = platformPos.y + platformData.height / 2;
        
        // Check if player is on this platform
        if (Math.abs(playerPos.x - platformPos.x) < halfWidth + 0.3 && 
            Math.abs(playerPos.z - platformPos.z) < halfDepth + 0.3 &&
            Math.abs(playerPos.y - (platformTop + 0.8)) < 0.2) {
          canJump = true;
          break;
        }
      }
    }
    
    // Only allow jumping if on ground/platform and cooldown has passed
    if (canJump && currentTime - lastJumpTime > jumpCooldown) {
      velocityY = jumpForce;
      isJumping = true;
      lastJumpTime = currentTime;
      
      // Squash and stretch effect - prepare for jump
      player.scale.y = 0.7;
      player.scale.x = 1.2;
      player.scale.z = 1.2;
      
      // After a short delay, stretch for the jump
      setTimeout(() => {
        if (player) {
          player.scale.y = 1.3;
          player.scale.x = 0.8;
          player.scale.z = 0.8;
        }
      }, 100);
    }
  }
  
  function start() {
    setShowInstructions(false);
    setIsPaused(false);
    setGameOver(false);
    setScore(0);
    clearGameObjects();
    createPlatforms(); // Recreate platforms on game start
    player.position.set(0, 0.8, 0);
    player.rotation.y = 0;
    positionY = 0; // Reset bouncing position
    velocityY = 0;
    isJumping = false;
    lastJumpTime = 0;
    lastCarrotSpawn = clock.getElapsedTime() * 1000;
    lastObstacleSpawn = clock.getElapsedTime() * 1000;
    
    // Focus the canvas to ensure keyboard events work
    if (canvas) {
      canvas.focus();
    }
  }
  
  function togglePause() {
    if (showInstructions || gameOver) return;
    setIsPaused(!isPaused);
  }
  
  function reset() {
    setShowInstructions(true);
    setIsPaused(true);
    setGameOver(false);
    setScore(0);
    clearGameObjects();
    createPlatforms(); // Recreate platforms on reset
    player.position.set(0, 0.8, 0);
    player.rotation.y = 0;
    positionY = 0;
    velocityY = 0;
    isJumping = false;
  }
  
  function clearGameObjects() {
    for (let i = carrots.length - 1; i >= 0; i--) {
      scene.remove(carrots[i]);
    }
    carrots = [];
    for (let i = obstacles.length - 1; i >= 0; i--) {
      scene.remove(obstacles[i]);
    }
    obstacles = [];
  }
  
  function onWindowResize() {
    if (!canvas || !camera || !renderer) return;
    
    // Get the current dimensions
    let width, height;
    
    if (isFullscreen) {
      // In fullscreen, use the window dimensions
      width = window.innerWidth;
      height = window.innerHeight;
    } else {
      // Otherwise use the container dimensions
      width = canvas.clientWidth;
      height = canvas.clientHeight;
    }
    
    // Update camera aspect ratio
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    // Update renderer size
    renderer.setSize(width, height, false);
  }
  
  function spawnCarrot() {
    const carrotGroup = new THREE.Group();
    const bodyGeometry = new THREE.ConeGeometry(0.2, 0.8, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xFF6347 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI;
    body.position.y = 0.4;
    body.castShadow = true;
    carrotGroup.add(body);
    
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
    
    // Spawn carrots in a smaller area for easier collection
    const x = (Math.random() - 0.5) * 15;
    const z = (Math.random() - 0.5) * 15;
    carrotGroup.position.set(x, 0, z);
    scene.add(carrotGroup);
    carrots.push(carrotGroup);
    lastCarrotSpawn = clock.getElapsedTime() * 1000;
  }
  
  function spawnObstacle() {
    const obstacleGeometry = new THREE.DodecahedronGeometry(0.8, 0);
    const obstacleMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x808080,
      roughness: 0.9,
    });
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    
    // Spawn obstacles in a smaller area
    const x = (Math.random() - 0.5) * 15;
    const z = (Math.random() - 0.5) * 15;
    obstacle.position.set(x, 0.8, z);
    obstacle.rotation.y = Math.random() * Math.PI * 2;
    obstacle.castShadow = true;
    scene.add(obstacle);
    obstacles.push(obstacle);
    lastObstacleSpawn = clock.getElapsedTime() * 1000;
  }
  
  function updatePlayer(deltaTime) {
    if (isPaused || showInstructions || gameOver) return;
    
    const moveX = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    const moveZ = (keys.backward ? 1 : 0) - (keys.forward ? 1 : 0);
    
    isMoving = (moveX !== 0 || moveZ !== 0);
    
    if (isMoving) {
      const angle = Math.atan2(moveX, moveZ);
      player.rotation.y = angle;
      
      // Apply speed with delta time normalization
      const normalizedDelta = Math.min(deltaTime, 33); // Cap delta at 33ms (30fps) to prevent huge jumps
      const speed = playerSpeed * normalizedDelta;
      
      // Calculate potential new position
      const newX = player.position.x + Math.sin(angle) * speed;
      const newZ = player.position.z + Math.cos(angle) * speed;
      
      // Apply movement directly - we'll handle collisions differently
      player.position.x = newX;
      player.position.z = newZ;
      
      // Keep player within bounds - smaller boundary for better gameplay
      const boundaryLimit = 20;
      player.position.x = Math.max(-boundaryLimit, Math.min(boundaryLimit, player.position.x));
      player.position.z = Math.max(-boundaryLimit, Math.min(boundaryLimit, player.position.z));
      
      // Check for platform side collisions after movement
      handlePlatformCollisions();
    }
  }
  
  function handlePlatformCollisions() {
    // Player collision radius
    const playerRadius = 0.5;
    
    // Get player's feet position
    const playerFeetY = player.position.y - 0.8;
    
    // Check if player is standing on any platform
    let standingOnPlatform = false;
    let standingPlatformIndex = -1;
    
    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i];
      const platformPos = platform.position.clone();
      const platformData = platform.userData;
      
      // Calculate platform boundaries
      const halfWidth = platformData.width / 2;
      const halfDepth = platformData.depth / 2;
      const platformTop = platformPos.y + platformData.height / 2;
      
      // Check if player is standing on this platform
      if (Math.abs(playerFeetY - platformTop) < 0.3 && 
          Math.abs(player.position.x - platformPos.x) < halfWidth + 0.3 && 
          Math.abs(player.position.z - platformPos.z) < halfDepth + 0.3) {
        standingOnPlatform = true;
        standingPlatformIndex = i;
        break;
      }
    }
    
    // If standing on a platform, we don't need to check for side collisions
    if (standingOnPlatform) {
      return;
    }
    
    // Check for side collisions with all platforms
    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i];
      const platformPos = platform.position.clone();
      const platformData = platform.userData;
      
      // Calculate platform boundaries
      const halfWidth = platformData.width / 2;
      const halfDepth = platformData.depth / 2;
      const platformHeight = platformData.height;
      const platformBottom = platformPos.y - platformHeight / 2;
      const platformTop = platformPos.y + platformData.height / 2;
      
      // Only check for side collisions if player is within the height range of the platform
      if (player.position.y < platformTop + 1.0 && 
          player.position.y > platformBottom - 0.5) {
        
        // Calculate horizontal distance to platform center
        const dx = player.position.x - platformPos.x;
        const dz = player.position.z - platformPos.z;
        const horizontalDistance = Math.sqrt(dx * dx + dz * dz);
        
        // Calculate the closest point on the platform's perimeter
        const closestX = Math.max(-halfWidth, Math.min(halfWidth, dx));
        const closestZ = Math.max(-halfDepth, Math.min(halfDepth, dz));
        
        // If player is inside the platform, push them out
        if (Math.abs(dx) < halfWidth + playerRadius && 
            Math.abs(dz) < halfDepth + playerRadius) {
          
          // Determine which side is closest to push the player out
          if (Math.abs(dx) / halfWidth > Math.abs(dz) / halfDepth) {
            // Push out along X axis
            player.position.x = platformPos.x + (dx > 0 ? 1 : -1) * (halfWidth + playerRadius);
          } else {
            // Push out along Z axis
            player.position.z = platformPos.z + (dz > 0 ? 1 : -1) * (halfDepth + playerRadius);
          }
        }
      }
    }
  }
  
  function updateBounce(deltaTime) {
    if (isPaused || showInstructions || gameOver) return;
    
    // Normalize delta time to prevent huge jumps
    const normalizedDelta = Math.min(deltaTime, 33);
    
    // Apply gravity
    velocityY += gravity * normalizedDelta * 0.06;
    
    // Store previous position for collision detection
    const previousY = positionY;
    
    // Update position temporarily for collision testing
    const newPositionY = positionY + velocityY;
    
    // Check for platform collisions
    const playerPos = new THREE.Vector3().copy(player.position);
    playerPos.y = 0.8 + newPositionY; // Update with potential new position
    
    let onPlatform = false;
    let platformHeight = 0;
    
    // Check if player is on a platform
    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i];
      const platformPos = platform.position.clone();
      const platformData = platform.userData;
      
      // Calculate platform boundaries with some margin for better gameplay
      const halfWidth = platformData.width / 2;
      const halfDepth = platformData.depth / 2;
      const platformTop = platformPos.y + platformData.height / 2;
      
      // Check if player is above the platform (using a slightly larger collision box)
      if (Math.abs(playerPos.x - platformPos.x) < halfWidth + 0.3 && 
          Math.abs(playerPos.z - platformPos.z) < halfDepth + 0.3) {
        
        // Check if player is landing on the platform (coming from above)
        // Use a more generous collision detection
        if ((previousY + 0.8) >= platformTop && 
            (newPositionY + 0.8) <= platformTop + 0.2 && 
            velocityY < 0) { // Only detect when moving downward
          
          onPlatform = true;
          platformHeight = platformTop - 0.8; // Adjust to stand on top
          break;
        }
      }
    }
    
    // Now apply the position update
    positionY += velocityY;
    
    // Handle ground and platform collisions
    if (positionY < 0) {
      // Ground collision
      positionY = 0;
      
      // Only bounce if we're moving and not in a deliberate jump
      if (isMoving && !isJumping) {
        velocityY = -velocityY * bounceFactor;
        // Squash effect on landing
        player.scale.y = 0.8;
        player.scale.x = 1.1;
        player.scale.z = 1.1;
      } else {
        velocityY = 0;
        isJumping = false;
        // Reset scale gradually
        player.scale.y += (1 - player.scale.y) * 0.2;
        player.scale.x += (1 - player.scale.x) * 0.2;
        player.scale.z += (1 - player.scale.z) * 0.2;
      }
    } else if (onPlatform) {
      // Platform collision
      positionY = platformHeight;
      
      // Only bounce if we're moving and not in a deliberate jump
      if (isMoving && !isJumping) {
        velocityY = -velocityY * bounceFactor;
        // Squash effect on landing
        player.scale.y = 0.8;
        player.scale.x = 1.1;
        player.scale.z = 1.1;
      } else {
        velocityY = 0;
        isJumping = false;
        // Reset scale gradually
        player.scale.y += (1 - player.scale.y) * 0.2;
        player.scale.x += (1 - player.scale.x) * 0.2;
        player.scale.z += (1 - player.scale.z) * 0.2;
      }
    } else {
      // In air, gradually return to normal scale
      player.scale.y += (1 - player.scale.y) * 0.1;
      player.scale.x += (1 - player.scale.x) * 0.1;
      player.scale.z += (1 - player.scale.z) * 0.1;
    }
    
    // Update player position
    player.position.y = 0.8 + positionY;
  }
  
  function checkCollisions() {
    if (isPaused || showInstructions || gameOver) return;
    
    const playerPos = new THREE.Vector3().copy(player.position);
    const playerRadius = 0.8;
    
    for (let i = carrots.length - 1; i >= 0; i--) {
      const carrot = carrots[i];
      const carrotPos = new THREE.Vector3().copy(carrot.position);
      carrotPos.y = playerPos.y;
      const distance = playerPos.distanceTo(carrotPos);
      if (distance < playerRadius + 0.4) {
        scene.remove(carrot);
        carrots.splice(i, 1);
        setScore(score + 10);
      }
    }
    
    for (let i = 0; i < obstacles.length; i++) {
      const obstacle = obstacles[i];
      const obstaclePos = new THREE.Vector3().copy(obstacle.position);
      
      // Check if player is jumping high enough over the obstacle
      const jumpingOverObstacle = positionY > 1.2; // Minimum height to clear an obstacle
      
      // Only check horizontal distance if not jumping high enough
      if (!jumpingOverObstacle) {
        obstaclePos.y = playerPos.y;
        const distance = playerPos.distanceTo(obstaclePos);
        if (distance < playerRadius + 0.8) {
          setGameOver(true);
          setIsPaused(true);
          setTimeout(() => {
            setShowInstructions(true);
          }, 1500);
          break;
        }
      }
    }
  }
  
  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    
    if (!scene || !camera || !renderer || !clock) return;
    
    try {
      const deltaTime = clock.getDelta() * 1000;
      
      if (!isPaused && !showInstructions) {
        const currentTime = clock.getElapsedTime() * 1000;
        if (currentTime - lastCarrotSpawn > carrotSpawnRate) {
          spawnCarrot();
        }
        if (currentTime - lastObstacleSpawn > obstacleSpawnRate) {
          spawnObstacle();
        }
        updatePlayer(deltaTime);
        updateBounce(deltaTime);
        checkCollisions();
      } else {
        updateBounce(deltaTime); // Keep bounce settling when paused
      }
      
      if (!showInstructions && player) {
        camera.position.x = player.position.x;
        camera.position.z = player.position.z + 10;
        camera.lookAt(player.position);
      }
      
      renderer.render(scene, camera);
    } catch (error) {
      console.error('Error in animation loop:', error);
    }
  }
  
  function destroy() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    
    // Remove all event listeners
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    
    // Remove the spacebar scroll prevention
    window.removeEventListener('keydown', (e) => {
      if (e.key === ' ') e.preventDefault();
    });
    
    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.error(`Error exiting fullscreen: ${err.message}`);
      });
    }
    
    // Reset styles
    if (gameContainer) {
      gameContainer.style.width = '';
      gameContainer.style.height = '';
    }
    
    if (canvas) {
      canvas.style.width = '';
      canvas.style.height = '';
    }
    
    if (renderer) {
      renderer.dispose();
    }
    
    scene = null;
    camera = null;
    renderer = null;
    clock = null;
    player = null;
    carrots = [];
    obstacles = [];
    platforms = [];
    ground = null;
    canvas = null;
    gameContainer = null;
  }
  
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
  
  return {
    init,
    start,
    togglePause,
    reset,
    toggleFullscreen,
    destroy
  };
}