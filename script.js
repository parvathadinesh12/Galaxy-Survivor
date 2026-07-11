const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const keys = {};

window.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
};

window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

const player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    radius: 20,
    speed: 6,
    color: "cyan",
    health: 3
};

const playerImage = new Image();
playerImage.src = "assets/images/player.png";

const laserSound = new Audio("assets/sounds/laser.mp3");
const explosionSound = new Audio("assets/sounds/explosion.mp3");
const backgroundMusic = new Audio("assets/sounds/background.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;

const stars = [];

for (let i = 0; i < 200; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 2 + 0.5
    });
}

const bullets = [];
const enemies = [];
let boss = null;
const explosions = [];
const powerUps = [];
let score = 0;
let gameStarted = false;

window.addEventListener("click", () => {

    // Restart if the game is over
    if (player.health <= 0) {
        restartGame();
        return;
    }

    // Start the game
    if (!gameStarted) {
        gameStarted = true;
        backgroundMusic.currentTime = 0;
        backgroundMusic.play();
        return;
    }

    // Shoot
    shoot();

});

    shoot();

function shoot() {
    laserSound.currentTime = 0;
    laserSound.play();
    const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);

    bullets.push({
        x: player.x,
        y: player.y,
        radius: 5,
        speed: 10,
        dx: Math.cos(angle) * 10,
        dy: Math.sin(angle) * 10
    });
}

    setInterval(() => {

    const fastEnemy = Math.random() < 0.3;

    enemies.push({
        x: Math.random() * canvas.width,
        y: -30,
        radius: fastEnemy ? 15 : 20,
        speed: fastEnemy ? 5 : 3,
        color: fastEnemy ? "purple" : "red",
        health: fastEnemy ? 2 : 1
    });

}, 1000);

function updatePlayer() {

    if (keys["w"]) player.y -= player.speed;
    if (keys["s"]) player.y += player.speed;
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;

    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
}

function drawStars() {

    ctx.fillStyle = "white";

    stars.forEach(star => {

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        star.y += star.speed;

        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }

    });

}

function drawPlayer() {
    ctx.drawImage(
        playerImage,
        player.x - 32,
        player.y - 32,
        64,
        64
    );
}

function drawBullets() {

    ctx.fillStyle = "yellow";

    for (let i = bullets.length - 1; i >= 0; i--) {

        const bullet = bullets[i];

        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();

        if (
            bullet.x < 0 ||
            bullet.x > canvas.width ||
            bullet.y < 0 ||
            bullet.y > canvas.height
        ) {
            bullets.splice(i, 1);
        }
    }
}

function drawEnemies() {

    for (let i = enemies.length - 1; i >= 0; i--) {

        const enemy = enemies[i];

        enemy.y += enemy.speed;

        ctx.fillStyle = enemy.color;

        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fill();

        if (enemy.y > canvas.height + 30) {
            enemies.splice(i, 1);
            continue;
        }

        // Bullet collision
        for (let j = bullets.length - 1; j >= 0; j--) {

            const bullet = bullets[j];

            const dx = enemy.x - bullet.x;
            const dy = enemy.y - bullet.y;

            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < enemy.radius + bullet.radius) {

                if (enemy.health > 1) {

                    enemy.health--;

                    bullets.splice(j, 1);

                    break;

                } else {

                    enemies.splice(i, 1);

                    bullets.splice(j, 1);

                }

                explosions.push({
                    x: enemy.x,
                    y: enemy.y, 
                    radius: 5,
                    alpha: 1
            });

            explosionSound.currentTime = 0;
            explosionSound.play();

            score += 10;

            if (Math.random() < 0.2) {

                powerUps.push({
                    x: enemy.x,
                    y: enemy.y,
                    size: 20,
                    speed: 2
                });

         }

                break;
            }
        }

        // Player collision
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < enemy.radius + player.radius) {

            enemies.splice(i, 1);

            player.health--;

            if (player.health <= 0) {
                alert("Game Over!\nScore: " + score);
                location.reload();
            }
        }
    }
}

function drawExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];

        ctx.globalAlpha = explosion.alpha;
        ctx.fillStyle = "orange";

        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        ctx.fill();

        explosion.radius += 1;
        explosion.alpha -= 0.02;

        if (explosion.alpha <= 0) {
            explosions.splice(i, 1);
        }
    }
    ctx.globalAlpha = 1;
}

function drawPowerUps() {

    ctx.fillStyle = "lime";

    for (let i = powerUps.length - 1; i >= 0; i--) {

        const power = powerUps[i];

        power.y += power.speed;

        // Draw the health pack
        ctx.fillRect(
            power.x - 10,
            power.y - 10,
            20,
            20
        );

        // Check if player collects it
        const dx = power.x - player.x;
        const dy = power.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.radius + 15) {

            player.health = Math.min(player.health + 1, 3);

            powerUps.splice(i, 1);
            continue;
        }

        // Remove if it falls off the screen
        if (power.y > canvas.height) {
            powerUps.splice(i, 1);
        }
    }
}

function drawHUD() {

    // Score
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillStyle = "yellow";
    ctx.font = "bold 28px Arial";
    ctx.fillText("⭐ Score: " + score, 20, 40);
    // Health Bar Background
    ctx.fillStyle = "gray";
    ctx.fillRect(20, 60, 150, 20);

    // Health Bar
    ctx.fillStyle = "lime";
    ctx.fillRect(20, 60, player.health * 50, 20);

    // Health Text
    ctx.strokeStyle = "white";
    ctx.strokeRect(20, 60, 150, 20);

    ctx.font = "24px Arial";
    ctx.fillStyle = "red";

    let hearts = "";

    for (let i = 0; i < player.health; i++) {
        hearts += "❤️";
    }

    ctx.fillText(hearts, 20, 110);

}
function gameLoop() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (player.health <= 0) {

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    ctx.font = "60px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, 220);

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Final Score: " + score, canvas.width / 2, 280);
    ctx.font = "24px Arial";
    ctx.fillText("Refresh the page to play again", canvas.width / 2, 330);

    return;
}

    if (!gameStarted) {

        ctx.fillStyle = "white";
        ctx.font = "50px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GALAXY SURVIVOR", canvas.width / 2, 180);

        ctx.font = "30px Arial";
        ctx.fillText("Click Anywhere to Start", canvas.width / 2, 260);

        requestAnimationFrame(gameLoop);
        return;
    } 

    drawStars();

    updatePlayer();

    drawPlayer();

    drawBullets();

    drawEnemies();

    drawExplosions();

    drawPowerUps();

    drawHUD();

    requestAnimationFrame(gameLoop);

}

function restartGame() {

    score = 0;

    player.health = 3;

    enemies.length = 0;
    bullets.length = 0;
    explosions.length = 0;
    powerUps.length = 0;

    gameStarted = false;

}

gameLoop();
