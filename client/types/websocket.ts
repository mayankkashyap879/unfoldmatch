// client/types/websocket.ts
import { Socket } from 'socket.io-client';

export interface WebSocketContextType {
  socket: Socket | null;
}