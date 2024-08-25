// server/services/messageService.ts

import { Message, IMessage } from '../models/Message';

export const getMessagesByMatchId = async (matchId: string): Promise<IMessage[]> => {
  return Message.find({ matchId }).sort({ timestamp: 1 });
};