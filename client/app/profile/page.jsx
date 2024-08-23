'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import ProfileForm from '../../components/Profile/ProfileForm';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
        headers: {
          'x-auth-token': localStorage.getItem('token') || ''
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched profile:', data); // Log fetched profile
        setProfile(data);
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
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
        console.log('Updated profile:', data); // Log updated profile
        setProfile(data);
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
        fetchProfile(); // Fetch the profile again to ensure we have the latest data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

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
        {/* <h1 className="text-3xl font-bold mb-4">Your Profile</h1> */}
        {profile ? (
          <ProfileForm profile={profile} onSubmit={handleProfileUpdate} />
        ) : (
          <div>No profile data available. Please try refreshing the page.</div>
        )}
      </div>
    </ProtectedRoute>
  );
}