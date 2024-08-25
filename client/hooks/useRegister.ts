// hooks/useRegister.ts

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export const useRegister = () => {
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const register = async (username: string, email: string, password: string) => {
    setError('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        login(data.token, {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username
        });
        router.push('/profile');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return { register, error };
};