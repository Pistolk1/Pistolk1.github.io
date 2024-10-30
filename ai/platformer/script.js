const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize the canvas
canvas.width = 800;
canvas.height = 400;

// Player properties
const player = {
  x: 50,
  y: 0,
  width: 20,
  height: 20,
  dx: 0,
  dy: 0,
  speed: 2,
  gravity: 0.5,
  jumpStrength: -10,
  grounded: false,
};

// Platform properties
const platforms = [
  { x: 0, y: 380, width: 800, height: 20 },
  { x: 200, y: 300, width: 100, height: 20 },
  { x: 400, y: 250, width: 100, height: 20 },
  { x: 600, y: 200, width: 100, height: 20 },
];

// Handle player movement
let keys = {};
window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

// Game loop
function gameLoop() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Player movement
  if (keys['ArrowRight']) player.dx = player.speed;
  else if (keys['ArrowLeft']) player.dx = -player.speed;
  else player.dx = 0;

  // Jumping
  if (keys['ArrowUp'] && player.grounded) {
    player.dy = player.jumpStrength;
    player.grounded = false;
  }

  // Apply gravity
  player.dy += player.gravity;
  player.y += player.dy;
  player.x += player.dx;

  // Platform collision detection
  player.grounded = false;
  for (let platform of platforms) {
    if (
      player.x < platform.x + platform.width &&
      player.x + player.width > platform.x &&
      player.y + player.height > platform.y &&
      player.y + player.height < platform.y + platform.height
    ) {
      player.grounded = true;
      player.dy = 0;
      player.y = platform.y - player.height;
    }
  }

  // Boundary detection
  if (player.y > canvas.height) player.y = canvas.height - player.height;

  // Draw player
  ctx.fillStyle = 'red';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw platforms
  ctx.fillStyle = 'green';
  platforms.forEach((platform) => {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
  });

  requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
