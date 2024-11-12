// script.js

let score = 0;
let arrows = [];
let music;
let audioAnalyzer = new AudioAnalyzer();

document.getElementById("start-game").addEventListener("click", () => {
    const fileInput = document.getElementById("music-upload");
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        audioAnalyzer.loadAudio(file).then(() => {
            startGame();
        }).catch(err => {
            console.error("Error loading audio: ", err);
        });
    } else {
        alert("Please upload a music file!");
    }
});

function startGame() {
    score = 0;
    document.getElementById("score").textContent = `Score: ${score}`;
    
    // Ensure that the source is not null before playing
    if (audioAnalyzer.source) {
        audioAnalyzer.source.start(0); // Start playing the audio
    }
    
    arrows = []; // Reset arrows
    audioAnalyzer.onBeatDetected = generateArrows; // Set callback for beat detection
}

function generateArrows(currentTime) {
    const directions = ['up', 'down', 'left', 'right'];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    
    // Adjust the timing based on detected beats
    const beatOffset = 0.5; // Adjust as necessary for sync timing
    const arrowTime = currentTime + beatOffset;

    const arrowElement = document.querySelector(`.arrow.${randomDirection}`);
    
    setTimeout(() => {
        arrowElement.style.display = "flex";
        arrowElement.style.animation = "fall 1s linear forwards";
    }, (arrowTime - audioAnalyzer.audioContext.currentTime) * 1000); // Schedule the arrow appearance

    arrows.push({ direction: randomDirection, time: arrowTime });

    arrowElement.addEventListener('animationend', () => {
        arrowElement.style.display = "none";
        arrows.shift(); // Remove the arrow after it falls
    });
}

document.querySelectorAll('.arrow').forEach(arrow => {
    arrow.addEventListener('click', (event) => {
        if (event.target.dataset.direction === arrows[0]?.direction) {
            score += 100;
            document.getElementById("score").textContent = `Score: ${score}`;
            arrows.shift(); // Remove the matched arrow
            event.target.style.display = "none"; // Hide clicked arrow
            playHitSound(); // Play sound on hit
        } else {
            playMissSound(); // Play sound on miss
        }
    });
});

function playHitSound() {
    const hitSound = new Audio('hit.mp3'); // Replace with the path to your hit sound
    hitSound.play();
}

function playMissSound() {
    const missSound = new Audio('miss.mp3'); // Replace with the path to your miss sound
    missSound.play();
}
