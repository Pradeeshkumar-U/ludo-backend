# Complete Code Breakdown: Ludo Backend

This file explains every single line of logic I have written for you. It is organized by file.

---

## 1. `src/app.js` (The Entry Point)
This is the starting file of your server. 

- **Line 1-4**: Imports `express` (for the web server), `http` (to link express and sockets), `Server` (from socket.io), and `uuid` (to generate unique IDs).
- **Line 8-13**: Configures **CORS** (Cross-Origin Resource Sharing). This allows your Flutter app to talk to the Node server safely.
- **Line 18**: `rooms = new Map()`: This is our global storage. Every game room created is stored here.
- **Line 23-33**: `io.on('connection', ...)`: This runs every time a new user opens your app. It "registers" the different handlers (room, game, and chat) so the server knows what to do when the user clicks a button.

---

## 2. `src/models/Game.js` (The Logic/Rules)
This class defines everything that happens during a Ludo match.

### `constructor(roomId)`
- Sets `status` to `WAITING` (players haven't started yet).
- Creates an empty `players` list.
- `messages = []`: This is where we store the live chat for this specific room.

### `addPlayer(id, name)`
- Checks if the room is full (max 4).
- Creates a `Player` object with:
    - `id`: The unique socket ID.
    - `name`: The name typed by the user in Flutter.
    - `color`: Auto-assigned (Red, Green, Yellow, Blue).
    - `pieces: [-1, -1, -1, -1]`: Every piece starts at index `-1` (Base).

### `rollDice()`
- Generates a random number from 1 to 6.
- Saves it in `this.lastDiceRoll`.
- It immediately runs `getPossibleMoves`. If no pieces can move (and it's not a 6), it automatically moves the turn to the next player.

### `movePiece(playerId, pieceIndex)`
- **Step 1**: Validates if it's actually that player's turn.
- **Step 2**: Updates the position. If at `-1` and roll is `6`, sets to `0` (start). Else, adds the dice roll to the current position.
- **Step 3: Killing Logic**: It checks if your `newPos` overlaps with an opponent. If it does (and it's not a safe spot), the opponent's piece is set back to `-1`.
- **Step 4**: Checking for Winner: If all 4 pieces are at index `57`, that player wins.
- **Step 5**: If you rolled a 6 or killed a piece, you get to stay on this turn. Otherwise, it calls `nextTurn()`.

### `getGlobalPosition(color, pos)`
- Each player sees their "start" as 0. But on the board, Red's 0 is different from Blue's 0. This function does the **index math** to convert everyone's relative position into a single board index (0-51) so the "Killing" logic works correctly.

---

## 3. `src/services/roomService.js` (Memory Service)
This handles the "List" of games.

- **`createRoom`**: Generates a random room code, creates a new `Game` instance, and saves it in the `Map`.
- **`joinRoom`**: Looks up a game by its code. If it finds it, it calls the `game.addPlayer()` function.
- **`deleteRoom`**: Removes the game from memory when everyone leaves. **Why?** To keep the server fast and save RAM.

---

## 4. `src/sockets/` (Communications)

### `roomHandler.js`
- Handles the `create_room` and `join_room` events.
- Uses `socket.join(roomCode)`: This is a "Room" feature in Socket.io that lets you send a message *only* to the people in a specific Ludo match.

### `gameHandler.js`
- `roll_dice`: Tells the model to roll, then broadcasts the result to everyone.
- `move_piece`: Tells the model to move a piece, then sends the updated game state to everyone.

### `chatHandler.js`
- `send_message`: Takes the `text` and `playerName` from Flutter.
- Calls `game.sendMessage()` to store it in history.
- Broadcasts `new_message` so everyone's chat window updates instantly.

---

---

### `lib/models/ludo_constants.dart`
- **The Map**: Defines the exact X/Y coordinates for the 52 path tiles and the 5-tile home run for each color.
- **Base Logic**: Handles the math for where the 4 coins sit when they are at home base (`-1`).

### `lib/widgets/dice_widget.dart`
- **The Visuals**: Instead of just showing a number, this widget draws actual dots (1-6) using a custom `_shouldShowDot` logic.
- **State**: It changes color when it's your turn to roll, acting as a visual cue.

### `lib/widgets/ludo_board.dart`
- **The Stack**: Uses a `Stack` to overlay the coins on top of the board grid.
- **Coordinate Mapping**: Every coin reads its position from the server (e.g., 25) and looks up its X/Y coordinate from `LudoConstants`.

---

## 7. How to run the project
hod" Behind This Code: Why I wrote it this way

You might notice that every line follows a very specific style. This is called **Professional Modular Architecture**. Here is why I used this "method" for every single part of your app:

### A. The "Single Source of Truth" Method
**What it is:** All the logic (moving, killing, winning) is inside the `Game` class, NOT in the sockets.
**Why I did it:** In a multiplayer game, if calculation happens in two places, they can get "out of sync." By putting everything in the `Game` class, I ensure that if the server says a piece is at position 10, it is 10 for EVERYONE. This is how professional games like PUBG or Ludo King work.

### B. The "Decoupled Handlers" Method
**What it is:** Notice how `roomHandler.js`, `gameHandler.js`, and `chatHandler.js` are separate?
**Why I did it:** If I put all 500 lines of code in one file, it becomes a "Spaghetti Code" mess. By separating them, you can fix a bug in the Chat without accidentally breaking the Dice logic. This makes you look like a high-level developer who understands **Maintainability**.

### C. The "Event-Driven" Method
**What it is:** Every line of code reacts to a `socket.on` (an event).
**Why I did it:** Traditional apps use "Request-Response" (where the app asks the server "Is it my turn yet?"). That creates lag. My method uses **Real-Time Pushing**. As soon as the dice rolls, the server "pushes" the result to everyone. This is called **Asynchronous Programming**.

### D. The "Validation First" Method
**What it is:** In every function, the first 2-3 lines are always checks (e.g., `if (!game) return`, `if (notYourTurn) return`).
**Why I did it:** Hackers or "Cheaters" might try to send a "Move Piece" signal even when it's not their turn. By checking the game state at the start of every single function, I've made your backend **Secure** and **Cheat-Proof**.

---

### Summary: Why this helps you?
When you show this to an interviewer, you aren't just showing "Ludo". You are showing:
1.  **Security** (Validation logic).
2.  **Scalability** (Modular structure).
3.  **Performance** (Efficient Map lookups).
4.  **Clean Code** (Names that actually mean something).
