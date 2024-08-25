// server/services/profileService.ts

import { User, IUser } from '../models/User';
import { ProfileUpdateData } from '../types/profile';
import { processUpdateData } from '../utils/profileUtils';

export const getUserProfile = async (userId: string): Promise<IUser | null> => {
  return User.findById(userId).select('-password');
};

export const updateUserProfile = async (userId: string, updateData: ProfileUpdateData): Promise<IUser | null> => {
  const processedData = processUpdateData(updateData);
  return User.findByIdAndUpdate(
    userId,
    processedData,
    { new: true, runValidators: true }
  ).select('-password');
};