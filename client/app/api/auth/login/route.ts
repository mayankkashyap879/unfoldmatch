// client/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (email === 'user@example.com' && password === 'password') {
    return NextResponse.json({ token: 'dummy_token' });
  }
  
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}