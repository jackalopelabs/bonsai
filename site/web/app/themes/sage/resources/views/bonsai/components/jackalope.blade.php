@props([
    'class' => '',
])

<div {{ $attributes->merge(['class' => 'jackalope-game-container relative w-full h-[500px] rounded-lg overflow-hidden shadow-lg ' . $class]) }}
     x-data="jackalope3DGame"
     x-init="initGame"
     x-on:beforeunload.window="destroy">
    <canvas x-ref="gameCanvas" class="w-full h-full"></canvas>
    
    <div class="absolute bottom-4 left-4 right-4 flex justify-between">
        <div class="bg-black/50 text-white px-3 py-1 rounded-md">
            <span x-text="score">0</span> points
        </div>
        <div class="flex gap-2">
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
        <h3 class="text-2xl font-bold mb-4">Jackalope Game</h3>
        <p class="mb-6">Help the jackalope collect carrots while avoiding obstacles!</p>
        <ul class="mb-6 text-left">
            <li class="mb-2">• Use arrow keys or WASD to move</li>
            <li class="mb-2">• Collect carrots for points</li>
            <li class="mb-2">• Avoid obstacles</li>
        </ul>
        <button @click="startGame" 
                class="bg-white text-black px-6 py-2 rounded-md hover:bg-gray-200 transition-colors">
            Start Game
        </button>
    </div>
</div>
