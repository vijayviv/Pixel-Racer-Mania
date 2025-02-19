const socket = io("http://localhost:3000");

// Game elements
const gameArea = document.getElementById("game-area");
const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");

// Player data
let player = {
    id: null,
    x: 120,
    y: 400,
    speed: 10,
    score: 0,
};

// Load sounds
const bgMusic = new Audio("assets/sounds/background.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.5;
bgMusic.play();

const collisionSound = new Audio("assets/sounds/collision.mp3");

// Store all players
let players = {};
let obstacles = [];
let gameInterval;
let obstacleSpeed = 3;
let level = 1;

// Connect to server
socket.on("connect", () => {
    player.id = socket.id;
    socket.emit("newPlayer", player);
});

// Update players from server
socket.on("updatePlayers", (serverPlayers) => {
    players = serverPlayers;
    renderPlayers();
});

// Handle player movement
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && player.x > 10) {
        player.x -= player.speed;
    } else if (e.key === "ArrowRight" && player.x < 240) {
        player.x += player.speed;
    }
    socket.emit("playerMove", { x: player.x, y: player.y });
});

// Render all players and obstacles
function renderPlayers() {
    gameArea.innerHTML = ""; // Clear game area

    // Render players
    Object.values(players).forEach((p) => {
        let car = document.createElement("div");
        car.classList.add("player-car");
        car.style.left = `${p.x}px`;
        car.style.top = `${p.y}px`;
        gameArea.appendChild(car);
    });

    // Render obstacles
    obstacles.forEach((obstacle) => {
        let obs = document.createElement("div");
        obs.classList.add(obstacle.type);
        obs.style.left = `${obstacle.x}px`;
        obs.style.top = `${obstacle.y}px`;
        gameArea.appendChild(obs);
    });
}

// Create obstacles
function createObstacle() {
    let obstacleTypes = ["cone", "barrel", "ai-car"];
    let type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    let x = Math.random() * 220;
    obstacles.push({ x, y: 0, type });
}

// Move obstacles
function moveObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.y += obstacleSpeed;

        // Remove out-of-bounds obstacles
        if (obstacle.y > 500) {
            obstacles.splice(index, 1);
            player.score += 10;
            updateScore();
        }

        // Collision detection
        if (
            player.x < obstacle.x + 40 &&
            player.x + 50 > obstacle.x &&
            player.y < obstacle.y + 70 &&
            player.y + 90 > obstacle.y
        ) {
            collisionSound.play();
            alert("Game Over! Your Score: " + player.score);
            resetGame();
        }
    });
}

// Update score
function updateScore() {
    scoreDisplay.innerText = `Score: ${player.score}`;
    if (player.score % 50 === 0) {
        level++;
        obstacleSpeed += 1;
        levelDisplay.innerText = `Level ${level}`;
    }
}

// Reset game
function resetGame() {
    player.x = 120;
    player.y = 400;
    player.score = 0;
    level = 1;
    obstacleSpeed = 3;
    obstacles = [];
    socket.emit("playerMove", { x: player.x, y: player.y });
    updateScore();
}

// Start game loop
function startGame() {
    gameInterval = setInterval(() => {
        if (Math.random() < 0.2) createObstacle();
        moveObstacles();
        renderPlayers();
    }, 100);
}

startGame();
