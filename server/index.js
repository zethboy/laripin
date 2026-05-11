const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const setupGameHandlers = require('./gameHandler');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/burjaw';
mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:5173', process.env.CLIENT_URL || 'https://burjaw.vercel.app'],
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', process.env.CLIENT_URL || 'https://burjaw.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Apply socket authentication middleware
const { socketAuth } = require('./middleware/authMiddleware');
io.use(socketAuth);

setupGameHandlers(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Burjaw server running on port ${PORT}`);
});
