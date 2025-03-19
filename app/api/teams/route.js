import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { Team } from '@/lib/db/models';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    await connectToDatabase();
    
    // Get user session
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const session = JSON.parse(sessionCookie.value);
    
    // Fetch teams the user is a member of
    const teams = await Team.find({
      $or: [
        { owner: session.userId },
        { 'members.userId': session.userId }
      ]
    }).populate({
      path: 'owner',
      select: 'name email'
    }).populate({
      path: 'members.userId',
      select: 'name email'
    });
    
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    
    // Get user session
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const session = JSON.parse(sessionCookie.value);
    
    // Parse request body
    const data = await request.json();
    
    // Create new team
    const team = await Team.create({
      name: data.name,
      description: data.description,
      owner: session.userId,
      members: [
        {
          userId: session.userId,
          role: 'admin',
          addedAt: new Date()
        }
      ],
      settings: data.settings || {}
    });
    
    return NextResponse.json({
      success: true,
      team
    }, {
      status: 201
    });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
} 