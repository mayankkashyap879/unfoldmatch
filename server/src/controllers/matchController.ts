// server/controllers/matchController.ts

import { Request, Response } from 'express';
import { 
  getUserMatches, 
  createFriendshipRequest, 
  handleFriendshipResponse,
  checkFriendshipStatus,
  getMatchStatusById
} from '../services/matchService';

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const getMatches = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const matches = await getUserMatches(req.user.userId);
    res.json({ matches });
  } catch (error) {
    console.error('Error fetching/creating matches:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const requestFriendship = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const match = await createFriendshipRequest(req.params.matchId, req.user.userId);
    res.json({ message: 'Friendship requested', match });
  } catch (error) {
    console.error('Error requesting friendship:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const respondToFriendship = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { accept } = req.body;
    const match = await handleFriendshipResponse(req.params.matchId, req.user.userId, accept);
    res.json({ message: accept ? 'Friendship accepted' : 'Friendship rejected', match });
  } catch (error) {
    console.error('Error responding to friendship:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getFriendshipStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const status = await checkFriendshipStatus(req.params.matchId, req.user.userId);
    res.json({ status });
  } catch (error) {
    console.error('Error checking friendship status:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getMatchStatus = async (req: AuthRequest, res: Response) => {
  try {
    const status = await getMatchStatusById(req.params.matchId);
    res.json({ status });
  } catch (error) {
    console.error('Error fetching match status:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};