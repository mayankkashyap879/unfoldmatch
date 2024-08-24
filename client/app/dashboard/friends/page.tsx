// client/app/dashboard/friends/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../components/AuthProvider';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Friend {
  _id: string;
  username: string;
}

interface PendingFriendship {
  _id: string;
  username: string;
  matchId: string;
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingFriendships, setPendingFriendships] = useState<PendingFriendship[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchFriends();
    fetchPendingFriendships();
  }, [user]);

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

  return (
    <ProtectedRoute>
      <div className="w-full">
        <h1 className="text-2xl font-bold mb-4">Friends</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Your Friends</h2>
            {friends.map(friend => (
              <Card key={friend._id} className="mb-2">
                <CardContent>{friend.username}</CardContent>
              </Card>
            ))}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Pending Friendships</h2>
            {pendingFriendships.map(pending => (
              <Card key={pending._id} className="mb-2">
                <CardHeader>
                  <CardTitle>{pending.username}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => respondToFriendship(pending.matchId, true)} className="mr-2">Accept</Button>
                  <Button onClick={() => respondToFriendship(pending.matchId, false)} variant="destructive">Reject</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}