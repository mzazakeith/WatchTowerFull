import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { Service } from '@/lib/db/models';
import { cookies } from 'next/headers';

// GET handler to fetch all services for the current user
export async function GET() {
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
    const userId = session.userId;
    
    // Fetch services created by the user or shared with their teams
    const services = await Service.find({
      $or: [
        { createdBy: userId },
        { teamId: { $in: session.teams || [] } }
      ]
    }).sort({ createdAt: -1 });
    
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST handler to create a new service
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
    const userId = session.userId;
    
    // Parse request body
    const data = await request.json();
    
    // Create new service
    const service = await Service.create({
      ...data,
      createdBy: userId,
      status: 'pending', // Initial status before first check
    });
    
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {});
      
      return NextResponse.json(
        { error: 'Validation failed', validationErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}