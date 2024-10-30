document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    const context = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const TILE_SIZE = 64;
    const FOV = Math.PI / 3;
    const NUM_RAYS = 240;
    const MAX_DEPTH = 600;

    let textures = { wall: null, floor: null };
    let levelData = { map: [], npcs: [], spawn: null, end: null };

    // Load wall and floor textures
    async function loadTextures() {
        textures.wall = await loadImage("wall_texture.png");
        textures.floor = await loadImage("floor_texture.png");
    }

    function loadImage(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
        });
    }

    let player = {
        x: TILE_SIZE * 1.5,
        y: TILE_SIZE * 1.5,
        angle: 0,
        speed: 3
    };

    function loadLevel(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            levelData = JSON.parse(e.target.result);

            if (levelData.spawn) {
                player.x = levelData.spawn.x * TILE_SIZE;
                player.y = levelData.spawn.y * TILE_SIZE;
            }
            drawNPCs();  // Draw NPCs if any in the loaded level
        };
        reader.readAsText(file);
    }

    document.getElementById("levelUpload").addEventListener("change", (event) => {
        loadLevel(event.target.files[0]);
    });

    function castRays() {
        let rayAngle = player.angle - FOV / 2;
        const deltaAngle = FOV / NUM_RAYS;

        for (let i = 0; i < NUM_RAYS; i++) {
            const hit = castRay(rayAngle);
            if (hit) renderWallSlice(i, hit);
            rayAngle += deltaAngle;
        }
    }

    function castRay(angle) {
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);

        for (let depth = 0; depth < MAX_DEPTH; depth++) {
            const x = player.x + cos * depth;
            const y = player.y + sin * depth;
            const mapX = Math.floor(x / TILE_SIZE);
            const mapY = Math.floor(y / TILE_SIZE);

            if (levelData.map[mapY] && levelData.map[mapY][mapX] === 1) {
                const wallTexX = Math.floor(x % TILE_SIZE);
                return { distance: depth, wallTexX, angle, depth };
            }
        }
        return null;
    }

    function renderWallSlice(index, hit) {
        const distance = hit.distance * Math.cos(hit.angle - player.angle);
        const sliceHeight = Math.min(canvas.height / distance * TILE_SIZE, canvas.height);

        const lightingFactor = 1 - Math.min(distance / MAX_DEPTH, 1);
        context.fillStyle = `rgba(${lightingFactor * 255}, ${lightingFactor * 200}, ${lightingFactor * 150}, 1)`;

        context.drawImage(
            textures.wall,
            hit.wallTexX, 0, 1, textures.wall.height,
            index * (canvas.width / NUM_RAYS), (canvas.height - sliceHeight) / 2,
            canvas.width / NUM_RAYS, sliceHeight
        );
    }

    function renderFloor() {
        for (let y = canvas.height / 2; y < canvas.height; y++) {
            const rayDirX0 = Math.cos(player.angle - FOV / 2);
            const rayDirY0 = Math.sin(player.angle - FOV / 2);
            const rayDirX1 = Math.cos(player.angle + FOV / 2);
            const rayDirY1 = Math.sin(player.angle + FOV / 2);

            const rowDist = canvas.height / (2 * y - canvas.height);
            const floorStepX = rowDist * (rayDirX1 - rayDirX0) / canvas.width;
            const floorStepY = rowDist * (rayDirY1 - rayDirY0) / canvas.width;

            let floorX = player.x + rowDist * rayDirX0;
            let floorY = player.y + rowDist * rayDirY0;

            for (let x = 0; x < canvas.width; x++) {
                const texX = Math.floor(floorX) % TILE_SIZE;
                const texY = Math.floor(floorY) % TILE_SIZE;

                const color = context.getImageData(texX, texY, 1, 1).data;
                const distFactor = 1 - Math.min(rowDist / MAX_DEPTH, 1);
                context.fillStyle = `rgba(${color[0] * distFactor}, ${color[1] * distFactor}, ${color[2] * distFactor}, 1)`;
                context.fillRect(x, y, 1, 1);

                floorX += floorStepX;
                floorY += floorStepY;
            }
        }
    }

    function renderEndPoint() {
        if (levelData.end) {
            const x = levelData.end.x * TILE_SIZE;
            const y = levelData.end.y * TILE_SIZE;
            context.fillStyle = "green";
            context.beginPath();
            context.arc(x - player.x + canvas.width / 2, y - player.y + canvas.height / 2, TILE_SIZE / 2, 0, Math.PI * 2);
            context.fill();
        }
    }

    function drawNPCs() {
        if (levelData.npcs) {
            levelData.npcs.forEach(npc => {
                context.fillStyle = "red";
                context.beginPath();
                context.arc(npc.x * TILE_SIZE, npc.y * TILE_SIZE, TILE_SIZE / 2, 0, Math.PI * 2);
                context.fill();
            });
        }
    }

    function gameLoop() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        renderFloor();
        castRays();
        renderEndPoint();
        drawNPCs();
        requestAnimationFrame(gameLoop);
    }

    loadTextures().then(() => {
        gameLoop();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp") {
            player.x += Math.cos(player.angle) * player.speed;
            player.y += Math.sin(player.angle) * player.speed;
        } else if (e.key === "ArrowDown") {
            player.x -= Math.cos(player.angle) * player.speed;
            player.y -= Math.sin(player.angle) * player.speed;
        } else if (e.key === "ArrowLeft") {
            player.angle -= 0.1;
        } else if (e.key === "ArrowRight") {
            player.angle += 0.1;
        }
    });
});
