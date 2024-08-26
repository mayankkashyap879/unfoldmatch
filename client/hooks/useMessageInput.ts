// client/hooks/useMessageInput.ts
import { useState } from 'react';

export const useMessageInput = (onSendMessage: (message: string) => void) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return {
    newMessage,
    handleInputChange,
    handleKeyPress,
    handleSendMessage
  };
};