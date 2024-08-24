import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Match {
    _id: string;
    username: string;
    compatibilityScore: number;
    expiresAt: string;
    status: 'active' | 'pending_friendship' | 'friends';
  }

  interface MatchListProps {
    matches: Match[];
    selectedMatch: Match | null;
    onSelectMatch: (match: Match) => void;
    showPotentialMatches: boolean;
    onTogglePotentialMatches: () => void;
  }

  const MatchList: React.FC<MatchListProps> = ({
    matches,
    selectedMatch,
    onSelectMatch,
    showPotentialMatches,
    onTogglePotentialMatches
  }) => {
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
            {matches.filter(match => match.status !== 'friends').map(match => (
              <div 
                key={match._id} 
                className={`mb-2 p-2 cursor-pointer rounded ${
                  selectedMatch?._id === match._id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                } ${
                  match.status === 'pending_friendship' ? 'bg-yellow-100' : ''
                }`}
                onClick={() => onSelectMatch(match)}
              >
                <h4 className="font-medium">{match.username}</h4>
                <p className="text-sm">Compatibility: {match.compatibilityScore}%</p>
                {match.status === 'pending_friendship' && <p className="text-sm font-semibold">Friendship Pending</p>}
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
    );
  };

export default MatchList;