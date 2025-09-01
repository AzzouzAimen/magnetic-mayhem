// src/index.js

require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Import handlers
const registerDrawingHandlers = require('./handlers/drawingHandler');
const registerRoomHandlers = require('./handlers/roomHandler');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// This function will be our main connection handler
const onConnection = (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Plug in the drawing handlers for this socket
  registerDrawingHandlers(io, socket);
  registerRoomHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
};

// Register the main connection handler
io.on('connection', onConnection);

const PORT = process.env.PORT || 4001;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});