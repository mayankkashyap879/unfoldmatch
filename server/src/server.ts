// server/src/server.ts

import express from 'express';
import cors from 'cors';
import http from 'http';
import { setupSocketIO } from './socket';
import { connectDB } from './db';
import { PORT, CLIENT_URL } from './config';
import dotenv from 'dotenv';
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import matchesRoutes from './routes/matches';
import messagesRoutes from './routes/messages';
import friendsRoutes from './routes/friends';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/friends', friendsRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('UnfoldMatch API is running');
});

// Setup Socket.IO
setupSocketIO(server);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export { app, server };