// server/constants/modelEnums.ts
export const MATCH_STATUSES = ['active', 'pending_friendship', 'friends', 'rejected', 'expired'] as const;
export type MatchStatus = typeof MATCH_STATUSES[number];

export const USER_PURPOSES = ['friendship', 'casual', 'longTerm'] as const;
export type UserPurpose = typeof USER_PURPOSES[number];

export const GENDER_TYPES = ['male', 'female', 'non-binary', 'other'] as const;
export type GenderType = typeof GENDER_TYPES[number];