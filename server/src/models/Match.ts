// server/src/models/Match.ts

import mongoose, { Schema } from 'mongoose';
import { TimestampedDocument } from '../types/modelTypes';
import { MatchStatus, MATCH_STATUSES } from '../constants/modelEnums';

export interface IMatch extends TimestampedDocument {
  _id: mongoose.Types.ObjectId;
  users: mongoose.Types.ObjectId[];
  status: MatchStatus;
  messageCount: number;
  friendshipInitiator?: mongoose.Types.ObjectId | null;
  expiresAt: Date;
  compatibilityScore: number;
}

const MatchSchema: Schema = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  status: {
    type: String,
    enum: MATCH_STATUSES,
    default: 'active'
  },
  messageCount: { type: Number, default: 0 },
  friendshipInitiator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  expiresAt: { type: Date, required: true },
  compatibilityScore: { type: Number, required: false, min: 0, max: 100 },
}, { timestamps: true });

export const Match = mongoose.model<IMatch>('Match', MatchSchema);