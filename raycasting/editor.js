const levelCanvas = document.getElementById("levelCanvas");
const previewCanvas = document.getElementById("previewCanvas");
const ctxLevel = levelCanvas.getContext("2d");
const ctxPreview = previewCanvas.getContext("2d");

levelCanvas.width = previewCanvas.width = 800;
levelCanvas.height = previewCanvas.height = 600;

const TILE_SIZE = 64;
let levelData = { map: [], textures: {}, npcs: [] };
let selectedTexture = { wall: null, floor: null };

// Load textures from file input
function loadTexture(input, type) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
            selectedTexture[type] = img;
            drawLevel(); // Redraw with new texture
        };
    };
    reader.readAsDataURL(file);
}

// Initialize empty level
for (let y = 0; y < 10; y++) {
    levelData.map[y] = [];
    for (let x = 0; x < 10; x++) {
        levelData.map[y][x] = { type: "floor", texture: null };
    }
}

// Handle object placement in level editor
levelCanvas.addEventListener("click", (e) => {
    const x = Math.floor(e.offsetX / TILE_SIZE);
    const y = Math.floor(e.offsetY / TILE_SIZE);
    const objectType = document.getElementById("objectType").value;

    if (objectType === "wall" || objectType === "floor") {
        levelData.map[y][x] = {
            type: objectType,
            texture: objectType === "wall" ? selectedTexture.wall : selectedTexture.floor
        };
    } else if (objectType === "enemy") {
        levelData.npcs.push({ x, y, type: "enemy" });
    } else if (objectType === "spawn") {
        levelData.spawn = { x, y };
    } else if (objectType === "end") {
        levelData.end = { x, y };
    }
    drawLevel();
});

// Draw level in 2D editor
function drawLevel() {
    ctxLevel.clearRect(0, 0, levelCanvas.width, levelCanvas.height);
    levelData.map.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell.type === "wall" && cell.texture) {
                ctxLevel.drawImage(cell.texture, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (cell.type === "floor" && cell.texture) {
                ctxLevel.drawImage(cell.texture, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else {
                ctxLevel.fillStyle = "#333";
                ctxLevel.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        });
    });

    // Draw NPCs, player spawn, and end point
    levelData.npcs.forEach(npc => {
        ctxLevel.fillStyle = "red";
        ctxLevel.fillRect(npc.x * TILE_SIZE, npc.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    });
    if (levelData.spawn) {
        ctxLevel.fillStyle = "blue";
        ctxLevel.fillRect(levelData.spawn.x * TILE_SIZE, levelData.spawn.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
    if (levelData.end) {
        ctxLevel.fillStyle = "green";
        ctxLevel.fillRect(levelData.end.x * TILE_SIZE, levelData.end.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
}

// Render level in 3D preview (simplified example)
function renderPreview() {
    // Implement simplified 3D rendering code similar to raycasting engine here
}

// Save and load level to/from JSON
function saveLevel() {
    const blob = new Blob([JSON.stringify(levelData)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "level.json";
    link.click();
}

function loadLevel() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            levelData = JSON.parse(e.target.result);
            drawLevel();
            renderPreview();
        };
        reader.readAsText(file);
    };
    input.click();
}

// Event listeners for texture uploads
document.getElementById("wallTextureUpload").addEventListener("change", (e) => loadTexture(e.target, "wall"));
document.getElementById("floorTextureUpload").addEventListener("change", (e) => loadTexture(e.target, "floor"));

// Initial draw
drawLevel();
