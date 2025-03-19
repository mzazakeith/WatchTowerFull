import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { Service, Check, Alert } from '@/lib/db/models';
import { checkService } from '@/lib/utils/serviceChecker';
import { generateAlert, shouldCreateNewAlert } from '@/lib/utils/alertManager';

export const maxDuration = 300; // Set max duration to 5 minutes for potentially long-running check operations

// GET handler for running periodic checks on all services
export async function GET(request) {
  try {
    // Validate API key if provided in header
    const apiKey = request.headers.get('x-api-key');
    
    // Optional: Implement API key validation here
    // This is a simple check that can be enhanced with a secure API key stored in environment variables
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId'); // Optional: Check a specific service
    const force = searchParams.get('force') === 'true'; // Force check even if not due
    
    // Find services due for checking
    // A service is due for checking if:
    // 1. It's not paused AND
    // 2. It's been at least 'interval' seconds since the last check (or has never been checked)
    let query = { paused: false };
    
    if (serviceId) {
      query._id = serviceId;
    }
    
    // Get current time minus safety margin
    const now = new Date();
    
    const services = await Service.find(query);
    const results = [];
    const alerts = [];
    
    console.log(`Running checks for ${services.length} services`);
    
    // Process each service sequentially to avoid overwhelming external services
    for (const service of services) {
      try {
        // Get the most recent check for this service
        const latestCheck = await Check.findOne(
          { serviceId: service._id }
        ).sort({ timestamp: -1 });
        
        // Determine if check is due
        const isDue = !latestCheck || 
          (now - new Date(latestCheck.timestamp)) / 1000 >= service.interval;
        
        if (isDue || force) {
          console.log(`Checking service: ${service.name} (${service._id})`);
          
          // Perform the service check
          const checkResult = await checkService(service);
          
          // Save the check result to the database
          const check = await Check.create({
            serviceId: service._id,
            status: checkResult.status,
            responseTime: checkResult.responseTime,
            statusCode: checkResult.metadata?.statusCode,
            responseSize: checkResult.metadata?.responseSize,
            error: checkResult.error,
            metadata: checkResult.metadata,
            ssl: checkResult.ssl,
          });
          
          // Update the service status
          await Service.findByIdAndUpdate(
            service._id,
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
            const alertData = generateAlert(service, checkResult);
            
            if (alertData) {
              // Check if we should create a new alert or update an existing one
              const existingAlerts = await Alert.find({
                serviceId: service._id,
                status: { $in: ['pending', 'acknowledged'] }
              });
              
              if (shouldCreateNewAlert(existingAlerts, alertData)) {
                // Save the alert to the database
                const alert = await Alert.create({
                  ...alertData,
                  checkId: check._id
                });
                
                alerts.push(alert);
              }
            }
          } else if (checkResult.status === 'healthy') {
            // Auto-resolve any pending alerts for this service
            const resolvedAlerts = await Alert.updateMany(
              { 
                serviceId: service._id, 
                status: { $in: ['pending', 'acknowledged'] }
              },
              { 
                status: 'resolved',
                resolvedAt: new Date(),
                // No resolvedBy since this is automatic
              }
            );
            
            if (resolvedAlerts.modifiedCount > 0) {
              console.log(`Auto-resolved ${resolvedAlerts.modifiedCount} alerts for service ${service.name}`);
            }
          }
          
          results.push({
            serviceId: service._id,
            name: service.name,
            status: checkResult.status,
            responseTime: checkResult.responseTime,
            timestamp: check.timestamp
          });
        } else {
          console.log(`Skipping service: ${service.name} - next check in ${service.interval - ((now - new Date(latestCheck.timestamp)) / 1000)} seconds`);
        }
      } catch (serviceError) {
        console.error(`Error checking service ${service.name}:`, serviceError);
        results.push({
          serviceId: service._id,
          name: service.name,
          status: 'error',
          error: serviceError.message
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      checked: results.length,
      skipped: services.length - results.length,
      results,
      alerts: alerts.length > 0 ? alerts : undefined
    });
  } catch (error) {
    console.error('Error running service checks:', error);
    return NextResponse.json(
      { error: 'Failed to run service checks', details: error.message },
      { status: 500 }
    );
  }
}