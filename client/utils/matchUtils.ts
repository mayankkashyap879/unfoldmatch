// utils/matchUtils.ts
import { Match } from '@/types/match';

export const filterNonFriendMatches = (matches: Match[]): Match[] => {
  return matches.filter(match => match.status !== 'friends');
};

export const formatCompatibilityScore = (score: number): string => {
    return `${score}%`;
  };