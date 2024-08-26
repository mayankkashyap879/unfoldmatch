// client/types/chat.ts
import { Match } from './match';

export interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

export interface Message {
  _id?: string; // Optional, as it might be assigned by the server
  matchId: string;
  sender: string;
  content: string;
  timestamp: Date;
  messageCount?: number; // Optional, as it might not be needed for every message
  canRequestFriendship?: boolean; // Optional, as it might not be needed for every message
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

export interface ChatInterfaceProps {
  initialMatches: Match[];
}