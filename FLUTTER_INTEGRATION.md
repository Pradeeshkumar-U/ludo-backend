# Flutter Integration Guide for Ludo Backend

Use the [socket_io_client](https://pub.dev/packages/socket_io_client) package in Flutter to connect.

## Socket Events

### 1. Room Management
- **Create Room**:
    - Emit: `create_room` with `playerName` (String)
    - Listen: `room_created` returns `{ roomCode, game }`
- **Join Room**:
    - Emit: `join_room` with `{ roomCode, playerName }`
    - Listen: `player_joined` returns `{ game }`
- **Start Game**:
    - Emit: `start_game` with `{ roomCode }`
    - Listen: `game_started` returns `{ game }`

### 3. Chat System
- **Send Message**:
    - Emit: `send_message` with `{ roomCode, text, playerName }`
    - Listen: `new_message` returns `{ senderId, senderName, text, timestamp }`

## Data Structure: `game` Object
- `players`: List of players. Each has `name`, `color`, and `pieces`.
- `messages`: List of messages for the current session.
- `pieces`:
    - `-1`: Base (needs 6 to move out)
    - `0-51`: Main board path
    - `52-56`: Home run path
    - `57`: Finished/Goal
- `currentTurnIndex`: Index of the player whose turn it is.
- `status`: `WAITING`, `PLAYING`, or `FINISHED`.

## UI Mapping Tip
- The backend uses logical positions (0-57). In Flutter, you should create a list of `Offset` coordinates for your board and map `pieces[i]` to `boardOffsets[pieces[i]]`.
- Since each player starts at a different point, remember to calculate their global position:
  - Red: Index 0
  - Green: Index 13
  - Yellow: Index 26
  - Blue: Index 39
