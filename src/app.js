const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust for production
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Game State Storage (In-memory for now)
const rooms = new Map();

// Help check route
app.get('/', (req, res) => {
    res.send('Ludo Backend is running! 🎲');
});

const roomHandler = require('./sockets/roomHandler');
const gameHandler = require('./sockets/gameHandler');
const chatHandler = require('./sockets/chatHandler');

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Register handlers
    roomHandler(io, socket);
    gameHandler(io, socket);
    chatHandler(io, socket);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Ludo backend listening on port ${PORT}`);
});
