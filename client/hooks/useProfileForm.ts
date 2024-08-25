import { useState, useCallback, useEffect } from 'react';
import { Profile } from '@/types/profile';
import { DEFAULT_MIN_AGE, DEFAULT_MAX_AGE } from '@/utils/constants';

export const useProfileForm = (initialProfile: Profile) => {
  const [formData, setFormData] = useState<Profile>(() => ({
    bio: initialProfile?.bio || '',
    interests: Array.isArray(initialProfile?.interests) ? initialProfile.interests : [initialProfile?.interests || ''],
    purpose: initialProfile?.purpose || '',
    age: initialProfile?.age || 18,
    gender: initialProfile?.gender || '',
    searchGlobally: initialProfile?.searchGlobally ?? true,
    country: initialProfile?.country || '',
    personalityType: initialProfile?.personalityType || '',
    preferences: {
      ageRange: initialProfile?.preferences?.ageRange 
        ? {
            min: Number(initialProfile.preferences.ageRange.min) || DEFAULT_MIN_AGE,
            max: Number(initialProfile.preferences.ageRange.max) || DEFAULT_MAX_AGE
          }
        : { min: DEFAULT_MIN_AGE, max: DEFAULT_MAX_AGE },
      genderPreference: Array.isArray(initialProfile?.preferences?.genderPreference)
        ? initialProfile.preferences.genderPreference
        : [initialProfile?.preferences?.genderPreference || ''],
    }
  }));

  const updateFormData = useCallback((newProfile: Partial<Profile>) => {
    if (newProfile) {
      setFormData(prevData => ({
        ...prevData,
        ...newProfile,
        preferences: {
          ...prevData.preferences,
          ...newProfile.preferences,
          ageRange: newProfile.preferences?.ageRange 
            ? {
                min: Number(newProfile.preferences.ageRange.min) || DEFAULT_MIN_AGE,
                max: Number(newProfile.preferences.ageRange.max) || DEFAULT_MAX_AGE
              }
            : prevData.preferences.ageRange,
          genderPreference: Array.isArray(newProfile.preferences?.genderPreference)
            ? newProfile.preferences.genderPreference
            : [newProfile.preferences?.genderPreference || ''],
        }
      }));
    }
  }, []);

  useEffect(() => {
    updateFormData(initialProfile);
  }, [initialProfile, updateFormData]);

  const handleChange = (name: keyof Profile, value: any) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handlePreferenceChange = (name: keyof Profile['preferences'], value: any) => {
    setFormData(prevData => {
      if (name === 'ageRange') {
        const sortedValues = (value as number[])
          .map(v => Number(v) || DEFAULT_MIN_AGE)
          .sort((a, b) => a - b);
        return {
          ...prevData,
          preferences: {
            ...prevData.preferences,
            [name]: { min: sortedValues[0], max: sortedValues[1] }
          }
        };
      }
      if (name === 'genderPreference') {
        const newValue = Array.isArray(value) ? value : [value];
        return {
          ...prevData,
          preferences: {
            ...prevData.preferences,
            [name]: newValue
          }
        };
      }
      return {
        ...prevData,
        preferences: {
          ...prevData.preferences,
          [name]: value
        }
      };
    });
  };

  return { formData, handleChange, handlePreferenceChange };
};