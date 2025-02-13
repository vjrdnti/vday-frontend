const socket = io("https://vday-server.onrender.com");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1080;
canvas.height = 700;

let players = {};
let pedestrians = [];
let level = 1;
let kissProgress = 0;
let animations = {};

const player1Img = new Image();
player1Img.src = "assets/player1.png";

const player2Img = new Image();
player2Img.src = "assets/player2.png";

const pedestrianImg = new Image();
pedestrianImg.src = "assets/pedestrian.png";

document.addEventListener("keydown", (event) => {
    if (!players[socket.id]) return;

    let dx = 0, dy = 0;
    if (event.key === "ArrowRight") dx = 20;
    if (event.key === "ArrowLeft") dx = -20;
    if (event.key === "ArrowUp") dy = -20;
    if (event.key === "ArrowDown") dy = 20;

    if (dx !== 0 || dy !== 0) {
        socket.emit("move", { x: players[socket.id].x + dx, y: players[socket.id].y + dy });
    }

    let emote = null;
    

    if (event.key === "k") {
        socket.emit("kiss");
        animations.push({ x: players[socket.id].x, y: players[socket.id].y, text: ":3", time: 6 });
    }
    
    if (event.key === "k") emote = ":3";
    if (event.key === "s") emote = "Zzz";
    if (event.key === "m") emote = "mreow";
    if (event.key === "p") emote = "purrrrr";

    if (emote) {
        socket.emit("emote", { emote });
    }
});

socket.on("players", (data) => {
    players = data;
    draw();
});

socket.on("pedestrians", (data) => {
    pedestrians = data;
    draw();
});

socket.on("kissSuccess", (progress) => {
    kissProgress = progress;
    draw();
});

socket.on("kissFail", (message) => {
    alert(`❌ ${message}`);
});

socket.on("levelUp", (newLevel) => {
    level = newLevel;
    kissProgress = 0;
    alert(`yippeee we reached level ${level}!`);
});

socket.on("gameOver", () => {
    kissProgress = 0;
    alert("uh-oh :(");
});

socket.on("emote", (data) => {
    if (players[data.id]) {
        animations[data.id] = { 
            x: players[data.id].x, 
            y: players[data.id].y, 
            text: data.text, 
            time: 60 
        };
    }
});


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const id in players) {
        const p = players[id];
        const img = p.id === 1 ? player1Img : player2Img;
        ctx.drawImage(img, p.x, p.y, 50, 50);

        if (animations[id]) {
            ctx.font = "25px Arial";
            ctx.fillStyle = "yellow";
            ctx.fillText(animations[id].text, p.x + 10, p.y - 10);
            animations[id].time--;
            if (animations[id].time <= 0) delete animations[id];
        }
    }

    pedestrians.forEach(ped => {
        ctx.drawImage(pedestrianImg, ped.x, ped.y, 40, 40);
    });

    ctx.fillStyle = "black";
    ctx.fillRect(10, 10, 100, 20);
    ctx.fillStyle = "pink";
    ctx.fillRect(10, 10, kissProgress * 20, 20);
}
