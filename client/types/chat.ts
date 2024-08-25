// types/chat.ts
import { Match } from './match';

export interface MessageInputProps {
    onSendMessage: (message: string) => void;
  }

  // types/chat.ts
export interface Message {
  sender: string;
  content: string;
  timestamp: Date;
}

export interface SelectedMatch {
  _id: string;
  username: string;
  status: string;
}

export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends';

export interface ChatWindowProps {
  selectedMatch: SelectedMatch | null;
  messages: Message[];
  timeLeft: string;
  messageCount: number;
  canRequestFriendship: boolean;
  friendshipStatus: FriendshipStatus;
  onRequestFriendship: () => void;
  onRespondToFriendship: (accept: boolean) => void;
  currentUserId: string;
  isLoadingMessages: boolean;
}

export interface Message {
  sender: string;
  content: string;
  timestamp: Date;
  messageCount: number;
  canRequestFriendship: boolean;
}

export interface ChatInterfaceProps {
  initialMatches: Match[];
}