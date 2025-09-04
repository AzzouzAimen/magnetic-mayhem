// src/handlers/stampHandler.js

const { gameRooms } = require('../state');

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
      // Add stamp events to the room-specific drawing history
      room.drawingHistory.push({ type: 'stamp', ...data });
      socket.broadcast.to(room.roomId).emit('stamp:place', data);
    }
  };

  socket.on('stamp:place', handlePlaceStamp);
};

module.exports = registerStampHandlers;