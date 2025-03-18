import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = cookies();
    
    // Clear the session cookie
    cookieStore.set('session', '', {
      path: '/',
      expires: new Date(0),
      maxAge: 0
    });

    return NextResponse.json(
      { 
        success: true,
        message: 'Logged out successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 