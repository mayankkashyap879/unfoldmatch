// server/services/friendsService.ts

import { User, IUser } from '../models/User';
import { Match, IMatch } from '../models/Match';
import { FriendInfo, PendingFriendship } from '../types/friends';
import mongoose from 'mongoose';

export const getUserFriends = async (userId: string): Promise<FriendInfo[]> => {
  const user = await User.findById(userId).populate<{ friends: IUser[] }>('friends', 'username');
  
  if (!user) {
    throw new Error('User not found');
  }

  return user.friends.map(friend => ({
    _id: friend._id.toString(),
    username: friend.username
  }));
};

export const getPendingFriendshipRequests = async (userId: string): Promise<PendingFriendship[]> => {
  const pendingMatches = await Match.find({
    users: userId,
    status: 'pending_friendship',
    friendshipInitiator: { $ne: userId }
  }).populate<{ users: IUser[] }>('users', 'username');

  return pendingMatches.map(match => {
    const otherUser = match.users.find(user => user._id.toString() !== userId);
    
    if (!otherUser) {
      throw new Error('Matching user not found');
    }

    return {
      _id: match._id.toString(),
      username: otherUser.username,
      matchId: match._id.toString()
    };
  });
};