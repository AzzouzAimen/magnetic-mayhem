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


// Set up Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

const PORT = 4001;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});