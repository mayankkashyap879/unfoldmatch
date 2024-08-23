import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInterfaceProps {
  matchId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ matchId }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Here you would typically fetch existing messages or start a new chat
    setMessages(["Welcome to your new match! Start chatting to get to know each other."]);
  }, [matchId]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, `You: ${newMessage}`]);
      setNewMessage('');
      // Here you would typically send the message to your backend
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Chat with your match</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">{msg}</div>
        ))}
      </CardContent>
      <CardFooter>
        <div className="flex w-full">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow mr-2"
          />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;