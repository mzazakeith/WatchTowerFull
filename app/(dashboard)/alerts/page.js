"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BellIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ArrowPathIcon,
  ServerIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

// Mock data for alerts
const mockAlerts = [
  { 
    id: '1', 
    service: 'Analytics API', 
    message: 'Response time exceeded critical threshold (4250ms)', 
    severity: 'critical', 
    status: 'open',
    createdAt: new Date(Date.now() - 5 * 60000),
    details: {
      responseTime: 4250,
      endpoint: '/api/analytics/metrics',
      attempts: 3,
      threshold: 3000
    }
  },
  { 
    id: '2', 
    service: 'Payment Processing', 
    message: 'Service is down - Connection refused', 
    severity: 'down', 
    status: 'acknowledged',
    createdAt: new Date(Date.now() - 12 * 60000),
    details: {
      error: 'ECONNREFUSED',
      endpoint: 'https://payments.example.com/api/health',
      attempts: 5
    }
  },
  { 
    id: '3', 
    service: 'Database Service', 
    message: 'Response time exceeded warning threshold (1350ms)', 
    severity: 'warning', 
    status: 'open',
    createdAt: new Date(Date.now() - 25 * 60000),
    details: {
      responseTime: 1350,
      query: 'SELECT * FROM customers WHERE...',
      threshold: 1000
    }
  },
  { 
    id: '4', 
    service: 'API Gateway', 
    message: 'Unusual traffic pattern detected - 500% increase in requests', 
    severity: 'warning', 
    status: 'open',
    createdAt: new Date(Date.now() - 45 * 60000),
    details: {
      currentRate: '150 req/s',
      normalRate: '30 req/s',
      endpoint: '/api/users/*'
    }
  },
  { 
    id: '5', 
    service: 'CDN Service', 
    message: 'Increased error rate - 5% of requests failing with 503', 
    severity: 'warning', 
    status: 'resolved',
    createdAt: new Date(Date.now() - 120 * 60000),
    resolvedAt: new Date(Date.now() - 90 * 60000),
    details: {
      errorRate: '5%',
      errorCode: 503,
      affectedRegions: ['us-east', 'eu-west']
    }
  },
  { 
    id: '6', 
    service: 'Authentication Service', 
    message: 'High number of failed login attempts', 
    severity: 'warning', 
    status: 'resolved',
    createdAt: new Date(Date.now() - 240 * 60000),
    resolvedAt: new Date(Date.now() - 210 * 60000),
    details: {
      failedAttempts: 120,
      timeWindow: '10 minutes',
      normalRate: '5-10 per 10 min'
    }
  },
  { 
    id: '7', 
    service: 'Storage Service', 
    message: 'Disk usage above 90% threshold', 
    severity: 'critical', 
    status: 'acknowledged',
    createdAt: new Date(Date.now() - 60 * 60000),
    details: {
      diskUsage: '92%',
      availableSpace: '80GB',
      threshold: '90%'
    }
  },
];

// Helper functions
function getSeverityIcon(severity, size = 6) {
  const classes = `w-${size} h-${size}`;
  switch (severity) {
    case 'down':
      return <ExclamationTriangleIcon className={`${classes} text-red-500`} />;
    case 'critical':
      return <ExclamationTriangleIcon className={`${classes} text-purple-500`} />;
    case 'warning':
      return <ExclamationTriangleIcon className={`${classes} text-yellow-500`} />;
    case 'info':
      return <BellIcon className={`${classes} text-blue-500`} />;
    default:
      return <BellIcon className={`${classes} text-neutral-500`} />;
  }
}

function getSeverityBadge(severity) {
  const variants = {
    down: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/50',
    critical: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-900/50',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
  };
  
  return (
    <Badge variant="outline" className={`${variants[severity]} border capitalize`}>
      {severity}
    </Badge>
  );
}

