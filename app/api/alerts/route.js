import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { Alert, Service } from '@/lib/db/models';
import { cookies } from 'next/headers';

// GET handler to fetch alerts
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
    const userId = session.userId;
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const serviceId = searchParams.get('serviceId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    
    // Get services the user has access to
    const userServices = await Service.find({
      $or: [
        { createdBy: userId },
        { teamId: { $in: session.teams || [] } }
      ]
    }).select('_id');
    
    const serviceIds = userServices.map(service => service._id);
    
    // Build query
    const query = { serviceId: { $in: serviceIds } };
    
    if (status) {
      query.status = status;
    }
    
    if (severity) {
      query.severity = severity;
    }
    
    if (serviceId) {
      query.serviceId = serviceId;
    }
    
    // Fetch alerts with pagination
    const skip = (page - 1) * limit;
    
    const alerts = await Alert.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('serviceId', 'name url')
      .populate('acknowledgedBy', 'name email')
      .populate('resolvedBy', 'name email');
    
    // Get total count for pagination
    const total = await Alert.countDocuments(query);
    
    return NextResponse.json({
      alerts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}