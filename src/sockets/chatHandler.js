const roomService = require('../services/roomService');

module.exports = (io, socket) => {
    socket.on('send_message', (data) => {
        const { roomCode, text, playerName } = data;
        if (!roomCode || !text) return socket.emit('error', 'Room code and message text are required');

        const game = roomService.getRoom(roomCode);
        if (!game) return socket.emit('error', 'Room not found');

        const message = game.sendMessage(socket.id, playerName || 'Unknown', text);

        io.to(roomCode).emit('new_message', message);
        console.log(`Message sent in room ${roomCode} by ${playerName}: ${text}`);
    });
};
