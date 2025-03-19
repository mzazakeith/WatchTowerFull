import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { Service, Alert, Incident, Check } from '@/lib/db/models';
import { cookies } from 'next/headers';

// GET handler to fetch statistics for dashboard analytics
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
    
    // Get time ranges for different metrics
    const now = new Date();
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get services the user has access to
    const userServices = await Service.find({
      $or: [
        { createdBy: userId },
        { teamId: { $in: session.teams || [] } }
      ]
    });
    
    const serviceIds = userServices.map(service => service._id);
    
    // Fetch alerts statistics
    const alertStats = {
      total: await Alert.countDocuments({ serviceId: { $in: serviceIds } }),
      active: await Alert.countDocuments({ 
        serviceId: { $in: serviceIds },
        status: { $in: ['pending', 'acknowledged'] }
      }),
      lastDay: await Alert.countDocuments({
        serviceId: { $in: serviceIds },
        timestamp: { $gte: oneDayAgo }
      }),
      lastWeek: await Alert.countDocuments({
        serviceId: { $in: serviceIds },
        timestamp: { $gte: sevenDaysAgo }
      }),
      lastMonth: await Alert.countDocuments({
        serviceId: { $in: serviceIds },
        timestamp: { $gte: thirtyDaysAgo }
      }),
      bySeverity: {
        warning: await Alert.countDocuments({
          serviceId: { $in: serviceIds },
          severity: 'warning'
        }),
        critical: await Alert.countDocuments({
          serviceId: { $in: serviceIds },
          severity: 'critical'
        }),
        down: await Alert.countDocuments({
          serviceId: { $in: serviceIds },
          severity: 'down'
        })
      },
      byStatus: {
        pending: await Alert.countDocuments({
          serviceId: { $in: serviceIds },
          status: 'pending'
        }),
        acknowledged: await Alert.countDocuments({
          serviceId: { $in: serviceIds },
          status: 'acknowledged'
        }),
        resolved: await Alert.countDocuments({
          serviceId: { $in: serviceIds },
          status: 'resolved'
        })
      }
    };
    
    // Fetch incident statistics
    const incidentStats = {
      total: await Incident.countDocuments({ services: { $in: serviceIds } }),
      active: await Incident.countDocuments({
        services: { $in: serviceIds },
        status: { $ne: 'resolved' }
      }),
      resolved: await Incident.countDocuments({
        services: { $in: serviceIds },
        status: 'resolved'
      }),
      lastDay: await Incident.countDocuments({
        services: { $in: serviceIds },
        startedAt: { $gte: oneDayAgo }
      }),
      lastWeek: await Incident.countDocuments({
        services: { $in: serviceIds },
        startedAt: { $gte: sevenDaysAgo }
      }),
      lastMonth: await Incident.countDocuments({
        services: { $in: serviceIds },
        startedAt: { $gte: thirtyDaysAgo }
      }),
      bySeverity: {
        minor: await Incident.countDocuments({
          services: { $in: serviceIds },
          severity: 'minor'
        }),
        major: await Incident.countDocuments({
          services: { $in: serviceIds },
          severity: 'major'
        }),
        critical: await Incident.countDocuments({
          services: { $in: serviceIds },
          severity: 'critical'
        })
      }
    };
    
    // Calculate average resolution time for incidents
    let averageResolutionTime = null;
    
    const resolvedIncidents = await Incident.find({
      services: { $in: serviceIds },
      status: 'resolved',
      startedAt: { $exists: true },
      resolvedAt: { $exists: true }
    });
    
    if (resolvedIncidents.length > 0) {
      const totalResolutionTime = resolvedIncidents.reduce((sum, incident) => {
        const startTime = new Date(incident.startedAt).getTime();
        const endTime = new Date(incident.resolvedAt).getTime();
        return sum + (endTime - startTime);
      }, 0);
      
      // Average in milliseconds
      averageResolutionTime = totalResolutionTime / resolvedIncidents.length;
    }
    
    // Get service health over time (last 30 days)
    const serviceHealthHistory = await Check.aggregate([
      {
        $match: {
          serviceId: { $in: serviceIds },
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count"
            }
          },
          total: { $sum: "$count" }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);
    
    // Calculate daily uptime percentage
    const uptimeHistory = serviceHealthHistory.map(day => {
      const healthyCount = day.statuses.find(s => s.status === 'healthy')?.count || 0;
      const uptime = (healthyCount / day.total) * 100;
      
      return {
        date: day._id,
        uptime: parseFloat(uptime.toFixed(2))
      };
    });
    
    return NextResponse.json({
      alerts: alertStats,
      incidents: incidentStats,
      averageResolutionTime,
      uptimeHistory
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics', details: error.message },
      { status: 500 }
    );
  }
} 