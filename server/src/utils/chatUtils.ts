// server/utils/chatUtils.ts

import { CHAT_MILESTONE } from '../config';
import { IMatch, IPopulatedMatch, IUser } from '../types/chat';

export const canRequestFriendship = (match: IMatch | IPopulatedMatch): boolean => {
  return match.messageCount >= CHAT_MILESTONE;
};

export const getOtherUserId = (match: IMatch | IPopulatedMatch, currentUserId: string): string | undefined => {
  if ('users' in match && Array.isArray(match.users) && match.users.length > 0 && 'username' in match.users[0]) {
    // This is an IPopulatedMatch
    return (match as IPopulatedMatch).users.find(user => user._id.toString() !== currentUserId)?._id.toString();
  } else {
    // This is an IMatch
    return (match as IMatch).users.find(userId => userId.toString() !== currentUserId)?.toString();
  }
};