// src/handlers/drawingHandler.js

// We need to import our state
const { drawingHistory } = require('../state');

// This function will be called when a new client connects
const registerDrawingHandlers = (io, socket) => {

  // This function takes the data for a drawing event
  const handleDrawing = (data) => {
    drawingHistory.push({ type: 'drawing', ...data });
    socket.broadcast.emit('draw:drawing', data);
  };

  // This function handles a request for history
  const handleHistoryRequest = () => {
    socket.emit('draw:history', drawingHistory);
  };

  // This function handles clearing the canvas
  const handleClear = () => {
    // Clear the history by setting the array length to 0
    drawingHistory.length = 0;
    io.emit('clear'); // Use `io` to emit to everyone
  };

  // Register all the event listeners for this socket
  socket.on('draw:drawing', handleDrawing);
  socket.on('history:request', handleHistoryRequest);
  socket.on('clear', handleClear);
};

module.exports = registerDrawingHandlers;