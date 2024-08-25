// server/utils/profileUtils.ts

import { ProfileUpdateData } from '../types/profile';

export const processUpdateData = (data: ProfileUpdateData): Partial<ProfileUpdateData> => {
  const updateData: Partial<ProfileUpdateData> = { ...data };

  // Remove undefined fields
  Object.keys(updateData).forEach(key => {
    if (updateData[key as keyof ProfileUpdateData] === undefined) {
      delete updateData[key as keyof ProfileUpdateData];
    }
  });

  return updateData;
};