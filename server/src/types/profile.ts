// server/types/profile.ts

export interface ProfileUpdateData {
    bio?: string;
    interests?: string[];
    purpose?: string;
    age?: number;
    gender?: string;
    searchGlobally?: boolean;
    country?: string;
    personalityType?: string;
    preferences?: {
      ageRange?: {
        min?: number;
        max?: number;
      };
      genderPreference?: string[];
    };
  }