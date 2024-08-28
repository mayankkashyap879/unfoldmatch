// client/types/match.ts
export interface Match {
  _id: string;
  username: string;
  compatibilityScore: number;
  expiresAt: string;
  status: 'active' | 'pending_friendship' | 'friends';
  gender: 'male' | 'female' | 'non-binary' | 'other';
}

export interface MatchListProps {
  matches: Match[];
  selectedMatch: Match | null;
  onSelectMatch: (match: Match) => void;
  showPotentialMatches: boolean;
  onTogglePotentialMatches: () => void;
}

export interface MatchCardProps {
  match: Match;
  isSelected: boolean;
  onClick: () => void;
}