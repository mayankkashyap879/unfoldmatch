import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { ChatWindowProps, Message } from '@/types/chat';
import { useScrollToBottom } from '@/hooks/useScrollToBottom';

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
} : ChatWindowProps) => {
  const { ref: messagesEndRef, scrollToBottom } = useScrollToBottom<HTMLDivElement>();

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  if (!selectedMatch) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-center px-4 text-muted-foreground">Select a match to start chatting</p>
      </div>
    );
  }

  const renderFriendshipAction = () => {
    switch (friendshipStatus) {
      case 'none':
        return canRequestFriendship && (
          <Button onClick={onRequestFriendship} className="w-full">Request Friendship</Button>
        );
      case 'pending_sent':
        return <p className="text-center text-sm text-muted-foreground">Friendship request sent</p>;
      case 'pending_received':
        return (
          <div className="flex space-x-2">
            <Button onClick={() => onRespondToFriendship(true)} className="flex-1">Accept</Button>
            <Button onClick={() => onRespondToFriendship(false)} variant="outline" className="flex-1">Decline</Button>
          </div>
        );
      case 'friends':
        return <p className="text-center text-sm text-muted-foreground">You are friends</p>;
    }
  };

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
              <MessageBubble key={index} message={msg} isCurrentUser={msg.sender === currentUserId} />
            ))
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>
      <div className="p-2 flex-shrink-0">
        {renderFriendshipAction()}
      </div>
    </Card>
  );
};

const MessageBubble: React.FC<{ message: Message; isCurrentUser: boolean }> = ({ message, isCurrentUser }) => (
  <div className={`mb-2 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
    <span className={`inline-block rounded px-2 py-1 ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} text-sm`}>
      {message.content}
    </span>
  </div>
);

export default ChatWindow;