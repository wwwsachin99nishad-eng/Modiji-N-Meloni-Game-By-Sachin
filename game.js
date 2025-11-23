const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// PORTRAIT CANVAS
canvas.width = 720;
canvas.height = 1280;

// IMAGES
const bg = new Image();
bg.src = "images/bg.jpeg";

const player = new Image();
player.src = "images/player.jpeg";

const pipeImg = new Image();
pipeImg.src = "images/obstacle.jpeg";

const popup = new Image();
popup.src = "images/popup.jpeg";

// SOUNDS
const startSound = new Audio("sounds/start.mp3");
startSound.volume = 1.0;

const hitSound = new Audio("sounds/hit.mp3");
hitSound.volume = 1.0;

let startSoundPlayed = false;
let hitPlayed = false;

// PLAYER VALUES
let playerX = 150;
let playerY = 500;
let velocity = 0;
let gravity = 0.25;
let jumpPower = -9;

// PIPE SETTINGS
let pipes = [];
let pipeGap = 450;
let pipeWidth = 240;
let pipeSpeed = 4;

// GAME STATE
let started = false;
let gameOver = false;

// BUTTONS
const startBtn = { w:300, h:100, x:canvas.width/2-150, y:canvas.height/2+150 };
const restartBtn = { w:300, h:100, x:canvas.width/2-150, y:canvas.height/2+200 };

function spawnPipe() {
    let topHeight = Math.random() * (canvas.height - pipeGap - 250) + 60;
    pipes.push({ x: canvas.width, topHeight });
}
spawnPipe();

function insideButton(x, y, btn) {
    return x > btn.x && x < btn.x + btn.w && y > btn.y && y < btn.y + btn.h;
}

// INPUT
canvas.addEventListener("mousedown", (e) => {
    if (!started) {
        if (insideButton(e.offsetX, e.offsetY, startBtn)) startGame();
        return;
    }
    if (gameOver) {
        if (insideButton(e.offsetX, e.offsetY, restartBtn)) resetGame();
        return;
    }
    velocity = jumpPower;
});

canvas.addEventListener("touchstart", (e) => {
    let rect = canvas.getBoundingClientRect();
    let t = e.touches[0];
    let x = t.clientX - rect.left;
    let y = t.clientY - rect.top;

    if (!started) {
        if (insideButton(x, y, startBtn)) startGame();
        return;
    }
    if (gameOver) {
        if (insideButton(x, y, restartBtn)) resetGame();
        return;
    }
    velocity = jumpPower;
});

// START
function startGame() {
    started = true;
    gameOver = false;

    if (!startSoundPlayed) {
        startSound.currentTime = 0;
        startSound.play();
        startSoundPlayed = true;
    }
}

// MAIN LOOP
function update() {
    if (started && !gameOver) gameLogic();
    draw();
    requestAnimationFrame(update);
}

function gameLogic() {
    velocity += gravity;
    playerY += velocity;

    pipes.forEach((p, i) => {
        p.x -= pipeSpeed;

        if (p.x + pipeWidth < 0) {
            pipes.splice(i, 1);
            spawnPipe();
        }

        if (
            playerX + 120 > p.x &&
            playerX < p.x + pipeWidth &&
            (playerY < p.topHeight ||
             playerY + 120 > p.topHeight + pipeGap)
        ) {
            return gameOverNow();
        }
    });

    if (playerY + 120 >= canvas.height) return gameOverNow();
    if (playerY <= 0) return gameOverNow();
}

function gameOverNow() {
    gameOver = true;

    if (!hitPlayed) {
        hitSound.currentTime = 0;
        hitSound.play();
        hitPlayed = true;
    }

    startSound.pause();
    startSound.currentTime = 0;
}

// DRAW EVERYTHING
function draw() {

    // BACKGROUND
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    

    // PLAYER CIRCLE
    ctx.save();
    ctx.beginPath();
    ctx.arc(playerX + 60, playerY + 60, 60, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(player, playerX, playerY, 120, 120);
    ctx.restore();

    // PIPES
    pipes.forEach((p) => {
        ctx.drawImage(pipeImg, p.x, 0, pipeWidth, p.topHeight);
        ctx.drawImage(
            pipeImg,
            p.x,
            p.topHeight + pipeGap,
            pipeWidth,
            canvas.height - (p.topHeight + pipeGap)
        );
    });

    // START SCREEN
    if (!started) {
        drawButton(startBtn, "START");
    }

    // GAME OVER POPUP
    if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let popupW = 350;
        let popupH = 350;
        let popupX = canvas.width/2 - popupW/2;
        let popupY = canvas.height/2 - popupH/2 - 100;

        ctx.drawImage(popup, popupX, popupY, popupW, popupH);

        restartBtn.x = canvas.width/2 - restartBtn.w/2;
        restartBtn.y = popupY + popupH + 40;
        drawButton(restartBtn, "RESTART");
    }

    // ⭐⭐⭐ WATERMARK ALWAYS VISIBLE ⭐⭐⭐
    ctx.save();
    ctx.font = "40px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 12;
    ctx.fillText("coded by Sachin", canvas.width / 2, 80);
    ctx.restore();
}

// DRAW BUTTON
function drawButton(btn, text) {
    ctx.fillStyle = "#222";
    ctx.fillRect(btn.x, btn.y, btn.w, btn.h);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);

    ctx.font = "45px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(text, btn.x + btn.w/2, btn.y + 65);
}

// RESET
function resetGame() {
    playerX = 150;
    playerY = 500;
    velocity = 0;

    pipes = [];
    spawnPipe();

    started = false;
    gameOver = false;

    startSoundPlayed = false;
    hitPlayed = false;
}

update();
