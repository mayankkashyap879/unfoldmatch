// server/src/utils/matchUtils.ts

import { IUser } from '../models/User';

export const calculateCompatibilityScore = (user1: IUser, user2: IUser): number => {
  let score = 0;

  // Compare interests
  const commonInterests = user1.interests.filter(interest => user2.interests.includes(interest));
  score += commonInterests.length * 10;

  // Compare purpose
  if (user1.purpose === user2.purpose) {
    score += 20;
  }

  // Compare personality type (if available)
  if (user1.personalityType && user2.personalityType && user1.personalityType === user2.personalityType) {
    score += 15;
  }

  // You can add more factors to calculate compatibility

  // Normalize the score to be between 0 and 100
  return Math.min(Math.max(score, 0), 100);
};