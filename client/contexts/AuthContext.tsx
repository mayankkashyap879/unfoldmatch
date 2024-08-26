// client/context/AuthContext.tsx
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthContextType } from '@/types/auth';
import { setAuthData, clearAuthData, getStoredAuthData } from '@/utils/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (token: string, userData: User) => {
    setAuthData(token, userData);
    setUser(userData);
    router.push('/profile');
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    router.push('/');
  };

  const checkAuth = async (): Promise<boolean> => {
    setIsLoading(true);
    const { token, storedUser } = getStoredAuthData();

    if (!token || !storedUser) {
      setIsLoading(false);
      return false;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setUser(storedUser);
        setIsLoading(false);
        return true;
      } else {
        throw new Error('Token validation failed');
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      logout();
      setIsLoading(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}