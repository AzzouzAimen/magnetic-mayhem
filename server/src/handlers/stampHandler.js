// src/handlers/stampHandler.js

const { drawingHistory, gameRooms } = require('../state');

const registerStampHandlers = (io, socket) => {
  const getCurrentRoom = () => {
    for (const [roomId, room] of gameRooms.entries()) {
      if (room.players.has(socket.id)) {
        return room;
      }
    }
    return null;
  };

  const handlePlaceStamp = (data) => {
    const room = getCurrentRoom();
    if (room && room.currentDrawerId === socket.id) {
      // We'll add stamp events to the main drawingHistory for now
      // A more advanced setup might have per-room histories
      drawingHistory.push({ type: 'stamp', ...data });
      socket.broadcast.to(room.roomId).emit('stamp:place', data);
    }
  };

  socket.on('stamp:place', handlePlaceStamp);
};

module.exports = registerStampHandlers;