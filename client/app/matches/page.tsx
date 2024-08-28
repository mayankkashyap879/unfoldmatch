// client/app/matches/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import ChatInterface from '@/components/chat/ChatInterface';
import { Loader2 } from "lucide-react";
import { Match } from '@/types/match';

// interface Match {
//   _id: string;
//   username: string;
//   compatibilityScore: number;
//   expiresAt: string;
//   status: 'active' | 'pending_friendship' | 'friends';
//   age?: number;
//   bio?: string;
//   interests?: string[];
//   purpose?: string;
//   personalityType?: string;
// }

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches`, {
          headers: {
            'x-auth-token': localStorage.getItem('token') || ''
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Matches data:', data);
          const formattedMatches: Match[] = data.matches.map((match: any) => ({
            ...match,
            gender: match.gender || 'other' // Provide a default value if gender is not present
          }));
          setMatches(formattedMatches);
          if (formattedMatches.length > 0 && !selectedMatch) {
            setSelectedMatch(formattedMatches[0]);
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch matches');
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-background">
      <ChatInterface initialMatches={matches} />
    </div>
  </ProtectedRoute>
  );
}