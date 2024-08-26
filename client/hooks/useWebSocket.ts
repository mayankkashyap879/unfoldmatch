// client/hooks/useWebSocket.ts
import { useContext } from 'react';
import { WebSocketContext } from '@/contexts/WebSocketContext';
import { WebSocketContextType } from '@/types/websocket';

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};