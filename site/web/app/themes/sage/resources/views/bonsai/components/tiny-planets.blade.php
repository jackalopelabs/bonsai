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
</style>

<div {{ $attributes->merge(['class' => 'tiny-planets-game-container relative w-full h-[500px] rounded-lg overflow-hidden shadow-lg ' . $class]) }}
     x-data="tinyPlanetsGame"
     x-init="initGame"
     x-on:beforeunload.window="destroy"
     tabindex="0">
    <canvas x-ref="gameCanvas" class="w-full h-full"></canvas>
    
    <div class="absolute bottom-4 left-4 right-4 flex justify-between">
        <div class="bg-black/50 text-white px-3 py-1 rounded-md flex gap-3">
            <div>
                <span x-text="score">0</span> points
            </div>
            <div>
                Planets: <span x-text="planetsVisited || 0">0</span>/<span x-text="totalPlanets || 5">5</span>
            </div>
            <div>
                Fuel: <span x-text="fuelRemaining || 100">100</span>%
            </div>
        </div>
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
         class="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-6 text-center">
        <h3 class="text-2xl font-bold mb-4">Tiny Planets Explorer</h3>
        
        <template x-if="gameOver && gameWon">
            <div class="mb-6 text-green-400 text-xl">
                <p>Mission complete! You've explored all the planets!</p>
            </div>
        </template>
        
        <template x-if="gameOver && !gameWon">
            <div class="mb-6 text-red-400 text-xl">
                <p>Out of fuel! Your ship is stranded in space.</p>
            </div>
        </template>
        
        <p class="mb-6">Visit all 5 planets before your fuel runs out!</p>
        <ul class="mb-6 text-left">
            <li class="mb-2">• Use <strong>arrow keys</strong> or <strong>WASD</strong> to navigate</li>
            <li class="mb-2">• Press <strong>spacebar</strong> to boost</li>
            <li class="mb-2">• Press <strong>F</strong> to toggle fullscreen</li>
            <li class="mb-2">• Collect fuel cells to extend your journey</li>
            <li class="mb-2">• Visit all planets to complete your mission</li>
        </ul>
        <button @click="startGame" 
                class="bg-white text-black px-6 py-2 rounded-md hover:bg-gray-200 transition-colors">
            Start Game
        </button>
    </div>
</div> 