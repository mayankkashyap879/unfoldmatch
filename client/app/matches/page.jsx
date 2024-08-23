'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { useWebSocket } from '../../components/WebSocketProvider';
import ProtectedRoute from '../../components/ProtectedRoute';
import MatchCard from '../../components/Matches/MatchCard';
import ChatInterface from '../../components/Chat/ChatInterface';
import { Loader2 } from "lucide-react";

// interface Match {
//   _id: string;
//   username: string;
//   compatibilityScore: number;
// }

export default function MatchesPage() {
  const [match, setMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const socket = useWebSocket();

  useEffect(() => {
    if (socket) {
      socket.on('newMatch', (newMatch) => {
        setMatch(newMatch);
      });
    }
  }, [socket]);

  useEffect(() => {
    const fetchMatch = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches`, {
          headers: {
            'x-auth-token': localStorage.getItem('token') || ''
          }
        });
        if (response.ok) {
          const data = await response.json();
          setMatch(data.match);
        } else {
          throw new Error('Failed to fetch match');
        }
      } catch (error) {
        console.error('Failed to fetch match:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatch();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 flex">
        <div className="w-1/3 pr-4">
          <h1 className="text-2xl font-bold mb-4">Your Match</h1>
          {match ? (
            <MatchCard match={match} />
          ) : (
            <p>No matches available at the moment.</p>
          )}
        </div>
        <div className="w-2/3 pl-4">
          {match ? (
            <ChatInterface matchId={match._id} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>No active match. Check back later for new matches!</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}