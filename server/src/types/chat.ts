// server/types/chat.ts
import mongoose from 'mongoose';

export interface IMessage extends mongoose.Document {
  _id: string | mongoose.Types.ObjectId;
  matchId?: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  content: string;
  gifUrl?: string;
  reactions: Map<string, string>;
  timestamp: Date;
}

export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  gender: string;
}

export interface IMatch extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  users: mongoose.Types.ObjectId[];
  messageCount: number;
  status: string;
  compatibilityScore: number;
  expiresAt: Date;
}

export interface IPopulatedMatch extends Omit<IMatch, 'users'> {
  users: IUser[];
}