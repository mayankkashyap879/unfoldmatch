// client/hooks/useMatchSelection.ts
import { useState } from 'react';
import { Match } from '@/types/match';

export const useMatchSelection = (initialMatches: Match[]) => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const handleSelectMatch = (match: Match) => {
    setSelectedMatch(match);
  };

  return { selectedMatch, handleSelectMatch };
};