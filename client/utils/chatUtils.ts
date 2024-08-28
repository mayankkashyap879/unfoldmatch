// client/utils/chatUtils.ts
import { FriendshipStatus } from '@/types/chat';
import { Match } from '@/types/match';
import { Message } from '@/types/chat';

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

export const getMessageReactions = (message: Message, reactions: { [messageId: string]: { user: string, emoji: string }[] }) => {
  return reactions[message._id!] || [];
};

export const formatReactions = (reactions: { user: string, emoji: string }[]) => {
  const emojiCounts: { [emoji: string]: number } = {};
  reactions.forEach(reaction => {
    emojiCounts[reaction.emoji] = (emojiCounts[reaction.emoji] || 0) + 1;
  });
  return Object.entries(emojiCounts).map(([emoji, count]) => `${emoji} ${count}`).join(' ');
};

export const isGifMessage = (message: Message) => {
  return !!message.gifUrl;
};

interface GifResult {
  id: string;
  url: string;
  attribution: string;
}

export const searchGifs = async (query: string): Promise<GifResult[]> => {
  const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
  if (!GIPHY_API_KEY) {
    console.error('GIPHY API key is not set');
    return [];
  }

  try {
    const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=10`);
    if (!response.ok) {
      throw new Error('Failed to fetch GIFs');
    }
    const data = await response.json();
    return data.data.map((gif: any) => ({
      id: gif.id,
      url: gif.images.fixed_height.url,
      attribution: gif.bitly_url
    }));
  } catch (error) {
    console.error('Error searching GIFs:', error);
    return [];
  }
};