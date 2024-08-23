// client/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { username, email, password } = await request.json();
  
  // Simulate registration process
  const token = 'dummy_registration_token';

  return NextResponse.json({ token });
}