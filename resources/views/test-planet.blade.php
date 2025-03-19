<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Planet Test</title>
  <style>
    body {
      margin: 0;
      overflow: hidden;
      background-color: #000;
    }
    #gameCanvas {
      width: 100%;
      height: 100vh;
    }
    .controls-overlay {
      position: absolute;
      bottom: 10px;
      right: 10px;
      color: white;
      padding: 10px;
      z-index: 10;
    }
    .controls-overlay button {
      margin: 5px;
      padding: 8px 16px;
      background-color: rgba(0,0,0,0.5);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .game-instructions {
      position: absolute;
      bottom: 10px;
      left: 10px;
      color: white;
      padding: 10px;
      background-color: rgba(0,0,0,0.5);
      border-radius: 5px;
      max-width: 300px;
      z-index: 10;
    }
    .planet-controls {
      position: absolute;
      top: 10px;
      left: 10px;
      color: white;
      padding: 10px;
      background-color: rgba(0,0,0,0.5);
      border-radius: 5px;
      z-index: 10;
    }
    .planet-controls button {
      margin: 5px;
      padding: 8px 16px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
      display: block;
      width: 100%;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/math/SimplexNoise.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.13.3/dist/cdn.min.js" defer></script>
</head>
<body>
  <div class="tiny-planets-game-container relative w-full h-full rounded-lg overflow-hidden shadow-lg"
       tabindex="0">
    <canvas id="gameCanvas" class="w-full h-full"></canvas>
    
    <!-- Planet type controls -->
    <div class="planet-controls">
      <h3 style="margin-bottom: 10px; font-weight: bold;">Planet Controls</h3>
      <button onclick="window.planetGame.setPlanetType('beach')">Beach Planet</button>
      <button onclick="window.planetGame.setPlanetType('forest')">Forest Planet</button>
      <button onclick="window.planetGame.setPlanetType('snowForest')">Snow Forest Planet</button>
      <button onclick="window.planetGame.setPlanetType('random')">Random Planet</button>
    </div>
    
    <!-- Game instructions -->
    <div class="game-instructions">
      <h3 style="margin-bottom: 10px; font-weight: bold;">Controls</h3>
      <p>R: Toggle planet auto-rotation</p>
      <p>1, 2, 3: Switch planet type (Beach, Forest, Snow)</p>
    </div>
  </div>

  <!-- Include the planet modules directly -->
  <script src="{{ asset('js/planets/materials/AtmosphereMaterial.js') }}"></script>
  <script src="{{ asset('js/planets/materials/OceanCausticsMaterial.js') }}"></script>
  <script src="{{ asset('js/planets/presets.js') }}"></script>
  <script src="{{ asset('js/planets/planet.js') }}"></script>
  <script src="{{ asset('js/tiny-planets-game.js') }}"></script>
  
  <script>
    // Initialize the planet game
    document.addEventListener('DOMContentLoaded', function() {
      window.planetGame = tinyPlanetsGame();
      planetGame.initGame();
      
      // Override the $refs.gameCanvas access
      planetGame.$refs = {
        gameCanvas: document.getElementById('gameCanvas')
      };
    });
  </script>
</body>
</html> 