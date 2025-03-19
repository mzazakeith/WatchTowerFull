import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { Alert, Service } from '@/lib/db/models';
import { cookies } from 'next/headers';

// PUT handler to update an alert (acknowledge or resolve)
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
    const { status } = await request.json();
    
    if (!status || !['acknowledged', 'resolved', 'closed'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (acknowledged, resolved, or closed)' },
        { status: 400 }
      );
    }
    
    // Find the alert
    const alert = await Alert.findById(id);
    
    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }
    
    // Check if user has access to the service this alert belongs to
    const service = await Service.findById(alert.serviceId);
    
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }
    
    const hasAccess = 
      service.createdBy.toString() === userId ||
      (service.teamId && session.teams && session.teams.includes(service.teamId.toString()));
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Update the alert status
    const updateData = { status };
    
    if (status === 'acknowledged') {
      updateData.acknowledgedBy = userId;
      updateData.acknowledgedAt = new Date();
    } else if (status === 'resolved') {
      updateData.resolvedBy = userId;
      updateData.resolvedAt = new Date();
    }
    
    const updatedAlert = await Alert.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('serviceId', 'name url');
    
    return NextResponse.json({
      success: true,
      alert: updatedAlert
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}