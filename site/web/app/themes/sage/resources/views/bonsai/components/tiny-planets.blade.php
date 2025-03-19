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
    
    /* Control panel styles */
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
    }
    
    .planet-controls button:hover {
        background-color: #45a049;
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
</style>

<div {{ $attributes->merge(['class' => 'tiny-planets-game-container relative w-full h-[500px] rounded-lg overflow-hidden shadow-lg ' . $class]) }}
     x-data="tinyPlanetsGame"
     x-init="initGame"
     x-on:beforeunload.window="destroy"
     tabindex="0">
    <canvas x-ref="gameCanvas" class="w-full h-full"></canvas>
    
    <!-- Planet type controls -->
    <div class="planet-controls">
        <h3 class="text-lg font-semibold mb-2">Planet Controls</h3>
        <button @click="setPlanetType('beach')">Beach Planet</button>
        <button @click="setPlanetType('forest')">Forest Planet</button>
        <button @click="setPlanetType('snow')">Snow Forest Planet</button>
        <button @click="setPlanetType('random')">Random Planet</button>
    </div>
    
    <!-- Game instructions -->
    <div class="game-instructions">
        <h3 class="text-lg font-semibold mb-2">Bunny Controls</h3>
        <p>WASD or Arrow Keys: Move the bunny around the planet</p>
        <p>Space: Jump (bunny jumps away from planet)</p>
        <p>Mouse Wheel: Zoom in/out (try microscopic zoom for extreme close-ups!)</p>
        <p>Click and Drag: Change camera angle around the bunny</p>
        <p>R: Toggle planet auto-rotation</p>
        <p>1, 2, 3: Switch planet type (Beach, Forest, Snow)</p>
        <p>Ctrl+D: Toggle debug ray visualization</p>
    </div>
    
    <!-- Game status and controls -->
    <div class="absolute bottom-4 right-4 flex justify-end">
        <div class="flex gap-2">
            <button @click="toggleFullscreen" 
                    class="bg-black/50 text-white px-3 py-1 rounded-md hover:bg-black/70 transition-colors">
                <span x-text="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'">Fullscreen</span>
            </button>
            <button @click="togglePause" 
                    class="bg-black/50 text-white px-3 py-1 rounded-md hover:bg-black/70 transition-colors">
                <span x-text="isPaused ? 'Resume' : 'Pause'">Pause</span>
            </button>
            <button @click="resetGame" 
                    class="bg-black/50 text-white px-3 py-1 rounded-md hover:bg-black/70 transition-colors">
                Reset
            </button>
        </div>
    </div>
    
    <!-- Game instructions overlay -->
    <div x-show="showInstructions" 
         class="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-6 text-center z-20">
        <h3 class="text-2xl font-bold mb-4">Tiny Planets Explorer</h3>
        
        <p class="mb-6">Control a bunny on tiny procedural planets!</p>
        <ul class="mb-6 text-left">
            <li class="mb-2">• Use <strong>arrow keys</strong> or <strong>WASD</strong> to move the bunny</li>
            <li class="mb-2">• Press <strong>spacebar</strong> to jump</li>
            <li class="mb-2">• Mouse wheel to zoom in/out</li>
            <li class="mb-2">• Click and drag to change camera angle</li>
            <li class="mb-2">• Press <strong>R</strong> to toggle planet rotation</li>
            <li class="mb-2">• Press <strong>F</strong> to toggle fullscreen</li>
            <li class="mb-2">• Try microscopic zoom level for extreme close-ups!</li>
        </ul>
        <button @click="startGame" 
                class="bg-white text-black px-6 py-2 rounded-md hover:bg-gray-200 transition-colors">
            Start Game
        </button>
    </div>
</div> 