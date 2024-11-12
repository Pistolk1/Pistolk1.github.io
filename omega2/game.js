const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-container').appendChild(renderer.domElement);

// Add a simple floor
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = - Math.PI / 2;
scene.add(floor);

// Add walls (simple cube for demonstration)
const wallGeometry = new THREE.BoxGeometry(1, 10, 100);
const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x555555 });
const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
wall1.position.x = -50;
scene.add(wall1);

const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
wall2.position.x = 50;
scene.add(wall2);

// Create a spooky object (like a ghost)
const ghostGeometry = new THREE.SphereGeometry(1, 32, 32);
const ghostMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });
const ghost = new THREE.Mesh(ghostGeometry, ghostMaterial);
ghost.position.set(0, 5, 0);
scene.add(ghost);

// Position the camera
camera.position.z = 5;
camera.position.y = 3;

// Handle keyboard input for movement
const keys = {};
window.addEventListener('keydown', (event) => {
    keys[event.code] = true;
});
window.addEventListener('keyup', (event) => {
    keys[event.code] = false;
});

// Animation loop
const animate = () => {
    requestAnimationFrame(animate);

    // Move camera based on key presses
    if (keys['ArrowUp']) camera.position.z -= 0.1;
    if (keys['ArrowDown']) camera.position.z += 0.1;
    if (keys['ArrowLeft']) camera.rotation.y += 0.02;
    if (keys['ArrowRight']) camera.rotation.y -= 0.02;

    // Simple ghost movement (random wandering)
    ghost.position.x = Math.sin(Date.now() * 0.001) * 10;
    ghost.position.z = Math.cos(Date.now() * 0.001) * 10;

    renderer.render(scene, camera);
};

animate();

// Resize the renderer on window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
