import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { User } from '@/lib/db/models';
import { createAuthCode } from '@/lib/utils/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Create auth code for the user
    const { user, code } = await createAuthCode(email);

    // In production, we would send the code via email here
    console.log(`Auth code for ${email}: ${code}`);

    return NextResponse.json(
      { 
        success: true,
        message: 'Verification code sent successfully',
        // Don't return the code in production, this is just for development
        debug: process.env.NODE_ENV === 'development' ? { code } : undefined
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 