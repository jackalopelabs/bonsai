@props([
    'class' => '',
    'title' => 'Space Games',
    'subtitle' => 'Explore tiny planets and help the jackalope collect carrots!',
])

<section class="py-16 {{ $class }}">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">{{ $title }}</h2>
            <p class="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">{{ $subtitle }}</p>
        </div>

        <div class="max-w-4xl mx-auto space-y-16">
            <!-- Tiny Planets Game -->
            <div>
                <h3 class="text-2xl font-semibold mb-4 text-center">Tiny Planets Explorer</h3>
                <x-bonsai::tiny-planets class="mb-8" />
                
                <div class="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg">
                    <h4 class="text-xl font-semibold mb-4">How to Explore</h4>
                    <ul class="list-disc pl-5 space-y-2">
                        <li>Click and drag to rotate the view</li>
                        <li>Scroll to zoom in and out</li>
                        <li>Right-click and drag to pan the view</li>
                        <li>Click the fullscreen button for a better experience</li>
                    </ul>
                </div>
            </div>
            
            <!-- Jackalope Game -->
            {{-- <div>
                <h3 class="text-2xl font-semibold mb-4 text-center">Jackalope Game</h3>
                <x-bonsai::jackalope class="mb-8" />
                
                <div class="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg">
                    <h4 class="text-xl font-semibold mb-4">How to Play</h4>
                    <ul class="list-disc pl-5 space-y-2">
                        <li>Use <strong>arrow keys</strong> or <strong>WASD</strong> to move the jackalope</li>
                        <li>Press <strong>spacebar</strong> to jump over obstacles</li>
                        <li>Press <strong>F</strong> or click the fullscreen button for a better experience</li>
                        <li>Collect orange carrots to earn points</li>
                        <li>Avoid gray rocks - hitting them ends the game</li>
                        <li>Press <strong>ESC</strong> or <strong>P</strong> to pause the game</li>
                    </ul>
                </div>
            </div> --}}
        </div>
    </div>
</section> 