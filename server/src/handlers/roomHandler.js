// src/handlers/roomHandler.js

const { nanoid } = require('nanoid'); // A great library for generating short, unique IDs

const registerRoomHandlers = (io, socket) => {

  const createGame = () => {
    const roomId = nanoid(4); // Generate a 4-character random ID, e.g., 'ABCD'
    console.log(`[Game Created] User ${socket.id} created room ${roomId}`);
    socket.join(roomId); // The user joins the Socket.IO room
    
    // Emit an event back to the creator with the room ID
    socket.emit('game:created', roomId);
  };

  // Register the event listener
  socket.on('game:create', createGame);
};

module.exports = registerRoomHandlers;