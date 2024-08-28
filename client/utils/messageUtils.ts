// client/utils/messageUtils.ts
import { Message } from '@/types/chat';

export const isGifMessage = (message: Message): boolean => {
  return !!message.gifUrl;
};

export const getMessageReactions = (message: Message, reactions: { [messageId: string]: { user: string, emoji: string }[] }) => {
  return reactions[message._id] || [];
};

export const formatReactions = (reactions: { user: string, emoji: string }[]) => {
  const emojiCounts: { [emoji: string]: number } = {};
  reactions.forEach(reaction => {
    emojiCounts[reaction.emoji] = (emojiCounts[reaction.emoji] || 0) + 1;
  });
  
  return Object.entries(emojiCounts)
    .sort((a, b) => b[1] - a[1]) // Sort by count, descending
    .map(([emoji, count]) => ({emoji, count}));
};

export const getCommonReactions = (): string[] => {
  return ['👍', '❤️', '😂', '😮', '😢', '🙏'];
};

export const getUserReaction = (reactions: { user: string, emoji: string }[], userId: string): string | null => {
  const userReaction = reactions.find(reaction => reaction.user === userId);
  return userReaction ? userReaction.emoji : null;
};