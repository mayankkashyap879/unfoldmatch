// components/ChatWindow.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { ChatWindowProps, Message } from '@/types/chat';
import { useScrollToBottom } from '@/hooks/useScrollToBottom';
import { getFriendshipActionContent } from '@/utils/chatUtils';

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

  const friendshipAction = getFriendshipActionContent(friendshipStatus, canRequestFriendship);

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
      {friendshipAction && (
        <FriendshipActionSection
          action={friendshipAction}
          onRequestFriendship={onRequestFriendship}
          onRespondToFriendship={onRespondToFriendship}
        />
      )}
    </Card>
  );
};

const MessageBubble: React.FC<{ message: Message; isCurrentUser: boolean }> = ({ message, isCurrentUser }: { message: Message; isCurrentUser: boolean }) => (
  <div className={`mb-2 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
    <span className="inline-block rounded px-2 py-1 bg-muted text-muted-foreground text-sm">
      {message.content}
    </span>
  </div>
);

const FriendshipActionSection: React.FC<{
  action: { type: string };
  onRequestFriendship: () => void;
  onRespondToFriendship: (accept: boolean) => void;
}> = ({ action, onRequestFriendship, onRespondToFriendship }: {
  action: { type: string };
  onRequestFriendship: () => void;
  onRespondToFriendship: (accept: boolean) => void;
}) => {
  switch (action.type) {
    case 'request':
      return (
        <div className="p-2 flex-shrink-0">
          <Button onClick={onRequestFriendship} className="w-full">Request Friendship</Button>
        </div>
      );
    case 'respond':
      return (
        <div className="p-2 flex-shrink-0 flex space-x-2">
          <Button onClick={() => onRespondToFriendship(true)} className="flex-1">Accept</Button>
          <Button onClick={() => onRespondToFriendship(false)} className="flex-1" variant="outline">Decline</Button>
        </div>
      );
    case 'waiting':
      return (
        <div className="p-2 flex-shrink-0">
          <p className="text-center text-sm text-muted-foreground">Friendship request sent</p>
        </div>
      );
    case 'friends':
      return (
        <div className="p-2 flex-shrink-0">
          <p className="text-center text-sm text-muted-foreground">You are friends</p>
        </div>
      );
    default:
      return null;
  }
};

export default ChatWindow;