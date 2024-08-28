// client/components/chat/MessageInput.tsx
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { MessageInputProps } from '@/types/chat';

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }: MessageInputProps) => {
  const [newMessage, setNewMessage] = React.useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

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

  return (
    <div className="p-2 flex">
      <Input
        value={newMessage}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        className="flex-1 mr-2"
      />
      <Button onClick={handleSendMessage} size="icon"><Send className="h-4 w-4" /></Button>
    </div>
  );
};

export default MessageInput;