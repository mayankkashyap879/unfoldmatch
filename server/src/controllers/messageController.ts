// server/controllers/messageController.ts

import { Request, Response } from 'express';
import { Message } from '../models/Message';

export const getMessagesByMatchId = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.params;
    const messages = await Message.find({ matchId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages by match ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMessagesBetweenUsers = async (req: Request, res: Response) => {
  try {
    const { friendId, userId } = req.params;
    
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages between users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};