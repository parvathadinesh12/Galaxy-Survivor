const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

let player = {
    x: 380,
    y: 420,
    width: 40,
    height: 40,
    speed: 5
};

let keys = {};

document.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

function update() {
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;
    if (keys["w"]) player.y -= player.speed;
    if (keys["s"]) player.y += player.speed;

    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width)
        player.x = canvas.width - player.width;

    if (player.y < 0) player.y = 0;
    if (player.y > canvas.height - player.height)
        player.y = canvas.height - player.height;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Space background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Spaceship
    ctx.fillStyle = "cyan";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Title
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("Galaxy Survivor", 20, 40);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
