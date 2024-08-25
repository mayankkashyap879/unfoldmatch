// server/config.ts

import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5001;
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/unfoldmatch";
export const CHAT_MILESTONE = 10;