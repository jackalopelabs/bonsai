@props([
    'class' => '',
    'title' => 'Jackalope Game',
    'subtitle' => 'Help the jackalope collect carrots while avoiding obstacles!',
])

<section class="py-16 {{ $class }}">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">{{ $title }}</h2>
            <p class="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">{{ $subtitle }}</p>
        </div>

        <div class="max-w-4xl mx-auto">
            <x-bonsai::jackalope class="mb-8" />
            
            <div class="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg">
                <h3 class="text-xl font-semibold mb-4">How to Play</h3>
                <ul class="list-disc pl-5 space-y-2">
                    <li>Use <strong>arrow keys</strong> or <strong>WASD</strong> to move the jackalope</li>
                    <li>Press <strong>spacebar</strong> to jump over obstacles</li>
                    <li>Press <strong>F</strong> or click the fullscreen button for a better experience</li>
                    <li>Collect orange carrots to earn points</li>
                    <li>Avoid gray rocks - hitting them ends the game</li>
                    <li>Press <strong>ESC</strong> or <strong>P</strong> to pause the game</li>
                </ul>
            </div>
        </div>
    </div>
</section> 