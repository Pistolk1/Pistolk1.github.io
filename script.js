// Setup basic Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

// Add a simple ground plane
const groundGeometry = new THREE.PlaneGeometry(500, 500);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Add a simple player cube
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);

// Camera settings
camera.position.set(0, 2, 5);
player.add(camera);

// Movement variables
let velocity = new THREE.Vector3();
const speed = 0.1;
const gravity = -0.01;
const jumpStrength = 0.2;
let canJump = false;

// Handle key presses
const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false
};

document.addEventListener('keydown', (event) => {
    if (event.key === 'w') keys.forward = true;
    if (event.key === 's') keys.backward = true;
    if (event.key === 'a') keys.left = true;
    if (event.key === 'd') keys.right = true;
    if (event.key === ' ') keys.jump = true;
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'w') keys.forward = false;
    if (event.key === 's') keys.backward = false;
    if (event.key === 'a') keys.left = false;
    if (event.key === 'd') keys.right = false;
    if (event.key === ' ') keys.jump = false;
});

// Game loop
function animate() {
    requestAnimationFrame(animate);

    // Apply gravity
    velocity.y += gravity;
    
    // Apply movement
    if (keys.forward) velocity.z -= speed;
    if (keys.backward) velocity.z += speed;
    if (keys.left) velocity.x -= speed;
    if (keys.right) velocity.x += speed;
    
    // Jump
    if (keys.jump && canJump) {
        velocity.y = jumpStrength;
        canJump = false;
    }

    // Update player position
    player.position.add(velocity);

    // Ground collision
    if (player.position.y <= 1) {
        player.position.y = 1;
        velocity.y = 0;
        canJump = true;
    }

    // Dampening (to simulate friction)
    velocity.x *= 0.9;
    velocity.z *= 0.9;

    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
