// client/app/api/profile/route.ts
import { NextResponse } from 'next/server';

// This is a mock profile. In a real application, you'd fetch this from your database.
let mockProfile = {
  id: '1',
  username: 'johndoe',
  email: 'john@example.com',
  bio: 'I love hiking and photography',
  interests: ['hiking', 'photography', 'travel'],
  relationshipGoals: 'longTerm',
};

export async function GET() {
  // In a real application, you'd fetch the profile from your database here
  return NextResponse.json(mockProfile);
}

export async function PUT(request: Request) {
  const body = await request.json();
  
  // In a real application, you'd update the profile in your database here
  mockProfile = { ...mockProfile, ...body };
  
  return NextResponse.json(mockProfile);
}