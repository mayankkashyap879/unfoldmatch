// server/utils/validation.ts

import { GenderType, UserPurpose, GENDER_TYPES, USER_PURPOSES } from '../constants/modelEnums';

interface RegistrationInput {
  username: string;
  email: string;
  password: string;
  gender: GenderType;
  age: number;
  purpose: UserPurpose;
}

export const validateRegistrationInput = (input: RegistrationInput): string[] => {
  const errors: string[] = [];

  if (!input.username || input.username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (!input.email || !/\S+@\S+\.\S+/.test(input.email)) {
    errors.push('Email is invalid');
  }

  if (!input.password || input.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!input.gender || !GENDER_TYPES.includes(input.gender)) {
    errors.push('Gender is invalid');
  }

  if (!input.age || input.age < 18 || input.age > 100) {
    errors.push('Age must be between 18 and 100');
  }

  if (!input.purpose || !USER_PURPOSES.includes(input.purpose)) {
    errors.push('Purpose is invalid');
  }

  return errors;
};

export const validateLoginInput = (identifier: string, password: string): string[] => {
  const errors: string[] = [];

  if (!identifier) {
    errors.push('Username or email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  return errors;
};

export const validatePasswordResetInput = (email: string, newPassword: string): string[] => {
  const errors: string[] = [];

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    errors.push('Email is invalid');
  }

  if (!newPassword || newPassword.length < 6) {
    errors.push('New password must be at least 6 characters long');
  }

  return errors;
};