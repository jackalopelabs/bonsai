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
            <!-- Direct Three.js Jackalope Planet Implementation -->
            <div 
                id="jackalope-planet-container" 
                class="w-full h-full relative"
                x-data="{
                    init() {
                        this.initThreeJs();
                    },
                    initThreeJs() {
                        // Load Three.js from CDN
                        const script = document.createElement('script');
                        script.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
                        script.onload = () => {
                            // Once Three.js is loaded, initialize our scene
                            this.createScene();
                        };
                        document.head.appendChild(script);
                    },
                    createScene() {
                        // Create basic Three.js scene
                        const container = document.getElementById('jackalope-planet-container');
                        
                        // Initialize scene, camera, and renderer
                        const scene = new THREE.Scene();
                        scene.background = new THREE.Color(0x050520);
                        
                        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
                        camera.position.z = 5;
                        
                        const renderer = new THREE.WebGLRenderer({ antialias: true });
                        renderer.setSize(container.clientWidth, container.clientHeight);
                        container.appendChild(renderer.domElement);
                        
                        // Add ambient and directional light
                        const ambientLight = new THREE.AmbientLight(0x404040, 2);
                        scene.add(ambientLight);
                        
                        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
                        directionalLight.position.set(1, 1, 1);
                        scene.add(directionalLight);
                        
                        // Create a planet (sphere)
                        const planetGeometry = new THREE.SphereGeometry(2, 32, 32);
                        const planetMaterial = new THREE.MeshStandardMaterial({
                            color: 0x8844aa,
                            metalness: 0.3,
                            roughness: 0.7,
                        });
                        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
                        scene.add(planet);
                        
                        // Create mountains on the planet (cones)
                        for (let i = 0; i < 12; i++) {
                            const phi = Math.acos(-1 + (2 * i) / 12);
                            const theta = Math.sqrt(12 * Math.PI) * phi;
                            
                            const mountainGeometry = new THREE.ConeGeometry(0.3, 0.6, 4);
                            const mountainMaterial = new THREE.MeshStandardMaterial({
                                color: 0x228866,
                                roughness: 0.8
                            });
                            
                            const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
                            mountain.position.setFromSphericalCoords(2, phi, theta);
                            mountain.lookAt(0, 0, 0);
                            planet.add(mountain);
                        }
                        
                        // Add stars in the background
                        const starGeometry = new THREE.BufferGeometry();
                        const starMaterial = new THREE.PointsMaterial({
                            color: 0xffffff,
                            size: 0.05,
                        });
                        
                        const starPositions = [];
                        for (let i = 0; i < 1000; i++) {
                            const x = (Math.random() - 0.5) * 100;
                            const y = (Math.random() - 0.5) * 100;
                            const z = (Math.random() - 0.5) * 100;
                            starPositions.push(x, y, z);
                        }
                        
                        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
                        const stars = new THREE.Points(starGeometry, starMaterial);
                        scene.add(stars);
                        
                        // Create a mini jackalope (just a simple shape for now)
                        const jackalopeGroup = new THREE.Group();
                        
                        // Body
                        const bodyGeometry = new THREE.SphereGeometry(0.3, 16, 16);
                        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xbb8855 });
                        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
                        jackalopeGroup.add(body);
                        
                        // Head
                        const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
                        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xbb8855 });
                        const head = new THREE.Mesh(headGeometry, headMaterial);
                        head.position.set(0, 0.3, 0.2);
                        jackalopeGroup.add(head);
                        
                        // Antlers
                        const antlerMaterial = new THREE.MeshStandardMaterial({ color: 0x664422 });
                        
                        const leftAntlerGeometry = new THREE.CylinderGeometry(0.02, 0.01, 0.4);
                        const leftAntler = new THREE.Mesh(leftAntlerGeometry, antlerMaterial);
                        leftAntler.position.set(-0.1, 0.5, 0.2);
                        leftAntler.rotation.z = -Math.PI / 6;
                        jackalopeGroup.add(leftAntler);
                        
                        const rightAntlerGeometry = new THREE.CylinderGeometry(0.02, 0.01, 0.4);
                        const rightAntler = new THREE.Mesh(rightAntlerGeometry, antlerMaterial);
                        rightAntler.position.set(0.1, 0.5, 0.2);
                        rightAntler.rotation.z = Math.PI / 6;
                        jackalopeGroup.add(rightAntler);
                        
                        jackalopeGroup.position.set(0, 2.3, 0);
                        scene.add(jackalopeGroup);
                        
                        // Handle window resize
                        window.addEventListener('resize', () => {
                            camera.aspect = container.clientWidth / container.clientHeight;
                            camera.updateProjectionMatrix();
                            renderer.setSize(container.clientWidth, container.clientHeight);
                        });
                        
                        // Animation loop
                        let angle = 0;
                        const animate = () => {
                            requestAnimationFrame(animate);
                            
                            // Rotate the planet
                            planet.rotation.y += 0.002;
                            
                            // Move the jackalope around the planet
                            angle += 0.005;
                            jackalopeGroup.position.x = 2.5 * Math.sin(angle);
                            jackalopeGroup.position.z = 2.5 * Math.cos(angle);
                            jackalopeGroup.rotation.y = -angle + Math.PI;
                            
                            // Slowly rotate camera around the scene
                            camera.position.x = 7 * Math.sin(angle * 0.2);
                            camera.position.z = 7 * Math.cos(angle * 0.2);
                            camera.lookAt(0, 0, 0);
                            
                            renderer.render(scene, camera);
                        };
                        
                        animate();
                    }
                }"
            >
                <!-- Loading state is handled by Three.js initialization -->
                <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10 jackalope-loading">
                    <div class="text-center">
                        <svg class="animate-spin h-12 w-12 text-indigo-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p class="text-indigo-100 text-lg">Loading Jackalope Planet...</p>
                    </div>
                </div>
            </div>
            
            <!-- Controls hint -->
            <div class="absolute bottom-4 left-0 right-0 text-center text-white bg-black bg-opacity-50 py-2 px-4 text-sm">
                <p>The scene rotates automatically to showcase the 3D Jackalope Planet</p>
            </div>
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

<script>
    // Remove loading state once Three.js is initialized
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const loadingElement = document.querySelector('.jackalope-loading');
            if (loadingElement && loadingElement.parentNode) {
                loadingElement.style.opacity = '0';
                setTimeout(() => {
                    loadingElement.parentNode.removeChild(loadingElement);
                }, 1000);
            }
        }, 3000); // Give Three.js time to initialize
    });
</script> 