import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { Service, Alert, Incident, Check } from '@/lib/db/models';
import { cookies } from 'next/headers';

// GET handler to fetch data for the dashboard
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
    
    // Get services user has access to
    const userServices = await Service.find({
      $or: [
        { createdBy: userId },
        { teamId: { $in: session.teams || [] } }
      ]
    });
    
    // Get service IDs
    const serviceIds = userServices.map(service => service._id);
    
    // Calculate service statistics
    const stats = {
      total: userServices.length,
      healthy: userServices.filter(s => s.status === 'healthy').length,
      degraded: userServices.filter(s => s.status === 'degraded').length,
      warning: userServices.filter(s => s.status === 'warning').length,
      critical: userServices.filter(s => s.status === 'critical').length,
      down: userServices.filter(s => s.status === 'down').length,
      pending: userServices.filter(s => s.status === 'pending').length,
    };
    
    // Get uptime for the past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Fetch uptime data
    let uptime = 0;
    
    if (serviceIds.length > 0) {
      // For each service, calculate its uptime based on its checks
      const uptimePromises = serviceIds.map(async (serviceId) => {
        const checks = await Check.find({
          serviceId,
          timestamp: { $gte: thirtyDaysAgo }
        });
        
        if (checks.length === 0) return 100; // Assume 100% if no checks
        
        const healthyChecks = checks.filter(check => check.status === 'healthy').length;
        return (healthyChecks / checks.length) * 100;
      });
      
      const uptimeValues = await Promise.all(uptimePromises);
      uptime = uptimeValues.length > 0 
        ? (uptimeValues.reduce((sum, val) => sum + val, 0) / uptimeValues.length).toFixed(2)
        : 100;
    } else {
      uptime = 100; // Default to 100% if no services
    }
    
    // Get active alerts
    const activeAlerts = await Alert.find({
      serviceId: { $in: serviceIds },
      status: { $in: ['pending', 'acknowledged'] }
    })
    .sort({ timestamp: -1 })
    .limit(5)
    .populate('serviceId', 'name url');
    
    // Get active incidents
    const activeIncidents = await Incident.find({
      services: { $in: serviceIds },
      status: { $ne: 'resolved' }
    })
    .sort({ startedAt: -1 })
    .limit(5)
    .populate('services', 'name url');
    
    // Get response time data for charts (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const responseTimeData = await Check.aggregate([
      {
        $match: {
          serviceId: { $in: serviceIds },
          timestamp: { $gte: oneDayAgo }
        }
      },
      {
        $sort: { timestamp: 1 }
      },
      {
        $group: {
          _id: {
            serviceId: "$serviceId",
            hour: { $hour: "$timestamp" }
          },
          avgResponseTime: { $avg: "$responseTime" },
          timestamp: { $first: "$timestamp" }
        }
      },
      {
        $sort: { "timestamp": 1 }
      }
    ]);
    
    // Format response time data for chart
    const chartData = {};
    for (const dataPoint of responseTimeData) {
      const service = await Service.findById(dataPoint._id.serviceId);
      if (!service) continue;
      
      const hour = dataPoint._id.hour.toString().padStart(2, '0') + ':00';
      
      if (!chartData[hour]) {
        chartData[hour] = { name: hour };
      }
      
      chartData[hour][service.name] = Math.round(dataPoint.avgResponseTime);
    }
    
    // Convert to array for easier consumption by chart libraries
    const responseTimeChartData = Object.values(chartData).sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    
    // Return dashboard data
    return NextResponse.json({
      stats: {
        ...stats,
        uptime
      },
      services: userServices,
      activeAlerts,
      activeIncidents,
      responseTimeChartData
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 