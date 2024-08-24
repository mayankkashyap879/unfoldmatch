import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '../../components/AuthProvider';
import { useToast } from "@/components/ui/use-toast";
import io from 'socket.io-client';

interface ChatInterfaceProps {
  matchId: string;
  expiresAt: string;
}

interface Message {
  sender: string;
  content: string;
  timestamp: Date;
}

const CHAT_MILESTONE = 10;

const ChatInterface: React.FC<ChatInterfaceProps> = ({ matchId, expiresAt }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [messageCount, setMessageCount] = useState(0);
  const [canRequestFriendship, setCanRequestFriendship] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}`);
    setSocket(newSocket);

    newSocket.emit('join chat', matchId);

    newSocket.on('new message', (message: Message) => {
      setMessages(prevMessages => [...prevMessages, message]);
      setMessageCount(prevCount => {
        const newCount = prevCount + 1;
        setCanRequestFriendship(newCount >= CHAT_MILESTONE);
        return newCount;
      });
    });

    newSocket.on('match update', (update: { messageCount: number, canRequestFriendship: boolean }) => {
      setMessageCount(update.messageCount);
      setCanRequestFriendship(update.canRequestFriendship);
    });

    newSocket.on('friendship requested', (data) => {
      if (data.requester !== user.id) {
        setCanRequestFriendship(false);
        toast({
          title: "Friendship Request Received",
          description: "The other user has requested friendship!",
        });
      }
    });

    fetchMessages();

    const timer = setInterval(() => {
      const now = new Date();
      const expiration = new Date(expiresAt);
      const difference = expiration.getTime() - now.getTime();
      
      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft('Expired');
        clearInterval(timer);
      }
    }, 60000); // Update every minute

    return () => {
      newSocket.disconnect();
      clearInterval(timer);
    };
  }, [matchId, user, expiresAt]);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${matchId}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token') || ''
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setMessageCount(data.messages.length);
        setCanRequestFriendship(data.messages.length >= CHAT_MILESTONE);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socket && user) {
      const messageData = {
        matchId,
        sender: user.id,
        content: newMessage,
        timestamp: new Date()
      };
      socket.emit('send message', messageData);
      setNewMessage('');
    }
  };

  const requestFriendship = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/request-friendship/${matchId}`, {
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
        socket.emit('request friendship', matchId);
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

  if (!user) {
    return <div>Please log in to access the chat.</div>;
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Chat with your match</CardTitle>
        <div>Time left: {timeLeft}</div>
        <div>Messages: {messageCount}</div>
        {canRequestFriendship && (
          <Button onClick={requestFriendship} className="w-full mt-2">Request Friendship</Button>
        )}
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
            <span className="inline-block bg-gray-200 rounded px-2 py-1">
              {msg.content}
            </span>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <div className="flex w-full">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow mr-2"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;