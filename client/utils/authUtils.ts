// client/utils/authUtils.ts

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export const useAuthRedirect = (redirectPath: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        router.push(redirectPath);
      } else {
        setIsLoading(false);
      }
    }
  }, [user, router, authLoading, redirectPath]);

  return { isLoading: isLoading || authLoading };
};