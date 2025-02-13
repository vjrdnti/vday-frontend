const socket = io("https://vday-server.onrender.com");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 400;

let players = {};
let pedestrians = [];

const playerImg = new Image();
playerImg.src = "assets/player1.png";

const pedestrianImg = new Image();
pedestrianImg.src = "assets/pedestrian.png";

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") move(10, 0);
    if (event.key === "ArrowLeft") move(-10, 0);
    if (event.key === "ArrowUp") move(0, -10);
    if (event.key === "ArrowDown") move(0, 10);
    if (event.key === "k") socket.emit("kiss");
});

function move(dx, dy) {
    socket.emit("move", { x: players[socket.id].x + dx, y: players[socket.id].y + dy });
}

socket.on("players", (data) => {
    players = data;
    draw();
});

socket.on("kissSuccess", () => alert("kissiees :33"));
socket.on("gameOver", () => alert("🚨 caught :("));

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const id in players) {
        ctx.drawImage(playerImg, players[id].x, players[id].y, 50, 50);
    }
    pedestrians.forEach(ped => ctx.drawImage(pedestrianImg, ped.x, ped.y, 40, 40));
}

