import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { CLIENT_URL } from './config';
import { handleSendMessage, createFriendshipRequest, handleFriendshipResponse } from './services/chatService';

export const setupSocketIO = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('join chat', (matchId) => {
      socket.join(matchId);
      console.log(`Client joined chat: ${matchId}`);
    });

    socket.on('send message', (messageData) => handleSendMessage(io, messageData));

    socket.on('request friendship', (data) => createFriendshipRequest(io, data.matchId, data.userId));

    socket.on('friendship response', (data) => handleFriendshipResponse(io, data.matchId, data.userId, data.accept));

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};