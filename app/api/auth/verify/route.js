import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { User } from '@/lib/db/models';
import { verifyAuthCode, createUserSession } from '@/lib/utils/auth';
import { cookies } from 'next/headers';
import { serialize } from 'cookie';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Find the user
    const user = await User.findOne({
      email: email.toLowerCase(),
      'authCode.code': code,
      'authCode.expiresAt': { $gt: new Date() }
    });
    
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
          role: user.role,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 