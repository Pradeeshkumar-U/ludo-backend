# Ludo Backend: Internship Study Guide

This document explains the technical implementation of the Ludo backend. Use this to study for interviews and explain your code to senior developers.

---

## 1. Architectural Overview
This project follows the **MVC (Model-View-Controller)** pattern and **Separation of Concerns**.

- **Models**: `src/models/Game.js` - Contains the "Business Logic" and rules of Ludo.
- **Services**: `src/services/roomService.js` - Manages data storage (In-memory Map).
- **Handlers/Controllers**: `src/sockets/` - Manages communication (Socket.io events).

---

## 2. Core Logic Deep-Dive (`src/models/Game.js`)

### `constructor(roomId)`
Sets up the initial state. **Interview Tip:** Mention that the state is "Centralized." Any change to the game must happen here to ensure all players stay in sync.

### `addPlayer(id, name)`
- **Logic**: Assigns a unique color (`RED`, `GREEN`, etc.) automatically.
- **Constraint**: Returns an error if the game is full or already started. This is called **Validation Logic**.

### `rollDice()`
- **Logic**: Generates 1-6. 
- **Efficiency**: It pre-calculates if the user *can* move. If not, it skips to the next turn immediately. This prevents a "Stuck Game" state.

### `movePiece(playerId, pieceIndex)`
- **Piece Collision (Killing)**: The most complex part. It checks if your `newPos` lands on an opponent's tile.
- **Safe Spots**: Implementation of safe tiles where pieces cannot be killed.
- **Extra Turn**: Implements the rule where getting a `6` or "killing" a piece gives you another roll.

### `getGlobalPosition(color, pos)`
- **Concept**: **Coordinate Mapping**. 
- **Math**: Since every player starts at a relative "0", this function converts relative positions to a "Global Board Index" (0-51) so we can compare if two pieces are on the same tile.

---

## 3. Real-Time Communication (`Socket.io`)

### Event-Driven Architecture
The server doesn't wait in a loop. It "reacts" to events:
- `create_room`: Initializes a new instance of the `Game` class.
- `roll_dice`: Triggers the `rollDice()` method.
- `send_message`: Updates the chat history and broadcasts it.

---

## 4. Performance & Scalability Concepts

### Why use a `Map` instead of an `Array` for rooms?
- **O(1) Lookup**: In a `Map`, finding a room by its code `rooms.get('ABCDE')` is instant. In an `Array`, the server would have to loop through every room, which is slow if you have 10,000 players.

### Handling Disconnects
- In `roomHandler.js`, the `disconnecting` event ensures that if a user leaves, the game state is updated or cleaned up. This prevents **Memory Leaks** (data staying in RAM when it's no longer needed).

---

## 5. Potential Interview Questions

**Q: How do you ensure two players don't move at the same time?**
*   **A:** "I implemented a `currentTurnIndex`. The `movePiece` function explicitly checks `if (player.id !== playerId) return { error: 'Not your turn' };`. This is server-side validation that prevents cheating."

**Q: What is the benefit of using Socket.io over REST APIs for this?**
*   **A:** "Ludo is a real-time game. REST is 'Pull-based' (the client must ask for updates), which creates lag. Socket.io is 'Push-based' (the server sends updates instantly), which is necessary for multiplayer sync."

**Q: How would you scale this to 1 Million users?**
*   **A:** "I would move the game state from the local `Map` to a **Redis** database and use a **Redis Adapter** for Socket.io. This would allow me to run multiple server instances behind a Load Balancer."

---

## 6. Key Terms to Use
- **Stateful Server**: The server remembers the current position of every piece.
- **Broadcast**: Sending a message to everyone in a room.
- **Business Logic**: The specific rules (Ludo rules) separated from the technical code.
- **Serialization**: Converting the `Game` object into a JSON string to send it over the wire.
