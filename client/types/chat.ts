// client/types/chat.ts
import { Match } from './match';

export interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

export interface Reaction {
  user: string;
  emoji: string;
}

export interface Message {
  _id: string;
  matchId?: string;
  senderId: string;
  receiverId: string;
  content: string;
  gifUrl?: string;
  reactions: { [userId: string]: string };
  timestamp: Date;
}

export interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  reactions: { [userId: string]: string };
  onReact: (emoji: string) => void;
  currentUserId: string;
}

export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends' | 'active';

export interface SelectedMatch extends Omit<Match, 'status'> {
  status: FriendshipStatus;
}

export interface ChatWindowProps {
  selectedMatch: SelectedMatch | null;
  messages: Message[];
  timeLeft: string;
  messageCount: number;
  canRequestFriendship: boolean;
  friendshipStatus: FriendshipStatus;
  onRequestFriendship: (matchId: string) => void;
  onRespondToFriendship: (matchId: string, accept: boolean) => void;
  currentUserId: string;
  isLoadingMessages: boolean;
  onSendMessage: (content: string) => void;
}

export interface Reaction {
  user: string;
  emoji: string;
}

export interface FriendsChatWindowProps {
  friend: {
    _id: string;
    username: string;
  };
  messages: Message[];
  reactions: { [messageId: string]: { [userId: string]: string } };
  onSendMessage: (content: string) => void;
  onSendReaction: (messageId: string, emoji: string) => void;
  onSendGif: (gifUrl: string) => void;
  currentUserId: string;
  isLoadingMessages: boolean;
  fetchMessages: (friendId: string) => void;
}

export interface ChatInterfaceProps {
  initialMatches: Match[];
}

export interface UseChatReturn {
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  selectedMatch: SelectedMatch | null;
  messages: Message[];
  timeLeft: string;
  messageCount: number;
  canRequestFriendship: boolean;
  showPotentialMatches: boolean;
  isLoadingMessages: boolean;
  friendshipStatus: FriendshipStatus;
  reactions: { [messageId: string]: Reaction[] };
  handleSelectMatch: (match: Match) => void;
  sendMessage: (content: string) => void;
  sendReaction: (messageId: string, emoji: string) => void;
  sendGif: (gifUrl: string) => void;
  requestFriendship: (matchId: string) => void;
  respondToFriendship: (matchId: string, accept: boolean) => Promise<void>;
  togglePotentialMatches: () => void;
}