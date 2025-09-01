// src/handlers/roomHandler.js

const { nanoid } = require("nanoid");
const { gameRooms, getRandomWord } = require("../state");

const registerRoomHandlers = (io, socket) => {
  const updatePlayerList = (roomId) => {
    const room = gameRooms.get(roomId);
    if (room) {
      // Convert the Map of players to an array to send to the client
      const players = Array.from(room.players.values());
      io.to(roomId).emit("lobby:update", players);
    }
  };

  const createGame = (nickname) => {
    const roomId = nanoid(4);
    const newPlayer = { id: socket.id, name: nickname };
    const players = [newPlayer]; // The initial player list is just the creator

    // Create a new room object in our state
    gameRooms.set(roomId, {
      roomId,
      players: new Map([[socket.id, newPlayer]]),
    });

    socket.join(roomId);
    // Send the roomId AND the initial player list in one event
    socket.emit("game:created", { roomId, players });
  };

  const joinGame = ({ roomId, nickname }) => {
    const room = gameRooms.get(roomId);
    if (!room || room.players.size >= 8) {
      return socket.emit("game:error", "Invalid room code or room is full.");
    }
    const newPlayer = { id: socket.id, name: nickname };
    room.players.set(socket.id, newPlayer);
    socket.join(roomId);
    const players = Array.from(room.players.values()); // Get the updated list of players
    // Send the confirmation and the FULL player list back to the joiner
    socket.emit("game:joined", { roomId, players });
    socket.broadcast.to(roomId).emit("lobby:update", players);
  };

  const leaveGame = () => {
    // Find which room the socket is in
    for (const [roomId, room] of gameRooms.entries()) {
      if (room.players.has(socket.id)) {
        room.players.delete(socket.id);
        // If the disconnected player was the host and the game stops
        if (room.players.size < 2) {
            clearInterval(room.timerInterval);
        }
        // If the room is now empty, delete it
        if (room.players.size === 0) {
          gameRooms.delete(roomId);
        } else {
          updatePlayerList(roomId); // Update the remaining players
        }
        break; // Exit loop once found and handled
      }
    }
  };

  const startNewRound = (roomId) => {
    const room = gameRooms.get(roomId);
    if (!room) return;
    // Clear previous timer if it exists
    if (room.timerInterval) clearInterval(room.timerInterval);

    // --- Round Logic ---
    // Select the next drawer (simple rotation for now)
    const players = Array.from(room.players.values());
    const currentDrawerIndex = players.findIndex(
      (p) => p.id === room.currentDrawerId
    );
    const nextDrawerIndex = (currentDrawerIndex + 1) % players.length;
    const nextDrawer = players[nextDrawerIndex];

    // Choose a new word
    const word = getRandomWord();

    // Update the server's game state for this room
    room.gameState = "drawing";
    room.currentDrawerId = nextDrawer.id;
    room.currentWord = word;
    room.timer = 60;

    console.log(
      `[New Round] Room: ${roomId}, Drawer: ${nextDrawer.name}, Word: ${word}`
    );

    // Notify ALL players in the room about the new round
    io.to(roomId).emit("round:start", {
      drawerId: nextDrawer.id,
      roundDuration: 60, // Send initial duration
    });

    // Send the secret word ONLY to the new drawer
    io.to(nextDrawer.id).emit("round:word", word);
    // Start the countdown interval
    room.timerInterval = setInterval(() => {
      room.timer -= 1;
      // Broadcast the tick to everyone in the room
      io.to(roomId).emit("timer:tick", room.timer);

      if (room.timer <= 0) {
        clearInterval(room.timerInterval);
        io.to(roomId).emit("round:end", {
          guesserName: null, // No one guessed
          correctWord: room.currentWord,
        });

        // Start next round after a delay
        setTimeout(() => startNewRound(roomId), 3000);
      }
    }, 1000); // Run every second
  };

  const startGame = (roomId) => {
    const room = gameRooms.get(roomId);
    if (!room) return;

    // Check if the person starting the game is the host
    const hostId = Array.from(room.players.keys())[0];
    if (socket.id === hostId) {
      // Initialize the scores and other game state properties
      room.players.forEach((player) => (player.score = 0));
      room.currentDrawerId = null; // So the first round picks the first player

      console.log(
        `[Game Started] Host ${socket.id} started game in room ${roomId}`
      );
      startNewRound(roomId);
    }
  };

  const handleGuess = (guess) => {
    // Find which room the socket is in
    for (const [roomId, room] of gameRooms.entries()) {
      if (room.players.has(socket.id)) {
        // Check if the guess is correct (and the guesser is not the drawer)
        if (
          room.currentWord.toLowerCase() === guess.toLowerCase() &&
          socket.id !== room.currentDrawerId
        ) {
          const guesser = room.players.get(socket.id);
          const drawer = room.players.get(room.currentDrawerId);

          //Stop the timer on correct guess
          clearInterval(room.timerInterval);

          // Award points
          guesser.score += 100;
          if (drawer) drawer.score += 75;

          console.log(
            `[Correct Guess] Room: ${roomId}, Player: ${guesser.name}`
          );

          // Announce the winner of the round to everyone in the room
          io.to(roomId).emit("round:end", {
            guesserName: guesser.name,
            correctWord: room.currentWord,
          });

          // Update everyone's player list/scoreboard
          updatePlayerList(roomId);

          // Start the next round after a short delay
          setTimeout(() => {
            startNewRound(roomId);
          }, 3000); // 3-second delay
        } else {
          // Broadcast the incorrect guess as a chat message
          const player = room.players.get(socket.id);
          io.to(roomId).emit("chat:message", {
            name: player.name,
            message: guess,
          });
        }
        break; // Exit loop once the room is found
      }
    }
  };

  socket.on("game:create", createGame);
  socket.on("game:join", joinGame);
  socket.on("game:start", startGame);
  socket.on("disconnect", leaveGame);
  socket.on("game:guess", handleGuess);
};

module.exports = registerRoomHandlers;
