const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const setupGameHandlers = require('./gameHandler');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', process.env.CLIENT_URL || '*'],
    methods: ['GET', 'POST'],
  },
});

setupGameHandlers(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Laripin server running on port ${PORT}`);
});
