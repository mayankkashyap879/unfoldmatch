// app/auth/login/page.tsx
'use client';

import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm'
import { useLogin } from '@/hooks/useLogin';
import { useAuthRedirect } from '@/utils/authUtils';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function Login() {
  const { loginUser, error } = useLogin();
  const { isLoading } = useAuthRedirect('/profile');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthLayout title="Sign in to your account">
      <LoginForm onSubmit={loginUser} error={error} />
      <div className="text-sm text-center">
        Don't have an account?{' '}
        <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
          Register
        </Link>
      </div>
    </AuthLayout>
  );
}