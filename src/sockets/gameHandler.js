const roomService = require('../services/roomService');

module.exports = (io, socket) => {
    socket.on('roll_dice', (data) => {
        const { roomCode } = data;
        const game = roomService.getRoom(roomCode);
        if (!game) return socket.emit('error', 'Room not found');

        const result = game.rollDice();
        if (result.error) return socket.emit('error', result.error);

        io.to(roomCode).emit('dice_rolled', {
            roll: result.roll,
            possibleMoves: result.possibleMoves,
            nextTurn: result.nextTurn,
            autoMoved: result.autoMoved,
            game: result.game
        });
        console.log(`Dice rolled: ${result.roll} in room ${roomCode}`);
    });

    socket.on('move_piece', (data) => {
        const { roomCode, pieceIndex } = data;
        const game = roomService.getRoom(roomCode);
        if (!game) return socket.emit('error', 'Room not found');

        const result = game.movePiece(socket.id, pieceIndex);
        if (result.error) return socket.emit('error', result.error);

        io.to(roomCode).emit('piece_moved', { game: result.game });
        console.log(`Piece moved: ${pieceIndex} in room ${roomCode}`);
    });
};
