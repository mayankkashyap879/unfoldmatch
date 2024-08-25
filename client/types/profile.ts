// types/profile.ts

export interface Profile {
    bio: string;
    interests: string[];
    purpose: string;
    age: number;
    gender: string;
    searchGlobally: boolean;
    country: string;
    personalityType: string;
    preferences: {
      ageRange: {
        min: number;
        max: number;
      };
      genderPreference: string[];
    };
  }
  
  export interface ProfileFormProps {
    profile: Profile;
    onSubmit: (updatedProfile: Profile) => Promise<void>;
  }