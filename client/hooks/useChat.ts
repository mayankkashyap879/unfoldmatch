import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import { Message, FriendshipStatus } from '@/types/chat';
import { Match } from '@/types/match';
import { CHAT_MILESTONE } from '@/utils/constants';

export const useChat = (initialMatches: Match[]) => {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [messageCount, setMessageCount] = useState(0);
  const [canRequestFriendship, setCanRequestFriendship] = useState(false);
  const [showPotentialMatches, setShowPotentialMatches] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>('none');

  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const fetchMatchStatus = useCallback(async (matchId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/${matchId}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const { status } = await response.json();
        return status as Match['status'];
      }
    } catch (error) {
      console.error('Error fetching match status:', error);
    }
    return 'active'; // Default to active if there's an error
  }, []);

  const updateMatchStatus = useCallback((matchId: string, newStatus: Match['status']) => {
    setMatches(prevMatches => 
      prevMatches.map(match => 
        match._id === matchId ? { ...match, status: newStatus } : match
      )
    );
    if (selectedMatch && selectedMatch._id === matchId) {
      setSelectedMatch(prev => prev ? { ...prev, status: newStatus } : null);
      setFriendshipStatus(getFriendshipStatus(newStatus));
    }
  }, [selectedMatch]);

  const getFriendshipStatus = useCallback((matchStatus: Match['status']): FriendshipStatus => {
    switch (matchStatus) {
      case 'friends':
        return 'friends';
      case 'pending_friendship':
        return 'pending_sent'; // You may need to determine if it's 'pending_sent' or 'pending_received' based on who initiated the request
      default:
        return 'none';
    }
  }, []);

  useEffect(() => {
    if (!user || !selectedMatch) return;
  
    const initializeChat = async () => {
      setIsLoadingMessages(true);
      const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}`);
      setSocket(newSocket);
  
      newSocket.emit('join chat', selectedMatch._id);
  
      newSocket.on('new message', (message: Message) => {
        setMessages(prevMessages => [...prevMessages, message]);
        setMessageCount(prevCount => {
          const newCount = prevCount + 1;
          setCanRequestFriendship(newCount >= CHAT_MILESTONE && selectedMatch.status === 'active');
          return newCount;
        });
      });
  
      newSocket.on('match update', (data: { matchId: string; messageCount: number; canRequestFriendship: boolean; status: Match['status'] }) => {
        if (data.matchId === selectedMatch._id) {
          setMessageCount(data.messageCount);
          setCanRequestFriendship(data.canRequestFriendship);
          updateMatchStatus(data.matchId, data.status);
        }
      });
  
      newSocket.on('friendship requested', (data: { matchId: string; receiverId: string; requesterId: string }) => {
        if (data.matchId === selectedMatch._id) {
          if (data.receiverId === user.id) {
            updateMatchStatus(data.matchId, 'pending_friendship');
            setFriendshipStatus('pending_received');
            toast({
              title: "Friendship Requested",
              description: `${selectedMatch.username} has requested to be friends!`,
            });
          } else if (data.requesterId === user.id) {
            updateMatchStatus(data.matchId, 'pending_friendship');
            setFriendshipStatus('pending_sent');
            toast({
              title: "Friendship Request Sent",
              description: `Your friendship request to ${selectedMatch.username} has been sent.`,
            });
          }
        }
      });
  
      newSocket.on('friendship status updated', (data: { matchId: string; status: Match['status'] }) => {
        if (data.matchId === selectedMatch._id) {
          updateMatchStatus(data.matchId, data.status);
          if (data.status === 'friends') {
            setFriendshipStatus('friends');
            toast({
              title: "Friendship Accepted",
              description: `You are now friends with ${selectedMatch.username}!`,
            });
            router.push('/dashboard/friends');
          } else if (data.status === 'active') {
            setFriendshipStatus('none');
            toast({
              title: "Friendship Declined",
              description: `The friendship request with ${selectedMatch.username} was declined.`,
            });
          }
        }
      });
  
      try {
        const currentStatus = await fetchMatchStatus(selectedMatch._id);
        updateMatchStatus(selectedMatch._id, currentStatus);
        await fetchMessages(selectedMatch._id);
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast({
          title: "Error",
          description: "Failed to initialize chat. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingMessages(false);
      }
    };
  
    initializeChat();
  
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [selectedMatch, user, updateMatchStatus, fetchMatchStatus, router]);

  const fetchMessages = async (matchId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${matchId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    const data = await response.json();
    setMessages(data.messages);
    setMessageCount(data.messages.length);
    setCanRequestFriendship(data.messages.length >= CHAT_MILESTONE);
  };

  const handleSelectMatch = useCallback(async (match: Match) => {
    setSelectedMatch(match);
    setMessages([]);
    setMessageCount(0);
    setCanRequestFriendship(false);
    setTimeLeft('');
    
    const currentStatus = await fetchMatchStatus(match._id);
    updateMatchStatus(match._id, currentStatus);
    
    if (currentStatus === 'friends') {
      router.push('/dashboard/friends');
    }
  }, [fetchMatchStatus, updateMatchStatus, router]);

  const sendMessage = useCallback((content: string) => {
    if (content.trim() && socket && user && selectedMatch && selectedMatch.status !== 'friends') {
      const messageData = {
        matchId: selectedMatch._id,
        sender: user.id,
        content,
        timestamp: new Date()
      };
      socket.emit('send message', messageData);
    }
  }, [socket, user, selectedMatch]);

  const requestFriendship = async () => {
    if (!selectedMatch || messageCount < CHAT_MILESTONE) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/request-friendship/${selectedMatch._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        updateMatchStatus(selectedMatch._id, 'pending_friendship');
        setFriendshipStatus('pending_sent');
        socket?.emit('request friendship', { matchId: selectedMatch._id, requesterId: user?.id });
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to request friendship');
      }
    } catch (error) {
      console.error('Error requesting friendship:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to request friendship. Please try again.",
        variant: "destructive",
      });
    }
  };

  const respondToFriendship = async (accept: boolean) => {
    if (!selectedMatch) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/respond-friendship/${selectedMatch._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ accept })
      });
      if (response.ok) {
        const newStatus = accept ? 'friends' : 'active';
        updateMatchStatus(selectedMatch._id, newStatus);
        setFriendshipStatus(getFriendshipStatus(newStatus));
        socket?.emit('friendship response', { 
          matchId: selectedMatch._id, 
          accepted: accept 
        });
        if (accept) {
          router.push('/dashboard/friends');
        }
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

  const togglePotentialMatches = () => {
    setShowPotentialMatches(!showPotentialMatches);
  };

  return {
    matches,
    selectedMatch,
    messages,
    timeLeft,
    messageCount,
    canRequestFriendship,
    showPotentialMatches,
    isLoadingMessages,
    friendshipStatus,
    handleSelectMatch,
    sendMessage,
    requestFriendship,
    respondToFriendship,
    togglePotentialMatches,
  };
};