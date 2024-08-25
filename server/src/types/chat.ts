// server/types/chat.ts

import mongoose from 'mongoose';

export interface IMessage extends mongoose.Document {
  matchId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
}

export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  username: string;
}

export interface IMatch extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  users: mongoose.Types.ObjectId[];
  messageCount: number;
  status: string;
}

export interface IPopulatedMatch extends Omit<IMatch, 'users'> {
  users: IUser[];
}