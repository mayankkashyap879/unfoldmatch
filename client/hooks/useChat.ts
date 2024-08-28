// client/hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import io, { Socket } from 'socket.io-client';
import { Message, FriendshipStatus } from '@/types/chat';
import { Match } from '@/types/match';

type MessageAcknowledgement = {
  success: boolean;
  message?: Message;
  error?: string;
};

export const useChat = (initialMatches: Match[]) => {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [messageCount, setMessageCount] = useState<number>(0);
  const [canRequestFriendship, setCanRequestFriendship] = useState(false);
  const [showPotentialMatches, setShowPotentialMatches] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>('none');
  const [reactions, setReactions] = useState<{ [messageId: string]: { [userId: string]: string } }>({});

  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);

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

  const connectSocket = useCallback(() => {
    if (!user) return;

    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
      query: { userId: user.id },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      console.log('Socket ID:', newSocket.id);
      console.log('Transport:', newSocket.io.engine.transport.name);
      newSocket.emit('join user room', user.id);
      if (selectedMatch) {
        newSocket.emit('join chat', selectedMatch._id);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to the chat server. Please check your internet connection.",
        variant: "destructive",
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket:', reason);
      if (reason === 'io server disconnect') {
        newSocket.connect();
      }
    });

    setSocket(newSocket);
    socketRef.current = newSocket;

    return () => {
      newSocket.disconnect();
    };
  }, [user, selectedMatch, toast]);

  useEffect(() => {
    const cleanup = connectSocket();
    return cleanup;
  }, [connectSocket]);

  useEffect(() => {
    if (!socketRef.current) return;

    const handleNewMessage = (message: Message) => {
      console.log('New message received:', message);
      if (selectedMatch && (message.senderId === selectedMatch._id || message.receiverId === selectedMatch._id)) {
        setMessages(prevMessages => {
          if (!prevMessages.some(msg => msg._id === message._id)) {
            return [...prevMessages, message];
          }
          return prevMessages;
        });
        setMessageCount(prevCount => prevCount + 1);
      }
    };

    const handleMatchUpdate = (data: { matchId: string; messageCount: number; canRequestFriendship: boolean; status: Match['status'] }) => {
      if (selectedMatch && data.matchId === selectedMatch._id) {
        setMessageCount(data.messageCount);
        setCanRequestFriendship(data.canRequestFriendship);
        updateMatchStatus(data.matchId, data.status);
      }
    };

    const handleFriendshipRequested = (data: { matchId: string; receiverId: string; requesterId: string }) => {
      if (selectedMatch && data.matchId === selectedMatch._id) {
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
        updateMatchStatus(data.matchId, 'pending_friendship');
      }
    };

    const handleFriendshipStatusUpdated = (data: { matchId: string; status: Match['status'] }) => {
      if (selectedMatch && data.matchId === selectedMatch._id) {
        updateMatchStatus(data.matchId, data.status);
        if (data.status === 'friends') {
          setFriendshipStatus('friends');
          toast({
            title: "Friendship Accepted",
            description: `You are now friends with ${selectedMatch.username}!`,
          });
          setCanRequestFriendship(false);
        } else if (data.status === 'active') {
          setFriendshipStatus('none');
          setCanRequestFriendship(true);
          toast({
            title: "Friendship Declined",
            description: `The friendship request with ${selectedMatch.username} was declined.`,
          });
        }
      }
    };

    const handleMessageReaction = (data: { messageId: string, reactions: { [userId: string]: string } }) => {
      console.log('Received reaction update:', data);
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === data.messageId
            ? { ...msg, reactions: data.reactions }
            : msg
        )
      );
      setReactions(prevReactions => ({
        ...prevReactions,
        [data.messageId]: data.reactions
      }));
    };

    socketRef.current.on('new message', handleNewMessage);
    socketRef.current.on('match update', handleMatchUpdate);
    socketRef.current.on('friendship requested', handleFriendshipRequested);
    socketRef.current.on('friendship status updated', handleFriendshipStatusUpdated);
    socketRef.current.on('message reaction', handleMessageReaction);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('new message', handleNewMessage);
        socketRef.current.off('match update', handleMatchUpdate);
        socketRef.current.off('friendship requested', handleFriendshipRequested);
        socketRef.current.off('friendship status updated', handleFriendshipStatusUpdated);
        socketRef.current.off('message reaction', handleMessageReaction);
      }
    };
  }, [socketRef, selectedMatch, user, updateMatchStatus, toast]);

  const fetchMessages = useCallback(async (id: string, isFriend: boolean = false) => {
    if (!user) return;
    setIsLoadingMessages(true);
    try {
      const url = isFriend
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/messages/friend/${id}/${user.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/messages/match/${id}`;
      console.log('Fetching messages from:', url);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMessages(data);
      const newReactions = data.reduce((acc: { [messageId: string]: { [userId: string]: string } }, message: Message) => {
        acc[message._id] = message.reactions;
        return acc;
      }, {});
      setReactions(newReactions);
      setMessageCount(data.length);
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
  }, [user, toast]);

  const handleSelectMatch = useCallback(async (match: Match) => {
    setSelectedMatch(match);
    setMessages([]);
    setMessageCount(0);
    setCanRequestFriendship(false);
    setTimeLeft('');
    setFriendshipStatus(match.status === 'friends' ? 'friends' : 'none');
    setIsLoadingMessages(true);

    try {
      if (match.status === 'friends') {
        await fetchMessages(match._id, true);
      } else {
        if (socketRef.current) {
          socketRef.current.emit('join chat', match._id);
        }
        await fetchMessages(match._id, false);
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
  }, [fetchMessages, toast]);

  const sendMessage = useCallback((content: string) => {
    if (content.trim() && socketRef.current && user && selectedMatch) {
      const tempId = `temp-${Date.now()}`;
      const messageData: Message = {
        _id: tempId,
        matchId: selectedMatch.status === 'friends' ? undefined : selectedMatch._id,
        senderId: user.id,
        receiverId: selectedMatch._id,
        content,
        timestamp: new Date(),
        reactions: {}
      };

      setMessages(prevMessages => [...prevMessages, messageData]);
      setMessageCount(prevCount => prevCount + 1);

      socketRef.current.emit('send message', messageData, (acknowledgement: MessageAcknowledgement) => {
        if (acknowledgement.success && acknowledgement.message) {
          setMessages(prevMessages => 
            prevMessages.map(msg => msg._id === tempId ? acknowledgement.message! : msg)
          );
        } else {
          setMessages(prevMessages => prevMessages.filter(msg => msg._id !== tempId));
          setMessageCount(prevCount => prevCount - 1);
          toast({
            title: "Error",
            description: acknowledgement.error || "Failed to send message. Please try again.",
            variant: "destructive",
          });
        }
      });
    }
  }, [socketRef, user, selectedMatch, toast]);

  const requestFriendship = useCallback(() => {
    if (socketRef.current && user && selectedMatch && canRequestFriendship) {
      socketRef.current.emit('request friendship', { matchId: selectedMatch._id, userId: user.id }, (response: { success: boolean, error?: string }) => {
        if (response.success) {
          setFriendshipStatus('pending_sent');
          updateMatchStatus(selectedMatch._id, 'pending_friendship');
          toast({
            title: "Friendship Requested",
            description: `You've sent a friendship request to ${selectedMatch.username}.`,
          });
        } else {
          toast({
            title: "Error",
            description: response.error || "Failed to send friendship request. Please try again.",
            variant: "destructive",
          });
        }
      });
    }
  }, [socketRef, user, selectedMatch, canRequestFriendship, toast, updateMatchStatus]);

  const sendReaction = useCallback((messageId: string, emoji: string) => {
    if (socketRef.current && user) {
      console.log('Sending reaction:', { messageId, userId: user.id, emoji });
      socketRef.current.emit('send reaction', { messageId, userId: user.id, emoji });
    }
  }, [socketRef, user]);

  const sendGif = useCallback((gifUrl: string) => {
    if (socketRef.current && user && selectedMatch) {
      const tempId = `temp-${Date.now()}`;
      const messageData: Message = {
        _id: tempId,
        matchId: selectedMatch.status === 'friends' ? undefined : selectedMatch._id,
        senderId: user.id,
        receiverId: selectedMatch._id,
        content: '',
        gifUrl,
        timestamp: new Date(),
        reactions: {}
      };

      setMessages(prevMessages => [...prevMessages, messageData]);
      setMessageCount(prevCount => prevCount + 1);

      socketRef.current.emit('send message', messageData, (acknowledgement: MessageAcknowledgement) => {
        if (acknowledgement.success && acknowledgement.message) {
          setMessages(prevMessages => 
            prevMessages.map(msg => msg._id === tempId ? acknowledgement.message! : msg)
          );
        } else {
          setMessages(prevMessages => prevMessages.filter(msg => msg._id !== tempId));
          setMessageCount(prevCount => prevCount - 1);
          toast({
            title: "Error",
            description: acknowledgement.error || "Failed to send GIF. Please try again.",
            variant: "destructive",
          });
        }
      });
    } else {
      toast({
        title: "Error",
        description: "Unable to send GIF: connection not established.",
        variant: "destructive",
      });
    }
  }, [socketRef, user, selectedMatch, toast]);

  const respondToFriendship = useCallback((matchId: string, accept: boolean): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (socketRef.current && user && selectedMatch) {
        socketRef.current.emit('friendship response', { matchId, userId: user.id, accept }, (response: { success: boolean, error?: string }) => {
          if (response.success) {
            resolve();
          } else {
            reject(new Error(response.error || 'Failed to respond to friendship request'));
          }
        });
      } else {
        reject(new Error('Unable to respond to friendship request'));
      }
    });
  }, [socketRef, user, selectedMatch]);

  const togglePotentialMatches = useCallback(() => {
    setShowPotentialMatches(prev => !prev);
  }, []);

  return {
    matches,
    setMatches,
    selectedMatch,
    messages,
    timeLeft,
    messageCount,
    canRequestFriendship,
    showPotentialMatches,
    isLoadingMessages,
    friendshipStatus,
    reactions,
    handleSelectMatch,
    sendMessage,
    sendReaction,
    sendGif,
    requestFriendship,
    respondToFriendship,
    togglePotentialMatches,
    fetchMessages
  };
};

export default useChat;