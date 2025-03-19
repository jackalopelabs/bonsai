@props([
    'class' => ''
])

<div class="{{ $class }} min-h-screen py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="text-4xl font-extrabold text-white sm:text-5xl">
                <span class="block">Jackalope Planet</span>
            </h2>
            <p class="mt-4 text-xl text-indigo-100">
                Explore our interactive 3D Jackalope Planet
            </p>
        </div>
        
        <div class="relative bg-black rounded-xl shadow-xl overflow-hidden" style="height: 70vh; min-height: 500px;">
            {!! do_shortcode('[jackalope-planet height="70vh"]') !!}
        </div>
        
        <div class="mt-12 max-w-3xl mx-auto text-indigo-100 text-lg">
            <p class="mb-4">
                Welcome to Jackalope Planet, an interactive 3D experience built with Three.js. Watch as our little jackalope explores the magical purple planet.
            </p>
            <p>
                This demonstration shows how web technologies can create engaging 3D experiences directly in your browser, no downloads required.
            </p>
        </div>
    </div>
</div> 