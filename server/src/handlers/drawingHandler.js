// src/handlers/drawingHandler.js

// We need to import our state
const { drawingHistory, gameRooms } = require("../state");

// This function will be called when a new client connects
const registerDrawingHandlers = (io, socket) => {
  // Helper to get the user's current room
  const getCurrentRoom = () => {
    for (const [roomId, room] of gameRooms.entries()) {
      if (room.players.has(socket.id)) {
        return room;
      }
    }
    return null;
  };

  // This function takes the data for a drawing event
  const handleDrawing = (data) => {
    const room = getCurrentRoom();
    if (room && room.currentDrawerId === socket.id) {
      //PERMISSION CHECK
      drawingHistory.push({ type: "drawing", ...data });
      // Send drawing data ONLY to the other players in the same room
      socket.broadcast.to(room.roomId).emit("draw:drawing", data);
    }
  };

  // This function handles a request for history
  const handleHistoryRequest = () => {
    socket.emit("draw:history", drawingHistory);
  };

  // This function handles clearing the canvas
  const handleClear = () => {
    const room = getCurrentRoom();
    if (room && room.currentDrawerId === socket.id) { //PERMISSION CHECK
      drawingHistory.length = 0; // Clear the history by setting the array length to 0
      io.emit("clear"); // Use `io` to emit to everyone
    }
  };

  // Register all the event listeners for this socket
  socket.on("draw:drawing", handleDrawing);
  socket.on("history:request", handleHistoryRequest);
  socket.on("clear", handleClear);
};

module.exports = registerDrawingHandlers;
