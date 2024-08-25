// server/validation/userValidation.ts

export const userValidationSchema = {
  age: {
    validate: {
      validator: (value: number) => value >= 18 && value <= 100,
      message: 'Age must be between 18 and 100'
    }
  },
  email: {
    validate: {
      validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'Invalid email format'
    }
  },
  bio: {
    validate: {
      validator: (value: string | undefined) => !value || value.length <= 500,
      message: 'Bio must not exceed 500 characters'
    }
  }
};