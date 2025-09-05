// src/handlers/roomHandler.js

const { nanoid } = require("nanoid");
const { gameRooms, defaultWordList } = require("../state");

// Helper to shuffle an array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

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
    const roomId = nanoid(4).toUpperCase();
    console.log(`[Create Game] Generated room ID: "${roomId}"`);
    const newPlayer = { id: socket.id, name: nickname };
    const players = [newPlayer]; // The initial player list is just the creator

    // Create a new room object in our state
    gameRooms.set(roomId, {
      roomId,
      players: new Map([[socket.id, newPlayer]]),
      drawingHistory: [],
    });

    socket.join(roomId);
    // Send the roomId AND the initial player list in one event
    socket.emit("game:created", { roomId, players });
  };

  const joinGame = ({ roomId, nickname }) => {
    const normalizedRoomId = roomId.toUpperCase();
    console.log(
      `[Join Attempt] Room ID: "${roomId}" -> "${normalizedRoomId}", Available rooms:`,
      Array.from(gameRooms.keys())
    );
    const room = gameRooms.get(normalizedRoomId);
    if (!room || room.players.size >= 8) {
      console.log(
        `[Join Failed] Room not found or full. Room:`,
        room,
        `Players:`,
        room?.players?.size
      );
      return socket.emit("game:error", "Invalid room code or room is full.");
    }
    const newPlayer = { id: socket.id, name: nickname };
    room.players.set(socket.id, newPlayer);
    socket.join(normalizedRoomId);
    io.to(normalizedRoomId).emit('chat:message', {
      type: 'system',
      text: `${nickname} has joined the game!`
    });
    const players = Array.from(room.players.values()); // Get the updated list of players
    // Send the confirmation and the FULL player list back to the joiner
    socket.emit("game:joined", { roomId: normalizedRoomId, players });
    socket.broadcast.to(normalizedRoomId).emit("lobby:update", players);
  };

  const leaveGame = () => {
    // Find which room the socket is in
    for (const [roomId, room] of gameRooms.entries()) {
      if (room.players.has(socket.id)) {
        const leavingPlayer = room.players.get(socket.id);
        room.players.delete(socket.id);
        io.to(roomId).emit('chat:message', {
          type: 'system',
          text: `${leavingPlayer.name} has left the game.`
        });
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
    console.log(`[Start New Round] Starting new round for room: ${roomId}`);
    const room = gameRooms.get(roomId);
    if (!room) {
      console.log(`[Start New Round] Room not found: ${roomId}`);
      return;
    }
    // Clear previous timer if it exists
    if (room.timerInterval) clearInterval(room.timerInterval);

    // --- NEW: Check for Game Over condition ---
    if (room.currentRound > room.totalRounds) {
      console.log(`[Game Over] Room: ${roomId}`);
      room.gameState = 'results';
      // Sort players by score for the final scoreboard
      const finalScores = Array.from(room.players.values()).sort((a, b) => b.score - a.score);
      io.to(roomId).emit('game:over', finalScores);
      return; // Stop the round loop
    }

    if (room.wordList.length === 0) {
      console.log(`[Start New Round] Word list is empty for room: ${roomId}`);
      // If we run out of words, end the game with final scores
      room.gameState = 'results';
      const finalScores = Array.from(room.players.values()).sort((a, b) => b.score - a.score);
      io.to(roomId).emit('game:over', finalScores);
      return;
    }
    const word = room.wordList.pop(); // Get the next word from the shuffled list

    // --- Round Logic ---
    // Select the next drawer (simple rotation for now)
    const players = Array.from(room.players.values());
    if (players.length === 0) {
      console.log(`[Start New Round] No players in room: ${roomId}`);
      return;
    }
    
    const currentDrawerIndex = room.currentDrawerId 
      ? players.findIndex((p) => p.id === room.currentDrawerId)
      : -1;
    const nextDrawerIndex = (currentDrawerIndex + 1) % players.length;
    const nextDrawer = players[nextDrawerIndex];

    // Update the server's game state for this room
    room.gameState = "drawing";
    room.currentDrawerId = nextDrawer.id;
    room.currentWord = word;
    
    // Clear the drawing history for the new round
    room.drawingHistory.length = 0;
    room.timer = room.roundTime;
    room.currentRound += 1; // Increment the round counter

    console.log(
      `[New Round ${room.currentRound}/${room.totalRounds}] Room: ${roomId}, Drawer: ${nextDrawer.name}, Word: ${word}, Time: ${room.timer}s`
    );

    // Notify ALL players in the room about the new round
    console.log(
      `[Start New Round] Emitting round:start to room ${roomId} with drawer: ${nextDrawer.name} (${nextDrawer.id})`
    );
    io.to(roomId).emit("round:start", {
      drawerId: nextDrawer.id,
      roundDuration: room.roundTime, // Send the correct duration
      currentRound: room.currentRound,
      totalRounds: room.totalRounds,
    });

    // Send the secret word ONLY to the new drawer
    console.log(
      `[Start New Round] Sending word "${word}" to drawer: ${nextDrawer.name}`
    );
    io.to(nextDrawer.id).emit("round:word", word);
    // Start the countdown interval
    room.timerInterval = setInterval(() => {
      room.timer -= 1;
      // Broadcast the tick to everyone in the room
      io.to(roomId).emit("timer:tick", room.timer);

      if (room.timer <= 0) {
        clearInterval(room.timerInterval);
        io.to(roomId).emit('chat:message', {
          type: 'system',
          text: `Time's up! The word was: ${room.currentWord}`
        });

        // Start next round after a delay
        setTimeout(() => startNewRound(roomId), 3000);
      }
    }, 1000); // Run every second
  };

  const startGame = ({ roomId, options }) => {
    console.log(
      `[Start Game] Attempting to start game for room: ${roomId} with options:`,
      options
    );
    const room = gameRooms.get(roomId);
    if (!room) {
      console.log(`[Start Game] Room not found: ${roomId}`);
      return;
    }

    const hostId = Array.from(room.players.keys())[0];
    console.log(
      `[Start Game] Host ID: ${hostId}, Current socket ID: ${socket.id}`
    );
    if (socket.id === hostId) {
      // Configure the game based on options
      room.roundTime = options?.roundTime || 60;

      // Set up the word list for the entire game
      if (options?.customWords && options.customWords.length > 0) {
        room.wordList = shuffleArray([...options.customWords]);
      } else {
        room.wordList = shuffleArray([...defaultWordList]);
      }

      // --- NEW: Initialize round counters ---
      room.totalRounds = room.players.size * 2; // e.g., 2 rounds per player
      room.currentRound = 0; // Will be incremented to 1 in startNewRound

      // Initialize scores
      room.players.forEach((player) => (player.score = 0));
      room.currentDrawerId = null;

      console.log(
        `[Game Started] Room: ${roomId} with options:`,
        options,
        `Word list length:`,
        room.wordList.length
      );
      startNewRound(roomId);
    } else {
      console.log(`[Start Game] Socket ${socket.id} is not the host ${hostId}`);
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

          // System message for correct guess
          io.to(roomId).emit("chat:message", {
            type: "system",
            text: `${guesser.name} guessed the word: ${room.currentWord}!`,
          });

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
            type: "chat",
            name: player.name,
            message: guess,
          });
        }
        break; // Exit loop once the room is found
      }
    }
  };

  // --- NEW: Handler to play again ---
  const handlePlayAgain = (roomId) => {
    const room = gameRooms.get(roomId);
    if (!room) return;

    // Only the host can restart the game
    const hostId = Array.from(room.players.keys())[0];
    if (socket.id === hostId) {
      console.log(`[Play Again] Room ${roomId} is returning to lobby.`);
      room.gameState = 'lobby';
      // Clear any running timer
      if (room.timerInterval) clearInterval(room.timerInterval);
      // Reset relevant game properties but keep players
      room.wordList = [];
      room.currentDrawerId = null;
      room.currentWord = '';
      room.currentRound = 0; // Reset round counter
      room.totalRounds = 0; // Reset total rounds
      
      // Tell all clients to go back to the lobby state
      io.to(roomId).emit('game:lobby');
    }
  };

  socket.on("game:create", createGame);
  socket.on("game:join", joinGame);
  socket.on("game:start", startGame);
  socket.on("game:playAgain", handlePlayAgain); // Register the new handler
  socket.on("disconnect", leaveGame);
  socket.on("game:guess", handleGuess);
};

module.exports = registerRoomHandlers;
