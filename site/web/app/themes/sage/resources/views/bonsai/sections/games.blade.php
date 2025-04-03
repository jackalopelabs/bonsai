@props([
    'class' => ''
])

<div class="{{ $class }} min-h-screen py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
            <h2 class="text-4xl font-extrabold text-white sm:text-5xl">
                <div class="flex items-center justify-center">
                    <span class="flex items-center">
                        <svg class="h-12 w-12 mr-2 p-1" height="28" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 33" style="fill: white"><path d="M12.7 14.6c-2 0-3.9.3-5.8 1.2-2.1 1-3.2 3.4-4.2 5.4-.3.8-.5 1.7-.7 2.5-.1.9.1 1.8-.1 2.7-2.4-.4-1.2 5.9.6 4.1-.2 1.5.6 1.6 1.7 1.1 1-.5 1.9-.6 3-.8.8-.1.7-.2 1.1-.8.1-.3.6-1 1.1-.7.6.3-.2 2.1-.1 2.8.1 1.1 1.2.7 2.2.8.9 0 1.8.2 2.7.1.5 0 1.1 0 1.4-.4.3-.5.1-1-.2-1.3-.7-.5-1.9-.3-2.8-.2-1.2.1-1.9-.2-1.4-1.5.4-1 .9-1.9 1.3-2.8.4-1 .3-2.4 1.6-2.1 1.4.4 1.5 1.2 1.7 2.5.3 1.4 1.2 5.6 3.1 5.1.2 0 .2-.7.4-.9.3 0 .6.6 1 .6.8-.2.5-.5.1-1-.9-1.1-.9-1.9-1.1-3.2-.2-1.1-.9-2.4-.8-3.4 0-1 1.3-1.6 2-2.2.9-.8 1.4-1.6 1.7-2.7.1-.5.2-1.2.6-1.5.4-.3.9 0 1.3-.1.9-.1 1.9-.6 2-1.6.1-1.1-.5-1.9-.5-2.8 0-.8.4-.8-.3-1.4-.4-.3-1-.4-.8-1 .1-.5.8-1.3 1.2-1.6.4-.4.7-.8 1.1-1.2.9-1 2-.5 3.1-1.9-.7-.2-1.8 1.4-2.2.5-.2-.5.7-2.5 1.1-3 .5-1 1.4-1.9 0-3.8-.2.9.1 1.1-.1 2.1-.2 1.1-.7 2-1.4 2.9-.6 1-1.2 2-1.7 3.1-.3.5-1.2 2.6-1.9 2.7-1 .1 0-2.3.2-2.9.4-1.1.8-2.1 1-3.2.1-.9.5-2.3 0-3.2-.5-1-2-1.1-2.5 0-.8 1.8 1 4.7-.2 6.3-1 1.4-1-1-.9-1.6.2-1.1-.5-1.7-.7-2.9-.1-.6-.1-1.3-.2-1.9-.4.4-.5 1-.4 1.4-.5.1-.7-.6-1.1-.8-.5-.2-1.1 0-1.4.3-.9.7-.4 2.1-.1 3 .4 1.1.7 2.1 1.1 3.2.5 1.1 1.2 2.1 1.6 3.2.3 1-.6 2.2-1.6 2.3"></path></svg>
                        Jackalopes
                    </span>
                </div>
                <span class="block text-indigo-400 mt-2 text-sm">Multiplayer Edition</span>
            </h2>
            {{-- <p class="mt-4 text-xl text-indigo-100 text-xs">
                Jackalope Planet is a multiplayer game experience built with Three.js. Players can join as either Team Jackalope (bunny characters) or Team Merc (human astronauts with flamethrowers).
            </p> --}}
        </div>
        
        <div id="jackalope-game-container" class="relative bg-black rounded-xl shadow-xl overflow-hidden" style="height: 600px;">
            <!-- Debug info -->
            <div id="debug-info" class="absolute top-0 left-0 bg-black bg-opacity-50 text-white p-2 text-xs z-50"></div>
            
            <!-- Simplified fullscreen button -->
            <button id="fullscreen-btn" class="absolute top-4 right-4 z-30 text-gray-100 px-4 py-2 rounded-lg flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                </svg>
            </button>
            
            <!-- Simplified click-to-play overlay -->
            <div id="jackalope-click-to-play" class="absolute inset-0 flex items-center justify-center z-20 bg-black bg-opacity-70">
                <div class="text-center p-6 bg-indigo-900 rounded-lg shadow-lg">
                    <svg class="w-16 h-16 mx-auto mb-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    <h3 class="text-2xl font-bold text-white mb-2">Click to Play</h3>
                    <p class="text-indigo-200 mb-4">Click here to activate the game controls.</p>
                    <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium">
                        Start Game
                    </button>
                </div>
            </div>
            
            <!-- Game shortcode -->
            {!! do_shortcode('[jackalopes width="100%" height="100%" disable_ui="false"]') !!}
        </div>
        
        {{-- <div class="mt-12 grid md:grid-cols-2 gap-8">
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
        </div> --}}
    </div>
