// client/components/chat/MatchCard.tsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MatchCardProps } from '@/types/match';
import { formatCompatibilityScore } from '@/utils/matchUtils';

const MatchCard: React.FC<MatchCardProps> = ({ match, isSelected, onClick }: MatchCardProps) => {
  const displayName = match.status === 'friends' 
    ? match.username 
    : match.gender === 'male' ? 'He' : match.gender === 'female' ? 'She' : 'They';

  return (
    <Card 
      className={`cursor-pointer transition-all ${isSelected ? 'border-primary' : ''}`}
      onClick={onClick}
    >
      <CardContent className="px-2 py-3">
        <p className="font-semibold">{displayName}</p>
        {match.status !== 'friends' && (
          <p className="text-sm text-muted-foreground">
            Compatibility: {formatCompatibilityScore(match.compatibilityScore)}
          </p>
        )}
        {match.status === 'friends' && (
          <p className="text-sm text-green-600">Friend</p>
        )}
        {match.status === 'pending_friendship' && (
          <p className="text-sm text-yellow-600">Pending Friend Request</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchCard;