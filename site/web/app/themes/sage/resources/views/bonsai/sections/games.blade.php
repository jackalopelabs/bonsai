@props([
    'class' => ''
])

<div class="{{ $class }} min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="text-4xl font-extrabold text-white sm:text-5xl">
                <span class="block">Jackalope Planet</span>
            </h2>
            <p class="mt-4 text-xl text-indigo-100">
                Explore the interactive 3D world of Jackalope Planet
            </p>
        </div>
        
        <div class="relative bg-black rounded-xl shadow-xl overflow-hidden" style="height: 70vh; min-height: 500px;">
            <!-- Jackalope Planet Component -->
            <div 
                x-data="{
                    loaded: false,
                    init() {
                        window.addEventListener('message', (event) => {
                            if (event.data === 'jackalope-planet-loaded') {
                                this.loaded = true;
                            }
                        });
                    }
                }"
                class="w-full h-full relative"
            >
                <!-- Loading overlay -->
                <div 
                    x-show="!loaded" 
                    class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10"
                >
                    <div class="text-center">
                        <svg class="animate-spin h-12 w-12 text-indigo-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p class="text-indigo-100 text-lg">Loading Jackalope Planet...</p>
                    </div>
                </div>
                
                <!-- Embedded iframe -->
                <iframe 
                    src="https://jackalope-planet.vercel.app" 
                    class="w-full h-full border-0" 
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                    loading="lazy"
                    onload="this.contentWindow.postMessage('check-loaded', '*');"
                ></iframe>
            </div>
            
            <!-- Controls hint -->
            <div class="absolute bottom-4 left-0 right-0 text-center text-white bg-black bg-opacity-50 py-2 px-4 text-sm">
                <p>WASD to move • Mouse to look • Space to jump • Shift to run</p>
            </div>
        </div>
        
        <div class="mt-12 max-w-3xl mx-auto text-indigo-100 text-lg">
            <p class="mb-4">
                Welcome to Jackalope Planet, an interactive 3D experience built with Three.js. Explore the landscape, discover hidden features, and enjoy the immersive environment.
            </p>
            <p>
                This experimental game world demonstrates how web technologies can create engaging 3D experiences directly in your browser, no downloads required.
            </p>
        </div>
    </div>
</div> 