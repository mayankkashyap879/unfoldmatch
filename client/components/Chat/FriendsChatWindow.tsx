// client/components/chat/FriendsChatWindow.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Smile, Send, Image } from "lucide-react";
import { useScrollToBottom } from '@/hooks/useScrollToBottom';
import { isGifMessage, getMessageReactions, formatReactions, getCommonReactions, getUserReaction } from '@/utils/messageUtils';
import { FriendsChatWindowProps, MessageBubbleProps, Message } from '@/types/chat';
import EmojiPickerComponent from './EmojiPickerComponent';
import GifSearchComponent from './GifSearchComponent';

const FriendsChatWindow: React.FC<FriendsChatWindowProps> = React.memo(({
  friend,
  messages,
  reactions,
  onSendMessage,
  onSendReaction,
  onSendGif,
  currentUserId,
  isLoadingMessages,
  fetchMessages
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifSearch, setShowGifSearch] = useState(false);
  const { ref: messagesEndRef, scrollToBottom } = useScrollToBottom<HTMLDivElement>();
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    console.log('FriendsChatWindow: friend changed', friend);
    if (friend._id && fetchMessages) {
      console.log('Fetching messages for friend:', friend._id);
      fetchMessages(friend._id);
    }
  }, [friend._id, fetchMessages]);

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  }, [newMessage, onSendMessage]);

  const handleGifSelect = useCallback((gifUrl: string) => {
    onSendGif(gifUrl);
    setShowGifSearch(false);
  }, [onSendGif]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  }, []);

  console.log('Rendering FriendsChatWindow. Friend:', friend);
  console.log('Messages:', messages);

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Chat with {friend.username}</h2>
        <p>Debug: Friend ID: {friend._id}, Current User ID: {currentUserId}</p>
      </div>
      <ScrollArea className="flex-grow p-4">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <p>No messages yet. Start chatting!</p>
        ) : (
          messages.map((msg) => (
            <MessageBubble 
              key={msg._id} 
              message={msg} 
              isCurrentUser={msg.senderId === currentUserId}
              reactions={reactions[msg._id] || {}}
              onReact={(emoji) => onSendReaction(msg._id, emoji)}
              currentUserId={currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>
      <div className="p-4 border-t relative">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Button
              ref={emojiButtonRef}
              variant="ghost"
              size="icon"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-5 w-5" />
            </Button>
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 left-0">
                <EmojiPickerComponent onEmojiSelect={handleEmojiSelect} />
              </div>
            )}
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowGifSearch(!showGifSearch)}
            >
              <Image className="h-5 w-5" />
            </Button>
            {showGifSearch && (
              <div className="absolute bottom-full mb-2 left-0">
                <GifSearchComponent onGifSelect={handleGifSelect} />
              </div>
            )}
          </div>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage}>
            <Send className="h-5 w-5 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
});

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser, reactions, onReact, currentUserId }) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const handleReact = (emoji: string) => {
    console.log('Reacting with:', emoji);
    onReact(emoji);
    setShowReactionPicker(false);
  };

  const formatReactions = (reactions: { [userId: string]: string }) => {
    const emojiCounts: { [emoji: string]: number } = {};
    Object.values(reactions).forEach(emoji => {
      emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
    });
    return Object.entries(emojiCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([emoji, count]) => ({ emoji, count }));
  };

  const userReaction = reactions[currentUserId];
  const formattedReactions = formatReactions(reactions);

  return (
    <div className={`mb-4 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
      <div className="relative inline-block">
      <div 
          className={`rounded-lg px-4 py-2 max-w-[70%] inline-block ${
            isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}
          onClick={() => setShowReactionPicker(!showReactionPicker)}
        >
          {isGifMessage(message) ? ( // Pass the entire message object
            <img src={message.gifUrl} alt="GIF" className="max-w-full h-auto rounded" />
          ) : (
            <p className="text-sm">{message.content}</p>
          )}
        </div>

        {formattedReactions.length > 0 && (
          <div className="absolute -bottom-6 right-0 bg-background shadow-sm rounded-full px-2 py-1 flex space-x-1 items-center text-xs z-10">
            {formattedReactions.map(({ emoji, count }, index) => (
              <span key={index} className="flex items-center">
                {emoji}{count > 1 && <span className="ml-1">{count}</span>}
              </span>
            ))}
          </div>
        )}

        {showReactionPicker && (
          <div className="absolute left-0 -top-10 bg-background shadow-md rounded-full p-1 flex space-x-1 z-20">
            {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className={`hover:bg-muted rounded-full p-1 ${userReaction === emoji ? 'bg-muted' : ''}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsChatWindow;