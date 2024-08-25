// utils/chatUtils.ts
import { FriendshipStatus } from '@/types/chat';
import { Match } from '@/types/match';

export const getFriendshipActionContent = (status: FriendshipStatus, canRequestFriendship: boolean) => {
  switch (status) {
    case 'none':
      return canRequestFriendship ? { type: 'request' } : null;
    case 'pending_received':
      return { type: 'respond' };
    case 'pending_sent':
      return { type: 'waiting' };
    case 'friends':
      return { type: 'friends' };
    default:
      return null;
  }
};

export const filterNonFriendMatches = (matches: Match[]): Match[] => {
  return matches.filter(match => match.status !== 'friends');
};

export const getFriendshipStatus = (matchStatus: Match['status']): FriendshipStatus => {
  switch (matchStatus) {
    case 'friends':
      return 'friends';
    case 'pending_friendship':
      return 'pending_sent';
    default:
      return 'none';
  }
};