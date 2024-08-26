import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import io, { Socket } from 'socket.io-client';
import { Message, FriendshipStatus } from '@/types/chat';
import { Match } from '@/types/match';
import { CHAT_MILESTONE } from '@/utils/constants';

export const useChat = (initialMatches: Match[]) => {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [messageCount, setMessageCount] = useState(0);
  const [canRequestFriendship, setCanRequestFriendship] = useState(false);
  const [showPotentialMatches, setShowPotentialMatches] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>('none');

  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const updateMatchStatus = useCallback((matchId: string, newStatus: Match['status']) => {
    setMatches(prevMatches => 
      prevMatches.map(match => 
        match._id === matchId ? { ...match, status: newStatus } : match
      )
    );
    if (selectedMatch && selectedMatch._id === matchId) {
      setSelectedMatch(prev => prev ? { ...prev, status: newStatus } : null);
    }
  }, [selectedMatch]);

  useEffect(() => {
    if (!user) return;

    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}`);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!socket || !selectedMatch) return;

    socket.emit('join chat', selectedMatch._id);

    const handleNewMessage = (message: Message) => {
      setMessages(prevMessages => [...prevMessages, message]);
      setMessageCount(prevCount => message.messageCount ?? prevCount);
      setCanRequestFriendship(prevCanRequest => message.canRequestFriendship ?? prevCanRequest);
    };

    const handleMatchUpdate = (data: { matchId: string; messageCount: number; canRequestFriendship: boolean; status: Match['status'] }) => {
      if (data.matchId === selectedMatch._id) {
        setMessageCount(data.messageCount);
        setCanRequestFriendship(data.canRequestFriendship);
        updateMatchStatus(data.matchId, data.status);
      }
    };

    const handleFriendshipRequested = (data: { matchId: string; receiverId: string; requesterId: string }) => {
      if (data.matchId === selectedMatch._id) {
        if (data.receiverId === user?.id) {
          setFriendshipStatus('pending_received');
          toast({
            title: "Friendship Requested",
            description: `${selectedMatch.username} has requested to be friends!`,
          });
        } else if (data.requesterId === user?.id) {
          setFriendshipStatus('pending_sent');
          toast({
            title: "Friendship Request Sent",
            description: `Your friendship request to ${selectedMatch.username} has been sent.`,
          });
        }
      }
    };

    const handleFriendshipStatusUpdated = (data: { matchId: string; status: Match['status'] }) => {
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
          setMessageCount(0);
          setCanRequestFriendship(false);
          toast({
            title: "Friendship Declined",
            description: `The friendship request with ${selectedMatch.username} was declined.`,
          });
        }
      }
    };

    socket.on('new message', handleNewMessage);
    socket.on('match update', handleMatchUpdate);
    socket.on('friendship requested', handleFriendshipRequested);
    socket.on('friendship status updated', handleFriendshipStatusUpdated);

    return () => {
      socket.off('new message', handleNewMessage);
      socket.off('match update', handleMatchUpdate);
      socket.off('friendship requested', handleFriendshipRequested);
      socket.off('friendship status updated', handleFriendshipStatusUpdated);
    };
  }, [socket, selectedMatch, user, updateMatchStatus, toast, router]);

  const fetchMessages = useCallback(async (matchId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${matchId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data.messages);
      setMessageCount(data.messages.length);
      setCanRequestFriendship(data.messages.length >= CHAT_MILESTONE);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [toast]);

  const handleSelectMatch = useCallback(async (match: Match) => {
    setSelectedMatch(match);
    setMessages([]);
    setMessageCount(0);
    setCanRequestFriendship(false);
    setTimeLeft('');
    setFriendshipStatus('none');
    setIsLoadingMessages(true);
    
    try {
      if (match.status === 'friends') {
        router.push('/dashboard/friends');
      } else {
        await fetchMessages(match._id);
      }
    } catch (error) {
      console.error('Error selecting match:', error);
      toast({
        title: "Error",
        description: "Failed to load match data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [fetchMessages, router, toast]);

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

  const requestFriendship = useCallback(() => {
    if (socket && user && selectedMatch && canRequestFriendship) {
      socket.emit('request friendship', { matchId: selectedMatch._id, userId: user.id });
    }
  }, [socket, user, selectedMatch, canRequestFriendship]);

  const respondToFriendship = useCallback((accept: boolean) => {
    if (socket && user && selectedMatch) {
      socket.emit('friendship response', { matchId: selectedMatch._id, userId: user.id, accept });
    }
  }, [socket, user, selectedMatch]);

  const togglePotentialMatches = useCallback(() => {
    setShowPotentialMatches(prev => !prev);
  }, []);

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