import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import { IMessage } from '../types/chat';
import { Match } from '../models/Match';
import { User } from '../models/User';
import { saveMessage, updateMatchMessageCount, findMatchWithUsers, updateMatchStatus } from '../db/chatOperations';
import { canRequestFriendship, getOtherUserId } from '../utils/chatUtils';
import { CHAT_MILESTONE } from '../config/constants';

export const handleSendMessage = async (io: SocketIOServer, messageData: Partial<IMessage>) => {
  try {
    const newMessage = await saveMessage(messageData);
    const match = await updateMatchMessageCount(messageData.matchId!);

    if (match) {
      const canRequest = canRequestFriendship(match);

      io.to(messageData.matchId!.toString()).emit('new message', {
        ...newMessage.toObject(),
        messageCount: match.messageCount,
        canRequestFriendship: canRequest
      });

      io.to(messageData.matchId!.toString()).emit('match update', {
        matchId: match._id,
        messageCount: match.messageCount,
        canRequestFriendship: canRequest,
        status: match.status
      });
    }
  } catch (error) {
    console.error('Error saving/sending message:', error);
  }
};

export const createFriendshipRequest = async (io: SocketIOServer, matchId: string, userId: string) => {
  try {
    const match = await Match.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    if (match.messageCount < CHAT_MILESTONE) {
      throw new Error('Chat milestone not reached');
    }

    if (match.status !== 'active') {
      throw new Error('Invalid match status for friendship request');
    }

    match.status = 'pending_friendship';
    match.friendshipInitiator = new mongoose.Types.ObjectId(userId);
    await match.save();

    io.to(matchId).emit('friendship requested', {
      matchId: match._id,
      requesterId: userId,
      receiverId: getOtherUserId(match, userId)
    });
  } catch (error) {
    console.error('Error creating friendship request:', error);
  }
};

export const handleFriendshipResponse = async (io: SocketIOServer, matchId: string, userId: string, accept: boolean) => {
  try {
    const match = await Match.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    if (match.status !== 'pending_friendship') {
      throw new Error('Invalid match status for friendship response');
    }

    if (match.friendshipInitiator.equals(userId)) {
      throw new Error('Cannot respond to your own friendship request');
    }

    if (accept) {
      match.status = 'friends';
      await User.updateMany(
        { _id: { $in: match.users } },
        { $addToSet: { friends: { $each: match.users } } }
      );
    } else {
      match.status = 'active';
      match.messageCount = 0; // Reset message count
    }
    await match.save();

    io.to(matchId).emit('friendship status updated', {
      matchId: match._id,
      status: match.status
    });
  } catch (error) {
    console.error('Error handling friendship response:', error);
  }
};