// server/db/chatOperations.ts

import mongoose from 'mongoose';
import { IMessage, IMatch, IUser, IPopulatedMatch } from '../types/chat';

export const saveMessage = async (messageData: Partial<IMessage>): Promise<IMessage> => {
  const Message = mongoose.model<IMessage>('Message');
  const newMessage = new Message(messageData);
  return newMessage.save();
};

export const updateMatchMessageCount = async (matchId: mongoose.Types.ObjectId): Promise<IMatch | null> => {
  const Match = mongoose.model<IMatch>('Match');
  return Match.findByIdAndUpdate(matchId, { $inc: { messageCount: 1 } }, { new: true });
};

export const findMatchWithUsers = async (matchId: string): Promise<IPopulatedMatch | null> => {
  const Match = mongoose.model<IMatch>('Match');
  const populatedMatch = await Match.findById(matchId).populate<{ users: IUser[] }>('users', 'username');
  
  if (!populatedMatch) return null;
  
  // Convert to IPopulatedMatch
  const { _id, users, messageCount, status } = populatedMatch;
  return { _id, users, messageCount, status } as IPopulatedMatch;
};

export const updateMatchStatus = async (matchId: string, status: string): Promise<IMatch | null> => {
  const Match = mongoose.model<IMatch>('Match');
  return Match.findByIdAndUpdate(matchId, { status }, { new: true });
};