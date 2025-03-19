import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { Service, Check, Alert } from '@/lib/db/models';
import { checkService } from '@/lib/utils/serviceChecker';
import { generateAlert } from '@/lib/utils/alertManager';
import { cookies } from 'next/headers';

// POST handler to manually trigger a check for a service
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
    const { serviceId } = await request.json();
    
    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch the service
    const service = await Service.findById(serviceId);
    
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
    
    // Perform the service check
    const checkResult = await checkService(service);
    
    // Save the check result to the database
    const check = await Check.create({
      serviceId: service._id,
      status: checkResult.status,
      responseTime: checkResult.responseTime,
      statusCode: checkResult.statusCode,
      responseSize: checkResult.responseSize,
      error: checkResult.error,
      metadata: checkResult.metadata,
      ssl: checkResult.ssl,
    });
    
    // Update the service status and response time
    await Service.findByIdAndUpdate(
      serviceId,
      { 
        status: checkResult.status,
        responseTime: checkResult.responseTime,
        lastCheck: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );
    
    // Generate alert if needed
    if (checkResult.status !== 'healthy' && checkResult.status !== 'pending') {
      const alert = generateAlert(service, checkResult);
      
      if (alert) {
        // Save the alert to the database
        await Alert.create({
          ...alert,
          checkId: check._id
        });
        
        // Log the alert (temporary until notification system is implemented)
        console.log('Alert generated:', alert);
      }
    }
    
    return NextResponse.json({
      success: true,
      check: check,
      status: checkResult.status
    });
  } catch (error) {
    console.error('Error checking service:', error);
    return NextResponse.json(
      { error: 'Failed to check service' },
      { status: 500 }
    );
  }
}