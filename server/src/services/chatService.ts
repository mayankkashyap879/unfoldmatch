// server/services/chatService.ts

import { Server as SocketIOServer } from 'socket.io';
import { IMessage } from '../types/chat';
import { saveMessage, updateMatchMessageCount, findMatchWithUsers, updateMatchStatus } from '../db/chatOperations';
import { canRequestFriendship, getOtherUserId } from '../utils/chatUtils';

export const handleSendMessage = async (io: SocketIOServer, messageData: Partial<IMessage>) => {
  try {
    const newMessage = await saveMessage(messageData);
    const match = await updateMatchMessageCount(messageData.matchId!);

    if (match) {
      const canRequest = canRequestFriendship(match);

      io.to(messageData.matchId!.toString()).emit('match update', {
        matchId: match._id,
        messageCount: match.messageCount,
        canRequestFriendship: canRequest
      });

      io.to(messageData.matchId!.toString()).emit('new message', {
        ...newMessage.toObject(),
        messageCount: match.messageCount,
        canRequestFriendship: canRequest
      });
    }
  } catch (error) {
    console.error('Error saving/sending message:', error);
  }
};

export const handleRequestFriendship = async (io: SocketIOServer, { matchId, requesterId }: { matchId: string, requesterId: string }) => {
    try {
      const match = await findMatchWithUsers(matchId);
      if (match) {
        const receiverId = getOtherUserId(match, requesterId);
        if (receiverId) {
          io.to(matchId).emit('friendship requested', {
            matchId: match._id,
            requesterId,
            receiverId
          });
        }
      }
    } catch (error) {
      console.error('Error handling friendship request:', error);
    }
  };

export const handleFriendshipResponse = async (io: SocketIOServer, { matchId, accepted }: { matchId: string, accepted: boolean }) => {
  try {
    const match = await updateMatchStatus(matchId, accepted ? 'friends' : 'rejected');
    if (match) {
      io.to(matchId).emit('friendship status updated', {
        matchId: match._id,
        status: match.status
      });
    }
  } catch (error) {
    console.error('Error handling friendship response:', error);
  }
};