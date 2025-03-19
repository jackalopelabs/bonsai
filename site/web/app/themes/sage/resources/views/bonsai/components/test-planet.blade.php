@extends('layouts.app')

@section('content')
<div>
  <div id="loading-planet" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 18px; text-align: center;">
    <div style="border: 4px solid rgba(255, 255, 255, 0.3); border-top: 4px solid #fff; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
    Loading planet...
  </div>
  
  <div id="planet-container" style="width: 100%; height: 500px; background-color: #000; border-radius: 8px; position: relative; overflow: hidden;"></div>
  
  <div id="planet-controls" style="display: none; position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background-color: rgba(0, 0, 0, 0.7); padding: 10px 20px; border-radius: 10px; z-index: 100; display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; max-width: 90%;">
    <div style="display: flex; flex-direction: column; align-items: center; border-right: 1px solid rgba(255, 255, 255, 0.2); padding-right: 10px; margin-right: 10px;">
      <div style="color: #fff; margin-bottom: 5px; font-size: 12px; text-transform: uppercase;">Planet Type</div>
      <div style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: center;">
        <button id="btn-beach" class="planet-type active" data-type="beach" style="background-color: rgba(30, 30, 30, 0.8); color: white; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 5px; padding: 5px 10px; font-size: 12px; cursor: pointer; transition: all 0.2s ease;">Beach</button>
        <button id="btn-forest" class="planet-type" data-type="forest" style="background-color: rgba(30, 30, 30, 0.8); color: white; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 5px; padding: 5px 10px; font-size: 12px; cursor: pointer; transition: all 0.2s ease;">Forest</button>
        <button id="btn-snow" class="planet-type" data-type="snowForest" style="background-color: rgba(30, 30, 30, 0.8); color: white; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 5px; padding: 5px 10px; font-size: 12px; cursor: pointer; transition: all 0.2s ease;">Snow</button>
        <button id="btn-desert" class="planet-type" data-type="desert" style="background-color: rgba(30, 30, 30, 0.8); color: white; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 5px; padding: 5px 10px; font-size: 12px; cursor: pointer; transition: all 0.2s ease;">Desert</button>
        <button id="btn-volcanic" class="planet-type" data-type="volcanic" style="background-color: rgba(30, 30, 30, 0.8); color: white; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 5px; padding: 5px 10px; font-size: 12px; cursor: pointer; transition: all 0.2s ease;">Volcanic</button>
        <button id="btn-alien" class="planet-type" data-type="alien" style="background-color: rgba(30, 30, 30, 0.8); color: white; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 5px; padding: 5px 10px; font-size: 12px; cursor: pointer; transition: all 0.2s ease;">Alien</button>
        <button id="btn-gas" class="planet-type" data-type="gasGiant" style="background-color: rgba(30, 30, 30, 0.8); color: white; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 5px; padding: 5px 10px; font-size: 12px; cursor: pointer; transition: all 0.2s ease;">Gas Giant</button>
        <button id="btn-random" class="planet-type" data-type="random" style="background-color: rgba(30, 30, 30, 0.8); color: white; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 5px; padding: 5px 10px; font-size: 12px; cursor: pointer; transition: all 0.2s ease;">Random</button>
      </div>
    </div>
    
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div style="color: #fff; margin-bottom: 5px; font-size: 12px; text-transform: uppercase;">Options</div>
      <div style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: center;">
        <button id="btn-wireframe" class="toggle-button" style="background-color: rgba(30, 30, 30, 0.8); color: white; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 5px; padding: 5px 10px; font-size: 12px; cursor: pointer; transition: all 0.2s ease;">Wireframe</button>
        <button id="btn-rotate" class="toggle-button active" style="background-color: rgba(100, 149, 237, 0.8); color: white; border: 1px solid rgba(255, 255, 255, 0.8); border-radius: 5px; padding: 5px 10px; font-size: 12px; cursor: pointer; transition: all 0.2s ease;">Auto-Rotate</button>
        <button id="btn-fps" class="toggle-button" style="background-color: rgba(30, 30, 30, 0.8); color: white; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 5px; padding: 5px 10px; font-size: 12px; cursor: pointer; transition: all 0.2s ease;">Show FPS</button>
      </div>
    </div>
  </div>

  <style>
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .planet-type.active,
    .toggle-button.active {
      background-color: rgba(100, 149, 237, 0.8) !important;
      border-color: rgba(255, 255, 255, 0.8) !important;
    }
    
    .planet-type:hover,
    .toggle-button:hover {
      background-color: rgba(60, 60, 60, 0.8) !important;
      border-color: rgba(255, 255, 255, 0.6) !important;
    }
  </style>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      let game = null;
      
      // Load scripts in the correct order
      function loadThree() {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/three@0.137.0/build/three.min.js';
          script.onload = () => {
            console.log('Three.js loaded');
            resolve();
          };
          script.onerror = (err) => {
            console.error('Error loading Three.js:', err);
            reject(err);
          };
          document.head.appendChild(script);
        });
      }

      function loadOrbitControls() {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/three@0.137.0/examples/js/controls/OrbitControls.js';
          script.onload = () => {
            // Make OrbitControls available globally
            window.OrbitControls = THREE.OrbitControls;
            console.log('OrbitControls loaded and made global');
            resolve();
          };
          script.onerror = (err) => {
            console.error('Error loading OrbitControls:', err);
            reject(err);
          };
          document.head.appendChild(script);
        });
      }

      function loadCustomScripts() {
        const basePath = '/app/themes/sage/public/scripts';
        const scripts = [
          `${basePath}/planets/simplex-noise.js`,
          `${basePath}/planets/materials/OceanCausticsMaterial.js`,
          `${basePath}/planets/materials/AtmosphereMaterial.js`,
          `${basePath}/planets/presets.js`,
          `${basePath}/planets/planet.js`,
          `${basePath}/tiny-planets-game.js`
        ];

        let chain = Promise.resolve();
        
        scripts.forEach(src => {
          chain = chain.then(() => {
            return new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = src;
              script.onload = () => {
                console.log(`Loaded ${src}`);
                resolve();
              };
              script.onerror = (err) => {
                console.error(`Error loading script ${src}:`, err);
                reject(err);
              };
              document.head.appendChild(script);
            });
          });
        });
        
        return chain;
      }

      function initGame() {
        // Check if tinyPlanetsGame exists
        if (typeof tinyPlanetsGame !== 'function') {
          console.error('tinyPlanetsGame function not found!');
          document.getElementById('loading-planet').innerHTML = 'Error: Planet generator not loaded correctly.';
          return;
        }

        console.log('Initializing planet game');
        
        // Hide loading indicator, show controls
        document.getElementById('loading-planet').style.display = 'none';
        document.getElementById('planet-controls').style.display = 'flex';
        
        // Initialize the game
        game = tinyPlanetsGame('#planet-container', {
          planetType: 'beach',
          wireframe: false,
          autoRotate: true,
          showFPS: false
        });
        
        game.init();
        
        // Set up event listeners for UI controls
        setupUIControls();
        
        // Handle window resize
        window.addEventListener('resize', function() {
          game.resize();
        });
      }

      function setupUIControls() {
        // Planet type buttons
        const planetTypeButtons = document.querySelectorAll('.planet-type');
        planetTypeButtons.forEach(button => {
          button.addEventListener('click', function() {
            // Update active button
            planetTypeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Change planet type
            const type = this.getAttribute('data-type');
            game.changePlanetType(type);
          });
        });
        
        // Wireframe toggle
        const wireframeButton = document.getElementById('btn-wireframe');
        wireframeButton.addEventListener('click', function() {
          this.classList.toggle('active');
          game.toggleWireframe();
        });
        
        // Auto-rotate toggle
        const rotateButton = document.getElementById('btn-rotate');
        rotateButton.addEventListener('click', function() {
          this.classList.toggle('active');
          game.toggleAutoRotate();
        });
        
        // FPS toggle
        const fpsButton = document.getElementById('btn-fps');
        fpsButton.addEventListener('click', function() {
          this.classList.toggle('active');
          game.toggleFPS();
        });
      }

      // Load scripts in sequence
      loadThree()
        .then(loadOrbitControls)
        .then(loadCustomScripts)
        .then(initGame)
        .catch(error => {
          console.error('Error in script loading sequence:', error);
          document.getElementById('loading-planet').innerHTML = 'Error loading planet. Please try again.';
        });
    });
  </script>
</div>
@endsection 