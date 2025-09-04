// src/handlers/drawingHandler.js

// We need to import our state
const { gameRooms } = require("../state");

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
    console.log(`[Drawing] Socket ${socket.id} drawing, room:`, room ? room.roomId : 'none', 'currentDrawer:', room ? room.currentDrawerId : 'none');
    if (room && room.currentDrawerId === socket.id) {
      //PERMISSION CHECK
      room.drawingHistory.push({ type: "drawing", ...data });
      console.log(`[Drawing] Broadcasting to room ${room.roomId}, history length: ${room.drawingHistory.length}`);
      // Send drawing data ONLY to the other players in the same room
      socket.broadcast.to(room.roomId).emit("draw:drawing", data);
    } else {
      console.log(`[Drawing] Permission denied - room: ${!!room}, isDrawer: ${room ? room.currentDrawerId === socket.id : false}`);
    }
  };

  // This function handles a request for history
  const handleHistoryRequest = () => {
    const room = getCurrentRoom();
    console.log(`[History] Socket ${socket.id} requesting history, room:`, room ? room.roomId : 'none', 'history length:', room ? room.drawingHistory.length : 0);
    if (room) {
      socket.emit("draw:history", room.drawingHistory);
    }
  };

  // This function handles clearing the canvas
  const handleClear = () => {
    const room = getCurrentRoom();
    if (room && room.currentDrawerId === socket.id) { //PERMISSION CHECK
      room.drawingHistory.length = 0; // Clear the history by setting the array length to 0
      io.to(room.roomId).emit("clear"); // Use `io.to(room.roomId)` to emit only to the room
    }
  };

  // Register all the event listeners for this socket
  socket.on("draw:drawing", handleDrawing);
  socket.on("history:request", handleHistoryRequest);
  socket.on("clear", handleClear);
};

module.exports = registerDrawingHandlers;
