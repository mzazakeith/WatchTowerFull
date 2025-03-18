import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { User } from '@/lib/db/models';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse session
    const session = JSON.parse(sessionCookie.value);
    
    // Connect to database
    await connectToDatabase();
    
    // Find user by ID
    const user = await User.findById(session.userId).select('-authCode -password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        teams: user.teams,
        primaryTeam: user.primaryTeam,
        preferences: user.preferences || {}
      }
    });
  } catch (error) {
    console.error('Get account settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Get session cookie
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse session
    const session = JSON.parse(sessionCookie.value);
    
    // Get request body
    const body = await request.json();
    const { name, email } = body;
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // If email is being changed, check if it's already in use
    if (email && email !== session.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      session.userId,
      {
        name,
        ...(email && { email: email.toLowerCase() }),
      },
      { new: true }
    ).select('-authCode -password');
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update session cookie with new user info
    const updatedSession = {
      ...session,
      name: updatedUser.name,
      email: updatedUser.email,
    };
    
    cookieStore.set('session', JSON.stringify(updatedSession), {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'strict'
    });
    
    return NextResponse.json({
      success: true,
      message: 'Account settings updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      }
    });
  } catch (error) {
    console.error('Update account settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 