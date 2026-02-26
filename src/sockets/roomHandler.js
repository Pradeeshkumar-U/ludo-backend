const roomService = require('../services/roomService');

module.exports = (io, socket) => {
    socket.on('create_room', (data) => {
        const { playerName } = data;
        if (!playerName) return socket.emit('error', 'Player name is required');

        const { roomCode, game } = roomService.createRoom(playerName);
        const result = game.addPlayer(socket.id, playerName);

        socket.join(roomCode);
        socket.emit('room_created', { roomCode, game });
        console.log(`Room created: ${roomCode} by ${playerName}`);
    });

    socket.on('join_room', (data) => {
        const { roomCode, playerName } = data;
        if (!roomCode || !playerName) return socket.emit('error', 'Room code and player name are required');

        const result = roomService.joinRoom(roomCode, socket.id, playerName);
        if (result.error) return socket.emit('error', result.error);

        socket.join(roomCode);
        io.to(roomCode).emit('player_joined', { game: result.game });
        console.log(`Player ${playerName} joined room: ${roomCode}`);
    });

    socket.on('start_game', (data) => {
        const { roomCode } = data;
        const game = roomService.getRoom(roomCode);
        if (!game) return socket.emit('error', 'Room not found');

        const result = game.startGame();
        if (result.error) return socket.emit('error', result.error);

        io.to(roomCode).emit('game_started', { game });
        console.log(`Game started in room: ${roomCode}`);
    });

    socket.on('disconnecting', () => {
        // Handle player leaving rooms
        const rooms = Array.from(socket.rooms);
        rooms.forEach((roomCode) => {
            if (roomCode !== socket.id) {
                const game = roomService.getRoom(roomCode);
                if (game) {
                    game.removePlayer(socket.id);
                    io.to(roomCode).emit('player_left', { game });

                    if (game.players.length === 0) {
                        roomService.deleteRoom(roomCode);
                    }
                }
            }
        });
    });
};