function getStatusBadge(status) {
  const variants = {
    open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
    acknowledged: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/50',
  };
  
  return (
    <Badge variant="outline" className={`${variants[status]} border capitalize`}>
      {status}
    </Badge>
  );
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval} years ago`;
  
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} months ago`;
  
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} days ago`;
  
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} hours ago`;
  
  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} minutes ago`;
  
  return `${Math.floor(seconds)} seconds ago`;
}

function formatDate(date) {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch alerts data (using mock data for now)
  useEffect(() => {
    // In production, this would fetch from the API
    setAlerts(mockAlerts);
    setFilteredAlerts(mockAlerts);
    
    // Extract unique services for the service filter
    const uniqueServices = [...new Set(mockAlerts.map(alert => alert.service))];
    setServices(uniqueServices);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = alerts;
    
    // Apply status filter based on active tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(alert => alert.status === activeTab);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(alert => 
        alert.service.toLowerCase().includes(query) ||
        alert.message.toLowerCase().includes(query)
      );
    }
    
    // Apply severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(alert => alert.status === statusFilter);
    }
    
    // Apply service filter
    if (serviceFilter !== 'all') {
      filtered = filtered.filter(alert => alert.service === serviceFilter);
    }
    
    setFilteredAlerts(filtered);
  }, [alerts, searchQuery, severityFilter, statusFilter, serviceFilter, activeTab]);

  // Alert counts for badges
  const openCount = alerts.filter(alert => alert.status === 'open').length;
  const acknowledgedCount = alerts.filter(alert => alert.status === 'acknowledged').length;
  const resolvedCount = alerts.filter(alert => alert.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Alerts</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Monitor and manage alerts across your services
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <ArrowPathIcon className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Tabs navigation */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
          <TabsList className="w-full sm:w-auto grid grid-cols-3">
            <TabsTrigger value="all" className="relative">
              All
              <Badge className="ml-2 bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                {alerts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="open" className="relative">
              Active
              <Badge className="ml-2 bg-blue-200 text-blue-700 dark:bg-blue-700 dark:text-blue-200">
                {openCount + acknowledgedCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="resolved" className="relative">
              Resolved
              <Badge className="ml-2 bg-green-200 text-green-700 dark:bg-green-700 dark:text-green-200">
                {resolvedCount}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:min-w-[240px]">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input 
                placeholder="Search alerts..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className={isFilterOpen ? 'bg-neutral-100 dark:bg-neutral-800' : ''}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FunnelIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Filters row */}
        {isFilterOpen && (
          <Card className="mb-4 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Severity</label>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="down">Down</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="acknowledged">Acknowledged</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Service</label>
                  <Select value={serviceFilter} onValueChange={setServiceFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      {services.map(service => (
                        <SelectItem key={service} value={service}>{service}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alert List */}
        <Card className="border-none shadow-sm bg-white dark:bg-neutral-900 overflow-hidden">
          {filteredAlerts.length > 0 ? (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredAlerts.map(alert => (
                <div 
                  key={alert.id} 
                  className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                        ${alert.severity === 'down' ? 'bg-red-100 dark:bg-red-900/20' : 
                          alert.severity === 'critical' ? 'bg-purple-100 dark:bg-purple-900/20' : 
                          'bg-yellow-100 dark:bg-yellow-900/20'}`}
                      >
                        {getSeverityIcon(alert.severity)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium truncate">{alert.service}</h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{alert.message}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getSeverityBadge(alert.severity)}
                          {getStatusBadge(alert.status)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-3.5 h-3.5" />
                          <span>{timeAgo(alert.createdAt)}</span>
                        </div>
                        {alert.status === 'resolved' && alert.resolvedAt && (
                          <div className="flex items-center gap-1">
                            <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />
                            <span>Resolved {timeAgo(alert.resolvedAt)}</span>
                          </div>
                        )}
                        <Button variant="ghost" size="sm" className="ml-auto p-1 h-auto text-xs">
                          <EyeIcon className="w-3.5 h-3.5 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No alerts matching your filters</h3>
              <p className="text-neutral-500 dark:text-neutral-400 mt-1 max-w-md mx-auto">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSeverityFilter('all');
                  setStatusFilter('all');
                  setServiceFilter('all');
                  setActiveTab('all');
                }}
              >
                Reset filters
              </Button>
            </div>
          )}
        </Card>
      </Tabs>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <Dialog open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getSeverityIcon(selectedAlert.severity, 5)}
                <span>Alert Details</span>
              </DialogTitle>
              <DialogDescription>
                Detailed information about this alert
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-2">
              <div className="flex flex-wrap justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getSeverityBadge(selectedAlert.severity)}
                  {getStatusBadge(selectedAlert.status)}
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  Alert ID: {selectedAlert.id}
                </div>
              </div>
              
              <div className="border-t border-b border-neutral-200 dark:border-neutral-800 py-3">
                <h3 className="font-medium text-lg">{selectedAlert.service}</h3>
                <p className="text-neutral-600 dark:text-neutral-300 mt-1">{selectedAlert.message}</p>
                <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                  Created: {formatDate(selectedAlert.createdAt)}
                </div>
                {selectedAlert.resolvedAt && (
                  <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Resolved: {formatDate(selectedAlert.resolvedAt)}
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Alert Details</h4>
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-md p-3 space-y-2">
                  {Object.entries(selectedAlert.details).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 text-sm">
                      <div className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                      <div className="col-span-2">{value.toString()}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between gap-2 pt-2">
                <div>
                  <Button variant="destructive" size="sm">
                    Delete Alert
                  </Button>
                </div>
                <div className="space-x-2">
                  {selectedAlert.status === 'open' && (
                    <Button variant="outline" size="sm">
                      Acknowledge
                    </Button>
                  )}
                  {selectedAlert.status !== 'resolved' && (
                    <Button size="sm">
                      {selectedAlert.status === 'acknowledged' ? 'Resolve' : 'Acknowledge & Resolve'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 