// client/utils/constants.ts

export const DEFAULT_MIN_AGE = 18;
export const DEFAULT_MAX_AGE = 50;

export const countries = ["United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Japan", "Brazil", "India", "China"];

export const personalityTypes = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

export const CHAT_MILESTONE = 10;

// New constants
export const GENDER_TYPES = ['male', 'female', 'non-binary', 'other'] as const;
export const USER_PURPOSES = ['friendship', 'casual', 'longTerm'] as const;

// Type definitions
export type GenderType = typeof GENDER_TYPES[number];
export type UserPurpose = typeof USER_PURPOSES[number];