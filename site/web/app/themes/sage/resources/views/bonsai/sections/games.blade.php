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
            >
                <!-- Container for Three.js canvas -->
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

<script type="module">
    // Use a more reliable CDN for Three.js
    import * as THREE from 'https://unpkg.com/three@0.150.1/build/three.module.js';
    
    // Initialize immediately without waiting for DOMContentLoaded
    const container = document.getElementById('jackalope-planet-container');
    
    // Set background color on container to match Three.js scene
    container.style.backgroundColor = '#050520';
    
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
    
    // Start animation loop immediately
    animate();
</script> 