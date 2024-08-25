// server/models/Message.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  matchId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
}

const MessageSchema: Schema = new Schema({
  matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export const Message = mongoose.model<IMessage>('Message', MessageSchema);