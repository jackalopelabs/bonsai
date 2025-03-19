import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import { Planet } from './planets/planet.js';
import { planetPresets } from './planets/presets.js';
import { PlanetMaterialWithCaustics } from './planets/materials/OceanCausticsMaterial.js';
import { createAtmosphereMaterial } from './planets/materials/AtmosphereMaterial.js';

/**
 * Simple Tiny Planets with Rabbit
 */
export default function tinyPlanetsGame() {
  // Store references for cleanup
  let scene, camera, renderer, controls, animationFrameId;
  let rabbit, planet;
  let isRotating = true;
  
  return {
    isFullscreen: false,
    isPaused: false,
    showInstructions: true,
    
    initGame() {
      console.log('Initializing tiny planets game');
      this.setupScene(this.$refs.gameCanvas);
      
      // Handle fullscreen change
      document.addEventListener('fullscreenchange', () => {
        this.isFullscreen = !!document.fullscreenElement;
        this.onResize();
      });
      
      // Handle key presses
      document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'r') {
          isRotating = !isRotating;
        }
        if (e.key.toLowerCase() === 'f') {
          this.toggleFullscreen();
        }
        // Add planet type switching with number keys
        if (e.key === '1') {
          this.setPlanetType('beach');
        }
        if (e.key === '2') {
          this.setPlanetType('forest');
        }
        if (e.key === '3') {
          this.setPlanetType('snowForest');
        }
      });
    },
    
    setupScene(canvas) {
      console.log('Setting up scene with canvas', canvas);
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
      
      // Setup FPS counter
      const fpsCounter = document.createElement('div');
      fpsCounter.style.position = 'absolute';
      fpsCounter.style.top = '10px';
      fpsCounter.style.right = '10px';
      fpsCounter.style.color = 'white';
      fpsCounter.style.fontFamily = 'monospace';
      fpsCounter.style.fontSize = '14px';
      fpsCounter.style.padding = '5px';
      fpsCounter.style.backgroundColor = 'rgba(0,0,0,0.5)';
      fpsCounter.style.borderRadius = '4px';
      fpsCounter.style.zIndex = '1000';
      canvas.parentElement.appendChild(fpsCounter);
      
      // FPS calculation variables
      let frameCount = 0;
      let lastFpsUpdateTime = 0;
      
      // Create simple planet
      this.createPlanet();
      
      // Create rabbit character
      this.createRabbit();
      
      // Add orbit controls
      controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.target.set(0, 1, 0); // Look at the rabbit
      
      // Handle window resize
      window.addEventListener('resize', this.onResize = () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      });
      
      // Animation loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        
        // Update FPS counter
        frameCount++;
        const now = performance.now();
        if (now - lastFpsUpdateTime > 1000) { // Update every second
          const fps = Math.round((frameCount * 1000) / (now - lastFpsUpdateTime));
          fpsCounter.textContent = `FPS: ${fps}`;
          frameCount = 0;
          lastFpsUpdateTime = now;
        }
        
        if (!this.isPaused) {
          // Rotate planet
          if (isRotating && planet) {
            planet.rotation.y += 0.005;
          }
          
          // Animate ocean waves if planet exists
          if (planet && planet.children.length > 0) {
            // First child should be the terrain mesh, second child the ocean mesh (if present)
            if (planet.children.length > 1) {
              const oceanMesh = planet.children[1];
              if (oceanMesh.morphTargetInfluences && oceanMesh.morphTargetInfluences.length > 0) {
                // Animate the morph target influence with a sine wave
                oceanMesh.morphTargetInfluences[0] = Math.sin(performance.now() * 0.0005) * 0.5 + 0.5;
              }
              
              // Update caustics material
              if (oceanMesh.material && oceanMesh.material.update) {
                oceanMesh.material.update();
              }
            }
          }
        }
        
        controls.update();
        renderer.render(scene, camera);
      };
      
      animate();
    },
    
    createPlanet(type = 'beach') {
      console.log('Creating planet of type:', type);
      
      // Remove old planet if it exists
      if (planet) {
        scene.remove(planet);
      }
      
      // Determine planet options based on type
      const preset = planetPresets[type] || planetPresets.beach;
      
      // Create and configure planet with the Planet class
      const planetInstance = new Planet(preset);
      
      // Use async create method from Planet class
      planetInstance.create().then(planetMesh => {
        // Scale up the planet to appropriate size
        planetMesh.scale.set(4, 4, 4);
        
        // Set up the planet mesh
        planetMesh.castShadow = true;
        planetMesh.receiveShadow = true;
        
        // Store reference to the planet
        planet = planetMesh;
        
        // Add planet to scene
        scene.add(planet);
        
        // Position rabbit on top of the new planet
        if (rabbit) {
          rabbit.position.set(0, 4.5, 0);
        }
      }).catch(error => {
        console.error('Error creating planet:', error);
      });
    },
    
    createRabbit() {
      console.log('Creating rabbit');
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
      rabbit.add(leftFrontFoot);
      
      const rightFrontFoot = new THREE.Mesh(footGeometry, footMaterial);
      rightFrontFoot.position.set(0.2, 0, 0.25);
      rabbit.add(rightFrontFoot);
      
      const leftBackFoot = new THREE.Mesh(footGeometry, footMaterial);
      leftBackFoot.position.set(-0.2, 0, -0.25);
      rabbit.add(leftBackFoot);
      
      const rightBackFoot = new THREE.Mesh(footGeometry, footMaterial);
      rightBackFoot.position.set(0.2, 0, -0.25);
      rabbit.add(rightBackFoot);
      
      // Create tail (small white sphere)
      const tailGeometry = new THREE.SphereGeometry(0.15, 8, 8);
      const tailMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const tail = new THREE.Mesh(tailGeometry, tailMaterial);
      tail.position.set(0, 0.4, -0.5);
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
    
    setPlanetType(type) {
      console.log('Planet type selected:', type);
      
      // Check if it's a random planet
      if (type === 'random') {
        const types = ['beach', 'forest', 'snowForest'];
        type = types[Math.floor(Math.random() * types.length)];
      }
      
      // Create a planet of the specified type
      this.createPlanet(type);
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