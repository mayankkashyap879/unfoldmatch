import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MatchCardProps {
  match: {
    _id: string;
    username: string;
    compatibilityScore: number;
    age?: number;
    bio?: string;
    interests?: string[];
    purpose?: string;
    personalityType?: string;
  };
  isSelected: boolean;
  onClick: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, isSelected, onClick }) => {
  const isFriend = 'age' in match;

  return (
    <Card 
      className={`cursor-pointer transition-all ${isSelected ? 'border-blue-500 border-2' : ''}`}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle>{match.username}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-semibold mb-2">
          Compatibility: {match.compatibilityScore}%
        </p>
        {isFriend ? (
          <>
            <p>Age: {match.age}</p>
            <p>Bio: {match.bio}</p>
            <p>Interests: {match.interests?.join(', ')}</p>
            <p>Looking for: {match.purpose}</p>
            <p>Personality Type: {match.personalityType}</p>
          </>
        ) : (
          <p>Chat to reveal more information</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchCard;