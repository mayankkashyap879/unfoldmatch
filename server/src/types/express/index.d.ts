// server/types/express/index.d.ts

import { Express } from 'express-serve-static-core';

// Define AuthUser interface
interface AuthUser {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}