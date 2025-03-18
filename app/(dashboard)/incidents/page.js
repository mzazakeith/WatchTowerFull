'use client'

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BellIcon, 
  ClockIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

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
                {incident.date}
              </span>
            </div>
            <h3 className="text-xl font-semibold">{incident.title}</h3>
            <p className="text-neutral-600 dark:text-neutral-400">{incident.description}</p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="flex -space-x-2">
              {incident.assignees.map((assignee, index) => (
                <Avatar key={index} className="border-2 border-white dark:border-neutral-900 h-8 w-8">
                  <AvatarImage src={assignee.avatar} alt={assignee.name} />
                  <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <Button variant="outline" size="sm">View Details</Button>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
              <BellIcon className="h-4 w-4" />
              {incident.alerts} alerts
            </div>
            <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
              <ExclamationTriangleIcon className="h-4 w-4" />
              {incident.services} services affected
            </div>
          </div>
          
          <div>
            <Badge variant={incident.priority === 'high' ? 'destructive' : incident.priority === 'medium' ? 'warning' : 'outline'}>
              {incident.priority.toUpperCase()} priority
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
  
  // Mock data
  const activeIncidents = [
    {
      id: 1,
      title: 'API Gateway Performance Degradation',
      description: 'Increased latency observed in the API Gateway affecting multiple services.',
      status: 'investigating',
      date: 'Today, 14:32',
      priority: 'high',
      alerts: 12,
      services: 4,
      assignees: [
        { name: 'Alice Smith', avatar: '/avatars/alice.jpg' },
        { name: 'Bob Chen', avatar: '/avatars/bob.jpg' },
      ]
    },
    {
      id: 2,
      title: 'Database Connectivity Issues',
      description: 'Intermittent connection failures to the primary database cluster.',
      status: 'identified',
      date: 'Today, 12:15',
      priority: 'medium',
      alerts: 7,
      services: 3,
      assignees: [
        { name: 'Carol Danvers', avatar: '/avatars/carol.jpg' },
      ]
    },
    {
      id: 3,
      title: 'CDN Cache Invalidation Failure',
      description: 'Content updates not propagating correctly through the CDN.',
      status: 'monitoring',
      date: 'Today, 09:45',
      priority: 'low',
      alerts: 3,
      services: 1,
      assignees: [
        { name: 'Dave Miller', avatar: '/avatars/dave.jpg' },
        { name: 'Eve Jordan', avatar: '/avatars/eve.jpg' },
      ]
    },
  ];
  
  const resolvedIncidents = [
    {
      id: 4,
      title: 'Authentication Service Outage',
      description: 'Complete failure of the authentication service affecting all login attempts.',
      status: 'resolved',
      date: 'Yesterday, 18:22',
      priority: 'high',
      alerts: 23,
      services: 8,
      assignees: [
        { name: 'Frank Zhang', avatar: '/avatars/frank.jpg' },
        { name: 'Grace Kim', avatar: '/avatars/grace.jpg' },
      ]
    },
    {
      id: 5,
      title: 'Payment Processing Delays',
      description: 'Increased processing time for payment transactions.',
      status: 'resolved',
      date: '2 days ago',
      priority: 'medium',
      alerts: 9,
      services: 2,
      assignees: [
        { name: 'Henry Wilson', avatar: '/avatars/henry.jpg' },
      ]
    },
  ];
  
  const historyEvents = [
    {
      time: 'Today, 14:32',
      title: 'Incident created',
      description: 'Automated alert triggered due to latency exceeding threshold.',
      user: { name: 'System', avatar: '/avatars/system.jpg' },
    },
    {
      time: 'Today, 14:35',
      title: 'Investigation started',
      description: 'Engineering team acknowledged the incident and began investigation.',
      user: { name: 'Alice Smith', avatar: '/avatars/alice.jpg' },
    },
    {
      time: 'Today, 14:42',
      title: 'Root cause identified',
      description: 'Identified increased load on API Gateway due to unexpected traffic spike.',
      user: { name: 'Bob Chen', avatar: '/avatars/bob.jpg' },
    },
    {
      time: 'Today, 14:50',
      title: 'Mitigation applied',
      description: 'Scaled up API Gateway instances and enabled rate limiting.',
      user: { name: 'Alice Smith', avatar: '/avatars/alice.jpg' },
    },
    {
      time: 'Today, 15:15',
      title: 'Monitoring for resolution',
      description: 'Latency metrics returning to normal levels. Continuing to monitor.',
      user: { name: 'Bob Chen', avatar: '/avatars/bob.jpg' },
    },
  ];
  
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
          <Button>
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            Create Incident
          </Button>
          <Button variant="outline">
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
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
                  {activeIncidents.filter(inc => inc.priority === 'high').length}
                </div>
              </div>
              
              <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Resolved (24h)</div>
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold mt-2">{resolvedIncidents.length}</div>
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
                  Avg. resolution time
                </div>
                <div className="text-2xl font-semibold">3h 42m</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  Total incidents
                </div>
                <div className="text-2xl font-semibold">24</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  Services affected
                </div>
                <div className="text-2xl font-semibold">12</div>
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
          {activeIncidents.map(incident => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </TabsContent>
        
        <TabsContent value="resolved" className="space-y-4">
          {resolvedIncidents.map(incident => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Incident History</CardTitle>
              <CardDescription>Recent activity timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <Timeline events={historyEvents} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 