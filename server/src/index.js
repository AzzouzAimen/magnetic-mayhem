// src/index.js

require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Import handlers
const registerDrawingHandlers = require('./handlers/drawingHandler');
const registerRoomHandlers = require('./handlers/roomHandler');
const registerStampHandlers = require('./handlers/stampHandler'); 
const registerBoardHandlers = require('./handlers/boardHandler');

const app = express();
const server = http.createServer(app);

const inferredClientUrl = process.env.CLIENT_URL || 'https://magnetic-mayhem-client.onrender.com';
const allowedOrigins = new Set([
  inferredClientUrl,
  'https://magnetic-mayhem-client.onrender.com',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000'
]);

const dynamicCorsOrigin = (origin, callback) => {
  if (!origin) {
    return callback(null, true);
  }
  if (allowedOrigins.has(origin)) {
    return callback(null, true);
  }
  return callback(new Error(`CORS not allowed for origin: ${origin}`), false);
};

const io = new Server(server, {
  cors: {
    origin: dynamicCorsOrigin,
    credentials: true,
    methods: ["GET", "POST"]
  }
});

app.use(cors({ origin: dynamicCorsOrigin, credentials: true }));

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// This function will be our main connection handler
const onConnection = (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Plug in the drawing handlers for this socket
  registerDrawingHandlers(io, socket);
  registerRoomHandlers(io, socket);
  registerStampHandlers(io, socket);
  registerBoardHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
};

// Register the main connection handler
io.on('connection', onConnection);

const PORT = process.env.PORT || 4001;
const PUBLIC_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on ${PUBLIC_URL}`);
});