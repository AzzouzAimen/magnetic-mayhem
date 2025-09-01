// src/handlers/roomHandler.js

const { nanoid } = require('nanoid');
const { gameRooms, getRandomWord } = require('../state');

const registerRoomHandlers = (io, socket) => {

  const updatePlayerList = (roomId) => {
    const room = gameRooms.get(roomId);
    if (room) {
      // Convert the Map of players to an array to send to the client
      const players = Array.from(room.players.values());
      io.to(roomId).emit('lobby:update', players);
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
    socket.emit('game:created', { roomId, players });
  };

  const joinGame = ({ roomId, nickname }) => {
    const room = gameRooms.get(roomId);
    if (!room || room.players.size >= 8) {
      return socket.emit('game:error', 'Invalid room code or room is full.');
    }
    const newPlayer = { id: socket.id, name: nickname };
    room.players.set(socket.id, newPlayer);
    socket.join(roomId);
    const players = Array.from(room.players.values());     // Get the updated list of players
    // Send the confirmation and the FULL player list back to the joiner
    socket.emit('game:joined', { roomId, players });
    socket.broadcast.to(roomId).emit('lobby:update', players);
  };
  
  const leaveGame = () => {
    // Find which room the socket is in
    for (const [roomId, room] of gameRooms.entries()) {
      if (room.players.has(socket.id)) {
        room.players.delete(socket.id);
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

    // --- Round Logic ---
    // Select the next drawer (simple rotation for now)
    const players = Array.from(room.players.values());
    const currentDrawerIndex = players.findIndex(p => p.id === room.currentDrawerId);
    const nextDrawerIndex = (currentDrawerIndex + 1) % players.length;
    const nextDrawer = players[nextDrawerIndex];
    
    // Choose a new word
    const word = getRandomWord();

    // Update the server's game state for this room
    room.gameState = 'drawing';
    room.currentDrawerId = nextDrawer.id;
    room.currentWord = word;
    // We will handle the timer later

    console.log(`[New Round] Room: ${roomId}, Drawer: ${nextDrawer.name}, Word: ${word}`);

    // Notify ALL players in the room about the new round
    io.to(roomId).emit('round:start', {
      drawerId: nextDrawer.id,
      // We will add timer info later
    });

    // Send the secret word ONLY to the new drawer
    io.to(nextDrawer.id).emit('round:word', word);
  };

  const startGame = (roomId) => {
    const room = gameRooms.get(roomId);
    if (!room) return;
    
    // Check if the person starting the game is the host
    const hostId = Array.from(room.players.keys())[0];
    if (socket.id === hostId) {
      // Initialize the scores and other game state properties
      room.players.forEach(player => player.score = 0);
      room.currentDrawerId = null; // So the first round picks the first player
      
      console.log(`[Game Started] Host ${socket.id} started game in room ${roomId}`);
      startNewRound(roomId);
    }
  };

  socket.on('game:create', createGame);
  socket.on('game:join', joinGame);
  socket.on('game:start', startGame);
  socket.on('disconnect', leaveGame); 
};

module.exports = registerRoomHandlers;