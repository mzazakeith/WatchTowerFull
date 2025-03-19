import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { Incident, Service } from '@/lib/db/models';
import { cookies } from 'next/headers';

// GET handler to fetch a specific incident
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
    
    // Find the incident
    const incident = await Incident.findById(id)
      .populate('services', 'name url status')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('updates.createdBy', 'name email');
    
    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(incident);
  } catch (error) {
    console.error('Error fetching incident:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incident' },
      { status: 500 }
    );
  }
}

// PUT handler to update an incident
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
    const userId = session.userId;
    
    // Parse request body
    const data = await request.json();
    
    // Find the incident
    const incident = await Incident.findById(id);
    
    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }
    
    // Check if user has access to this incident
    const hasAccess = 
      incident.createdBy.toString() === userId ||
      (incident.teamId && session.teams && session.teams.includes(incident.teamId.toString()));
    
    if (!hasAccess && session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Handle status change
    if (data.status && data.status !== incident.status) {
      // Add update to the incident
      incident.updates.push({
        message: data.updateMessage || `Status changed from ${incident.status} to ${data.status}`,
        status: data.status,
        timestamp: new Date(),
        createdBy: userId
      });
      
      // If resolving the incident, set resolvedAt
      if (data.status === 'resolved' && !incident.resolvedAt) {
        incident.resolvedAt = new Date();
      }
    }
    
    // Update fields
    if (data.title) incident.title = data.title;
    if (data.description) incident.description = data.description;
    if (data.severity) incident.severity = data.severity;
    if (data.assignedTo) incident.assignedTo = data.assignedTo;
    if (data.rootCause) incident.rootCause = data.rootCause;
    if (data.resolution) incident.resolution = data.resolution;
    if (data.isPublic !== undefined) incident.isPublic = data.isPublic;
    if (data.impactedAreas) incident.impactedAreas = data.impactedAreas;
    
    // Update status
    if (data.status) incident.status = data.status;
    
    // Save the updated incident
    await incident.save();
    
    // Return the updated incident
    const updatedIncident = await Incident.findById(id)
      .populate('services', 'name url status')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('updates.createdBy', 'name email');
    
    return NextResponse.json({
      success: true,
      incident: updatedIncident
    });
  } catch (error) {
    console.error('Error updating incident:', error);
    return NextResponse.json(
      { error: 'Failed to update incident' },
      { status: 500 }
    );
  }
}

// POST handler to add an update to an incident
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
    const userId = session.userId;
    
    // Parse request body
    const { message, status } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Update message is required' },
        { status: 400 }
      );
    }
    
    // Find the incident
    const incident = await Incident.findById(id);
    
    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }
    
    // Check if user has access to this incident
    const hasAccess = 
      incident.createdBy.toString() === userId ||
      (incident.teamId && session.teams && session.teams.includes(incident.teamId.toString()));
    
    if (!hasAccess && session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Add update to the incident
    const update = {
      message,
      status: status || incident.status,
      timestamp: new Date(),
      createdBy: userId
    };
    
    incident.updates.push(update);
    
    // If status is provided and different, update the incident status
    if (status && status !== incident.status) {
      incident.status = status;
      
      // If resolving the incident, set resolvedAt
      if (status === 'resolved' && !incident.resolvedAt) {
        incident.resolvedAt = new Date();
      }
    }
    
    // Save the updated incident
    await incident.save();
    
    // Return the updated incident
    const updatedIncident = await Incident.findById(id)
      .populate('services', 'name url status')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('updates.createdBy', 'name email');
    
    return NextResponse.json({
      success: true,
      incident: updatedIncident
    });
  } catch (error) {
    console.error('Error adding incident update:', error);
    return NextResponse.json(
      { error: 'Failed to add incident update' },
      { status: 500 }
    );
  }
}