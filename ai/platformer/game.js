// Set up Matter.js
const { Engine, Render, Runner, Bodies, World, Events } = Matter;

// Create engine and renderer
const engine = Engine.create();
const world = engine.world;

const canvas = document.getElementById('gameCanvas');
const render = Render.create({
  element: document.body,
  canvas: canvas,
  engine: engine,
  options: {
    width: 800,
    height: 600,
    wireframes: false,
    background: '#222',
  }
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// Game Objects
const player = Bodies.rectangle(100, 500, 40, 40, { restitution: 0.5 });
const ground = Bodies.rectangle(400, 590, 810, 20, { isStatic: true });

World.add(world, [player, ground]);

// Helper function to create breakable objects
function createBreakable(x, y, width, height) {
  return Bodies.rectangle(x, y, width, height, {
    render: { fillStyle: 'green' },
    breakable: true, // Custom property
  });
}

// Add breakable objects
const breakable1 = createBreakable(400, 300, 60, 60);
const breakable2 = createBreakable(600, 200, 60, 60);
World.add(world, [breakable1, breakable2]);

// Spikes (as sensor bodies that kill the player on collision)
const spikes = Bodies.rectangle(300, 570, 100, 10, {
  isStatic: true,
  label: 'spike',
  render: { fillStyle: 'red' },
});
World.add(world, spikes);

// Laser (kills player on collision)
const laser = Bodies.rectangle(700, 400, 200, 10, {
  isStatic: true,
  isSensor: true,
  label: 'laser',
  render: { fillStyle: 'cyan' },
});
World.add(world, laser);

// Spawn and Goal System
const spawnPoint = { x: 100, y: 500 };
const goal = Bodies.rectangle(750, 500, 50, 50, {
  isStatic: true,
  label: 'goal',
  render: { fillStyle: 'gold' },
});
World.add(world, goal);

function resetPlayer() {
  Matter.Body.setPosition(player, spawnPoint);
}

// Collision Events
Events.on(engine, 'collisionStart', function(event) {
  event.pairs.forEach(({ bodyA, bodyB }) => {
    if (bodyA === player || bodyB === player) {
      const otherBody = bodyA === player ? bodyB : bodyA;

      // Player collides with goal
      if (otherBody.label === 'goal') {
        alert("Level Complete!");
        resetPlayer();
      }

      // Player hits a spike or laser
      if (otherBody.label === 'spike' || otherBody.label === 'laser') {
        alert("Game Over! Respawning...");
        resetPlayer();
      }

      // Breakable object collision
      if (otherBody.breakable) {
        World.remove(world, otherBody);
      }
    }
  });
});
