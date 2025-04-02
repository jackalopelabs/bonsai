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
            {!! do_shortcode('[jackalopes disable_threejs="true"]') !!}
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

<script>
// Initialize the Jackalope Planet game
document.addEventListener('DOMContentLoaded', () => {
    window.DEBUG_MODE = true; // Enable debug mode for more detailed logging
    window.jpLog = function(message, type = 'info') {
        // Only log in debug mode
        if (window.DEBUG_MODE) {
            console.log(message);
        }
    };
    
    // Check if ThreeJS is already loaded by the plugin
    const isThreeJSAlreadyLoaded = () => {
        return (
            typeof THREE !== 'undefined' || 
            typeof window.THREE !== 'undefined' ||
            document.querySelector('script[src*="three.module.js"]') !== null
        );
    };
    
    // Log ThreeJS loading status
    console.log('ThreeJS status:', isThreeJSAlreadyLoaded() ? 'Already loaded by plugin' : 'Not yet loaded');
    
    // Function to find the Jackalope game container, searching through various possible elements
    function findJackalopeContainer() {
        // Try specific selectors first
        let container = document.querySelector('.jackalope-planet-canvas-container') || 
                       document.querySelector('#jackalope-planet-container') || 
                       document.querySelector('.jackalopes-canvas-container') ||
                       document.querySelector('canvas.jackalope-render-target');
        
        // If no container found, look for any canvas element inside the parent div
        if (!container) {
            const parentDiv = document.querySelector('.relative.bg-black.rounded-xl');
            if (parentDiv) {
                const canvas = parentDiv.querySelector('canvas');
                if (canvas) {
                    console.log('Found canvas in parent div');
                    return canvas;
                }
                
                // If still no canvas, use the parent div itself as fallback
                console.log('Using parent div as fallback container');
                return parentDiv;
            }
        }
        
        return container;
    }
    
    // CRITICAL FIX: Ensure keyboard events are properly captured
    function setupGlobalKeyboardCapture() {
        // Track game container focus state
        let gameHasFocus = false;
        const jpContainer = document.getElementById('jackalope-planet-container');
        
        if (jpContainer) {
            // Add event listeners to track focus
            jpContainer.addEventListener('click', () => {
                gameHasFocus = true;
                console.log('Game area clicked - focus acquired');
                
                // Force player state diagnosis on click
                if (window.game && window.game.diagnosePlayerState) {
                    setTimeout(() => {
                        window.game.diagnosePlayerState(true); // Force fix
                    }, 100);
                }
            });
            
            document.body.addEventListener('click', (e) => {
                // Check if click was outside game area
                if (!jpContainer.contains(e.target)) {
                    gameHasFocus = false;
                    console.log('Clicked outside game area - focus lost');
                }
            });
            
            // CRITICAL FIX: Global window-level keydown and keyup handlers
            // These will work even when the canvas doesn't have focus
            window.addEventListener('keydown', (e) => {
                // Update global keyboard state
                window.keyboardState = window.keyboardState || {};
                window.keyboardState[e.code] = true;
                
                // Force key state sync in game, even without focus
                if (window.game && window.game.inputManager) {
                    const im = window.game.inputManager;
                    
                    // Handle WASD keys
                    if (e.code === 'KeyW') im.keys.w = true;
                    if (e.code === 'KeyA') im.keys.a = true;
                    if (e.code === 'KeyS') im.keys.s = true;
                    if (e.code === 'KeyD') im.keys.d = true;
                    if (e.code === 'Space') im.keys.space = true;
                    
                    // Update movement flags
                    im.moveForward = im.keys.w;
                    im.moveBackward = im.keys.s;
                    im.moveLeft = im.keys.a;
                    im.moveRight = im.keys.d;
                    
                    if (!gameHasFocus && (e.code === 'KeyW' || e.code === 'KeyA' || e.code === 'KeyS' || e.code === 'KeyD')) {
                        console.log(`Key ${e.code} pressed while game doesn't have focus - forcing state update`);
                    }
                }
            });
            
            window.addEventListener('keyup', (e) => {
                // Update global keyboard state
                window.keyboardState = window.keyboardState || {};
                window.keyboardState[e.code] = false;
                
                // Force key state sync in game, even without focus
                if (window.game && window.game.inputManager) {
                    const im = window.game.inputManager;
                    
                    // Handle WASD keys
                    if (e.code === 'KeyW') im.keys.w = false;
                    if (e.code === 'KeyA') im.keys.a = false;
                    if (e.code === 'KeyS') im.keys.s = false;
                    if (e.code === 'KeyD') im.keys.d = false;
                    if (e.code === 'Space') im.keys.space = false;
                    
                    // Update movement flags
                    im.moveForward = im.keys.w;
                    im.moveBackward = im.keys.s;
                    im.moveLeft = im.keys.a;
                    im.moveRight = im.keys.d;
                }
            });
        }
    }
    
    // Restore fullscreen functionality
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    
    // Find the game container - try multiple possible selectors
    const gameContainer = findJackalopeContainer();
    
    console.log('Found game container for fullscreen:', gameContainer ? 'Yes' : 'No');
    
    if (fullscreenBtn && gameContainer) {
        // Store a reference to the game container that will update if found later
        let dynamicGameContainer = gameContainer;
        
        // Watch for changes to the DOM that might add the game container
        const gameContainerObserver = new MutationObserver((mutations) => {
            // Only look for the container if we haven't found it yet
            if (!dynamicGameContainer) {
                console.log('DOM changed, searching for game container again');
                dynamicGameContainer = findJackalopeContainer();
                
                if (dynamicGameContainer) {
                    console.log('Found game container after DOM change');
                    gameContainerObserver.disconnect();
                }
            }
        });
        
        // Start observing for the game container
        gameContainerObserver.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
        
        // Add a click handler for the fullscreen button
        fullscreenBtn.addEventListener('click', () => {
            console.log('Fullscreen button clicked');
            
            if (!document.fullscreenElement) {
                // Request fullscreen on the container
                console.log('Requesting fullscreen for element:', dynamicGameContainer);
                
                try {
                    dynamicGameContainer.requestFullscreen().then(() => {
                        // Update button text and icon
                        fullscreenBtn.innerHTML = `
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20H5m0 0v-4m0 4l5-5m11 5l-5-5m5 5v-4m0 4h-4M4 8V4m0 0h4M4 4l5 5"></path>
                            </svg>
                            <span>Exit Fullscreen</span>
                        `;
                    }).catch(err => {
                        console.error('Error attempting to enable fullscreen:', err);
                    });
                } catch (err) {
                    console.error('Exception when trying to enter fullscreen:', err);
                    
                    // Try with parent element as fallback
                    try {
                        console.log('Trying with parent element as fallback');
                        const parentElement = dynamicGameContainer.parentElement;
                        if (parentElement) {
                            parentElement.requestFullscreen();
                        }
                    } catch (fallbackErr) {
                        console.error('Fallback fullscreen also failed:', fallbackErr);
                    }
                }
            } else {
                // Exit fullscreen
                document.exitFullscreen().then(() => {
                    // Reset button text and icon
                    fullscreenBtn.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                        </svg>
                        <span>Fullscreen</span>
                    `;
                }).catch(err => {
                    console.error('Error attempting to exit fullscreen:', err);
                });
            }
        });
    
        // Handle fullscreen changes from other sources (like pressing Esc)
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                fullscreenBtn.innerHTML = `
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                    </svg>
                    <span>Fullscreen</span>
                `;
            }
        });
    } else {
        console.error('Could not find fullscreen button or game container', { 
            fullscreenBtn: !!fullscreenBtn, 
            gameContainer: !!gameContainer 
        });
        
        // Add event listener directly to the button regardless
        if (fullscreenBtn) {
            // Set up a mutation observer to watch for the container being added
            let dynamicGameContainer = null;
            
            const gameContainerObserver = new MutationObserver((mutations) => {
                if (!dynamicGameContainer) {
                    dynamicGameContainer = findJackalopeContainer();
                    if (dynamicGameContainer) {
                        console.log('Found game container after DOM change (fallback case)');
                    }
                }
            });
            
            // Start observing
            gameContainerObserver.observe(document.body, { 
                childList: true, 
                subtree: true 
            });
            
            fullscreenBtn.addEventListener('click', () => {
                console.log('Fullscreen button clicked, finding container dynamically');
                
                // Use the observed container if available, or try to find it again
                const containerToUse = dynamicGameContainer || 
                                      findJackalopeContainer() || 
                                      document.querySelector('.relative.bg-black.rounded-xl') ||
                                      document.querySelector('canvas');
                
                if (containerToUse) {
                    try {
                        containerToUse.requestFullscreen().then(() => {
                            // Update button text and icon when successful
                            fullscreenBtn.innerHTML = `
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20H5m0 0v-4m0 4l5-5m11 5l-5-5m5 5v-4m0 4h-4M4 8V4m0 0h4M4 4l5 5"></path>
                                </svg>
                                <span>Exit Fullscreen</span>
                            `;
                        }).catch(err => {
                            console.error('Error in fallback fullscreen:', err);
                            
                            // Try parent as last resort
                            if (containerToUse.parentElement) {
                                containerToUse.parentElement.requestFullscreen().catch(
                                    e => console.error('Parent fallback also failed:', e)
                                );
                            }
                        });
                    } catch (err) {
                        console.error('Dynamic fullscreen attempt failed:', err);
                    }
                } else {
                    // Last resort: try to fullscreen the game's parent div
                    const gameParent = document.querySelector('.relative.bg-black.rounded-xl');
                    if (gameParent) {
                        gameParent.requestFullscreen().catch(e => console.error('Last resort fallback failed:', e));
                    }
                }
            });
            
            // Handle fullscreen exit the same way as before
            document.addEventListener('fullscreenchange', () => {
                if (!document.fullscreenElement) {
                    fullscreenBtn.innerHTML = `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                        </svg>
                        <span>Fullscreen</span>
                    `;
                }
            });
        }
    }
    
    // Add debugging tools and initialize game
    const jpContainer = document.getElementById('jackalope-planet-container');
    if (jpContainer) {
        // Setup key debugging overlay
        const keyDebug = document.createElement('div');
        keyDebug.style.position = 'fixed';
        keyDebug.style.bottom = '10px';
        keyDebug.style.right = '10px';
        keyDebug.style.backgroundColor = 'rgba(0,0,0,0.7)';
        keyDebug.style.color = 'white';
        keyDebug.style.padding = '10px';
        keyDebug.style.fontFamily = 'monospace';
        keyDebug.style.fontSize = '12px';
        keyDebug.style.zIndex = '9999';
        keyDebug.innerHTML = 'Key Debug: Initializing...';
        document.body.appendChild(keyDebug);
        
        // Setup global keyboard state for debugging
        window.keyboardState = {};
        document.addEventListener('keydown', (e) => {
            window.keyboardState[e.code] = true;
            updateKeyDebug();
        });
        document.addEventListener('keyup', (e) => {
            window.keyboardState[e.code] = false;
            updateKeyDebug();
        });
        
        // Update key debug display
        function updateKeyDebug() {
            const wasd = {
                'KeyW': window.keyboardState['KeyW'] === true,
                'KeyA': window.keyboardState['KeyA'] === true,
                'KeyS': window.keyboardState['KeyS'] === true,
                'KeyD': window.keyboardState['KeyD'] === true,
                'Space': window.keyboardState['Space'] === true
            };
            
            keyDebug.innerHTML = `Key Debug: W:${wasd.KeyW ? '✅' : '❌'} A:${wasd.KeyA ? '✅' : '❌'} S:${wasd.KeyS ? '✅' : '❌'} D:${wasd.KeyD ? '✅' : '❌'} Space:${wasd.Space ? '✅' : '❌'}`;
            
            // If game exists, compare with input manager state
            if (window.game && window.game.inputManager) {
                const im = window.game.inputManager;
                keyDebug.innerHTML += `<br>InputMgr: W:${im.keys.w ? '✅' : '❌'} A:${im.keys.a ? '✅' : '❌'} S:${im.keys.s ? '✅' : '❌'} D:${im.keys.d ? '✅' : '❌'} Space:${im.keys.space ? '✅' : '❌'}`;
                
                // If there's a mismatch, add synchronization button
                const hasKeyMismatch = (wasd.KeyW !== im.keys.w) || 
                                      (wasd.KeyA !== im.keys.a) || 
                                      (wasd.KeyS !== im.keys.s) || 
                                      (wasd.KeyD !== im.keys.d) || 
                                      (wasd.Space !== im.keys.space);
                
                if (hasKeyMismatch) {
                    if (!keyDebug.querySelector('.sync-btn')) {
                        const syncBtn = document.createElement('button');
                        syncBtn.innerText = 'Sync Keys';
                        syncBtn.className = 'sync-btn';
                        syncBtn.style.marginTop = '5px';
                        syncBtn.style.padding = '2px 5px';
                        syncBtn.style.backgroundColor = '#f00';
                        syncBtn.style.color = 'white';
                        syncBtn.style.border = 'none';
                        syncBtn.style.borderRadius = '3px';
                        syncBtn.style.cursor = 'pointer';
                        
                        syncBtn.addEventListener('click', () => {
                            // Force sync keyboard state with input manager
                            if (window.game && window.game.inputManager) {
                                const im = window.game.inputManager;
                                im.keys.w = window.keyboardState['KeyW'] === true;
                                im.keys.a = window.keyboardState['KeyA'] === true;
                                im.keys.s = window.keyboardState['KeyS'] === true;
                                im.keys.d = window.keyboardState['KeyD'] === true;
                                im.keys.space = window.keyboardState['Space'] === true;
                                
                                im.moveForward = im.keys.w;
                                im.moveBackward = im.keys.s;
                                im.moveLeft = im.keys.a;
                                im.moveRight = im.keys.d;
                                
                                updateKeyDebug();
                                
                                // Run diagnostics with force fix
                                if (window.game.diagnosePlayerState) {
                                    window.game.diagnosePlayerState(true);
                                }
                            }
                        });
                        
                        keyDebug.appendChild(syncBtn);
                    }
                } else if (keyDebug.querySelector('.sync-btn')) {
                    keyDebug.querySelector('.sync-btn').remove();
                }
            }
        }
        
        // Update every 100ms to ensure we see the current state
        setInterval(updateKeyDebug, 100);
        
        // Initialize the game, but only if not already initialized by the plugin
        try {
            // Check if the game is already initialized by the plugin
            if (!window.game) {
                if (typeof JackalopeGame === 'function') {
                    console.log('Creating new JackalopeGame instance from theme');
                    window.game = new JackalopeGame(jpContainer.id);
                    console.log('Jackalope Planet game initialized successfully from theme');
                } else {
                    console.log('JackalopeGame constructor not found - waiting for plugin to initialize it');
                    
                    // Set up an observer to detect when the plugin initializes the game
                    const gameCheckInterval = setInterval(() => {
                        if (window.game) {
                            console.log('Game object detected (initialized by plugin)');
                            setupGlobalKeyboardCapture();
                            clearInterval(gameCheckInterval);
                        }
                    }, 500);
                    
                    // Stop checking after 10 seconds to prevent endless loop
                    setTimeout(() => {
                        clearInterval(gameCheckInterval);
                        console.warn('Gave up waiting for plugin to initialize game');
                    }, 10000);
                }
            } else {
                console.log('Game already initialized by plugin, skipping theme initialization');
            }
            
            // Set up global keyboard capture (will work regardless of which initialization method is used)
            setupGlobalKeyboardCapture();
            
            // Add help button
            const helpBtn = document.createElement('button');
            helpBtn.innerText = 'Game Help';
            helpBtn.style.position = 'fixed';
            helpBtn.style.top = '10px';
            helpBtn.style.right = '10px';
            helpBtn.style.padding = '5px 10px';
            helpBtn.style.backgroundColor = '#335';
            helpBtn.style.color = 'white';
            helpBtn.style.border = 'none';
            helpBtn.style.borderRadius = '3px';
            helpBtn.style.cursor = 'pointer';
            helpBtn.style.zIndex = '9999';
            
            helpBtn.addEventListener('click', () => {
                const helpText = document.createElement('div');
                helpText.style.position = 'fixed';
                helpText.style.top = '50%';
                helpText.style.left = '50%';
                helpText.style.transform = 'translate(-50%, -50%)';
                helpText.style.backgroundColor = 'rgba(0,0,0,0.85)';
                helpText.style.color = 'white';
                helpText.style.padding = '20px';
                helpText.style.fontFamily = 'Arial, sans-serif';
                helpText.style.borderRadius = '5px';
                helpText.style.zIndex = '10000';
                helpText.style.maxWidth = '80%';
                helpText.style.maxHeight = '80%';
                helpText.style.overflow = 'auto';
                
                helpText.innerHTML = `
                    <h2>Jackalope Planet Controls</h2>
                    <p><b>Basic Controls:</b></p>
                    <ul>
                        <li>W, A, S, D - Movement</li>
                        <li>Space - Jump</li>
                        <li>Mouse - Look around/orbit camera</li>
                        <li>Click - Shoot flamethrower (first-person only)</li>
                        <li>T - Toggle between first/third person</li>
                    </ul>
                    
                    <p><b>Admin Controls:</b></p>
                    <ul>
                        <li>G - Toggle God Mode</li>
                        <li>1 - Spawn Jackalope (in God Mode)</li>
                        <li>2 - Spawn Merc (in God Mode)</li>
                        <li>D - Run diagnostics (helps fix control issues)</li>
                        <li>P - Show player info</li>
                    </ul>
                    
                    <p><b>Troubleshooting:</b></p>
                    <ul>
                        <li>If controls stop working, click the game area</li>
                        <li>Press 'D' to run diagnostics and fix issues</li>
                        <li>Watch the key debug overlay in bottom right</li>
                        <li>Click "Sync Keys" if there's a mismatch</li>
                    </ul>
                    
                    <button id="close-help" style="margin-top: 10px; padding: 5px 10px; background-color: #335; color: white; border: none; border-radius: 3px; cursor: pointer;">Close</button>
                `;
                
                document.body.appendChild(helpText);
                
                document.getElementById('close-help').addEventListener('click', () => {
                    helpText.remove();
                });
            });
            
            document.body.appendChild(helpBtn);
            
        } catch (error) {
            console.error('Failed to initialize Jackalope Planet game:', error);
        }
    }
});
</script>