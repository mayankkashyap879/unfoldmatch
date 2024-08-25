// app/dashboard/profile/page.tsx
'use client';

import ProfileForm from '@/components/profile/ProfileForm';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { Loader2 } from "lucide-react";
import { useProfile } from '@/hooks/useProfile';

export default function ProfilePage() {
  const { profile, isLoading, updateProfile } = useProfile();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {profile ? (
          <ProfileForm profile={profile} onSubmit={updateProfile} />
        ) : (
          <div>No profile data available. Please try refreshing the page.</div>
        )}
      </div>
    </ProtectedRoute>
  );
}