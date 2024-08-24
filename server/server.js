// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const matchesRouter = require('./routes/matches');
const diagnosticRoutes = require('./routes/diagnostic');
const friendsRouter = require('./routes/friends');
// const notificationsRouter = require('./routes/notifications');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ["GET", "POST"],
    credentials: true
  }
});

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
app.use('/api/diagnostic', diagnosticRoutes);
app.use('/api/messages', require('./routes/messages'));
app.use('/api/friends', friendsRouter);
// app.use('/api/notifications', notificationsRouter);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('UnfoldMatch API is running');
});

const CHAT_MILESTONE = 10;

// Socket.io
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('join chat', (matchId) => {
    socket.join(matchId);
    console.log(`Client joined chat: ${matchId}`);
  });

  socket.on('send message', async (messageData) => {
    try {
      const Message = mongoose.model('Message');
      const Match = mongoose.model('Match');
  
      const newMessage = new Message(messageData);
      await newMessage.save();
  
      const match = await Match.findById(messageData.matchId);
      if (match) {
        match.messageCount += 1;
        await match.save();
  
        const canRequestFriendship = match.messageCount >= CHAT_MILESTONE;
  
        // Emit updated match status
        io.to(messageData.matchId).emit('match update', {
          matchId: match._id,
          messageCount: match.messageCount,
          canRequestFriendship: canRequestFriendship
        });
  
        console.log(`Match ${match._id} message count: ${match.messageCount}`);
  
        // Send new message with updated message count
        io.to(messageData.matchId).emit('new message', {
          ...newMessage.toObject(),
          messageCount: match.messageCount,
          canRequestFriendship: canRequestFriendship
        });
      }
    } catch (error) {
      console.error('Error saving/sending message:', error);
    }
  });

  socket.on('request friendship', async ({ matchId, requesterId }) => {
    try {
      const match = await mongoose.model('Match').findById(matchId).populate('users', 'username');
      if (match) {
        const receiverId = match.users.find(user => user._id.toString() !== requesterId)._id;
        io.to(matchId).emit('friendship requested', {
          matchId: match._id,
          requesterId,
          receiverId
        });
      }
    } catch (error) {
      console.error('Error handling friendship request:', error);
    }
  });

  socket.on('friendship response', async ({ matchId, accepted }) => {
    try {
      const match = await mongoose.model('Match').findById(matchId);
      if (match) {
        match.status = accepted ? 'friends' : 'rejected';
        await match.save();
        io.to(matchId).emit('friendship status updated', {
          matchId: match._id,
          status: match.status
        });
      }
    } catch (error) {
      console.error('Error handling friendship response:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, server, io };