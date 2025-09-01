// server/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express(); // Create an Express application
const server = http.createServer(app); // Create an HTTP server using our Express app

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Replace with your client's origin
    methods: ["GET", "POST"],
  },
});

app.use(cors());  // Enable CORS for all routes

let drawingHistory = [];

// Set up Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  socket.on('history:request', () => {
    // When a client asks for the history, send it back to them
    socket.emit('draw:history', drawingHistory);
  });

   socket.on('draw:start', (data) => {
    // Add the action to our history
    drawingHistory.push({ type: 'start', ...data });
    // Broadcast to all OTHER clients
    socket.broadcast.emit('draw:start', data);
  });

  socket.on('draw:drawing', (data) => {
    // Add the action to our history
    drawingHistory.push({ type: 'drawing', ...data });
    // Broadcast to all OTHER clients
    socket.broadcast.emit('draw:drawing', data);
  });

  socket.on('draw:stop', () => {
    // keep it simple for now and not store this one
    // Broadcast to all OTHER clients
    socket.broadcast.emit('draw:stop');
  });

  // Handle the clear event 
  socket.on('clear', () => {
    // Clear the history on the server
    drawingHistory = [];
    // Tell all other clients to clear their canvases too
    io.emit('clear'); // Use io.emit to send to EVERYONE, including the sender
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

const PORT = 4001;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});