</div>

<style>
/* Ensure the canvas is properly displayed in all browsers */
#jackalope-game-container canvas {
    display: block !important;
    width: 100% !important;
    height: 100% !important;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
}

/* Ensure the game container is properly sized */
#jackalope-game-container {
    display: block;
    position: relative;
    min-height: 480px;
}

/* Click-to-play overlay */
#jackalope-click-to-play {
    transition: opacity 0.3s ease;
    pointer-events: all;
    cursor: pointer;
    z-index: 20;
}

/* Fullscreen styles */
.game-fullscreen {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 9999 !important;
}

/* Fix for UI elements */
#jackalope-game-container .fps-stats,
#jackalope-game-container #stats,
#jackalope-game-container button {
    z-index: 30 !important;
}

/* Fullscreen button when active */
#fullscreen-btn.exit {
    position: fixed !important;
    top: 10px !important;
    right: 10px !important;
    z-index: 10001 !important;
}

/* Debug info */
#debug-info {
    font-family: monospace;
    white-space: pre;
    max-height: 200px;
    overflow-y: auto;
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const gameContainer = document.getElementById('jackalope-game-container');
    const clickToPlayOverlay = document.getElementById('jackalope-click-to-play');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const debugInfo = document.getElementById('debug-info');
    
    // Debug logging function
    function debugLog(message) {
        console.log(message);
        if (debugInfo) {
            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
            debugInfo.innerHTML += `[${timestamp}] ${message}\n`;
            debugInfo.scrollTop = debugInfo.scrollHeight;
        }
    }
    
    // Log initial state
    debugLog('Initializing Jackalope game...');
    debugLog(`Game container found: ${!!gameContainer}`);
    debugLog(`Click to play overlay found: ${!!clickToPlayOverlay}`);
    debugLog(`Fullscreen button found: ${!!fullscreenBtn}`);
    debugLog(`User agent: ${navigator.userAgent}`);
    debugLog(`Screen size: ${window.innerWidth}x${window.innerHeight}`);
    
    // Click-to-play functionality
    if (clickToPlayOverlay) {
        clickToPlayOverlay.addEventListener('click', function() {
            debugLog('Click to play overlay clicked');
            clickToPlayOverlay.style.opacity = '0';
            setTimeout(() => {
                clickToPlayOverlay.style.display = 'none';
                debugLog('Click to play overlay hidden');
                
                // Force a resize event to ensure the game adapts
                window.dispatchEvent(new Event('resize'));
                debugLog('Resize event dispatched');
                
                // Send a custom event to notify the game to start
                window.dispatchEvent(new CustomEvent('jackalopesGameStarted'));
                debugLog('Game started event dispatched');
            }, 300);
        });
    }
    
    // Fullscreen functionality
    if (fullscreenBtn && gameContainer) {
        fullscreenBtn.addEventListener('click', function() {
            debugLog('Fullscreen button clicked');
            if (!document.fullscreenElement) {
                gameContainer.requestFullscreen().then(() => {
                    debugLog('Entered fullscreen mode');
                    gameContainer.classList.add('game-fullscreen');
                    fullscreenBtn.classList.add('exit');
                    fullscreenBtn.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20H5m0 0v-4m0 4l5-5m11 5l-5-5m5 5v-4m0 4h-4M4 8V4m0 0h4M4 4l5 5"></path>
                        </svg>
                    `;
                    
                    // Make sure canvas is properly sized in fullscreen
                    const canvas = gameContainer.querySelector('canvas');
                    if (canvas) {
                        canvas.style.width = '100vw';
                        canvas.style.height = '100vh';
                        debugLog('Canvas resized for fullscreen');
                    }
                    
                    // Force game to resize
                    window.dispatchEvent(new Event('resize'));
                }).catch(err => {
                    debugLog(`Error entering fullscreen: ${err.message}`);
                });
            } else {
                document.exitFullscreen().catch(err => {
                    debugLog(`Error exiting fullscreen: ${err.message}`);
                }).finally(() => {
                    debugLog('Exited fullscreen mode');
                    gameContainer.classList.remove('game-fullscreen');
                    fullscreenBtn.classList.remove('exit');
                    fullscreenBtn.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                        </svg>
                    `;
                    
                    // Force game to resize
                    window.dispatchEvent(new Event('resize'));
                });
            }
        });
        
        // Handle ESC key for exiting fullscreen
        document.addEventListener('fullscreenchange', function() {
            debugLog('Fullscreen state changed');
            if (!document.fullscreenElement && gameContainer.classList.contains('game-fullscreen')) {
                gameContainer.classList.remove('game-fullscreen');
                fullscreenBtn.classList.remove('exit');
                fullscreenBtn.innerHTML = `
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                    </svg>
                `;
                
                // Force game to resize
                window.dispatchEvent(new Event('resize'));
            }
        });
    }
    
    // Ensure canvas visibility after a short delay
    setTimeout(() => {
        const canvas = gameContainer.querySelector('canvas');
        if (canvas) {
            debugLog('Canvas found, setting display properties');
            canvas.style.display = 'block';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            
            // Log canvas properties
            debugLog(`Canvas dimensions: ${canvas.width}x${canvas.height}`);
            debugLog(`Canvas style: ${canvas.style.cssText}`);
            debugLog(`Canvas computed style: ${window.getComputedStyle(canvas).cssText}`);
        } else {
            debugLog('Canvas not found after timeout');
        }
    }, 1000);
    
    // Make sure controls and UI are visible on mobile
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                debugLog(`DOM mutation detected: ${mutation.addedNodes.length} nodes added`);
                // Check for UI elements that might be added dynamically
                document.querySelectorAll('.fps-stats, #stats, .virtual-gamepad').forEach(el => {
                    debugLog(`UI element found: ${el.tagName}${el.id ? '#' + el.id : ''}${el.className ? '.' + el.className : ''}`);
                    // Ensure they have proper z-index
                    el.style.zIndex = '30';
                    // Ensure they're visible
                    el.style.display = 'block';
                    el.style.opacity = '1';
                    debugLog(`UI element style updated: ${el.style.cssText}`);
                });
            }
        });
    });
    
    observer.observe(gameContainer, { childList: true, subtree: true });
    
    // Add visibility change listener
    document.addEventListener('visibilitychange', function() {
        debugLog(`Document visibility changed: ${document.visibilityState}`);
    });
    
    // Add resize listener
    window.addEventListener('resize', function() {
        debugLog(`Window resized: ${window.innerWidth}x${window.innerHeight}`);
    });
});
</script>