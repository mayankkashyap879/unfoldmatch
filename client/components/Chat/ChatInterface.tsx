// client/components/chat/ChatInterface.tsx
import React, { useEffect } from 'react';
import MatchList from './MatchList';
import ChatWindow from './ChatWindow';
import FriendsChatWindow from './FriendsChatWindow';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ChatInterfaceProps, FriendshipStatus, SelectedMatch } from '@/types/chat';
import { Match } from '@/types/match';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "@/components/ui/use-toast";

const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialMatches }) => {
  const { user } = useAuth();
  const {
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
  } = useChat(initialMatches);

  useEffect(() => {
    if (selectedMatch) {
      checkFriendshipStatus(selectedMatch._id);
    }
  }, [selectedMatch]);

  const checkFriendshipStatus = async (matchId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/friends/status/${matchId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        updateMatchStatus(matchId, data.status as FriendshipStatus);
      } else {
        throw new Error('Failed to check friendship status');
      }
    } catch (error) {
      console.error('Error checking friendship status:', error);
      toast({
        title: "Error",
        description: "Failed to check friendship status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateMatchStatus = (matchId: string, status: FriendshipStatus) => {
    setMatches((prevMatches: Match[]) => 
      prevMatches.map((match: Match) => 
        match._id === matchId ? { ...match, status: status as Match['status'] } : match
      )
    );
  };

  const handleRespondToFriendship = async (matchId: string, accept: boolean) => {
    try {
      await respondToFriendship(matchId, accept);
      if (accept) {
        updateMatchStatus(matchId, 'friends');
        toast({
          title: "Success",
          description: "Friendship request accepted!",
        });
      } else {
        updateMatchStatus(matchId, 'active');
        toast({
          title: "Info",
          description: "Friendship request declined.",
        });
      }
    } catch (error) {
      console.error('Error responding to friendship:', error);
      toast({
        title: "Error",
        description: "Failed to respond to friendship request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isFriendsChat = selectedMatch && selectedMatch.status === 'friends';

  return (
    <div className="flex flex-col sm:flex-row h-full bg-background text-foreground">
      <MatchList
        matches={matches}
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
          <h2 className="text-lg font-bold">{isFriendsChat ? 'Friend Chat' : 'Chat'}</h2>
          <div className="w-10"></div>
        </div>
        <div className="flex-1 overflow-hidden">
          {isFriendsChat ? (
            <FriendsChatWindow
              friend={selectedMatch as SelectedMatch}
              messages={messages}
              reactions={reactions}
              onSendMessage={sendMessage}
              onSendReaction={sendReaction}
              onSendGif={sendGif}
              currentUserId={user?.id || ''}
              isLoadingMessages={isLoadingMessages}
              fetchMessages={fetchMessages}
            />
          ) : (
            <ChatWindow
              selectedMatch={selectedMatch as SelectedMatch}
              messages={messages}
              timeLeft={timeLeft}
              messageCount={messageCount}
              canRequestFriendship={canRequestFriendship}
              onRequestFriendship={requestFriendship}
              onRespondToFriendship={handleRespondToFriendship}
              friendshipStatus={friendshipStatus}
              currentUserId={user?.id || ''}
              isLoadingMessages={isLoadingMessages}
              onSendMessage={sendMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;