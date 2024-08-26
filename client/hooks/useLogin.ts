// client/hooks/useLogin.ts

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export const useLogin = () => {
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const loginUser = async (identifier: string, password: string) => {
    setError('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        login(data.token, {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username
        });
        router.push('/profile');
      } else {
        setError(`Login failed: ${data.message}`);
      }
    } catch (error) {
      setError(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return { loginUser, error };
};