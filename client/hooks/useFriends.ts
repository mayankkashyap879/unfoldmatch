// client/hooks/useFriends.ts

import { useState, useEffect } from 'react';
import { Friend, PendingFriendship } from '@/types/friend';
import { useAuth } from '@/hooks/useAuth';

export const useFriends = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingFriendships, setPendingFriendships] = useState<PendingFriendship[]>([]);
  const { user } = useAuth();

  const fetchFriends = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/friends`, {
        headers: {
          'x-auth-token': localStorage.getItem('token') || ''
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchPendingFriendships = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/friends/pending`, {
        headers: {
          'x-auth-token': localStorage.getItem('token') || ''
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPendingFriendships(data.pendingFriendships);
      }
    } catch (error) {
      console.error('Error fetching pending friendships:', error);
    }
  };

  const respondToFriendship = async (matchId: string, accept: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/respond-friendship/${matchId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token') || ''
        },
        body: JSON.stringify({ accept })
      });
      if (response.ok) {
        fetchFriends();
        fetchPendingFriendships();
      }
    } catch (error) {
      console.error('Error responding to friendship:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchPendingFriendships();
    }
  }, [user]);

  return { friends, pendingFriendships, respondToFriendship };
};