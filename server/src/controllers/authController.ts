// server/controllers/authController.ts

import { Request, Response } from 'express';
import { validateRegistrationInput } from '../utils/validation';
import { 
  registerUserService, 
  loginUserService, 
  resetPasswordService, 
  verifyUserService 
} from '../services/authService';

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, gender, age, purpose } = req.body;
    
    const validationErrors = validateRegistrationInput({ username, email, password, gender, age, purpose });
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const result = await registerUserService(username, email, password, gender, age, purpose);
    res.status(201).json(result);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    
    if (!identifier || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const result = await loginUserService(identifier, password);
    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    await resetPasswordService(email, newPassword);
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

export const verifyUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const user = await verifyUserService(req.user.userId);
    res.json({ user });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};