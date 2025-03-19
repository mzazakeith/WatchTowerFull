'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner'
import { 
  BellIcon, 
  ClockIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

// Status component with appropriate color for each incident state
function StatusBadge({ status }) {
  const statusStyles = {
    'resolved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'investigating': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    'identified': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'critical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    'monitoring': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Incident Card component
function IncidentCard({ incident }) {
  return (
    <Card className="mb-4 hover:shadow-md transition-all duration-200 border border-neutral-200 dark:border-neutral-800">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusBadge status={incident.status} />
              <span className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                {formatDate(incident.startedAt)}
              </span>
            </div>
            <h3 className="text-xl font-semibold">{incident.title}</h3>
            <p className="text-neutral-600 dark:text-neutral-400">{incident.description}</p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="flex -space-x-2">
              {incident.assignedTo && (
                <Avatar className="border-2 border-white dark:border-neutral-900 h-8 w-8">
                  <AvatarImage src={'/avatars/user.jpg'} alt={incident.assignedTo.name} />
                  <AvatarFallback>{incident.assignedTo.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              {incident.createdBy && (
                <Avatar className="border-2 border-white dark:border-neutral-900 h-8 w-8">
                  <AvatarImage src={'/avatars/user.jpg'} alt={incident.createdBy.name} />
                  <AvatarFallback>{incident.createdBy.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loadIncidentHistory(incident._id)}
            >
              View Details
            </Button>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
              <BellIcon className="h-4 w-4" />
              {incident.alerts ? `${incident.alerts.length} alerts` : '0 alerts'}
            </div>
            <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
              <ExclamationTriangleIcon className="h-4 w-4" />
              {incident.services ? `${incident.services.length} services affected` : '0 services'}
            </div>
          </div>
          
          <div>
            <Badge variant={incident.severity === 'critical' ? 'destructive' : incident.severity === 'major' ? 'warning' : 'outline'}>
              {incident.severity.toUpperCase()} severity
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Timeline component for the incident history
function Timeline({ events }) {
  return (
    <div className="relative pl-8 mt-6">
      {events.map((event, index) => (
        <div key={index} className="relative mb-8">
          <div className="absolute -left-6 mt-1.5">
            <div className="h-3 w-3 rounded-full bg-primary border-4 border-white dark:border-neutral-900"></div>
          </div>
          <div className="absolute w-px h-full bg-neutral-200 dark:bg-neutral-800 -left-5 top-4"></div>
          <div className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">{event.time}</div>
          <div className="font-medium">{event.title}</div>
          <div className="text-neutral-600 dark:text-neutral-400 mt-1">{event.description}</div>
          {event.user && (
            <div className="flex items-center gap-2 mt-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={event.user.avatar} alt={event.user.name} />
                <AvatarFallback>{event.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{event.user.name}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function IncidentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [incidents, setIncidents] = useState([]);
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [resolvedIncidents, setResolvedIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentHistory, setIncidentHistory] = useState([]);

  // Fetch incidents data
  useEffect(() => {
    async function fetchIncidents() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/incidents');
        
        if (!response.ok) {
          throw new Error('Failed to fetch incidents');
        }
        
        const data = await response.json();
        setIncidents(data.incidents);
        
        // Filter active and resolved incidents
        setActiveIncidents(data.incidents.filter(
          incident => incident.status !== 'resolved'
        ));
        setResolvedIncidents(data.incidents.filter(
          incident => incident.status === 'resolved'
        ));
        
        setError(null);
      } catch (err) {
        console.error('Error fetching incidents:', err);
        setError(err.message || 'Failed to load incidents');
        toast.error(err.message || 'Failed to load incidents');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchIncidents();
  }, []);

  // Handle refresh
  async function handleRefresh() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/incidents');
      
      if (!response.ok) {
        throw new Error('Failed to fetch incidents');
      }
      
      const data = await response.json();
      setIncidents(data.incidents);
      
      // Filter active and resolved incidents
      setActiveIncidents(data.incidents.filter(
        incident => incident.status !== 'resolved'
      ));
      setResolvedIncidents(data.incidents.filter(
        incident => incident.status === 'resolved'
      ));
      
      toast.success('Incidents refreshed');
    } catch (error) {
      console.error('Error refreshing incidents:', error);
      toast.error(error.message || 'Failed to refresh incidents');
    } finally {
      setIsLoading(false);
    }
  }

  // Load incident history when selected
  async function loadIncidentHistory(incidentId) {
    try {
      setIncidentHistory([]);
      
      const response = await fetch(`/api/incidents/${incidentId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch incident details');
      }
      
      const data = await response.json();
      setSelectedIncident(data.incident);
      
      // Transform updates to history events format
      if (data.incident.updates && data.incident.updates.length > 0) {
        const historyEvents = data.incident.updates.map(update => ({
          time: new Date(update.timestamp).toLocaleString(),
          title: `Status changed to ${update.status}`,
          description: update.message,
          user: update.createdBy ? {
            name: update.createdBy.name,
            avatar: '/avatars/user.jpg' // Default avatar
          } : { name: 'System', avatar: '/avatars/system.jpg' }
        }));
        
        setIncidentHistory(historyEvents);
      } else {
        setIncidentHistory([{
          time: new Date(data.incident.createdAt).toLocaleString(),
          title: 'Incident created',
          description: 'Incident was created',
          user: data.incident.createdBy ? {
            name: data.incident.createdBy.name,
            avatar: '/avatars/user.jpg'
          } : { name: 'System', avatar: '/avatars/system.jpg' }
        }]);
      }
    } catch (error) {
      console.error('Error loading incident history:', error);
      toast.error(error.message || 'Failed to load incident history');
    }
  }
  
  // Filter incidents based on search query
  const filteredActive = searchQuery ? 
    activeIncidents.filter(incident => 
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : activeIncidents;
    
  const filteredResolved = searchQuery ? 
    resolvedIncidents.filter(incident => 
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : resolvedIncidents;

  // Format date for display
  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Incidents</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Monitor and manage service disruptions
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link href="/incidents/create">
            <Button>
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              Create Incident
            </Button>
          </Link>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-lg font-medium">{error}</p>
            <Button onClick={handleRefresh} variant="outline" className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Incident Summary</CardTitle>
                <CardDescription>Current status of all monitored services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Active</div>
                      <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="text-3xl font-bold mt-2">{activeIncidents.length}</div>
                  </div>
                  
                  <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Critical</div>
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="text-3xl font-bold mt-2">
                      {activeIncidents.filter(inc => inc.severity === 'critical').length}
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Resolved (24h)</div>
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold mt-2">
                      {resolvedIncidents.filter(inc => {
                        const resolvedDate = new Date(inc.resolvedAt || inc.updatedAt);
                        const oneDayAgo = new Date();
                        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                        return resolvedDate >= oneDayAgo;
                      }).length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                      Total incidents
                    </div>
                    <div className="text-2xl font-semibold">
                      {incidents.filter(inc => {
                        const date = new Date(inc.createdAt);
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        return date >= thirtyDaysAgo;
                      }).length}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                      Avg. resolution time
                    </div>
                    <div className="text-2xl font-semibold">
                      {calculateAverageResolutionTime(resolvedIncidents)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                      Services affected
                    </div>
                    <div className="text-2xl font-semibold">
                      {getUniqueAffectedServices(incidents).length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:w-96">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
              <Input 
                placeholder="Search incidents..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                All
              </Button>
              <Button variant="outline" size="sm">
                Critical
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="active">Active Incidents</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="space-y-4">
              {filteredActive.length > 0 ? (
                filteredActive.map(incident => (
                  <IncidentCard key={incident._id} incident={incident} />
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-medium">No Active Incidents</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2 mb-6 text-center max-w-md">
                      All your services are operating normally. There are no ongoing incidents to display.
                    </p>
                    <Link href="/incidents/create">
                      <Button>
                        <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                        Report New Incident
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="resolved" className="space-y-4">
              {filteredResolved.length > 0 ? (
                filteredResolved.map(incident => (
                  <IncidentCard key={incident._id} incident={incident} />
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ClipboardDocumentListIcon className="h-16 w-16 text-neutral-300 mb-4" />
                    <h3 className="text-xl font-medium">No Resolved Incidents</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-center max-w-md">
                      There are no resolved incidents in your history yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="history">
              {selectedIncident ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>{selectedIncident.title}</CardTitle>
                        <CardDescription>Incident timeline and updates</CardDescription>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedIncident(null)}
                      >
                        Close
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {incidentHistory.length > 0 ? (
                      <Timeline events={incidentHistory} />
                    ) : (
                      <div className="flex justify-center items-center py-12">
                        <p className="text-neutral-500">Loading incident history...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ClockIcon className="h-16 w-16 text-neutral-300 mb-4" />
                    <h3 className="text-xl font-medium">Select an Incident</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-center max-w-md">
                      View the timeline of an incident by clicking "View Details" on any incident card.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

// Helper function to calculate average resolution time
function calculateAverageResolutionTime(resolvedIncidents) {
  if (!resolvedIncidents || resolvedIncidents.length === 0) return 'N/A';
  
  // Filter incidents that have both start and resolved timestamps
  const incidentsWithDuration = resolvedIncidents.filter(inc => 
    inc.startedAt && (inc.resolvedAt || inc.updatedAt)
  );
  
  if (incidentsWithDuration.length === 0) return 'N/A';
  
  // Calculate total duration in milliseconds
  const totalDuration = incidentsWithDuration.reduce((sum, inc) => {
    const startTime = new Date(inc.startedAt).getTime();
    const endTime = new Date(inc.resolvedAt || inc.updatedAt).getTime();
    return sum + (endTime - startTime);
  }, 0);
  
  // Calculate average in milliseconds
  const avgDurationMs = totalDuration / incidentsWithDuration.length;
  
  // Convert to hours and minutes
  const hours = Math.floor(avgDurationMs / (1000 * 60 * 60));
  const minutes = Math.floor((avgDurationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}

// Helper function to get unique services affected by incidents
function getUniqueAffectedServices(incidents) {
  if (!incidents || incidents.length === 0) return [];
  
  const uniqueServiceIds = new Set();
  
  incidents.forEach(incident => {
    if (incident.services && Array.isArray(incident.services)) {
      incident.services.forEach(service => {
        const serviceId = typeof service === 'object' ? service._id : service;
        uniqueServiceIds.add(serviceId);
      });
    }
  });
  
  return Array.from(uniqueServiceIds);
}