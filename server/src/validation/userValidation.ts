// server/validation/userValidation.ts

import { GenderType, UserPurpose, GENDER_TYPES, USER_PURPOSES } from '../constants/modelEnums';

type Validator<T> = {
  validator: (value: T) => boolean;
  message: string;
};

export const userValidationSchema = {
  username: {
    validate: {
      validator: (value: string) => value.length >= 3 && value.length <= 30,
      message: 'Username must be between 3 and 30 characters'
    } as Validator<string>
  },
  email: {
    validate: {
      validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'Invalid email format'
    } as Validator<string>
  },
  password: {
    validate: {
      validator: (value: string) => value.length >= 6,
      message: 'Password must be at least 6 characters long'
    } as Validator<string>
  },
  age: {
    validate: {
      validator: (value: number) => value >= 18 && value <= 100,
      message: 'Age must be between 18 and 100'
    } as Validator<number>
  },
  gender: {
    validate: {
      validator: (value: GenderType) => GENDER_TYPES.includes(value),
      message: 'Invalid gender'
    } as Validator<GenderType>
  },
  purpose: {
    validate: {
      validator: (value: UserPurpose) => USER_PURPOSES.includes(value),
      message: 'Invalid purpose'
    } as Validator<UserPurpose>
  },
  bio: {
    validate: {
      validator: (value: string | undefined) => !value || value.length <= 500,
      message: 'Bio must not exceed 500 characters'
    } as Validator<string | undefined>
  }
};

export type UserValidationSchema = typeof userValidationSchema;