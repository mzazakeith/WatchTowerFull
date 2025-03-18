import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { User } from '@/lib/db/models';
import { createAuthCode } from '@/lib/utils/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      // User exists, but we don't want to reveal this for security reasons
      // Instead, we'll create a new auth code anyway
      const { code } = await createAuthCode(email, name);
      
      return NextResponse.json(
        { 
          success: true,
          message: 'Verification code sent successfully',
          debug: process.env.NODE_ENV === 'development' ? { code } : undefined
        },
        { status: 200 }
      );
    }
    
    // Create a new user with auth code
    const { user, code } = await createAuthCode(email, name);

    // In production, we would send the code via email here
    console.log(`Auth code for new user ${name} (${email}): ${code}`);

    return NextResponse.json(
      { 
        success: true,
        message: 'User registered successfully. Verification code sent.',
        debug: process.env.NODE_ENV === 'development' ? { code } : undefined
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 