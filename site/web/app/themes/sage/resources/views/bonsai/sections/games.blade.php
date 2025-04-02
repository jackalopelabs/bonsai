@props([
    'class' => ''
])

<div class="{{ $class }} min-h-screen py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="text-4xl font-extrabold text-white sm:text-5xl">
                <span class="block">Jackalope Planet</span>
                <span class="block text-indigo-400 mt-2">Multiplayer Edition</span>
            </h2>
            <p class="mt-4 text-xl text-indigo-100">
                Experience our interactive 3D game with team-based multiplayer
            </p>
        </div>
        
        <div class="relative bg-black rounded-xl shadow-xl overflow-hidden">
            <div class="absolute top-4 right-4 z-10">
                <button id="fullscreen-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                    </svg>
                    <span>Fullscreen</span>
                </button>
            </div>
            {!! do_shortcode('[jackalopes]') !!}
        </div>
        
        <div class="mt-12 grid md:grid-cols-2 gap-8">
            <div class="text-indigo-100 text-lg">
                <h3 class="text-2xl font-bold text-white mb-4">About Jackalope Planet</h3>
                <p class="mb-4">
                    Welcome to Jackalope Planet Multiplayer, an interactive 3D game experience built with Three.js. Players can join as either Team Jackalope (bunny characters) or Team Merc (human astronauts with flamethrowers).
                </p>
                <p>
                    This demonstration showcases how web technologies can create engaging 3D multiplayer experiences directly in your browser, with no downloads required.
                </p>
            </div>
            
            <div class="text-indigo-100 text-lg">
                <h3 class="text-2xl font-bold text-white mb-4">Game Controls</h3>
                <div class="bg-gray-900 bg-opacity-50 p-6 rounded-lg">
                    <ul class="space-y-2">
                        <li><span class="font-semibold">Movement:</span> WASD keys</li>
                        <li><span class="font-semibold">Look around:</span> Mouse movement</li>
                        <li><span class="font-semibold">Toggle player type:</span> Press T</li>
                        <li><span class="font-semibold">God Mode:</span> Press G</li>
                        <li><span class="font-semibold">Spawn Jackalope:</span> Press 1 (in God Mode)</li>
                        <li><span class="font-semibold">Spawn Merc:</span> Press 2 (in God Mode)</li>
                        <li><span class="font-semibold">Show Player Info:</span> Press P</li>
                        <li><span class="font-semibold">Fire flamethrower:</span> Click (as Merc)</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="mt-12 text-indigo-100 text-lg bg-indigo-900 bg-opacity-30 p-6 rounded-lg">
            <h3 class="text-2xl font-bold text-white mb-4">God Mode Instructions</h3>
            <p class="mb-4">
                God Mode allows you to spawn and control multiple players for testing the multiplayer experience:
            </p>
            <ol class="list-decimal pl-6 space-y-2">
                <li>Press G to toggle God Mode (you'll see a player info panel appear)</li>
                <li>Press 1 to spawn a Team Jackalope player</li>
                <li>Press 2 to spawn a Team Merc player</li>
                <li>Press T to cycle between controlling different players</li>
                <li>Watch as the inactive players continue to exist in the world</li>
            </ol>
            <p class="mt-4">
                In an actual multiplayer session, other players would join from different browsers or devices, but this God Mode allows you to test the experience on your own.
            </p>
        </div>
    </div>
</div>

<style id="jackalope-ui-fix">
/* Core containment styles */
#jackalopes-game-container, 
.jackalopes-game-container,
.jackalope-planet-container,
.relative.bg-black.rounded-xl {
    position: relative !important;
    overflow: visible !important;
    min-height: 600px;
    z-index: 1;
}

/* Fix for UI elements that might get created at body level */
body > .fps-stats,
body > .virtual-gamepad,
body > #stats,
body > .leva-c-kWgxhW,
body > button[style*="position: fixed"],
body > div[style*="position: fixed"][style*="z-index"],
body > .jackalopes-ui,
body > .jackalope-ui-element {
    position: absolute !important; 
    z-index: 9999 !important;
    top: auto !important;
    left: auto !important;
}

/* Game container selectors */
.jackalopes-game-container canvas,
#jackalopes-game-container canvas,
.relative.bg-black.rounded-xl canvas {
    width: 100% !important;
    height: 100% !important;
    display: block !important;
}

/* Fullscreen mode */
.game-fullscreen,
.jp-fullscreen,
.fullscreen-active {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 9999 !important;
    background: #000 !important;
    margin: 0 !important;
    padding: 0 !important;
}

/* Ensure UI elements are visible in fullscreen */
.game-fullscreen .fps-stats,
.game-fullscreen #stats,
.game-fullscreen .leva-c-kWgxhW,
.game-fullscreen .jackalopes-ui,
.game-fullscreen div[style*="position: fixed"],
.game-fullscreen button,
.jp-fullscreen .fps-stats,
.jp-fullscreen #stats,
.jp-fullscreen .leva-c-kWgxhW,
.jp-fullscreen .jackalopes-ui,
.jp-fullscreen div[style*="position: fixed"],
.jp-fullscreen button,
.fullscreen-active .fps-stats,
.fullscreen-active #stats,
.fullscreen-active .leva-c-kWgxhW,
.fullscreen-active .jackalopes-ui,
.fullscreen-active div[style*="position: fixed"],
.fullscreen-active button {
    position: fixed !important;
    z-index: 10000 !important;
    display: block !important;
}

/* Add class to make elements visible in fullscreen */
.jackalope-ui-element {
    z-index: 10000 !important;
}

/* Fix for Leva UI panel specifically */
.leva-c-kWgxhW {
    z-index: 10000 !important;
    position: absolute !important;
    top: 10px !important;
    right: 10px !important;
}

/* Fix for Game Stats */
#stats {
    position: absolute !important;
    top: 10px !important;
    left: 10px !important;
    z-index: 10000 !important;
}

