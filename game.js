const socket = io("https://vday-server.onrender.com");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1080;
canvas.height = 700;

let players = {};
let pedestrians = [];
let level = 1;
let kissProgress = 0;
let messages = [];
let animations = [];

const player1Img = new Image();
player1Img.src = "assets/player1.png";

const player2Img = new Image();
player2Img.src = "assets/player2.png";

const pedestrianImg = new Image();
pedestrianImg.src = "assets/pedestrian.png";

const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
const chatBox = document.getElementById("chatBox");

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

    if (event.key === "k") {
        socket.emit("kiss");
        animations.push({ x: players[socket.id].x, y: players[socket.id].y, text: ":3", time: 6 });
    }

    if (event.key === "s") {
        animations.push({ x: players[socket.id].x, y: players[socket.id].y, text: "Zzz", time: 6  });
    }
    
    if (event.key === "m") {
        animations.push({ x: players[socket.id].x, y: players[socket.id].y, text: "mreow", time: 6 });
    }

    if (event.key === "p") {
        animations.push({ x: players[socket.id].x, y: players[socket.id].y, text: "purrrrr", time: 6 });
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

socket.on("message", (msg) => {
    messages.push(msg);
    updateChat();
    draw();
});

socket.on("gameOver", () => {
    kissProgress = 0;
    alert("uh-oh :(");
});

chatSend.addEventListener("click", () => {
    const msg = chatInput.value.trim();
    if (msg) {
        socket.emit("message", msg);
        chatInput.value = "";
    }
});

function updateChat() {
    chatBox.innerHTML = messages.slice(-5).map(msg => `<p><b>${msg.id}:</b> ${msg.text}</p>`).join("");
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const id in players) {
        const p = players[id];
        const img = p.id === 1 ? player1Img : player2Img;
        ctx.drawImage(img, p.x, p.y, 50, 50);
    }

    pedestrians.forEach(ped => {
        ctx.drawImage(pedestrianImg, ped.x, ped.y, 40, 40);
    });

    animations.forEach((anim, index) => {
        ctx.font = "20px Arial";
        ctx.fillStyle = "yellow";
        ctx.fillText(anim.text, anim.x, anim.y);
        anim.time--;
        if (anim.time <= 0) animations.splice(index, 1);
    });

    ctx.fillStyle = "black";
    ctx.fillRect(10, 10, 100, 20);
    ctx.fillStyle = "pink";
    ctx.fillRect(10, 10, kissProgress * 20, 20);
}

