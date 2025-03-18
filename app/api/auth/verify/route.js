import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { User } from '@/lib/db/models';
import { verifyAuthCode, createUserSession, normalizePhoneNumber } from '@/lib/utils/auth';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, identifierType = 'email', code } = body;

    if (!identifier || !code) {
      return NextResponse.json(
        { error: 'Identifier and verification code are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Find the user
    const query = {
      'authCode.code': code,
      'authCode.expiresAt': { $gt: new Date() }
    };
    
    if (identifierType === 'email') {
      query.email = identifier.toLowerCase();
    } else {
      query.phone = normalizePhoneNumber(identifier);
    }
    
    const user = await User.findOne(query);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 401 }
      );
    }
    
    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      );
    }
    
    // Clear auth code after successful verification
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          'authCode.code': null,
          'authCode.expiresAt': null,
          'authCode.attempts': 0,
          lastLogin: new Date(),
        },
      }
    );
    
    // Create user session
    const session = createUserSession(user);
    
    // Set session cookie
    const cookieStore = cookies();
    cookieStore.set('session', JSON.stringify(session), {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'strict'
    });

    return NextResponse.json(
      { 
        success: true,
        message: 'Authentication successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}