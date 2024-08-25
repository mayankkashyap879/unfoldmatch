// server/models/Match.ts

import mongoose, { Schema } from 'mongoose';
import { TimestampedDocument } from '../types/modelTypes';
import { MatchStatus, MATCH_STATUSES } from '../constants/modelEnums';

export interface IMatch extends TimestampedDocument {
  _id: mongoose.Types.ObjectId;
  users: mongoose.Types.ObjectId[];
  status: MatchStatus;
  messageCount: number;
  friendshipInitiator: mongoose.Types.ObjectId;
  expiresAt: Date;
}

const MatchSchema: Schema = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  status: {
    type: String,
    enum: MATCH_STATUSES,
    default: 'active'
  },
  messageCount: { type: Number, default: 0 },
  friendshipInitiator: { type: Schema.Types.ObjectId, ref: 'User' },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

export const Match = mongoose.model<IMatch>('Match', MatchSchema);