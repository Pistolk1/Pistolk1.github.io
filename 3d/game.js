  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const menu = document.getElementById('menu');

  canvas.width = window.innerWidth * 2;
  canvas.height = window.innerHeight * 2;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.scale(2, 2);

  let gameRunning = false;

  // Define levels
  const levels = [
    [
      [1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 1],
      [1, 0, 2, 0, 0, 1],
      [1, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1],
    ],
    [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 2, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ]
  ];

  let currentLevel = 0;
  let map = levels[currentLevel];

  const TILE_SIZE = 64; // Size of each square tile in the map
  const FOV = Math.PI / 3; // Field of view (60 degrees)
  const NUM_RAYS = canvas.width / 2; // Number of rays (1 per horizontal pixel)

  const player = {
    x: TILE_SIZE * 1.5,
    y: TILE_SIZE * 1.5,
    angle: Math.PI / 4, // 45 degrees
    speed: 2,
    flashlightAngle: Math.PI / 6, // Flashlight cone (30 degrees)
  };

  const colors = [
    "#000000", // Empty space
    "#8B0000", // Wall color
    "#FFD700"  // Sprite color (e.g., gold)
  ];

  function castRays() {
    const rayAngleStep = FOV / NUM_RAYS;
    let currentAngle = player.angle - FOV / 2;

    for (let ray = 0; ray < NUM_RAYS; ray++) {
      const hit = castRay(currentAngle);
      if (hit) {
        drawWall(ray, hit.distance, hit.texture);
      }
      currentAngle += rayAngleStep;
    }
  }

  function castRay(angle) {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    for (let t = 0; t < 20; t += 0.1) {
      const x = player.x + cos * t * TILE_SIZE;
      const y = player.y + sin * t * TILE_SIZE;

      const mapX = Math.floor(x / TILE_SIZE);
      const mapY = Math.floor(y / TILE_SIZE);

      if (map[mapY]?.[mapX] >= 1) {
        return { distance: t, texture: map[mapY][mapX] };
      }
    }

    return null;
  }

  function drawWall(x, distance, texture) {
    const fogFactor = Math.max(0, 1 - distance / 10);
    const wallHeight = Math.min(canvas.height / 2, TILE_SIZE / distance * 200);
    const baseColor = colors[texture];
    const rgb = baseColor.match(/#(..)(..)(..)/).slice(1).map((hex) => parseInt(hex, 16));
    const foggedColor = `rgb(${rgb[0] * fogFactor}, ${rgb[1] * fogFactor}, ${rgb[2] * fogFactor})`;

    ctx.fillStyle = foggedColor;
    ctx.fillRect(x, (canvas.height / 2 - wallHeight) / 2, 1, wallHeight);
  }

  function drawSprites() {
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (map[y][x] === 2) { // Sprite position
          const spriteX = x * TILE_SIZE + TILE_SIZE / 2;
          const spriteY = y * TILE_SIZE + TILE_SIZE / 2;
          const dx = spriteX - player.x;
          const dy = spriteY - player.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const angleToSprite = Math.atan2(dy, dx);
          const angleDifference = angleToSprite - player.angle;

          if (Math.abs(angleDifference) < FOV / 2) {
            const spriteHeight = TILE_SIZE / distance * 200;
            const spriteScreenX = (canvas.width / 4) + (angleDifference / FOV) * (canvas.width / 2);

            const fogFactor = Math.max(0, 1 - distance / 10);
            const baseColor = colors[2];
            const rgb = baseColor.match(/#(..)(..)(..)/).slice(1).map((hex) => parseInt(hex, 16));
            const foggedColor = `rgb(${rgb[0] * fogFactor}, ${rgb[1] * fogFactor}, ${rgb[2] * fogFactor})`;

            ctx.fillStyle = foggedColor;
            ctx.fillRect(spriteScreenX - 5, (canvas.height / 2 - spriteHeight) / 2, 10, spriteHeight);
          }
        }
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    castRays();
    drawSprites();
  }

  function movePlayer() {
    if (keys['ArrowUp']) {
      player.x += Math.cos(player.angle) * player.speed;
      player.y += Math.sin(player.angle) * player.speed;
    }
    if (keys['ArrowDown']) {
      player.x -= Math.cos(player.angle) * player.speed;
      player.y -= Math.sin(player.angle) * player.speed;
    }
    if (keys['ArrowLeft']) {
      player.angle -= 0.03;
    }
    if (keys['ArrowRight']) {
      player.angle += 0.03;
    }
  }

  function startGame() {
    menu.style.display = 'none';
    canvas.style.display = 'block';
    gameRunning = true;
    gameLoop();
  }

  function showSettings() {
    alert('Settings menu is not implemented yet!');
  }

  function quitGame() {
    alert('Quit Game is not implemented yet!');
  }

  const keys = {};
  window.addEventListener('keydown', (e) => (keys[e.key] = true));
  window.addEventListener('keyup', (e) => (keys[e.key] = false));

  function gameLoop() {
    if (gameRunning) {
      movePlayer();
      draw();
      requestAnimationFrame(gameLoop);
    }
  }