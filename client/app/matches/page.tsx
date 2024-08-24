'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import ProtectedRoute from '../../components/ProtectedRoute';
import ChatInterface from '../../components/Chat/ChatInterface';

interface Match {
  _id: string;
  username: string;
  compatibilityScore: number;
  expiresAt: string;
  age?: number;
  bio?: string;
  interests?: string[];
  purpose?: string;
  personalityType?: string;
}

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
          setMatches(data.matches || []);
          if (data.matches && data.matches.length > 0 && !selectedMatch) {
            setSelectedMatch(data.matches[0]);
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

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="h-[calc(100vh-64px)]">
        <ChatInterface 
          matches={matches}
          selectedMatch={selectedMatch}
          setSelectedMatch={setSelectedMatch}
        />
      </div>
    </ProtectedRoute>
  );
}