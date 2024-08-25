// server/services/matchService.ts

import mongoose from 'mongoose';
import { User, IUser } from '../models/User';
import { Match, IMatch } from '../models/Match';
import { MATCH_DURATION, CHAT_MILESTONE, MAX_ACTIVE_MATCHES } from '../config/constants';

function isIUser(user: mongoose.Types.ObjectId | IUser): user is IUser {
  return (user as IUser).username !== undefined;
}

export const getUserMatches = async (userId: string) => {
  const currentUser = await User.findById(userId);
  if (!currentUser) {
    throw new Error('User not found');
  }

  const activeMatches = await Match.find({
    users: currentUser._id,
    $or: [
      { status: 'active', expiresAt: { $gt: new Date() } },
      { status: 'pending_friendship' }
    ]
  }).populate<{ users: (mongoose.Types.ObjectId | IUser)[] }>('users', 'username');

  if (activeMatches.length >= MAX_ACTIVE_MATCHES) {
    return activeMatches;
  }

  const potentialMatches = await User.find({
    _id: { $ne: currentUser._id },
    // Add your matching criteria here
  }).sort({ createdAt: -1 });

  const newMatches = [];

  for (const potentialMatch of potentialMatches) {
    if (activeMatches.length + newMatches.length >= MAX_ACTIVE_MATCHES) break;

    const existingMatch = await Match.findOne({
      users: { $all: [currentUser._id, potentialMatch._id] },
      status: { $in: ['active', 'pending_friendship', 'friends'] }
    });
    
    if (!existingMatch) {
      const newMatch = new Match({
        users: [currentUser._id, potentialMatch._id],
        expiresAt: new Date(Date.now() + MATCH_DURATION)
      });
      await newMatch.save();
      newMatches.push(newMatch);
    }
  }

  return [...activeMatches, ...newMatches].map(match => {
    const otherUser = match.users.find(user => 
      isIUser(user) ? !user._id.equals(currentUser._id) : !user.equals(currentUser._id)
    );
  
    if (!otherUser) {
      console.warn(`No other user found for match ${match._id}`);
    }
  
    return {
      _id: match._id,
      username: otherUser && isIUser(otherUser) ? otherUser.username : 'Unknown',
      expiresAt: match.expiresAt,
      status: match.status
    };
  });
};

export const createFriendshipRequest = async (matchId: string, userId: string) => {
  const match = await Match.findById(matchId);
  if (!match) {
    throw new Error('Match not found');
  }

  if (match.messageCount < CHAT_MILESTONE) {
    throw new Error('Chat milestone not reached');
  }

  if (match.status !== 'active') {
    throw new Error('Invalid match status for friendship request');
  }

  match.status = 'pending_friendship';
  match.friendshipInitiator = new mongoose.Types.ObjectId(userId);
  return match.save();
};

export const handleFriendshipResponse = async (matchId: string, userId: string, accept: boolean) => {
  const match = await Match.findById(matchId);
  if (!match) {
    throw new Error('Match not found');
  }

  if (match.status !== 'pending_friendship') {
    throw new Error('Invalid match status for friendship response');
  }

  if (match.friendshipInitiator.equals(userId)) {
    throw new Error('Cannot respond to your own friendship request');
  }

  if (accept) {
    match.status = 'friends';
    await User.updateMany(
      { _id: { $in: match.users } },
      { $addToSet: { friends: { $each: match.users } } }
    );
  } else {
    match.status = 'active';
  }
  return match.save();
};

export const checkFriendshipStatus = async (matchId: string, userId: string) => {
  const match = await Match.findById(matchId);
  if (!match) {
    throw new Error('Match not found');
  }

  if (match.status === 'friends') {
    return 'friends';
  } else if (match.status === 'pending_friendship') {
    return match.friendshipInitiator.equals(userId) ? 'pending_sent' : 'pending_received';
  }
  return 'none';
};

export const getMatchStatusById = async (matchId: string) => {
  const match = await Match.findById(matchId);
  if (!match) {
    throw new Error('Match not found');
  }
  return match.status;
};