// components/MatchCard.tsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MatchCardProps } from '@/types/match';
import { formatCompatibilityScore } from '@/utils/matchUtils';

const MatchCard: React.FC<MatchCardProps> = ({ match, isSelected, onClick } : MatchCardProps) => {
  return (
    <Card 
      className={`cursor-pointer transition-all ${isSelected ? 'border-primary' : ''}`}
      onClick={onClick}
    >
      <CardContent className="px-2">
        <p className="font-semibold">{match.username}</p>
        <p className="text-sm text-muted-foreground">
          Compatibility: {formatCompatibilityScore(match.compatibilityScore)}
        </p>
      </CardContent>
    </Card>
  );
};

export default MatchCard;