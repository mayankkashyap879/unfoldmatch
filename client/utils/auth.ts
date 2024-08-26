// client/utils/auth.ts
import { User } from '@/types/auth';

export const setAuthData = (token: string, userData: User) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userData));
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getStoredAuthData = () => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  return { token, storedUser: storedUser ? JSON.parse(storedUser) : null };
};