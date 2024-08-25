// server/config/constants.ts

export const JWT_SECRET = process.env.JWT_SECRET || "JWT_temp_secret";
export const JWT_EXPIRATION = '1d';
export const MATCH_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
export const CHAT_MILESTONE = 10; // Number of messages to become friends
export const MAX_ACTIVE_MATCHES = 5; // Maximum number of active matches per user