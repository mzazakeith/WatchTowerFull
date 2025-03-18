import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');
    
    // No session cookie found
    if (!sessionCookie) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }
    
    try {
      // Parse session data
      const session = JSON.parse(sessionCookie.value);
      
      // Return user data
      return NextResponse.json(
        { 
          authenticated: true,
          user: {
            id: session.userId,
            name: session.name,
            email: session.email,
            phone: session.phone,
            role: session.role,
            teams: session.teams,
            primaryTeam: session.primaryTeam
          }
        },
        { status: 200 }
      );
    } catch (parseError) {
      // Invalid session cookie
      console.error('Invalid session cookie:', parseError);
      
      // Clear the invalid cookie
      cookieStore.set('session', '', {
        path: '/',
        expires: new Date(0),
        maxAge: 0
      });
      
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}