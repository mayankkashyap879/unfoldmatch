// server/types/modelTypes.ts
import { Document } from 'mongoose';

export interface TimestampedDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}