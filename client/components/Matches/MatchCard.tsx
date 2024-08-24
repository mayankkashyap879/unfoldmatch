import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface MatchCardProps {
  match: {
    _id: string;
    username: string;
    compatibilityScore: number;
  };
  isSelected: boolean;
  onClick: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, isSelected, onClick }) => {
  return (
    <Card 
      className={`cursor-pointer transition-all ${isSelected ? 'border-primary' : ''}`}
      onClick={onClick}
    >
      <CardContent className="px-2">
        <p className="font-semibold">{match.username}</p>
        <p className="text-sm text-muted-foreground">Compatibility: {match.compatibilityScore}%</p>
      </CardContent>
    </Card>
  );
};

export default MatchCard;