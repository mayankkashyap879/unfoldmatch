// server/src/types/customTypes.ts

import { Request } from 'express';

export interface AuthUser {
  userId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}