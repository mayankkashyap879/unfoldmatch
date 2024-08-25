import React from 'react';
import MatchList from './MatchList';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ChatInterfaceProps } from '@/types/chat';
import { useChat } from '@/hooks/useChat';
import { filterNonFriendMatches } from '@/utils/chatUtils';
import { useAuth } from '@/hooks/useAuth';

const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialMatches }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const {
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
  } = useChat(initialMatches);

  return (
    <div className="flex flex-col sm:flex-row h-full bg-background text-foreground">
      <MatchList
        matches={filterNonFriendMatches(matches)}
        selectedMatch={selectedMatch}
        onSelectMatch={handleSelectMatch}
        showPotentialMatches={showPotentialMatches}
        onTogglePotentialMatches={togglePotentialMatches}
      />
      <div className="flex-1 flex flex-col h-full">
        <div className="flex-none p-2 flex justify-between items-center border-b border-border">
          <Button variant="ghost" size="sm" onClick={togglePotentialMatches} className="sm:hidden">
            <Menu className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-bold">Chat</h2>
          <div className="w-10"></div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatWindow
            selectedMatch={selectedMatch}
            messages={messages}
            timeLeft={timeLeft}
            messageCount={messageCount}
            canRequestFriendship={canRequestFriendship}
            onRequestFriendship={requestFriendship}
            onRespondToFriendship={respondToFriendship}
            friendshipStatus={friendshipStatus}
            currentUserId={user?.id || ''}
            isLoadingMessages={isLoadingMessages}
          />
        </div>
        {selectedMatch && selectedMatch.status !== 'friends' && (
          <MessageInput onSendMessage={sendMessage} />
        )}
      </div>
    </div>
  );
};

export default ChatInterface;