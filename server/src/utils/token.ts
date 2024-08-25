// server/utils/token.ts
import { Request } from 'express';

export function extractToken(req: Request): string | undefined {
  return req.headers.authorization?.replace('Bearer ', '') || req.header('x-auth-token');
}