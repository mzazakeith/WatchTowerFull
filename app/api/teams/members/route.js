import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { Team, User } from '@/lib/db/models';
import { cookies } from 'next/headers';

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
    
    if (!data.teamId || !data.email || !data.role) {
      return NextResponse.json(
        { error: 'Team ID, email and role are required' },
        { status: 400 }
      );
    }
    
    // Find the team
    const team = await Team.findById(data.teamId);
    
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }
    
    // Check if user has admin permission on this team
    const isAdmin = 
      team.owner.toString() === session.userId ||
      team.members.some(m => 
        m.userId.toString() === session.userId && 
        m.role === 'admin'
      );
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only team admins can add members' },
        { status: 403 }
      );
    }
    
    // Find the user to add by email
    const userToAdd = await User.findOne({ email: data.email });
    
    if (!userToAdd) {
      return NextResponse.json(
        { error: 'User not found with the provided email' },
        { status: 404 }
      );
    }
    
    // Check if user is already a member
    const isAlreadyMember = team.members.some(
      m => m.userId.toString() === userToAdd._id.toString()
    );
    
    if (isAlreadyMember) {
      return NextResponse.json(
        { error: 'User is already a member of this team' },
        { status: 400 }
      );
    }
    
    // Add the new member
    team.members.push({
      userId: userToAdd._id,
      role: data.role,
      addedAt: new Date()
    });
    
    await team.save();
    
    return NextResponse.json({
      success: true,
      message: `${userToAdd.name} has been added to the team`,
      member: {
        userId: userToAdd._id,
        name: userToAdd.name,
        email: userToAdd.email,
        role: data.role
      }
    });
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    );
  }
} 