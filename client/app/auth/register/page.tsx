// client/app/auth/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../components/AuthProvider';
import { RegisterForm } from '../../../components/Auth/RegisterForm'

export default function Register() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, login, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        router.push('/profile');
      } else {
        setIsLoading(false);
      }
    }
  }, [user, router, authLoading]);

  const handleSubmit = async (username: string, email: string, password: string) => {
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

  if (isLoading || authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <RegisterForm onSubmit={handleSubmit} error={error} />
        <div className="text-sm text-center">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}