// server/models/Message.ts

import mongoose, { Schema } from 'mongoose';
import { IMessage } from '../types/chat';

const MessageSchema: Schema = new Schema({
  _id: { type: String, required: true },
  matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: false },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  gifUrl: { type: String },
  reactions: {
    type: Map,
    of: String,
    default: new Map()
  },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);