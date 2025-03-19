import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { Service, Check } from '@/lib/db/models';
import { cookies } from 'next/headers';

// GET handler to fetch checks for a specific service
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
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
    
    // Fetch the service to check access
    const service = await Service.findById(id);
    
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }
    
    // Check if user has access to this service
    const hasAccess = 
      service.createdBy.toString() === session.userId ||
      (service.teamId && session.teams && session.teams.includes(service.teamId.toString()));
    
    if (!hasAccess && session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    
    // Fetch checks with pagination
    const skip = (page - 1) * limit;
    
    const checks = await Check.find({ serviceId: id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Check.countDocuments({ serviceId: id });
    
    return NextResponse.json({
      checks,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching service checks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service checks' },
      { status: 500 }
    );
  }
}