import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { Team, User, Service, Incident, Alert } from '@/lib/db/models';
import { cookies } from 'next/headers';

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
    
    // Find teams the user is a member of
    const userTeams = await Team.find({
      $or: [
        { owner: session.userId },
        { 'members.userId': session.userId }
      ]
    }, '_id');
    
    const teamIds = userTeams.map(team => team._id);
    
    // Combine activity from various sources
    const activityData = [];
    
    // Get recent incidents for the user's teams
    const recentIncidents = await Incident.find({
      services: { $exists: true, $ne: [] }
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('createdBy', 'name email')
    .lean();
    
    for (const incident of recentIncidents) {
      // Check if the incident is related to any service in the user's teams
      const relatedService = await Service.findOne({
        _id: { $in: incident.services },
        teamId: { $in: teamIds }
      }).populate('teamId', 'name');
      
      if (relatedService) {
        activityData.push({
          id: incident._id.toString(),
          timestamp: incident.createdAt,
          actionType: 'created an incident',
          description: `Created "${incident.title}" incident for ${relatedService.name}`,
          user: {
            id: incident.createdBy?._id.toString(),
            name: incident.createdBy?.name || 'Unknown User',
            role: 'Member'
          },
          team: relatedService.teamId ? {
            id: relatedService.teamId._id.toString(),
            name: relatedService.teamId.name
          } : null
        });
      }
    }
    
    // Get recent alert acknowledgements
    const recentAlerts = await Alert.find({
      acknowledgedBy: { $exists: true, $ne: null }
    })
    .sort({ acknowledgedAt: -1 })
    .limit(5)
    .populate('acknowledgedBy', 'name email')
    .populate('serviceId', 'name teamId')
    .lean();
    
    for (const alert of recentAlerts) {
      // Check if the alert is for a service in the user's teams
      if (alert.serviceId && alert.serviceId.teamId && teamIds.some(id => id.toString() === alert.serviceId.teamId.toString())) {
        activityData.push({
          id: alert._id.toString(),
          timestamp: alert.acknowledgedAt,
          actionType: 'acknowledged an alert',
          description: `Acknowledged ${alert.severity} alert for ${alert.serviceId.name}`,
          user: {
            id: alert.acknowledgedBy?._id.toString(),
            name: alert.acknowledgedBy?.name || 'Unknown User',
            role: 'Member'
          },
          team: null
        });
      }
    }
    
    // Get recent service additions
    const recentServices = await Service.find({
      teamId: { $in: teamIds }
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('createdBy', 'name email')
    .populate('teamId', 'name')
    .lean();
    
    for (const service of recentServices) {
      activityData.push({
        id: service._id.toString(),
        timestamp: service.createdAt,
        actionType: 'added a new service',
        description: `Added "${service.name}" service for monitoring`,
        user: {
          id: service.createdBy?._id.toString(),
          name: service.createdBy?.name || 'Unknown User',
          role: 'Member'
        },
        team: service.teamId ? {
          id: service.teamId._id.toString(),
          name: service.teamId.name
        } : null
      });
    }
    
    // Sort all activity by timestamp (most recent first)
    activityData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return NextResponse.json(activityData.slice(0, 10));
  } catch (error) {
    console.error('Error fetching team activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team activity' },
      { status: 500 }
    );
  }
} 