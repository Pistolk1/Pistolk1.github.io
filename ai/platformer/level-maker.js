const levelElement = document.getElementById('level');
const playerScoreElement = document.getElementById('player-score');
const aiScoreElement = document.getElementById('ai-score');

let playerScore = 0;
let aiScore = 0;
let levelGrid = [];

// Directions for movement (up, down, left, right)
const directions = [
    { dx: 0, dy: 1 },  // right
    { dx: 1, dy: 0 },  // down
    { dx: 0, dy: -1 }, // left
    { dx: -1, dy: 0 }  // up
];

// Function to generate a level
function generateLevel() {
    levelGrid = [];
    levelElement.innerHTML = '';
    
    // Create a simple level grid (10x10)
    for (let y = 0; y < 10; y++) {
        const row = [];
        for (let x = 0; x < 10; x++) {
            const block = document.createElement('div');
            block.classList.add('block');
            row.push('empty');
            levelElement.appendChild(block);
        }
        levelGrid.push(row);
    }
    
    // Place the goal
    levelGrid[9][9] = 'goal';
    const goalBlock = levelElement.children[99]; // (9, 9) position in a 10x10 grid
    goalBlock.classList.add('goal');

    // Randomly place blocks and ensure level is beatable
    placeRandomBlocks();
}

// Function to place random blocks while ensuring path to goal
function placeRandomBlocks() {
    const maxBlocks = 15; // Maximum number of blocks
    let blocksPlaced = 0;

    while (blocksPlaced < maxBlocks) {
        const x = Math.floor(Math.random() * 9);
        const y = Math.floor(Math.random() * 9);

        // Check if it's an empty space
        if (levelGrid[y][x] === 'empty') {
            levelGrid[y][x] = 'block';
            const block = levelElement.children[y * 10 + x];
            block.classList.add('block');
            blocksPlaced++;
        }
    }

    // Ensure there's a valid path from (0,0) to (9,9)
    if (!isPathValid()) {
        // Reset blocks and try again
        resetBlocks();
        placeRandomBlocks();
    }
}

// Function to reset blocks for new placement
function resetBlocks() {
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (levelGrid[y][x] === 'block') {
                levelGrid[y][x] = 'empty';
                const block = levelElement.children[y * 10 + x];
                block.classList.remove('block');
            }
        }
    }
}

// Function to check if there is a valid path from (0, 0) to (9, 9)
function isPathValid() {
    const visited = Array.from({ length: 10 }, () => Array(10).fill(false));
    const queue = [{ x: 0, y: 0 }];

    while (queue.length > 0) {
        const { x, y } = queue.shift();

        // Check if we've reached the goal
        if (x === 9 && y === 9) {
            return true;
        }

        visited[y][x] = true;

        for (const { dx, dy } of directions) {
            const newX = x + dx;
            const newY = y + dy;

            // Check bounds and if it's a valid space
            if (
                newX >= 0 && newX < 10 &&
                newY >= 0 && newY < 10 &&
                !visited[newY][newX] &&
                levelGrid[newY][newX] !== 'block'
            ) {
                queue.push({ x: newX, y: newY });
            }
        }
    }
    return false; // No path found
}

// Function to start the game
function startGame() {
    // Reset scores
    let playerDead = false;

    // Simple simulation of gameplay logic
    for (let i = 0; i < levelGrid.length; i++) {
        if (levelGrid[i][0] === 'block') {
            playerDead = true; // Player dies if there's a block
            aiScore++;
            break;
        }
    }

    if (!playerDead) {
        playerScore++;
        // Check if player reaches the goal
        const lastBlock = levelGrid[9][9];
        if (lastBlock === 'goal') {
            playerScore++;
        }
    }

    updateScores();
}

// Function to update scores on the display
function updateScores() {
    playerScoreElement.textContent = playerScore;
    aiScoreElement.textContent = aiScore;
}

// Event listeners
document.getElementById('generate-level').addEventListener('click', generateLevel);
document.getElementById('start-game').addEventListener('click', startGame);

// Initial level generation
generateLevel();
