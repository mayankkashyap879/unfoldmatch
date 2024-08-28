// client/app/dashboard/friends/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import FriendsChatWindow from '@/components/chat/FriendsChatWindow';
import { useChat } from '@/hooks/useChat';
import { Match } from '@/types/match';
import { SelectedMatch } from '@/types/chat';

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
  const [selectedFriend, setSelectedFriend] = useState<SelectedMatch | null>(null);
  const { user } = useAuth();
  const {
    messages,
    reactions,
    sendMessage,
    sendReaction,
    sendGif,
    isLoadingMessages,
    handleSelectMatch,
    fetchMessages,
  } = useChat([]);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchPendingFriendships();
    }
  }, [user]);

  useEffect(() => {
    console.log('Selected friend changed:', selectedFriend);
    if (selectedFriend) {
      console.log('Fetching messages for friend:', selectedFriend._id);
      fetchMessages(selectedFriend._id, true);
    }
  }, [selectedFriend, fetchMessages]);

  const fetchFriends = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/friends`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched friends:', data.friends);
        setFriends(data.friends);
      } else {
        throw new Error('Failed to fetch friends');
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast({
        title: "Error",
        description: "Failed to fetch friends. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchPendingFriendships = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/friends/pending`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPendingFriendships(data.pendingFriendships);
      } else {
        throw new Error('Failed to fetch pending friendships');
      }
    } catch (error) {
      console.error('Error fetching pending friendships:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending friendships. Please try again.",
        variant: "destructive",
      });
    }
  };

  const respondToFriendship = async (matchId: string, accept: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/respond-friendship/${matchId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ accept })
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: accept ? "Friendship accepted!" : "Friendship request declined.",
        });
        fetchFriends();
        fetchPendingFriendships();
      } else {
        throw new Error('Failed to respond to friendship request');
      }
    } catch (error) {
      console.error('Error responding to friendship:', error);
      toast({
        title: "Error",
        description: "Failed to respond to friendship request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectFriend = useCallback((friend: Friend) => {
    console.log('Selecting friend:', friend);
    const selectedMatch: SelectedMatch = {
      _id: friend._id,
      username: friend.username,
      status: 'friends',
      compatibilityScore: 0,
      expiresAt: '',
      gender: 'other'
    };
    setSelectedFriend(selectedMatch);
    handleSelectMatch(selectedMatch as Match);
    fetchMessages(friend._id, true); // Add this line to fetch messages immediately
  }, [handleSelectMatch, fetchMessages]);

  console.log('Rendering FriendsPage. Selected friend:', selectedFriend);
  console.log('Messages:', messages);

  return (
    <ProtectedRoute>
      <div className="flex h-full">
        <div className="w-1/3 p-4 border-r">
          <h1 className="text-2xl font-bold mb-6">Friends</h1>
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Friends</h2>
            {friends.length > 0 ? (
              friends.map(friend => (
                <Card key={friend._id} className="mb-4 cursor-pointer" onClick={() => handleSelectFriend(friend)}>
                  <CardContent className="p-4">
                    <p className="text-lg">{friend.username}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">You don't have any friends yet.</p>
            )}
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Pending Friendships</h2>
            {pendingFriendships.length > 0 ? (
              pendingFriendships.map(pending => (
                <Card key={pending._id} className="mb-4">
                  <CardHeader>
                    <CardTitle>{pending.username}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <Button onClick={() => respondToFriendship(pending.matchId, true)}>Accept</Button>
                      <Button onClick={() => respondToFriendship(pending.matchId, false)} variant="outline">Decline</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">No pending friendship requests.</p>
            )}
          </div>
        </div>
        <div className="w-2/3 p-4">
          {selectedFriend ? (
            <>
              <p>Debug: Selected friend: {selectedFriend.username}</p>
              <FriendsChatWindow
                friend={selectedFriend}
                messages={messages}
                reactions={reactions}
                onSendMessage={sendMessage}
                onSendReaction={sendReaction}
                onSendGif={sendGif}
                currentUserId={user?.id || ''}
                isLoadingMessages={isLoadingMessages}
                fetchMessages={fetchMessages}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-xl text-muted-foreground">Select a friend to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}