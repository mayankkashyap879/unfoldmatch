// client/app/api/profile/route.ts
import { NextResponse } from 'next/server';

const mockProfile = {
  id: '1',
  username: 'johndoe',
  email: 'john@example.com',
  bio: 'I love hiking and photography',
  interests: ['hiking', 'photography', 'travel'],
  relationshipGoals: 'longTerm',
};

export async function GET() {
  return NextResponse.json(mockProfile);
}

export async function PUT(request: Request) {
  const updatedProfile = await request.json();
  const newProfile = { ...mockProfile, ...updatedProfile };
  
  return NextResponse.json(newProfile);
}