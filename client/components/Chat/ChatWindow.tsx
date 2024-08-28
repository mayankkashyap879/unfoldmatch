// client/components/chat/ChatWindow.tsx
import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ChatWindowProps, Message, FriendshipStatus } from '@/types/chat';
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
  isLoadingMessages,
  onSendMessage
}) => {
  const [newMessage, setNewMessage] = useState('');
  const { ref: messagesEndRef, scrollToBottom } = useScrollToBottom<HTMLDivElement>();

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!selectedMatch) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-center px-4 text-muted-foreground">Select a match to start chatting</p>
      </div>
    );
  }
  
  const isChatDisabled = friendshipStatus === 'pending_sent' || friendshipStatus === 'pending_received' || !canRequestFriendship;

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b">
        <h2 className="text-lg font-bold">Chat with {selectedMatch.username}</h2>
        <div className="text-sm text-muted-foreground">Time left: {timeLeft} | Messages: {messageCount}</div>
      </div>
      <ScrollArea className="flex-grow p-2">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading messages...</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} isCurrentUser={msg.senderId === currentUserId} />
          ))
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>
      <div className="p-2 flex items-center">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 mr-2"
          disabled={isChatDisabled}
        />
        <Button onClick={handleSendMessage} size="icon" disabled={isChatDisabled}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-2">
        {friendshipStatus === 'none' && canRequestFriendship && (
          <Button onClick={() => onRequestFriendship(selectedMatch._id)} className="w-full">Request Friendship</Button>
        )}
        {friendshipStatus === 'pending_received' && (
          <div className="flex space-x-2">
            <Button onClick={() => onRespondToFriendship(selectedMatch._id, true)} className="flex-1">Accept</Button>
            <Button onClick={() => onRespondToFriendship(selectedMatch._id, false)} variant="outline" className="flex-1">Decline</Button>
          </div>
        )}
        {friendshipStatus === 'pending_sent' && (
          <p className="text-center text-sm text-muted-foreground">Friendship request sent</p>
        )}
      </div>
    </div>
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