// server/services/messageService.ts

import mongoose from 'mongoose';
import { Message } from '../models/Message';
import { Match } from '../models/Match';
import { IMessage } from '../types/chat';

export const saveMessage = async (messageData: Partial<IMessage>): Promise<IMessage> => {
  try {
    const messageId = messageData._id || new mongoose.Types.ObjectId().toString();
    
    if (!messageData.content && !messageData.gifUrl) {
      throw new Error('Message must have either content or gifUrl');
    }

    const newMessage = new Message({
      ...messageData,
      _id: messageId
    });
    await newMessage.save();

    // If matchId is provided, update the match's message count
    if (messageData.matchId) {
      const updatedMatch = await Match.findByIdAndUpdate(
        messageData.matchId,
        { $inc: { messageCount: 1 } },
        { new: true }
      );

      if (!updatedMatch) {
        console.log(`Match not found for ID: ${messageData.matchId}. This might be a friend chat.`);
      }
    }

    return newMessage;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

export const getMessagesBetweenUsers = async (user1Id: string, user2Id: string): Promise<IMessage[]> => {
  return Message.find({
    $or: [
      { senderId: user1Id, receiverId: user2Id },
      { senderId: user2Id, receiverId: user1Id }
    ]
  }).sort({ timestamp: 1 });
};

export const addReactionToMessage = async (messageId: string, userId: string, emoji: string): Promise<IMessage> => {
  console.log('Adding reaction:', { messageId, userId, emoji });
  const message = await Message.findById(messageId);
  if (!message) {
    throw new Error('Message not found');
  }

  console.log('Current reactions:', message.reactions);

  if (emoji) {
    if (!message.reactions) {
      message.reactions = new Map();
    }
    message.reactions.set(userId, emoji);
  } else {
    if (message.reactions) {
      message.reactions.delete(userId);
    }
  }

  const updatedMessage = await message.save();
  console.log('Updated reactions:', updatedMessage.reactions);
  return updatedMessage;
};

export const getMessagesByMatchId = async (matchId: string): Promise<IMessage[]> => {
  return Message.find({ matchId }).sort({ timestamp: 1 });
};