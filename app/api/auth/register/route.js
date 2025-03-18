import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { User } from '@/lib/db/models';
import { createAuthCode, normalizePhoneNumber } from '@/lib/utils/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, identifierType = 'email', name } = body;

    if (!identifier || !name) {
      return NextResponse.json(
        { error: 'Name and email/phone are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Check if user exists
    const query = identifierType === 'email' 
      ? { email: identifier.toLowerCase() }
      : { phone: normalizePhoneNumber(identifier) };
    
    const existingUser = await User.findOne(query);
    
    if (existingUser) {
      // User exists, but we don't want to reveal this for security reasons
      // Instead, we'll create a new auth code anyway
      const { code } = await createAuthCode(identifier, identifierType, name);
      
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
    const { user, code } = await createAuthCode(identifier, identifierType, name);

    // In production, we would send the code via email or SMS here
    console.log(`Auth code for new user ${name} (${identifier}): ${code}`);

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
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}