// client/components/Chat/ChatInterface.tsx
import React, { useState, useEffect } from 'react';
import MatchCard from '../Matches/MatchCard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, X, Send } from "lucide-react";
import { useAuth } from '../AuthProvider';
import { useToast } from "@/components/ui/use-toast";
import io from 'socket.io-client';

interface Message {
  sender: string;
  content: string;
  timestamp: Date;
}

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

interface ChatInterfaceProps {
  matches: Match[];
  selectedMatch: Match | null;
  setSelectedMatch: (match: Match | null) => void;
}

const CHAT_MILESTONE = 10;

const ChatInterface: React.FC<ChatInterfaceProps> = ({ matches, selectedMatch, setSelectedMatch }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [messageCount, setMessageCount] = useState(0);
  const [canRequestFriendship, setCanRequestFriendship] = useState(false);
  const [showPotentialMatches, setShowPotentialMatches] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !selectedMatch) return;

    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}`);
    setSocket(newSocket);

    newSocket.emit('join chat', selectedMatch._id);

    newSocket.on('new message', (message: Message) => {
      setMessages(prevMessages => [...prevMessages, message]);
      setMessageCount(prevCount => {
        const newCount = prevCount + 1;
        setCanRequestFriendship(newCount >= CHAT_MILESTONE);
        return newCount;
      });
    });

    const timer = setInterval(() => {
      if (selectedMatch) {
        const now = new Date();
        const expiration = new Date(selectedMatch.expiresAt);
        const difference = expiration.getTime() - now.getTime();
        
        if (difference > 0) {
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft('Expired');
          clearInterval(timer);
        }
      }
    }, 600); // Update every second

    return () => {
      newSocket.disconnect();
      clearInterval(timer);
    };
  }, [selectedMatch, user]);

  const sendMessage = () => {
    if (newMessage.trim() && socket && user && selectedMatch) {
      const messageData = {
        matchId: selectedMatch._id,
        sender: user.id,
        content: newMessage,
        timestamp: new Date()
      };
      socket.emit('send message', messageData);
      setNewMessage('');
    }
  };

  const requestFriendship = async () => {
    if (!selectedMatch) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/request-friendship/${selectedMatch._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token') || ''
        }
      });
      if (response.ok) {
        toast({
          title: "Friendship Requested",
          description: "Your friendship request has been sent!",
        });
        setCanRequestFriendship(false);
        socket?.emit('request friendship', selectedMatch._id);
      } else {
        throw new Error('Failed to request friendship');
      }
    } catch (error) {
      console.error('Error requesting friendship:', error);
      toast({
        title: "Error",
        description: "Failed to request friendship. Please try again.",
        variant: "destructive",
      });
    }
  };

  const togglePotentialMatches = () => {
    setShowPotentialMatches(!showPotentialMatches);
  };


  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex-none p-2 flex justify-between items-center bg-background text-foreground">
        <Button variant="ghost" size="icon" onClick={togglePotentialMatches}>
          {showPotentialMatches ? <>Close X<X className="h-6 w-6" /></> : <Menu className="h-6 w-6" />}
        </Button>
        <h2 className="text-lg font-bold bg-background text-foreground">Chat</h2>
        <div className="w-10"></div> {/* Placeholder for balance */}
      </div>
      <div className="flex flex-1 overflow-hidden">
        {showPotentialMatches && (
          <div className="w-1/3 md:w-1/4 border-r border-border p-4">
            <ScrollArea className="h-full">
              <div className="p-2">
                <h3 className="text-lg font-semibold mb-2">Your Potential Matches</h3>
                {matches.length > 0 ? (
                  matches.map(match => (
                    <div key={match._id} className="mb-2">
                      <MatchCard 
                        match={match} 
                        isSelected={selectedMatch?._id === match._id}
                        onClick={() => setSelectedMatch(match)}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No matches available at the moment. We're working on finding your perfect match!</p>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        <div className="flex-1 flex flex-col p-4">
          {selectedMatch ? (
            <Card className="flex-1 flex flex-col">
              <CardHeader className="py-2">
                <CardTitle className="text-lg">Chat with {selectedMatch.username}</CardTitle>
                <div className="text-sm text-muted-foreground">Time left: {timeLeft} | Messages: {messageCount}</div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-2">
                <ScrollArea className="h-full">
                  {messages.map((msg, index) => (
                    <div key={index} className={`mb-2 ${msg.sender === user?.id ? 'text-right' : 'text-left'}`}>
                      <span className="inline-block rounded px-2 py-1 bg-muted text-muted-foreground text-sm">
                        {msg.content}
                      </span>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
              <div className="p-2 flex">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 mr-2"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage} size="icon"><Send className="h-4 w-4" /></Button>
              </div>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-center px-4 text-muted-foreground">Select a match to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;