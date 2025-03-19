import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { Incident, Service, Alert } from '@/lib/db/models';
import { cookies } from 'next/headers';

// GET handler to fetch incidents
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
    const limit = parseInt(searchParams.get('limit') || '20');
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
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (severity) {
      query.severity = severity;
    }
    
    if (serviceId) {
      query.services = serviceId;
    } else {
      // Only show incidents for services the user has access to
      query.services = { $in: serviceIds };
    }
    
    // Fetch incidents with pagination
    const skip = (page - 1) * limit;
    
    const incidents = await Incident.find(query)
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('services', 'name url status')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    
    // Get total count for pagination
    const total = await Incident.countDocuments(query);
    
    return NextResponse.json({
      incidents,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}

// POST handler to create a new incident
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
    const { title, description, services, severity, alertIds } = data;
    
    if (!title || !services || !services.length) {
      return NextResponse.json(
        { error: 'Title and at least one service are required' },
        { status: 400 }
      );
    }
    
    // Check if user has access to all services
    for (const serviceId of services) {
      const service = await Service.findById(serviceId);
      
      if (!service) {
        return NextResponse.json(
          { error: `Service with ID ${serviceId} not found` },
          { status: 404 }
        );
      }
      
      const hasAccess = 
        service.createdBy.toString() === userId ||
        (service.teamId && session.teams && session.teams.includes(service.teamId.toString()));
      
      if (!hasAccess) {
        return NextResponse.json(
          { error: `Access denied to service with ID ${serviceId}` },
          { status: 403 }
        );
      }
    }
    
    // Create the incident
    const incident = await Incident.create({
      title,
      description,
      services,
      severity: severity || 'minor',
      createdBy: userId,
      updates: [{
        message: 'Incident created',
        status: 'investigating',
        createdBy: userId
      }]
    });
    
    // If alert IDs were provided, link them to this incident
    if (alertIds && alertIds.length) {
      await Alert.updateMany(
        { _id: { $in: alertIds } },
        { incidentId: incident._id }
      );
    }
    
    return NextResponse.json({
      success: true,
      incident
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json(
      { error: 'Failed to create incident' },
      { status: 500 }
    );
  }
}