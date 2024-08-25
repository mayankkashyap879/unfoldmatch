// server/utils/validation.ts

interface RegistrationInput {
  username: string;
  email: string;
  password: string;
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

  return errors;
};