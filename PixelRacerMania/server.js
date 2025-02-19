const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = {};

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);

    socket.on("newPlayer", (player) => {
        players[socket.id] = player;
        io.emit("updatePlayers", players);
    });

    socket.on("playerMove", (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            io.emit("updatePlayers", players);
        }
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("updatePlayers", players);
    });
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});
