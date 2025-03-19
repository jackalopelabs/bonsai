import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';

/**
 * Simple Tiny Planets with Rabbit
 */
export default function tinyPlanetsGame() {
  // Store references for cleanup
  let scene, camera, renderer, controls, animationFrameId;
  let rabbit, planet;
  let isRotating = true;
  
  // Keyboard controls
  let keys = {};
  let isJumping = false;
  
  return {
    isFullscreen: false,
    isPaused: false,
    showInstructions: true,
    
    initGame() {
      this.setupScene(this.$refs.gameCanvas);
      
      // Handle fullscreen change
      document.addEventListener('fullscreenchange', () => {
        this.isFullscreen = !!document.fullscreenElement;
        this.onResize();
      });
      
      // Handle key presses
      document.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        
        if (e.key.toLowerCase() === 'r') {
          isRotating = !isRotating;
        }
        if (e.key.toLowerCase() === 'f') {
          this.toggleFullscreen();
        }
        if (e.key === ' ' && !isJumping) {
          this.jump();
        }
      });
      
      document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
      });
    },
    
    setupScene(canvas) {
      // Basic Three.js setup
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000011);
      
      // Camera setup for viewing the planet and rabbit
      camera = new THREE.PerspectiveCamera(
        70, 
        canvas.clientWidth / canvas.clientHeight, 
        0.001, // Allow extreme close zooming
        30
      );
      camera.position.set(0, 3, 7);
      
      renderer = new THREE.WebGLRenderer({ 
        canvas,
        antialias: true
      });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      
      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);
      
      // Create simple planet
      this.createPlanet();
      
      // Create rabbit character
      this.createRabbit();
      
      // Add orbit controls
      controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.minDistance = 0.05; // Allow extremely close zoom
      controls.maxDistance = 10;
      controls.target.set(0, 4.5, 0); // Look at the rabbit position
      
      // Add zoom event handler for character scaling
      canvas.addEventListener('wheel', this.handleZoom.bind(this));
      
      // Handle window resize
      window.addEventListener('resize', this.onResize = () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      });
      
      // Animation loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        
        if (!this.isPaused) {
          // Handle rabbit movement
          this.updateRabbitMovement();
          
          // Rotate planet
          if (isRotating && planet) {
            planet.rotation.y += 0.005;
          }
          
          // Update rabbit scale based on camera distance (in animation loop for smooth transitions)
          this.updateRabbitScale();
        }
        
        controls.update();
        renderer.render(scene, camera);
      };
      
      animate();
    },
    
    // Constants for rabbit scaling
    BASE_CHARACTER_SIZE: 1.0,
    MIN_CHARACTER_SCALE: 0.1,  // 10% size at closest zoom (microscopic)
    MAX_CHARACTER_SCALE: 2.0,  // 200% size at farthest zoom
    BASE_MOVE_SPEED: 0.02,    // Base movement speed
    MIN_MOVE_SPEED: 0.0005,   // Ultra-slow movement at closest zoom
    
    handleZoom(event) {
      // This function just handles the scroll event
      // Actual scaling happens in updateRabbitScale to make it smooth
    },
    
    updateRabbitScale() {
      if (!rabbit || !camera) return;
      
      // Calculate camera distance to rabbit
      const distance = camera.position.distanceTo(rabbit.position);
      
      // Calculate zoom factor (0 to 1 range)
      const zoomFactor = Math.min(Math.max(
        (distance - controls.minDistance) / (controls.maxDistance - controls.minDistance),
        0
      ), 1);
      
      // Apply non-linear scaling for better effect at extremes
      const scaledZoomFactor = Math.pow(zoomFactor, 0.7);
      
      // Calculate new scale based on zoom
      const newScale = this.MIN_CHARACTER_SCALE + 
          (this.MAX_CHARACTER_SCALE - this.MIN_CHARACTER_SCALE) * scaledZoomFactor;
      
      // Apply scale smoothly if it's different enough
      if (Math.abs(rabbit.scale.x - newScale) > 0.001) {
        // Apply smoothed scaling for more natural transitions
        rabbit.scale.lerp(new THREE.Vector3(newScale, newScale, newScale), 0.1);
      }
    },
    
    updateRabbitMovement() {
      if (!rabbit || !planet || isJumping) return;
      
      // Calculate camera distance for speed adjustment
      const distance = camera.position.distanceTo(rabbit.position);
      
      // Calculate zoom factor (0 to 1)
      const zoomFactor = Math.min(Math.max(
        (distance - controls.minDistance) / (controls.maxDistance - controls.minDistance),
        0
      ), 1);
      
      // Scale movement speed based on zoom (slower when zoomed in)
      const moveSpeed = this.MIN_MOVE_SPEED + 
          (this.BASE_MOVE_SPEED - this.MIN_MOVE_SPEED) * zoomFactor;
      
      // Get camera relative directions for movement
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      cameraDirection.y = 0;
      cameraDirection.normalize();
      
      // Calculate camera-relative direction vectors
      const cameraForward = cameraDirection.clone();
      const cameraRight = new THREE.Vector3().crossVectors(cameraForward, new THREE.Vector3(0, 1, 0)).normalize();
      
      // Init movement direction
      let rotationAxis = new THREE.Vector3();
      let rabbitForward = new THREE.Vector3();
      
      // Track if there's movement this frame
      let isMoving = false;
      
      // Determine movement direction based on keys pressed
      if (keys['w'] || keys['arrowup']) {
        // Forward
        rotationAxis.add(cameraRight.clone().multiplyScalar(-1));
        rabbitForward.copy(cameraForward.clone().negate());
        isMoving = true;
      }
      if (keys['s'] || keys['arrowdown']) {
        // Backward
        rotationAxis.add(cameraRight.clone());
        rabbitForward.copy(cameraForward);
        isMoving = true;
      }
      if (keys['a'] || keys['arrowleft']) {
        // Left
        rotationAxis.add(cameraForward.clone().negate());
        rabbitForward.copy(cameraRight);
        isMoving = true;
      }
      if (keys['d'] || keys['arrowright']) {
        // Right
        rotationAxis.add(cameraForward.clone());
        rabbitForward.copy(cameraRight.clone().negate());
        isMoving = true;
      }
      
      // Apply movement if key is pressed
      if (rotationAxis.lengthSq() > 0) {
        rotationAxis.normalize();
        
        // Rotate the planet (which effectively moves the rabbit in the opposite direction)
        // Use zoom-dependent speed
        planet.rotateOnWorldAxis(rotationAxis, -moveSpeed);
        
        // Orient the rabbit to face the movement direction
        if (rabbitForward.lengthSq() > 0) {
          // Get the rabbit's up vector (direction from planet center to rabbit)
          const rabbitUp = rabbit.position.clone().normalize();
          
          // Make sure rabbitForward is perpendicular to up vector
          rabbitForward.sub(rabbitUp.clone().multiplyScalar(rabbitForward.dot(rabbitUp))).normalize();
          
          // Calculate right vector for proper orientation
          const rabbitRight = new THREE.Vector3().crossVectors(rabbitForward, rabbitUp).normalize();
          
          // Recalculate forward to ensure orthogonality
          rabbitForward.crossVectors(rabbitUp, rabbitRight).normalize();
          
          // Create rotation matrix
          const rotMatrix = new THREE.Matrix4().makeBasis(
            rabbitRight,
            rabbitUp,
            rabbitForward.clone().negate()
          );
          const targetRotation = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);
          
          // Smoothly interpolate rotation for more natural movement
          rabbit.quaternion.slerp(targetRotation, 0.15);
        }
        
        // Apply hopping animation - adjust speed based on movement speed
        const hopSpeed = moveSpeed / this.BASE_MOVE_SPEED; // Normalize to base speed
        this.animateHopping(hopSpeed);
      } else {
        // Reset to normal pose if not moving
        this.resetRabbitPose();
      }
    },
    
    // Animation time for continuous hopping
    hopAnimationTime: 0,
    
    animateHopping(hopSpeed = 1) {
      // Update animation time
      this.hopAnimationTime += 0.15 * hopSpeed;
      
      // Get body parts
      const body = rabbit.getObjectByName("body");
      const head = rabbit.getObjectByName("head");
      const leftEar = rabbit.getObjectByName("leftEar");
      const rightEar = rabbit.getObjectByName("rightEar");
      const leftFrontFoot = rabbit.getObjectByName("leftFrontFoot");
      const rightFrontFoot = rabbit.getObjectByName("rightFrontFoot");
      const leftBackFoot = rabbit.getObjectByName("leftBackFoot");
      const rightBackFoot = rabbit.getObjectByName("rightBackFoot");
      const tail = rabbit.getObjectByName("tail");
      
      if (!body || !head || !leftEar || !rightEar || !leftFrontFoot || 
          !rightFrontFoot || !leftBackFoot || !rightBackFoot || !tail) {
        return;
      }
      
      // Calculate hop phase based on sine wave
      const hopCycle = Math.sin(this.hopAnimationTime);
      // Scale hop height by speed factor (smaller hops when slower)
      const hopHeight = Math.max(0, hopCycle) * 0.1 * Math.min(hopSpeed, 1.5);
      
      // Apply small vertical hop motion to whole rabbit
      const upVector = rabbit.position.clone().normalize();
      const originalPosition = rabbit.position.clone();
      rabbit.position.copy(originalPosition.clone().add(upVector.multiplyScalar(hopHeight)));
      
      // Animate limbs for running effect
      const legCycle = Math.sin(this.hopAnimationTime * 2);
      
      // Front legs alternate
      leftFrontFoot.position.y = -0.2 * 0.4 + Math.max(0, legCycle) * 0.1;
      rightFrontFoot.position.y = -0.2 * 0.4 + Math.max(0, -legCycle) * 0.1;
      
      // Back legs provide the hop
      leftBackFoot.position.y = -0.2 * 0.4 + Math.max(0, hopCycle) * 0.15;
      rightBackFoot.position.y = -0.2 * 0.4 + Math.max(0, hopCycle) * 0.15;
      
      // Ears and tail have subtle movement
      leftEar.rotation.z = Math.PI / 12 + legCycle * 0.05;
      rightEar.rotation.z = -Math.PI / 12 - legCycle * 0.05;
      tail.rotation.x = legCycle * 0.1;
    },
    
    resetRabbitPose() {
      // Get body parts
      const body = rabbit?.getObjectByName("body");
      const head = rabbit?.getObjectByName("head");
      const leftEar = rabbit?.getObjectByName("leftEar");
      const rightEar = rabbit?.getObjectByName("rightEar");
      const leftFrontFoot = rabbit?.getObjectByName("leftFrontFoot");
      const rightFrontFoot = rabbit?.getObjectByName("rightFrontFoot");
      const leftBackFoot = rabbit?.getObjectByName("leftBackFoot");
      const rightBackFoot = rabbit?.getObjectByName("rightBackFoot");
      const tail = rabbit?.getObjectByName("tail");
      
      if (!body || !head || !leftEar || !rightEar || !leftFrontFoot || 
          !rightFrontFoot || !leftBackFoot || !rightBackFoot || !tail) {
        return;
      }
      
      // Reset to default positions
      leftFrontFoot.position.y = -0.2 * 0.4;
      rightFrontFoot.position.y = -0.2 * 0.4;
      leftBackFoot.position.y = -0.2 * 0.4;
      rightBackFoot.position.y = -0.2 * 0.4;
      
      leftEar.rotation.z = Math.PI / 12;
      rightEar.rotation.z = -Math.PI / 12;
      tail.rotation.x = 0;
    },
    
    jump() {
      if (!rabbit || isJumping) return;
      
      isJumping = true;
      
      // Get the rabbit's current position and up vector
      const startPosition = rabbit.position.clone();
      const upVector = startPosition.clone().normalize();
      
      // Jump height and duration
      const jumpHeight = 0.5;
      const jumpDuration = 500; // ms
      const startTime = Date.now();
      
      // Animation function for the jump
      const animateJump = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / jumpDuration, 1);
        
        // Parabolic jump curve - goes up and then back down
        const jumpFactor = 4 * progress * (1 - progress);
        
        // Calculate new position
        const newPosition = startPosition.clone().add(
          upVector.clone().multiplyScalar(jumpHeight * jumpFactor)
        );
        
        // Update rabbit position
        rabbit.position.copy(newPosition);
        
        // Update camera target
        controls.target.copy(rabbit.position);
        
        // Continue animation until complete
        if (progress < 1) {
          requestAnimationFrame(animateJump);
        } else {
          // Reset jump state
          isJumping = false;
        }
      };
      
      // Start jump animation
      animateJump();
    },
    
    createPlanet(type = 'random') {
      // Remove existing planet if any
      if (planet) {
        scene.remove(planet);
      }
      
      console.log('Creating planet type:', type);
      
      // Create planet parameters based on type
      let terrainColor, waterColor, mountainHeight, waterLevel, detailLevel;
      
      switch(type) {
        case 'beach':
          terrainColor = new THREE.Color(0xe0cb9e); // Sandy color
          waterColor = new THREE.Color(0x4fa4de);   // Light blue
          mountainHeight = 0.15;                    // Lower mountains
          waterLevel = 0.10;                        // More water
          detailLevel = 0.8;                        // Less detail
          break;
          
        case 'forest':
          terrainColor = new THREE.Color(0x448844); // Deep green
          waterColor = new THREE.Color(0x3e87b3);   // Darker blue
          mountainHeight = 0.25;                    // Medium mountains
          waterLevel = -0.15;                       // Less water
          detailLevel = 1.0;                        // Normal detail
          break;
          
        case 'snow':
          terrainColor = new THREE.Color(0xd8e3e9); // Snow white with blue tint
          waterColor = new THREE.Color(0x3074a0);   // Deep blue
          mountainHeight = 0.35;                    // Higher mountains
          waterLevel = -0.05;                       // Medium water
          detailLevel = 1.2;                        // More detail
          break;
          
        case 'random':
        default:
          // Random terrain colors from green to brown
          const hue = 0.2 + Math.random() * 0.15; // Green to yellow-brown
          const saturation = 0.4 + Math.random() * 0.3;
          const lightness = 0.4 + Math.random() * 0.2;
          terrainColor = new THREE.Color().setHSL(hue, saturation, lightness);
          
          // Random water color (blue to green-blue)
          const waterHue = 0.5 + Math.random() * 0.2;
          waterColor = new THREE.Color().setHSL(waterHue, 0.65, 0.5);
          
          mountainHeight = 0.15 + Math.random() * 0.25;
          waterLevel = -0.2 + Math.random() * 0.25;
          detailLevel = 0.8 + Math.random() * 0.4;
          break;
      }
      
      // Create simple planet geometry with higher detail
      const geometry = new THREE.SphereGeometry(4, 64, 64);
      
      // Create material with vertex colors for better terrain visualization
      const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.7,
        metalness: 0.1,
        flatShading: false
      });
      
      // Apply noise to vertices for terrain with multiple frequencies
      const positions = geometry.attributes.position;
      const noise = new SimplexNoise();
      
      // Create color array for vertex coloring
      const colors = new Float32Array(positions.count * 3);
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        
        const vertex = new THREE.Vector3(x, y, z);
        const direction = vertex.normalize();
        
        // Generate noise at different frequencies
        // Large features - continents and oceans
        const largeNoise = noise.noise3d(
          direction.x * 1.5, 
          direction.y * 1.5, 
          direction.z * 1.5
        ) * 0.2;
        
        // Medium features - mountains and valleys
        const mediumNoise = noise.noise3d(
          direction.x * 3, 
          direction.y * 3, 
          direction.z * 3
        ) * 0.1;
        
        // Small features - hills and bumps
        const smallNoise = noise.noise3d(
          direction.x * 6, 
          direction.y * 6, 
          direction.z * 6
        ) * 0.05;
        
        // Micro details for close-up viewing
        const microNoise = noise.noise3d(
          direction.x * 12, 
          direction.y * 12, 
          direction.z * 12
        ) * 0.025;
        
        // Combine noise at different detail levels
        let elevation = largeNoise * 1.0 + 
                       mediumNoise * detailLevel + 
                       smallNoise * detailLevel + 
                       microNoise * detailLevel;
        
        // Add more dramatic mountains for snow planets
        if (type === 'snow') {
          const mountainNoise = Math.pow(Math.abs(largeNoise), 1.5) * 0.3;
          elevation += mountainNoise;
        }
        
        // Beach planets get smoother shorelines
        if (type === 'beach') {
          // Smooth transition at shoreline
          if (elevation > -0.05 && elevation < 0.1) {
            elevation = 0.05 * Math.sin((elevation + 0.05) * Math.PI * 5);
          }
        }
        
        // Scale by mountain height factor
        elevation *= mountainHeight;
        
        // Apply height to vertex
        vertex.add(direction.multiplyScalar(elevation));
        positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        
        // Determine vertex color based on elevation and type
        let vertexColor = new THREE.Color();
        
        // Water areas
        if (elevation < waterLevel) {
          // Deep ocean gets darker
          const depth = Math.min(1, Math.abs(elevation - waterLevel) * 5);
          vertexColor.copy(waterColor).multiplyScalar(1 - depth * 0.3);
        } 
        // Beach/shore areas
        else if (elevation < waterLevel + 0.05) {
          // Beach sand or snow
          if (type === 'beach') {
            vertexColor.setRGB(0.95, 0.90, 0.75); // Beach sand
          } else if (type === 'snow') {
            vertexColor.setRGB(0.95, 0.95, 0.97); // Snowy shore
          } else {
            // Blend from water to terrain color
            const blend = (elevation - waterLevel) / 0.05;
            vertexColor.copy(waterColor).lerp(terrainColor, blend);
          }
        }
        // Normal terrain
        else if (elevation < waterLevel + 0.3) {
          // Main terrain color
          vertexColor.copy(terrainColor);
          
          // Add some variation based on noise
          const colorNoise = noise.noise3d(
            direction.x * 10, 
            direction.y * 10, 
            direction.z * 10
          ) * 0.1;
          
          // Adjust brightness with noise
          vertexColor.offsetHSL(0, 0, colorNoise);
        }
        // Mountains/highlands
        else {
          if (type === 'snow') {
            // Snow covered mountains
            const snowAmount = Math.min(1, (elevation - (waterLevel + 0.3)) * 5);
            vertexColor.copy(terrainColor).lerp(new THREE.Color(0xffffff), snowAmount);
          } else if (type === 'forest') {
            // Rocky mountains
            const rockAmount = Math.min(1, (elevation - (waterLevel + 0.3)) * 5);
            vertexColor.copy(terrainColor).lerp(new THREE.Color(0x666666), rockAmount);
          } else {
            // Generic mountains get darker with elevation
            vertexColor.copy(terrainColor).multiplyScalar(0.8 + elevation * 0.5);
          }
        }
        
        // Set the vertex color
        colors[i * 3] = vertexColor.r;
        colors[i * 3 + 1] = vertexColor.g;
        colors[i * 3 + 2] = vertexColor.b;
      }
      
      // Add colors to geometry
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      // Update normals after deformation
      geometry.computeVertexNormals();
      
      // Create planet mesh
      planet = new THREE.Mesh(geometry, material);
      planet.castShadow = true;
      planet.receiveShadow = true;
      
      // Create water layer (semi-transparent)
      this.createWater(planet, waterColor, waterLevel);
      
      // Create atmosphere if not beach planet
      if (type !== 'beach') {
        this.createAtmosphere(planet, type);
      }
      
      // Add vegetation based on planet type
      this.addVegetation(planet, type, waterLevel);
      
      scene.add(planet);
      
      // Put rabbit back on top of planet after recreating
      if (rabbit) {
        // Position rabbit on top of planet
        rabbit.position.set(0, 4.5, 0);
      }
    },
    
    createWater(planet, waterColor, waterLevel) {
      // Create water sphere
      const waterRadius = 4.1 + (waterLevel * 0.3); // Adjust radius based on water level
      const waterGeometry = new THREE.SphereGeometry(waterRadius, 48, 48);
      
      // Create transparent water material
      const waterMaterial = new THREE.MeshPhysicalMaterial({
        color: waterColor,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
        metalness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.2,
        transmission: 0.5,
      });
      
      const water = new THREE.Mesh(waterGeometry, waterMaterial);
      water.receiveShadow = true;
      
      // Only add water in specific areas using noise 
      // to create continents and oceans
      const waterPositions = waterGeometry.attributes.position;
      const noise = new SimplexNoise();
      
      for (let i = 0; i < waterPositions.count; i++) {
        const x = waterPositions.getX(i);
        const y = waterPositions.getY(i);
        const z = waterPositions.getZ(i);
        
        // Get normalized direction
        const vertex = new THREE.Vector3(x, y, z);
        const direction = vertex.normalize();
        
        // Use noise to determine if this area should have water
        // Lower frequency noise for larger continent patterns
        const waterNoise = noise.noise3d(
          direction.x * 1.5, 
          direction.y * 1.5, 
          direction.z * 1.5
        );
        
        // If noise value is above threshold, move vertex inward to hide water
        if (waterNoise > 0.1) {
          // Move vertex inward to hide water
          vertex.multiplyScalar(0.97);
          waterPositions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
      }
      
      // Store water for animation
      this.water = water;
      this.waterBaseRadius = waterRadius;
      this.waterTime = 0;
      
      planet.add(water);
    },
    
    createAtmosphere(planet, type) {
      // Create atmosphere glow
      const atmosphereGeometry = new THREE.SphereGeometry(4.3, 32, 32);
      
      // Different atmosphere colors based on planet type
      let atmosphereColor;
      let atmosphereOpacity;
      
      switch (type) {
        case 'snow':
          atmosphereColor = new THREE.Color(0x8cb5e8); // Blue-white
          atmosphereOpacity = 0.15;
          break;
        case 'forest':
          atmosphereColor = new THREE.Color(0x6bbba9); // Green-blue
          atmosphereOpacity = 0.12;
          break;
        default:
          atmosphereColor = new THREE.Color(0x8d95c9); // Light purple
          atmosphereOpacity = 0.1;
      }
      
      const atmosphereMaterial = new THREE.MeshLambertMaterial({
        color: atmosphereColor,
        transparent: true,
        opacity: atmosphereOpacity,
        side: THREE.BackSide,
      });
      
      const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      planet.add(atmosphere);
      this.atmosphere = atmosphere;
    },
    
    addVegetation(planet, type, waterLevel) {
      // Exit early if not forest or snow planet
      if (type !== 'forest' && type !== 'snow') return;
      
      // Create tree instances based on type
      const treeCount = type === 'forest' ? 80 : 40;
      const treeGeometry = new THREE.ConeGeometry(0.1, 0.4, 6);
      const trunkGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 5);
      
      // Different colors for different planet types
      const treeColor = type === 'forest' 
                       ? new THREE.Color(0x2d5d39) // Dark green
                       : new THREE.Color(0x386b48); // Blue-green for snow planet
                       
      const trunkColor = type === 'forest'
                        ? new THREE.Color(0x714a23) // Brown
                        : new THREE.Color(0x4d3217); // Dark brown
                        
      const treeMaterial = new THREE.MeshStandardMaterial({ color: treeColor });
      const trunkMaterial = new THREE.MeshStandardMaterial({ color: trunkColor });
      
      // Create trees randomly placed on the planet
      const noise = new SimplexNoise();
      
      for (let i = 0; i < treeCount; i++) {
        // Random position on sphere
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        
        // Convert to cartesian coordinates
        const x = Math.sin(theta) * Math.cos(phi);
        const y = Math.sin(theta) * Math.sin(phi);
        const z = Math.cos(theta);
        
        // Check if tree is above water level
        const pos = new THREE.Vector3(x, y, z);
        const elevation = noise.noise3d(pos.x * 1.5, pos.y * 1.5, pos.z * 1.5) * 0.2;
        
        if (elevation > waterLevel + 0.1) {
          // Create tree group
          const tree = new THREE.Group();
          
          // Create trunk
          const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
          trunk.castShadow = true;
          trunk.position.y = 0.1;
          tree.add(trunk);
          
          // Create foliage
          const foliage = new THREE.Mesh(treeGeometry, treeMaterial);
          foliage.position.y = 0.3;
          foliage.castShadow = true;
          tree.add(foliage);
          
          // Snow cap for snow planet trees
          if (type === 'snow') {
            const snowCapGeometry = new THREE.ConeGeometry(0.08, 0.1, 6);
            const snowMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
            const snowCap = new THREE.Mesh(snowCapGeometry, snowMaterial);
            snowCap.position.y = 0.4;
            snowCap.castShadow = true;
            tree.add(snowCap);
          }
          
          // Position and orient the tree on the planet
          const radius = 4.1 + (elevation * 0.2);
          pos.normalize().multiplyScalar(radius);
          tree.position.copy(pos);
          
          // Orient tree to planet surface
          const up = pos.clone().normalize();
          tree.up.copy(up);
          
          // Look at planet center from tree position
          const target = new THREE.Vector3(0, 0, 0);
          const matrix = new THREE.Matrix4().lookAt(pos, target, new THREE.Vector3(0, 1, 0));
          const quaternion = new THREE.Quaternion().setFromRotationMatrix(matrix);
          tree.quaternion.copy(quaternion);
          
          // Add tree to planet
          planet.add(tree);
        }
      }
    },
    
    // Method to change planet type
    setPlanetType(type) {
      // Valid planet types
      const validTypes = ['beach', 'forest', 'snow', 'random'];
      
      // Validate planet type
      if (!validTypes.includes(type)) {
        type = 'random';
      }
      
      // Create new planet
      this.createPlanet(type);
    },
    
    createRabbit() {
      // Create a rabbit group
      rabbit = new THREE.Group();
      
      // Create body (white cylinder)
      const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.8, 8);
      const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.rotation.x = Math.PI / 2; // Lay cylinder on its side
      body.position.y = 0.4;
      body.castShadow = true;
      rabbit.add(body);
      
      // Create head (white sphere)
      const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      head.position.set(0, 0.6, 0.4);
      head.castShadow = true;
      rabbit.add(head);
      
      // Create ears (two white cones)
      const earGeometry = new THREE.ConeGeometry(0.1, 0.5, 8);
      const earMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      
      const leftEar = new THREE.Mesh(earGeometry, earMaterial);
      leftEar.position.set(-0.15, 0.9, 0.3);
      leftEar.rotation.x = -Math.PI / 6;
      leftEar.rotation.z = Math.PI / 12;
      leftEar.castShadow = true;
      rabbit.add(leftEar);
      
      const rightEar = new THREE.Mesh(earGeometry, earMaterial);
      rightEar.position.set(0.15, 0.9, 0.3);
      rightEar.rotation.x = -Math.PI / 6;
      rightEar.rotation.z = -Math.PI / 12;
      rightEar.castShadow = true;
      rabbit.add(rightEar);
      
      // Create eyes (two black spheres)
      const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
      
      const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      leftEye.position.set(-0.1, 0.7, 0.6);
      rabbit.add(leftEye);
      
      const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
      rightEye.position.set(0.1, 0.7, 0.6);
      rabbit.add(rightEye);
      
      // Create nose (pink sphere)
      const noseGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const noseMaterial = new THREE.MeshStandardMaterial({ color: 0xff9999 });
      const nose = new THREE.Mesh(noseGeometry, noseMaterial);
      nose.position.set(0, 0.6, 0.7);
      rabbit.add(nose);
      
      // Create feet (four white elongated spheres)
      const footGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      footGeometry.scale(1, 0.5, 1.5);
      const footMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      
      const leftFrontFoot = new THREE.Mesh(footGeometry, footMaterial);
      leftFrontFoot.position.set(-0.2, 0, 0.25);
      leftFrontFoot.name = "leftFrontFoot";
      rabbit.add(leftFrontFoot);
      
      const rightFrontFoot = new THREE.Mesh(footGeometry, footMaterial);
      rightFrontFoot.position.set(0.2, 0, 0.25);
      rightFrontFoot.name = "rightFrontFoot";
      rabbit.add(rightFrontFoot);
      
      const leftBackFoot = new THREE.Mesh(footGeometry, footMaterial);
      leftBackFoot.position.set(-0.2, 0, -0.25);
      leftBackFoot.name = "leftBackFoot";
      rabbit.add(leftBackFoot);
      
      const rightBackFoot = new THREE.Mesh(footGeometry, footMaterial);
      rightBackFoot.position.set(0.2, 0, -0.25);
      rightBackFoot.name = "rightBackFoot";
      rabbit.add(rightBackFoot);
      
      // Create tail (small white sphere)
      const tailGeometry = new THREE.SphereGeometry(0.15, 8, 8);
      const tailMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const tail = new THREE.Mesh(tailGeometry, tailMaterial);
      tail.position.set(0, 0.4, -0.5);
      tail.name = "tail";
      rabbit.add(tail);
      
      // Position rabbit on top of planet
      rabbit.position.set(0, 4.5, 0); // Positioned on "north pole" of planet with radius 4
      
      // Orient rabbit to stand on planet
      rabbit.up = new THREE.Vector3(0, 1, 0);
      
      scene.add(rabbit);
    },
    
    startGame() {
      this.showInstructions = false;
      this.isPaused = false;
    },
    
    togglePause() {
      this.isPaused = !this.isPaused;
    },
    
    resetGame() {
      this.showInstructions = true;
      this.isPaused = true;
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
    
    destroy() {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      if (controls) {
        controls.dispose();
      }
      
      window.removeEventListener('resize', this.onResize);
      document.removeEventListener('fullscreenchange', () => {});
      document.removeEventListener('keydown', () => {});
      document.removeEventListener('keyup', () => {});
      
      // Remove wheel listener
      if (this.$refs?.gameCanvas) {
        this.$refs.gameCanvas.removeEventListener('wheel', this.handleZoom);
      }
      
      // Clean up Three.js resources
      if (renderer) {
        renderer.dispose();
      }
      
      scene = null;
      camera = null;
      renderer = null;
      controls = null;
      rabbit = null;
      planet = null;
    }
  };
} 