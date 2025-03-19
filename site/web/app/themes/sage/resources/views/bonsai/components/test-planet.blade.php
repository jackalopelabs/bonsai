@extends('layouts.app')

@section('content')
  <div class="tiny-planets-container">
    <div class="planets-content">
      <canvas id="planetCanvas"></canvas>
      
      <div id="controls" class="planet-controls">
        <button id="beachBtn">Beach Planet</button>
        <button id="forestBtn">Forest Planet</button>
        <button id="snowBtn">Snow Forest Planet</button>
        <button id="randomBtn">Random Planet</button>
        <button id="rotateToggle">Toggle Auto-Rotation</button>
        <button id="wireframeToggle">Toggle Wireframe</button>
      </div>
      
      <div id="instructions" class="planet-instructions">
        <h3>Controls:</h3>
        <p>Mouse drag - Rotate planet</p>
        <p>Mouse wheel - Zoom in/out</p>
        <p>Auto-rotation - Toggle on/off</p>
        <p>Change planet - Select a planet type</p>
      </div>
    </div>
  </div>
@endsection

<style>
  .tiny-planets-container {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #000;
    color: #fff;
    position: relative;
  }
  
  .planets-content {
    width: 100%;
    height: 100%;
    position: relative;
  }
  
  #planetCanvas {
    width: 100%;
    height: 100%;
    display: block;
  }
  
  .planet-controls {
    position: absolute;
    bottom: 20px;
    left: 20px;
    z-index: 100;
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 5px;
  }
  
  .planet-controls button {
    background-color: #444;
    color: white;
    border: none;
    padding: 8px 12px;
    margin: 4px;
    cursor: pointer;
    border-radius: 4px;
  }
  
  .planet-controls button:hover {
    background-color: #666;
  }
  
  .planet-instructions {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 100;
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 5px;
    max-width: 300px;
  }
</style>

<script>
  window.addEventListener('DOMContentLoaded', function() {
    // Load Three.js from CDN dynamically
    function loadScript(src, callback) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = src;
      script.onload = callback;
      document.head.appendChild(script);
    }
    
    // First load Three.js
    loadScript('https://cdn.jsdelivr.net/npm/three@0.146.0/build/three.min.js', function() {
      // Then load OrbitControls
      loadScript('https://cdn.jsdelivr.net/npm/three@0.146.0/examples/js/controls/OrbitControls.js', function() {
        // Then load our planet scripts in sequence
        loadScript('/app/themes/sage/public/scripts/planets/simplex-noise.js', function() {
          loadScript('/app/themes/sage/public/scripts/planets/materials/AtmosphereMaterial.js', function() {
            loadScript('/app/themes/sage/public/scripts/planets/materials/OceanCausticsMaterial.js', function() {
              loadScript('/app/themes/sage/public/scripts/planets/presets.js', function() {
                loadScript('/app/themes/sage/public/scripts/planets/planet.js', function() {
                  loadScript('/app/themes/sage/public/scripts/tiny-planets-game.js', initGame);
                });
              });
            });
          });
        });
      });
    });
    
    function initGame() {
      // Initialize planet generator
      const canvas = document.getElementById('planetCanvas');
      
      // Make sure tinyPlanetsGame exists
      if (typeof tinyPlanetsGame === 'function') {
        const game = tinyPlanetsGame(canvas, {
          showFPS: true,
          autoRotate: true,
          initialPlanetType: 'beach'
        });
        
        // Initialize the game
        game.init();
        
        // Set up button listeners
        document.getElementById('beachBtn').addEventListener('click', function() {
          game.changePlanetType('beach');
        });
        
        document.getElementById('forestBtn').addEventListener('click', function() {
          game.changePlanetType('forest');
        });
        
        document.getElementById('snowBtn').addEventListener('click', function() {
          game.changePlanetType('snowForest');
        });
        
        document.getElementById('randomBtn').addEventListener('click', function() {
          game.changePlanetType('random');
        });
        
        document.getElementById('rotateToggle').addEventListener('click', function() {
          game.toggleAutoRotate();
        });
        
        document.getElementById('wireframeToggle').addEventListener('click', function() {
          game.toggleWireframe();
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        });
      } else {
        console.error('tinyPlanetsGame function not found!');
      }
    }
  });
</script> 