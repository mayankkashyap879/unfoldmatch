// server/src/controllers/profileController.ts

import { Response } from 'express';
import { AuthenticatedRequest } from '../types/customTypes';
import { getUserProfile, updateUserProfile } from '../services/profileService';
import { ProfileUpdateData } from '../types/profile';

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await getUserProfile(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const updateData: ProfileUpdateData = req.body;
    const user = await updateUserProfile(req.user.userId, updateData);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};