import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface Message {
  sender: string;
  content: string;
  timestamp: Date;
}

interface ChatWindowProps {
  selectedMatch: {
    _id: string;
    username: string;
    status: string;
  } | null;
  messages: Message[];
  timeLeft: string;
  messageCount: number;
  canRequestFriendship: boolean;
  friendshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'friends';
  onRequestFriendship: () => void;
  onRespondToFriendship: (accept: boolean) => void;
  currentUserId: string;
  isLoadingMessages: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  selectedMatch,
  messages,
  timeLeft,
  messageCount,
  canRequestFriendship,
  friendshipStatus,
  onRequestFriendship,
  onRespondToFriendship,
  currentUserId,
  isLoadingMessages
}) => {
  if (!selectedMatch) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-center px-4 text-muted-foreground">Select a match to start chatting</p>
      </div>
    );
  }

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="py-2 flex-shrink-0">
        <CardTitle className="text-lg">Chat with {selectedMatch.username}</CardTitle>
        <div className="text-sm text-muted-foreground">Time left: {timeLeft} | Messages: {messageCount}</div>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto p-2">
        <ScrollArea className="h-full">
          {isLoadingMessages ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`mb-2 ${msg.sender === currentUserId ? 'text-right' : 'text-left'}`}>
                <span className="inline-block rounded px-2 py-1 bg-muted text-muted-foreground text-sm">
                  {msg.content}
                </span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>
      {friendshipStatus === 'none' && canRequestFriendship && (
        <div className="p-2 flex-shrink-0">
          <Button onClick={onRequestFriendship} className="w-full">Request Friendship</Button>
        </div>
      )}
      {friendshipStatus === 'pending_received' && (
        <div className="p-2 flex-shrink-0 flex space-x-2">
          <Button onClick={() => onRespondToFriendship(true)} className="flex-1">Accept</Button>
          <Button onClick={() => onRespondToFriendship(false)} className="flex-1" variant="outline">Decline</Button>
        </div>
      )}
      {friendshipStatus === 'pending_sent' && (
        <div className="p-2 flex-shrink-0">
          <p className="text-center text-sm text-muted-foreground">Friendship request sent</p>
        </div>
      )}
      {friendshipStatus === 'friends' && (
        <div className="p-2 flex-shrink-0">
          <p className="text-center text-sm text-muted-foreground">You are friends</p>
        </div>
      )}
    </Card>
  );
};

export default ChatWindow;