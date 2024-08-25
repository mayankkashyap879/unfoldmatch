// server/services/authService.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { JWT_SECRET, JWT_EXPIRATION } from '../config/constants';

export function verifyAndDecodeToken(token: string): { userId: string } {
  return jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(candidatePassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, hashedPassword);
}

export const registerUserService = async (username: string, email: string, password: string) => {
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const user = new User({ username, email, password });
  await user.save();

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
  return { token, user: { id: user._id, username: user.username, email: user.email } };
};

export const loginUserService = async (identifier: string, password: string) => {
  const user = await User.findOne({
    $or: [{ username: identifier }, { email: identifier }]
  });

  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
  return { token, user: { id: user._id, username: user.username, email: user.email } };
};

export const resetPasswordService = async (email: string, newPassword: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  user.password = newPassword;
  await user.save();
};

export const verifyUserService = async (userId: string) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};