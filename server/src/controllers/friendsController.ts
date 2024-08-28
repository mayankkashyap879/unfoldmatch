// server/controllers/friendController.ts

import { Request, Response } from 'express';
import { User, IUser } from '../models/User';
import { Match, IMatch } from '../models/Match';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

interface PopulatedUser extends Omit<IUser, 'friends'> {
  friends: { _id: mongoose.Types.ObjectId; username: string }[];
}

interface PopulatedMatch extends Omit<IMatch, 'users'> {
  users: { _id: mongoose.Types.ObjectId; username: string }[];
}

export const getFriends = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user.userId).populate<PopulatedUser>('friends', 'username');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ friends: user.friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getPendingFriendships = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const pendingMatches = await Match.find({
      users: req.user.userId,
      status: 'pending_friendship',
      friendshipInitiator: { $ne: new mongoose.Types.ObjectId(req.user.userId) }
    }).populate<PopulatedMatch>('users', 'username');

    const pendingFriendships = pendingMatches.map(match => {
      const otherUser = match.users.find(user => user._id.toString() !== req.user?.userId);
      return {
        _id: match._id,
        username: otherUser?.username,
        matchId: match._id
      };
    });

    res.json({ pendingFriendships });
  } catch (error) {
    console.error('Error fetching pending friendships:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const checkFriendshipStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { matchId } = req.params;
    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const isFriend = match.status === 'friends';

    res.json({ isFriend });
  } catch (error) {
    console.error('Error checking friendship status:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};