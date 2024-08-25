// server/types/express.ts
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}