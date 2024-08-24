'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import ProtectedRoute from '../../components/ProtectedRoute';
import MatchCard from '../../components/Matches/MatchCard';
import ChatInterface from '../../components/Chat/ChatInterface';
import { Loader2 } from "lucide-react";

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
          console.log('Matches data:', data); // Log the received data
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 flex">
        <div className="w-1/3 pr-4">
          <h1 className="text-2xl font-bold mb-4">Your Matches</h1>
          {matches.length > 0 ? (
            matches.map(match => (
              <div key={match._id} className="mb-4">
                <MatchCard 
                  match={match} 
                  isSelected={selectedMatch?._id === match._id}
                  onClick={() => setSelectedMatch(match)}
                />
              </div>
            ))
          ) : (
            <p>No matches available at the moment. We're working on finding your perfect match!</p>
          )}
        </div>
        <div className="w-2/3 pl-4">
          {selectedMatch ? (
            <ChatInterface matchId={selectedMatch._id} expiresAt={selectedMatch.expiresAt} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>{matches.length > 0 ? "Select a match to start chatting!" : "No matches available for chat yet."}</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}