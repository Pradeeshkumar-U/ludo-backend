const COLORS = ['RED', 'GREEN', 'YELLOW', 'BLUE'];

class Game {
    constructor(roomId) {
        this.roomId = roomId;
        this.players = []; // { id, name, color, pieces, isReady }
        this.status = 'WAITING'; // WAITING, PLAYING, FINISHED
        this.currentTurnIndex = 0;
        this.lastDiceRoll = 0;
        this.winner = null;
        this.messages = []; // { senderId, senderName, text, timestamp }
    }

    sendMessage(senderId, senderName, text) {
        const message = {
            senderId,
            senderName,
            text,
            timestamp: Date.now()
        };
        this.messages.push(message);
        return message;
    }

    addPlayer(id, name) {
        if (this.players.length >= 4) return { error: 'Room is full' };
        if (this.status !== 'WAITING') return { error: 'Game already started' };

        const color = COLORS[this.players.length];
        const player = {
            id,
            name,
            color,
            pieces: [-1, -1, -1, -1], // -1 means at home/base
            isReady: false
        };

        this.players.push(player);
        return { player };
    }

    removePlayer(id) {
        this.players = this.players.filter(p => p.id !== id);
    }

    startGame() {
        if (this.players.length < 2) return { error: 'Need at least 2 players' };
        this.status = 'PLAYING';
        this.currentTurnIndex = 0;
        return { success: true };
    }

    rollDice() {
        if (this.status !== 'PLAYING') return { error: 'Game not started' };
        if (this.lastDiceRoll > 0) return { error: 'You have already rolled' };

        const roll = Math.floor(Math.random() * 6) + 1;
        this.lastDiceRoll = roll;

        const currentPlayer = this.players[this.currentTurnIndex];
        const possibleMoves = this.getPossibleMoves(currentPlayer, roll);

        let autoMoved = false;
        if (possibleMoves.length === 1) {
            // Auto-move if exactly one valid move exists
            this.movePiece(currentPlayer.id, possibleMoves[0]);
            autoMoved = true;
        } else if (possibleMoves.length === 0 && roll !== 6) {
            this.nextTurn();
        }

        return { roll, possibleMoves, nextTurn: possibleMoves.length === 0 && roll !== 6, autoMoved, game: this };
    }

    getPossibleMoves(player, roll) {
        const moves = [];
        player.pieces.forEach((pos, index) => {
            if (pos === -1) {
                if (roll === 6) moves.push(index);
            } else if (pos < 57) {
                if (pos + roll <= 57) moves.push(index);
            }
        });
        return moves;
    }

    movePiece(playerId, pieceIndex) {
        const player = this.players[this.currentTurnIndex];
        if (player.id !== playerId) return { error: 'Not your turn' };

        let pos = player.pieces[pieceIndex];
        const roll = this.lastDiceRoll;

        if (pos === -1 && roll === 6) {
            player.pieces[pieceIndex] = 0; // Entry
        } else {
            player.pieces[pieceIndex] += roll;
        }

        const newPos = player.pieces[pieceIndex];
        let killed = false;

        // Collision logic (simplified)
        if (newPos >= 0 && newPos <= 51) {
            const globalPos = this.getGlobalPosition(player.color, newPos);
            const safeSpots = [0, 8, 13, 21, 26, 34, 39, 47];

            if (!safeSpots.includes(globalPos)) {
                this.players.forEach(p => {
                    if (p.id !== player.id) {
                        p.pieces.forEach((otherPos, otherIdx) => {
                            if (otherPos >= 0 && otherPos <= 51) {
                                if (this.getGlobalPosition(p.color, otherPos) === globalPos) {
                                    p.pieces[otherIdx] = -1; // Send back to base
                                    killed = true;
                                }
                            }
                        });
                    }
                });
            }
        }

        if (newPos === 57) {
            if (player.pieces.every(p => p === 57)) {
                this.status = 'FINISHED';
                this.winner = player;
            }
        }

        // Extra turn for 6 or for killing a piece
        if (roll !== 6 && !killed) {
            this.nextTurn();
        } else {
            this.lastDiceRoll = 0; // Allow rolling again for extra turn
        }

        return { success: true, game: this, killed };
    }

    getGlobalPosition(color, pos) {
        const offsets = { 'RED': 0, 'GREEN': 13, 'YELLOW': 26, 'BLUE': 39 };
        return (pos + offsets[color]) % 52;
    }

    nextTurn() {
        this.lastDiceRoll = 0;
        this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
    }
}

module.exports = { Game, COLORS };
