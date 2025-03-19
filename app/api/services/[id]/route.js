import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { Service } from '@/lib/db/models';
import { cookies } from 'next/headers';
import { checkService } from '@/lib/utils/serviceChecker';

// GET handler to fetch a specific service
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
    
    // Fetch the service
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
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

// PUT handler to update a service
export async function PUT(request, { params }) {
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
    
    // Parse request body
    const data = await request.json();
    
    // Fetch the service
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
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Update the service
    const updatedService = await Service.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    
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
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a service
export async function DELETE(request, { params }) {
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
    
    // Fetch the service
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
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Delete the service
    await Service.findByIdAndDelete(id);
    
    return NextResponse.json(
      { message: 'Service deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}

// POST handler to manually check a service
export async function POST(request, { params }) {
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
    
    // Fetch the service
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
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Perform service check
    const checkResult = await checkService(service);
    
    // Update service status based on check result
    await Service.findByIdAndUpdate(id, {
      status: checkResult.status,
      lastCheck: checkResult.timestamp,
      responseTime: checkResult.responseTime || 0,
    });
    
    return NextResponse.json(checkResult);
  } catch (error) {
    console.error('Error checking service:', error);
    return NextResponse.json(
      { error: 'Failed to check service' },
      { status: 500 }
    );
  }
}