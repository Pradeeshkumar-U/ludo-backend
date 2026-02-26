const { v4: uuidv4 } = require('uuid');
const { Game } = require('../models/Game');

const rooms = new Map();

const createRoom = (playerName) => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const game = new Game(roomCode);
    rooms.set(roomCode, game);
    return { roomCode, game };
};

const joinRoom = (roomCode, playerId, playerName) => {
    const game = rooms.get(roomCode);
    if (!game) return { error: 'Room not found' };

    const result = game.addPlayer(playerId, playerName);
    if (result.error) return result;

    return { game };
};

const getRoom = (roomCode) => rooms.get(roomCode);

const deleteRoom = (roomCode) => rooms.delete(roomCode);

module.exports = {
    createRoom,
    joinRoom,
    getRoom,
    deleteRoom
};