/* Fullscreen button styles when active */
#fullscreen-btn.exit {
    position: fixed !important;
    top: 10px !important;
    right: 10px !important;
    z-index: 10001 !important;
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Jackalope UI containment and fullscreen handler');
    
    // Function to find game container - try multiple possible selectors
    function findGameContainer() {
        return document.querySelector('.jackalopes-game-container') || 
               document.querySelector('#jackalopes-game-container') ||
               document.querySelector('.jackalope-planet-container') ||
               document.querySelector('#jackalope-planet-container') ||
               document.querySelector('.relative.bg-black.rounded-xl');
    }
    
    // Set up enhanced UI containment for all game UI elements
    function setupUIContainment() {
        // Find the game container
        const gameContainer = findGameContainer();
        if (!gameContainer) {
            console.log('Game container not found yet, waiting...');
            
            // Wait for it to be created
            const observer = new MutationObserver((mutations) => {
                const container = findGameContainer();
                if (container) {
                    console.log('Game container found:', container);
                    observer.disconnect();
                    setupUIContainmentForContainer(container);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            // Also check again after a short delay
            setTimeout(() => {
                const container = findGameContainer();
                if (container) {
                    console.log('Game container found after delay:', container);
                    setupUIContainmentForContainer(container);
                }
            }, 1000);
        } else {
            console.log('Game container found immediately:', gameContainer);
            setupUIContainmentForContainer(gameContainer);
        }
    }
    
    // Function to set up containment for a specific container
    function setupUIContainmentForContainer(container) {
        console.log('Setting up UI containment for container:', container);
        
        // Add a class for easier styling
        container.classList.add('jackalope-game-container');
        
        // Set up fullscreen functionality
        setupFullscreenHandler(container);
        
        // Find all UI elements and move them into the container
        function relocateUIElements() {
            // List of selectors for UI elements
            const uiSelectors = [
                '.fps-stats', 
                '.virtual-gamepad',
                '#stats',
                '.leva-c-kWgxhW',
                'div[style*="position: fixed"][style*="z-index"]',
                'button[style*="position: fixed"][style*="z-index"]',
                '.jackalopes-ui'
            ];
            
            // Find all UI elements
            uiSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                
                elements.forEach(element => {
                    // Skip if already in the container
                    if (element.parentElement === container) {
                        return;
                    }
                    
                    console.log('Moving UI element into container:', element);
                    
                    // Add class for easier styling
                    element.classList.add('jackalope-ui-element');
                    
                    // Get current position
                    const rect = element.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();
                    
                    // Calculate relative position within container
                    let top = rect.top - containerRect.top;
                    let left = rect.left - containerRect.left;
                    
                    // Ensure element doesn't go outside container
                    top = Math.max(0, Math.min(top, containerRect.height - 50));
                    left = Math.max(0, Math.min(left, containerRect.width - 50));
                    
                    // Move to container
                    container.appendChild(element);
                    
                    // Set position
                    element.style.position = 'absolute';
                    element.style.top = top + 'px';
                    element.style.left = left + 'px';
                    element.style.zIndex = '9999';
                });
            });
        }
        
        // Relocate UI elements initially
        relocateUIElements();
        
        // Set up observer to detect new UI elements
        const observer = new MutationObserver((mutations) => {
            let shouldRelocate = false;
            
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.nodeType === 1) { // Element node
                            if (node.classList && 
                                (node.classList.contains('fps-stats') || 
                                 node.id === 'stats' || 
                                 node.classList.contains('leva-c-kWgxhW') ||
                                 node.classList.contains('jackalopes-ui') ||
                                 node.style.position === 'fixed')) {
                                shouldRelocate = true;
                                break;
                            }
                        }
                    }
                }
            });
            
            if (shouldRelocate) {
                relocateUIElements();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        
        // Also set an interval to check periodically
        setInterval(relocateUIElements, 1000);
    }
    
    // Set up fullscreen functionality
    function setupFullscreenHandler(container) {
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (!fullscreenBtn) {
            console.log('Fullscreen button not found');
            return;
        }
        
        console.log('Setting up fullscreen handler for container:', container);
        
        fullscreenBtn.addEventListener('click', function() {
            if (!document.fullscreenElement) {
                // Enter fullscreen
                console.log('Entering fullscreen');
                
                try {
                    // First, mark all UI elements
                    const uiElements = document.querySelectorAll('.fps-stats, #stats, .leva-c-kWgxhW, .jackalopes-ui, div[style*="position: fixed"], button[style*="position: fixed"]');
                    uiElements.forEach(el => {
                        el.classList.add('jackalope-ui-element');
                        el.dataset.originalPosition = window.getComputedStyle(el).position;
                        el.dataset.originalZIndex = window.getComputedStyle(el).zIndex;
                    });
                    
                    // Request fullscreen
                    container.requestFullscreen().then(() => {
                        container.classList.add('game-fullscreen');
                        fullscreenBtn.classList.add('exit');
                        
                        // Update button
                        fullscreenBtn.innerHTML = `
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20H5m0 0v-4m0 4l5-5m11 5l-5-5m5 5v-4m0 4h-4M4 8V4m0 0h4M4 4l5 5"></path>
                            </svg>
                            <span>Exit Fullscreen</span>
                        `;
                        
                        // Fix UI elements
                        uiElements.forEach(el => {
                            el.style.position = 'fixed';
                            el.style.zIndex = '10000';
                        });
                        
                        // Add temporary style
                        const style = document.createElement('style');
                        style.id = 'temp-fullscreen-fix';
                        style.textContent = `
                            body > .jackalope-ui-element {
                                position: fixed !important;
                                z-index: 10000 !important;
                                display: block !important;
                            }
                        `;
                        document.head.appendChild(style);
                        
                        // Trigger resize
                        window.dispatchEvent(new Event('resize'));
                    }).catch(err => {
                        console.error('Error entering fullscreen:', err);
                    });
                } catch (e) {
                    console.error('Could not request fullscreen:', e);
                }
            } else {
                // Exit fullscreen
                document.exitFullscreen().catch(err => {
                    console.error('Error exiting fullscreen:', err);
                }).finally(() => {
                    // Clean up
                    container.classList.remove('game-fullscreen');
                    fullscreenBtn.classList.remove('exit');
                    
                    // Update button
                    fullscreenBtn.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                        </svg>
                        <span>Fullscreen</span>
                    `;
                    
                    // Restore UI elements
                    const uiElements = document.querySelectorAll('.jackalope-ui-element');
                    uiElements.forEach(el => {
                        if (el.dataset.originalPosition) {
                            el.style.position = el.dataset.originalPosition;
                        }
                        if (el.dataset.originalZIndex) {
                            el.style.zIndex = el.dataset.originalZIndex;
                        }
                    });
                    
                    // Remove temporary style
                    const tempStyle = document.getElementById('temp-fullscreen-fix');
                    if (tempStyle) {
                        tempStyle.remove();
                    }
                    
                    // Trigger resize
                    window.dispatchEvent(new Event('resize'));
                });
            }
        });
        
        // Handle ESC key and other ways of exiting fullscreen
        document.addEventListener('fullscreenchange', function() {
            if (!document.fullscreenElement && container.classList.contains('game-fullscreen')) {
                container.classList.remove('game-fullscreen');
                fullscreenBtn.classList.remove('exit');
                
                // Update button
                fullscreenBtn.innerHTML = `
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                    </svg>
                    <span>Fullscreen</span>
                `;
                
                // Restore UI elements
                const uiElements = document.querySelectorAll('.jackalope-ui-element');
                uiElements.forEach(el => {
                    if (el.dataset.originalPosition) {
                        el.style.position = el.dataset.originalPosition;
                    }
                    if (el.dataset.originalZIndex) {
                        el.style.zIndex = el.dataset.originalZIndex;
                    }
                });
                
                // Remove temporary style
                const tempStyle = document.getElementById('temp-fullscreen-fix');
                if (tempStyle) {
                    tempStyle.remove();
                }
                
                // Trigger resize
                window.dispatchEvent(new Event('resize'));
            }
        });
    }
    
    // Initialize UI containment
    setupUIContainment();
});
</script>