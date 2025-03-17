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
    timeRemaining: 20,
    carrotsCollected: 0,
    gameWon: false,
    
    initGame() {
      game.init(this.$refs.gameCanvas, {
        onScoreChange: (newScore) => { this.score = newScore; },
        onPauseChange: (isPaused) => { this.isPaused = isPaused; },
        onInstructionsChange: (show) => { this.showInstructions = show; },
        onGameOverChange: (isOver) => { this.gameOver = isOver; },
        onFullscreenChange: (isFullscreen) => { this.isFullscreen = isFullscreen; },
        onTimerChange: (time) => { this.timeRemaining = time; },
        onCarrotsChange: (carrots) => { this.carrotsCollected = carrots; },
        onGameWonChange: (won) => { this.gameWon = won; }
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
  
  // Game win/lose state
  let gameWon = false;
  let timeRemaining = 20; // 20 seconds time limit
  let carrotsNeeded = 5; // Need to collect 5 carrots
  let carrotsCollected = 0;
  let lastTimerUpdate = 0;
  
  let scene = null;
  let camera = null;
  let renderer = null;
  let clock = null;
  
  let player = null;
  let carrots = [];
  let hole = null; // Single hole as the goal
  let ground = null;
  
  // DOM elements
  let canvas = null;
  let gameContainer = null;
  
  // Game settings - reduced speed for better control
  const playerSpeed = 0.05;
  const carrotSpawnRate = 3000; // ms
  let lastCarrotSpawn = 0;
  
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
    
    // Create the bouncing rabbit as the player
    createBouncingRabbit();
    
    // Create the goal hole
    createGoalHole();
    
    clock = new THREE.Clock();
    
    handleResize = () => onWindowResize();
    window.addEventListener('resize', handleResize);
    
    setTimeout(() => {
      onWindowResize();
    }, 100);
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
  
  function createGoalHole() {
    // Create a hole in the ground as the goal
    const holeGroup = new THREE.Group();
    
    // Create a dark circle for the hole
    const holeGeometry = new THREE.CircleGeometry(1.5, 32);
    const holeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      side: THREE.DoubleSide
    });
    const holeMesh = new THREE.Mesh(holeGeometry, holeMaterial);
    holeMesh.rotation.x = -Math.PI / 2; // Lay flat on the ground
    holeMesh.position.y = 0.01; // Slightly above ground to prevent z-fighting
    holeGroup.add(holeMesh);
    
    // Add a darker ring around the hole
    const ringGeometry = new THREE.RingGeometry(1.5, 1.8, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x333333,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2; // Lay flat on the ground
    ring.position.y = 0.02; // Slightly above the hole
    holeGroup.add(ring);
    
    // Position the hole at a fixed location
    holeGroup.position.set(0, 0, -10);
    
    scene.add(holeGroup);
    hole = holeGroup;
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
    
    // Only allow jumping if on or near the ground and cooldown has passed
    if (positionY < 0.1 && currentTime - lastJumpTime > jumpCooldown) {
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
    gameWon = false;
    setScore(0);
    carrotsCollected = 0;
    timeRemaining = 20;
    lastTimerUpdate = clock.getElapsedTime() * 1000;
    clearGameObjects();
    player.position.set(0, 0.8, 0);
    player.rotation.y = 0;
    positionY = 0; // Reset bouncing position
    velocityY = 0;
    isJumping = false;
    lastJumpTime = 0;
    lastCarrotSpawn = clock.getElapsedTime() * 1000;
    
    // Spawn initial carrots
    for (let i = 0; i < 8; i++) {
      spawnCarrot();
    }
    
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
    // Avoid spawning too close to the hole
    let x, z;
    let validPosition = false;
    
    while (!validPosition) {
      x = (Math.random() - 0.5) * 15;
      z = (Math.random() - 0.5) * 15;
      
      // Check distance from hole
      const distanceToHole = Math.sqrt(
        Math.pow(x - hole.position.x, 2) + 
        Math.pow(z - hole.position.z, 2)
      );
      
      // Make sure carrot is not too close to the hole
      if (distanceToHole > 3) {
        validPosition = true;
      }
    }
    
    carrotGroup.position.set(x, 0, z);
    scene.add(carrotGroup);
    carrots.push(carrotGroup);
    lastCarrotSpawn = clock.getElapsedTime() * 1000;
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
      
      // Apply movement directly
      player.position.x = newX;
      player.position.z = newZ;
      
      // Keep player within bounds - smaller boundary for better gameplay
      const boundaryLimit = 20;
      player.position.x = Math.max(-boundaryLimit, Math.min(boundaryLimit, player.position.x));
      player.position.z = Math.max(-boundaryLimit, Math.min(boundaryLimit, player.position.z));
    }
  }
  
  function updateBounce(deltaTime) {
    if (isPaused || showInstructions || gameOver) return;
    
    // Normalize delta time to prevent huge jumps
    const normalizedDelta = Math.min(deltaTime, 33);
    
    // Apply gravity
    velocityY += gravity * normalizedDelta * 0.06;
    
    // Update position
    positionY += velocityY;
    
    // Handle ground collision
    if (positionY < 0) {
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
    
    // Check for carrot collisions
    for (let i = carrots.length - 1; i >= 0; i--) {
      const carrot = carrots[i];
      const carrotPos = new THREE.Vector3().copy(carrot.position);
      carrotPos.y = playerPos.y;
      const distance = playerPos.distanceTo(carrotPos);
      if (distance < playerRadius + 0.4) {
        scene.remove(carrot);
        carrots.splice(i, 1);
        carrotsCollected++;
        setCarrotsCollected(carrotsCollected);
        setScore(carrotsCollected * 10);
        
        // Spawn a new carrot if we haven't collected enough yet
        if (carrotsCollected < carrotsNeeded) {
          spawnCarrot();
        }
      }
    }
    
    // Check for hole collision (only if we have enough carrots)
    if (carrotsCollected >= carrotsNeeded) {
      const holePos = new THREE.Vector3().copy(hole.position);
      
      // Calculate horizontal distance to hole center (ignoring Y)
      const dx = playerPos.x - holePos.x;
      const dz = playerPos.z - holePos.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      // If player is over the hole and not jumping high
      if (distance < 1.2 && positionY < 1.0) {
        // Player wins!
        setGameWon(true);
        winGame();
      }
    }
  }
  
  function winGame() {
    // Prevent further game updates
    setGameOver(true);
    setIsPaused(true);
    
    // Get hole position
    const holePos = hole.position.clone();
    
    // Animate falling into the hole
    const startY = player.position.y;
    const startScale = player.scale.clone();
    const duration = 1000; // ms
    const startTime = clock.getElapsedTime() * 1000;
    
    // Create a one-time animation function
    const fallAnimation = () => {
      const currentTime = clock.getElapsedTime() * 1000;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Move player to hole center
      player.position.x = player.position.x + (holePos.x - player.position.x) * progress * 0.5;
      player.position.z = player.position.z + (holePos.z - player.position.z) * progress * 0.5;
      
      // Make player fall down
      player.position.y = startY - progress * 2;
      
      // Shrink player as they fall
      const scale = 1 - progress * 0.8;
      player.scale.set(scale, scale, scale);
      
      // Rotate player as they fall
      player.rotation.z = progress * Math.PI;
      
      // Continue animation until complete
      if (progress < 1) {
        requestAnimationFrame(fallAnimation);
      } else {
        // Animation complete, show game over with win message
        setTimeout(() => {
          setShowInstructions(true);
          
          // Reset player position and scale for next game
          player.position.set(0, 0.8, 0);
          player.rotation.set(0, 0, 0);
          player.scale.copy(startScale);
        }, 500);
      }
    };
    
    // Start the animation
    fallAnimation();
  }
  
  function updateTimer(deltaTime) {
    if (isPaused || showInstructions || gameOver) return;
    
    // Update timer
    timeRemaining -= deltaTime / 1000; // Convert ms to seconds
    
    // Update the display every second
    const currentTime = clock.getElapsedTime() * 1000;
    if (currentTime - lastTimerUpdate > 1000) {
      lastTimerUpdate = currentTime;
      
      // Update timer display if needed
      if (callbacks.onTimerChange) {
        callbacks.onTimerChange(Math.ceil(timeRemaining));
      }
    }
    
    // Check if time is up
    if (timeRemaining <= 0) {
      timeRemaining = 0;
      setGameWon(false);
      loseGame();
    }
  }
  
  function loseGame() {
    gameWon = false;
    setGameOver(true);
    setIsPaused(true);
    
    // Show game over with lose message
    setTimeout(() => {
      setShowInstructions(true);
    }, 500);
  }
  
  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    
    if (!scene || !camera || !renderer || !clock) return;
    
    try {
      const deltaTime = clock.getDelta() * 1000;
      
      if (!isPaused && !showInstructions) {
        const currentTime = clock.getElapsedTime() * 1000;
        
        // Only spawn new carrots if we need more and it's time
        if (carrots.length < 8 && currentTime - lastCarrotSpawn > carrotSpawnRate) {
          spawnCarrot();
        }
        
        updatePlayer(deltaTime);
        updateBounce(deltaTime);
        checkCollisions();
        updateTimer(deltaTime);
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
    hole = null;
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
  
  function setCarrotsCollected(newCarrotsCollected) {
    carrotsCollected = newCarrotsCollected;
    if (callbacks.onCarrotsChange) {
      callbacks.onCarrotsChange(carrotsCollected);
    }
  }
  
  function setGameWon(newGameWon) {
    gameWon = newGameWon;
    if (callbacks.onGameWonChange) {
      callbacks.onGameWonChange(gameWon);
    }
  }
  
  return {
    init,
    start,
    togglePause,
    reset,
    toggleFullscreen,
    destroy,
    getGameState: () => ({
      timeRemaining: Math.ceil(timeRemaining),
      carrotsCollected,
      carrotsNeeded,
      gameWon
    })
  };
}