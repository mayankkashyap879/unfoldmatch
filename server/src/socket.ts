// server/src/socket.ts

import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import mongoose from 'mongoose';
import { saveMessage, addReactionToMessage } from './services/messageService';
import { Match } from './models/Match';
import { CHAT_MILESTONE } from './config/constants';
import { CLIENT_URL } from './config';
import { Message } from './models/Message';

export const setupSocketIO = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  const userSockets = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected');

    const userId = socket.handshake.query.userId as string;
    userSockets.set(userId, socket);

    socket.on('join user room', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their personal room`);
    });

    socket.on('join chat', (matchId) => {
      socket.join(matchId);
      console.log(`User ${userId} joined chat room: ${matchId}`);
    });

    socket.on('send message', async (messageData, callback) => {
      try {
        console.log('Received message data:', messageData);

        if (!messageData.content && !messageData.gifUrl) {
          throw new Error('Message must have either content or gifUrl');
        }

        const savedMessage = await saveMessage(messageData);
        console.log('Saved message:', savedMessage);

        // Emit the new message to the appropriate room(s)
        if (messageData.matchId) {
          console.log(`Emitting new message to match room: ${messageData.matchId}`);
          io.to(messageData.matchId).emit('new message', savedMessage);
        } else if (messageData.senderId && messageData.receiverId) {
          console.log(`Emitting new message to users: ${messageData.senderId} and ${messageData.receiverId}`);
          io.to(messageData.senderId).emit('new message', savedMessage);
          io.to(messageData.receiverId).emit('new message', savedMessage);
        }

        // Update match if it's not a friend chat
        if (messageData.matchId) {
          const updatedMatch = await Match.findByIdAndUpdate(
            messageData.matchId,
            { $inc: { messageCount: 1 } },
            { new: true }
          );
          if (updatedMatch) {
            console.log(`Emitting match update for match: ${updatedMatch._id}`);
            io.to(messageData.matchId).emit('match update', {
              matchId: updatedMatch._id,
              messageCount: updatedMatch.messageCount,
              canRequestFriendship: updatedMatch.messageCount >= CHAT_MILESTONE,
              status: updatedMatch.status
            });
          }
        }

        callback({ success: true, message: savedMessage });
      } catch (error) {
        console.error('Error saving/sending message:', error);
        callback({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    socket.on('send reaction', async (data) => {
      try {
        console.log('Received reaction:', data);

        let actualMessageId = data.messageId;
        if (data.messageId.startsWith('temp-')) {
          const actualMessage = await Message.findOne({
            senderId: data.userId,
            createdAt: { $gte: new Date(Date.now() - 60000) } // Look for messages created in the last minute
          }).sort({ createdAt: -1 });

          if (actualMessage) {
            actualMessageId = actualMessage._id;
          } else {
            throw new Error('Could not find the actual message for the temporary ID');
          }
        }

        const updatedMessage = await addReactionToMessage(actualMessageId, data.userId, data.emoji);
        console.log('Updated message with reaction:', updatedMessage);

        // Convert Map to a plain object for emission
        const reactionsObject = Object.fromEntries(updatedMessage.reactions);

        // Emit to both users involved in the chat
        io.to(updatedMessage.senderId.toString()).emit('message reaction', {
          messageId: updatedMessage._id,
          reactions: reactionsObject
        });
        io.to(updatedMessage.receiverId.toString()).emit('message reaction', {
          messageId: updatedMessage._id,
          reactions: reactionsObject
        });

        console.log('Emitted reaction update');
      } catch (error) {
        console.error('Error handling reaction:', error instanceof Error ? error.message : 'Unknown error');
      }
    });

    socket.on('request friendship', async (data, callback) => {
      try {
        const { matchId, userId } = data;
        console.log(`Friendship request received from ${userId} for match ${matchId}`);

        const match = await Match.findById(matchId);
        if (!match) {
          throw new Error('Match not found');
        }
        if (match.messageCount < CHAT_MILESTONE) {
          throw new Error('Not enough messages to request friendship');
        }
        match.status = 'pending_friendship';
        match.friendshipInitiator = new mongoose.Types.ObjectId(userId);
        await match.save();

        console.log(`Emitting friendship requested event for match ${matchId}`);
        const receiverId = match.users.find(id => id.toString() !== userId)?.toString();
        if (receiverId) {
          io.to(matchId).emit('friendship requested', { matchId, requesterId: userId, receiverId });
        } else {
          throw new Error('Receiver not found in match users');
        }

        callback({ success: true });
      } catch (error) {
        console.error('Error requesting friendship:', error instanceof Error ? error.message : 'Unknown error');
        callback({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    socket.on('friendship response', async (data, callback) => {
      try {
        const { matchId, userId, accept } = data;
        console.log(`Friendship response received from ${userId} for match ${matchId}: ${accept ? 'Accepted' : 'Declined'}`);

        const match = await Match.findById(matchId);
        if (!match) {
          throw new Error('Match not found');
        }

        if (accept) {
          match.status = 'friends';
        } else {
          match.status = 'active';
          match.friendshipInitiator = null;
        }
        await match.save();

        console.log(`Emitting friendship status updated event for match ${matchId}`);
        io.to(matchId).emit('friendship status updated', { matchId, status: match.status });

        callback({ success: true });
      } catch (error) {
        console.error('Error responding to friendship:', error instanceof Error ? error.message : 'Unknown error');
        callback({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${userId}`);
      userSockets.delete(userId);
    });
  });

  return io;
};