@props([
    'class' => '',
])

<style>
    /* Fullscreen styles */
    .tiny-planets-game-container:fullscreen {
        width: 100vw !important;
        height: 100vh !important;
        padding: 0;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .tiny-planets-game-container:fullscreen canvas {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain;
    }
    
    /* Control panel styles - simplified */
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
    
    .controls-overlay button:hover {
        background-color: rgba(0,0,0,0.7);
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
    
    /* Planet type controls */
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
    
    .planet-controls button:hover {
        background-color: #45a049;
    }
</style>

<div {{ $attributes->merge(['class' => 'tiny-planets-game-container relative w-full h-[500px] rounded-lg overflow-hidden shadow-lg ' . $class]) }}
     x-data="tinyPlanetsGame"
     x-init="initGame"
     x-on:beforeunload.window="destroy"
     tabindex="0">
    <canvas x-ref="gameCanvas" class="w-full h-full"></canvas>
    
    <!-- Game instructions -->
    <div class="game-instructions">
        <h3 class="text-lg font-semibold mb-2">Controls</h3>
        <p>WASD or Arrow Keys: Move the bunny around</p>
        <p>Spacebar: Jump</p>
        <p>Mouse: Click and drag to rotate view</p>
        <p>Mouse Wheel: Zoom in/out (bunny will resize)</p>
        <p>R key: Toggle planet rotation</p>
        <p>F key: Toggle fullscreen</p>
        <p><strong>Try:</strong> Switch between different planet types!</p>
    </div>
    
    <!-- Simplified controls -->
    <div class="controls-overlay">
        <button @click="toggleFullscreen" 
                class="bg-black/50 text-white px-3 py-1 rounded-md hover:bg-black/70 transition-colors">
            <span x-text="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'">Fullscreen</span>
        </button>
        <button @click="togglePause" 
                class="bg-black/50 text-white px-3 py-1 rounded-md hover:bg-black/70 transition-colors">
            <span x-text="isPaused ? 'Resume' : 'Pause'">Pause</span>
        </button>
    </div>
    
    <!-- Start game overlay -->
    <div x-show="showInstructions" 
         class="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-6 text-center z-20">
        <h3 class="text-2xl font-bold mb-4">Tiny Planets Explorer</h3>
        
        <p class="mb-6">Control a bunny on a tiny planet!</p>
        <ul class="mb-6 text-left">
            <li class="mb-2">• Use <strong>WASD</strong> or <strong>arrow keys</strong> to move the bunny</li>
            <li class="mb-2">• Press <strong>spacebar</strong> to jump</li>
            <li class="mb-2">• Click and drag to rotate the view</li>
            <li class="mb-2">• Scroll to zoom in and out (bunny size and speed will change)</li>
            <li class="mb-2">• Press <strong>R</strong> to toggle planet rotation</li>
            <li class="mb-2">• Press <strong>F</strong> for fullscreen</li>
            <li class="mb-2">• Try different planet types: Beach, Forest, and Snow Forest!</li>
        </ul>
        <button @click="startGame" 
                class="bg-white text-black px-6 py-2 rounded-md hover:bg-gray-200 transition-colors">
            Start
        </button>
    </div>
    
    <!-- Planet type controls -->
    <div class="planet-controls">
        <h3 class="text-lg font-semibold mb-2">Planet Types</h3>
        <button @click="setPlanetType('beach')">Beach Planet</button>
        <button @click="setPlanetType('forest')">Forest Planet</button>
        <button @click="setPlanetType('snow')">Snow Forest Planet</button>
        <button @click="setPlanetType('random')">Random Planet</button>
    </div>
</div> 