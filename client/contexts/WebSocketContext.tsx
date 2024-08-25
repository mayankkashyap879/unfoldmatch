'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { createSocket } from '@/utils/socket';
import { WebSocketContextType } from '@/types/websocket';

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = createSocket();
      setSocket(newSocket);

      newSocket.emit('join', user.id);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  return (
    <WebSocketContext.Provider value={{ socket }}>
      {children}
    </WebSocketContext.Provider>
  );
};