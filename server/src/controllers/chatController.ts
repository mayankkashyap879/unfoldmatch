// server/controllers/chatController.ts
import { Request, Response } from 'express';
import { getUserMatches, createFriendshipRequest, handleFriendshipResponse } from '../services/matchService';
import { getMessagesByMatchId } from '../services/messageService';
import { Match } from '../models/Match'; // Add this import
import { CHAT_MILESTONE } from '../config/constants'; // Add this import

export const getMatches = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const matches = await getUserMatches(req.user.userId);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching matches' });
  }
};

// server/controllers/chatController.ts
export const getMatchData = async (req: Request, res: Response) => {
  try {
    const matchId = req.params.matchId;
    console.log('Fetching match data for ID:', matchId);
    const match = await Match.findById(matchId);
    if (!match) {
      console.log('Match not found for ID:', matchId);
      return res.status(404).json({ message: 'Match not found' });
    }

    const messages = await getMessagesByMatchId(matchId);
    const canRequestFriendship = match.messageCount >= CHAT_MILESTONE;

    console.log('Successfully fetched match data for ID:', matchId);
    res.json({
      match: match.toObject(),
      messages,
      canRequestFriendship
    });
  } catch (error) {
    console.error('Error fetching match data:', error);
    res.status(500).json({ message: 'Error fetching match data' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await getMessagesByMatchId(req.params.matchId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

export const requestFriendship = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const match = await createFriendshipRequest(req.params.matchId, req.user.userId);
    res.json(match);
  } catch (error) {
    res.status(400).json({ message: 'Error requesting friendship' });
  }
};

export const respondToFriendship = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const match = await handleFriendshipResponse(req.params.matchId, req.user.userId, req.body.accept);
    res.json(match);
  } catch (error) {
    res.status(400).json({ message: 'Error responding to friendship request' });
  }
};