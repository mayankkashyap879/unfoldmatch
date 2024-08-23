// client/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  // Here, you would typically validate the credentials against your backend
  // For this example, we're just checking for a dummy email/password
  if (email === 'user@example.com' && password === 'password') {
    // In a real app, you'd generate a JWT here
    const token = 'dummy_token';
    return NextResponse.json({ token });
  } else {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
}