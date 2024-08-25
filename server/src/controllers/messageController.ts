// server/controllers/messageController.ts

import { Request, Response } from 'express';
import { getMessagesByMatchId } from '../services/messageService';

export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await getMessagesByMatchId(req.params.matchId);
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};