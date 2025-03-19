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
        0.1, 
        1000
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
      controls.dampingFactor = 0.05;
      controls.target.set(0, 4.5, 0); // Look at the rabbit position
      
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
        }
        
        controls.update();
        renderer.render(scene, camera);
      };
      
      animate();
    },
    
    updateRabbitMovement() {
      if (!rabbit || !planet || isJumping) return;
      
      // Movement speed
      const moveSpeed = 0.02;
      
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
      
      // Determine movement direction based on keys pressed
      if (keys['w'] || keys['arrowup']) {
        // Forward
        rotationAxis.add(cameraRight.clone().multiplyScalar(-1));
        rabbitForward.copy(cameraForward.clone().negate());
      }
      if (keys['s'] || keys['arrowdown']) {
        // Backward
        rotationAxis.add(cameraRight.clone());
        rabbitForward.copy(cameraForward);
      }
      if (keys['a'] || keys['arrowleft']) {
        // Left
        rotationAxis.add(cameraForward.clone().negate());
        rabbitForward.copy(cameraRight);
      }
      if (keys['d'] || keys['arrowright']) {
        // Right
        rotationAxis.add(cameraForward.clone());
        rabbitForward.copy(cameraRight).negate();
      }
      
      // Apply movement if key is pressed
      if (rotationAxis.lengthSq() > 0) {
        rotationAxis.normalize();
        
        // Rotate the planet (which effectively moves the rabbit in the opposite direction)
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
      }
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
    
    createPlanet() {
      // Create simple planet geometry
      const geometry = new THREE.SphereGeometry(4, 32, 32);
      
      // Create noise-based material
      const material = new THREE.MeshStandardMaterial({
        color: 0x44aa44,
        roughness: 0.8,
      });
      
      // Apply noise to vertices for terrain
      const positions = geometry.attributes.position;
      const noise = new SimplexNoise();
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        
        const vertex = new THREE.Vector3(x, y, z);
        const direction = vertex.normalize();
        
        // Generate noise-based height
        const elevation = noise.noise3d(
          direction.x * 2, 
          direction.y * 2, 
          direction.z * 2
        ) * 0.2;
        
        // Apply height to vertex
        vertex.add(direction.multiplyScalar(elevation));
        
        positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }
      
      geometry.computeVertexNormals();
      
      // Create planet mesh
      planet = new THREE.Mesh(geometry, material);
      planet.castShadow = true;
      planet.receiveShadow = true;
      scene.add(planet);
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
      
      // Clean up Three.js resources
      if (renderer) {
        renderer.dispose();
      }
      
      scene = null;
      camera = null;
      renderer = null;
      controls = null;
    }
  };
} 