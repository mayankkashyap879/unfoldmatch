// client/app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import ProfileForm from '../../components/Profile/ProfileForm';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
          headers: {
            'x-auth-token': localStorage.getItem('token') || ''
          }
        });
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          console.error('Failed to fetch profile');
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleProfileUpdate = async (updatedProfile) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token') || ''
        },
        body: JSON.stringify(updatedProfile),
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to update profile: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Your Profile</h1>
        {profile ? (
          <ProfileForm profile={profile} onSubmit={handleProfileUpdate} />
        ) : (
          <div>Loading profile...</div>
        )}
      </div>
    </ProtectedRoute>
  );
}