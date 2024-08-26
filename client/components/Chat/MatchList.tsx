// client/components/chat/MatchList.tsx
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { MatchListProps, Match } from '@/types/match';
import { filterNonFriendMatches } from '@/utils/matchUtils';

const MatchList: React.FC<MatchListProps> = ({
  matches,
  selectedMatch,
  onSelectMatch,
  showPotentialMatches,
  onTogglePotentialMatches
}: MatchListProps) => {
  const filteredMatches = filterNonFriendMatches(matches);

  return (
    <div className={`sm:w-1/3 md:w-1/4 border-r border-border 
                    ${showPotentialMatches ? 'h-1/2 sm:h-full' : 'h-0 sm:h-full'} 
                    transition-all duration-300 ease-in-out overflow-hidden`}>
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Your Potential Matches</h3>
          <Button variant="ghost" size="sm" onClick={onTogglePotentialMatches} className="sm:hidden">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-grow">
          {filteredMatches.map(match => (
            <MatchListItem 
              key={match._id}
              match={match}
              isSelected={selectedMatch?._id === match._id}
              onSelect={onSelectMatch}
            />
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};

interface MatchListItemProps {
  match: Match;
  isSelected: boolean;
  onSelect: (match: Match) => void;
}

const MatchListItem: React.FC<MatchListItemProps> = ({ match, isSelected, onSelect }: MatchListItemProps) => (
  <div 
    className={`mb-2 p-2 cursor-pointer rounded ${
      isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
    } ${
      match.status === 'pending_friendship' ? 'bg-yellow-100' : ''
    }`}
    onClick={() => onSelect(match)}
  >
    <h4 className="font-medium">{match.username}</h4>
    <p className="text-sm">Compatibility: {match.compatibilityScore}%</p>
    {match.status === 'pending_friendship' && <p className="text-sm font-semibold">Friendship Pending</p>}
  </div>
);

export default MatchList;