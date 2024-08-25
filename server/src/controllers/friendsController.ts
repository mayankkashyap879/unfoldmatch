// server/controllers/friendsController.ts

import { Request, Response } from 'express';
import { getUserFriends, getPendingFriendshipRequests } from '../services/friendsService';

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const getFriends = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const friends = await getUserFriends(req.user.userId);
    res.json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getPendingFriendships = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const pendingFriendships = await getPendingFriendshipRequests(req.user.userId);
    res.json({ pendingFriendships });
  } catch (error) {
    console.error('Error fetching pending friendships:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};