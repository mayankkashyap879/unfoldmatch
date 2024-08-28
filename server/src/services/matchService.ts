// server/src/services/matchService.ts

import { User, IUser } from '../models/User';
import { Match, IMatch } from '../models/Match';
import mongoose from 'mongoose';
import { calculateCompatibilityScore } from '../utils/matchUtils';
import { CHAT_MILESTONE } from '../config/constants';

interface PopulatedMatch extends Omit<IMatch, 'users'> {
  users: (IUser | mongoose.Types.ObjectId)[];
}

interface MatchData {
  _id: mongoose.Types.ObjectId;
  username: string;
  gender: string;
  compatibilityScore: number;
  expiresAt: Date;
  status: string;
}

export const getUserMatches = async (userId: string): Promise<MatchData[]> => {
  const currentUser = await User.findById(userId);
  if (!currentUser) {
    throw new Error('User not found');
  }

  const matches = await Match.find({
    users: currentUser._id,
    $or: [
      { status: 'active', expiresAt: { $gt: new Date() } },
      { status: 'pending_friendship' },
      { status: 'friends' }
    ]
  }).populate<PopulatedMatch>('users', 'username gender');

  const existingMatchIds = matches.map(match => match.users.map(user => user._id.toString())).flat();

  const potentialMatches = await User.find({
    _id: { $ne: currentUser._id, $nin: existingMatchIds },
    age: { $gte: currentUser.preferences.ageRange.min, $lte: currentUser.preferences.ageRange.max },
    gender: { $in: currentUser.preferences.genderPreference },
    'preferences.genderPreference': currentUser.gender,
    'preferences.ageRange.min': { $lte: currentUser.age },
    'preferences.ageRange.max': { $gte: currentUser.age }
  }).limit(5);

  const newMatches = await Promise.all(potentialMatches.map(async (potentialMatch) => {
    const compatibilityScore = calculateCompatibilityScore(currentUser, potentialMatch);
    const newMatch = new Match({
      users: [currentUser._id, potentialMatch._id],
      compatibilityScore,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    });
    await newMatch.save();
    return newMatch;
  }));

  const validMatches = [...matches, ...newMatches].reduce<MatchData[]>((acc, match) => {
    try {
      const otherUser = match.users.find(user => !user._id.equals(currentUser._id));

      if (!otherUser) {
        console.warn(`No other user found for match ${match._id}`);
        return acc;
      }

      if (!('username' in otherUser) || !('gender' in otherUser)) {
        console.warn(`Invalid user data in match ${match._id}`, otherUser);
        return acc;
      }

      acc.push({
        _id: match._id,
        username: otherUser.username,
        gender: otherUser.gender,
        compatibilityScore: match.compatibilityScore,
        expiresAt: match.expiresAt,
        status: match.status
      });
    } catch (error) {
      console.error(`Error processing match ${match._id}:`, error);
    }
    return acc;
  }, []);

  return validMatches;
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

