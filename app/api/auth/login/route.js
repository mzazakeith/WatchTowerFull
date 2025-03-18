import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { User } from '@/lib/db/models';
import { createAuthCode } from '@/lib/utils/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, identifierType = 'email' } = body;

    if (!identifier) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Create auth code for the user
    const { user, code } = await createAuthCode(identifier, identifierType);

    // In production, we would send the code via email or SMS here
    console.log(`Auth code for ${identifierType === 'email' ? 'email' : 'phone'} ${identifier}: ${code}`);

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
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}