declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      // Add any other properties that your user object might have
    };
  }
}