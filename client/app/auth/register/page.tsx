// app/auth/register/page.tsx
'use client';

import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm'
import { useRegister } from '@/hooks/useRegister';
import { useAuthRedirect } from '@/utils/authUtils';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function Register() {
  const { register, error } = useRegister();
  const { isLoading } = useAuthRedirect('/profile');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthLayout title="Create your account">
      <RegisterForm onSubmit={register} error={error} />
      <div className="text-sm text-center">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Log in
        </Link>
      </div>
    </AuthLayout>
  );
}