// Define the game canvas and context
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 400;
document.body.appendChild(canvas);

// Variables for world and level management
let worlds = {};
let currentWorld = 'grass';
let currentLevelIndex = 0;
let currentLevel = [];

// Load worlds and levels from worlds.json
fetch('worlds.json')
    .then(response => response.json())
    .then(data => {
        worlds = data;
        loadWorld(currentWorld);
    })
    .catch(error => console.error('Error loading worlds.json:', error));

// Load a specific world
function loadWorld(worldName) {
    currentWorld = worldName;
    currentLevelIndex = 0;
    currentLevel = worlds[worldName].levels[currentLevelIndex];
}

// Move to the next level
function nextLevel() {
    currentLevelIndex++;
    if (currentLevelIndex >= worlds[currentWorld].levels.length) {
        console.log('All levels completed!');
        return;
    }
    currentLevel = worlds[currentWorld].levels[currentLevelIndex];
}

// Draw the level as a grid of tiles
function drawLevel() {
    const palette = worlds[currentWorld].palette;
    const tileSize = 30; // Size of each tile
    currentLevel.forEach((row, rowIndex) => {
        row.forEach((tile, colIndex) => {
            ctx.fillStyle = palette[tile] || palette[0];
            ctx.fillRect(colIndex * tileSize, rowIndex * tileSize, tileSize, tileSize);
        });
    });
}

// Game loop
function update() {
    player.y += player.dy;
    player.x += player.dx;

    // Gravity
    if (player.y + player.height < canvas.height) {
        player.dy += 0.5;
    } else {
        player.dy = 0;
        player.y = canvas.height - player.height;
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the level
    drawLevel();

    // Draw player
    drawSprite(playerSprite, player.x, player.y, 2);
}

function loop() {
    update();
    render();
    requestAnimationFrame(loop);
}

// Controls
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') player.dx = 3;
    if (e.key === 'ArrowLeft') player.dx = -3;
    if (e.key === 'ArrowUp' && player.dy === 0) player.dy = -10;
    if (e.key === 'n') nextLevel(); // Go to the next level
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') player.dx = 0;
});

// Start the game loop
loop();
