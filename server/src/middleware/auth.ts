// server/middleware/auth.ts

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { extractToken } from '../utils/token';
import { AUTH_MESSAGES } from '../config/messages';
import { verifyAndDecodeToken } from '../services/authService';

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: AUTH_MESSAGES.NO_TOKEN });
  }

  try {
    const decoded = verifyAndDecodeToken(token);
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ message: AUTH_MESSAGES.INVALID_TOKEN });
  }
};

export default authMiddleware;