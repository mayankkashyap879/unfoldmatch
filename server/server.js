// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const matchesRouter = require('./routes/matches');
require('dotenv').config();

const app = express();

const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/unfoldmatch")
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/matches', matchesRouter);
// app.use('/api/users', require('./routes/users'));
// app.use('/api/chats', require('./routes/chats'));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('UnfoldMatch API is running');
});

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;