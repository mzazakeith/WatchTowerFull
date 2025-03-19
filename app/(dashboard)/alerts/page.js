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
import { toast } from 'sonner';
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
    pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [stats, setStats] = useState(null);

  // Fetch alerts data and stats
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        const [alertsResponse, statsResponse] = await Promise.all([
          fetch('/api/alerts'),
          fetch('/api/dashboard/stats')
        ]);
        
        if (!alertsResponse.ok) {
          throw new Error('Failed to fetch alerts');
        }
        
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch alert statistics');
        }
        
        const alertsData = await alertsResponse.json();
        const statsData = await statsResponse.json();
        
        setAlerts(alertsData.alerts);
        setFilteredAlerts(alertsData.alerts);
        setStats(statsData.alerts);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
        toast.error(err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Filter alerts when filters change
  useEffect(() => {
    let result = [...alerts];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(alert => 
        (alert.serviceId?.name?.toLowerCase().includes(query)) ||
        alert.message.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(alert => alert.status === statusFilter);
    }
    
    // Apply severity filter
    if (severityFilter !== 'all') {
      result = result.filter(alert => alert.severity === severityFilter);
    }
    
    setFilteredAlerts(result);
  }, [alerts, searchQuery, statusFilter, severityFilter]);

  // Handle alert status update
  async function updateAlertStatus(alertId, newStatus) {
    try {
      setIsUpdating(true);
      
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update alert to ${newStatus}`);
      }
      
      // Update local state
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert._id === alertId 
            ? { ...alert, status: newStatus } 
            : alert
        )
      );
      
      toast.success(`Alert ${newStatus} successfully`);
      
      // Close dialog if open
      if (isDialogOpen) {
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error updating alert:', error);
      toast.error(error.message || 'Failed to update alert');
    } finally {
      setIsUpdating(false);
    }
  }

  // Handle refresh
  async function handleRefresh() {
    try {
      setIsLoading(true);
      
      const [alertsResponse, statsResponse] = await Promise.all([
        fetch('/api/alerts'),
        fetch('/api/dashboard/stats')
      ]);
      
      if (!alertsResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to refresh data');
      }
      
      const alertsData = await alertsResponse.json();
      const statsData = await statsResponse.json();
      
      setAlerts(alertsData.alerts);
      setStats(statsData.alerts);
      toast.success('Alerts refreshed');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error(error.message || 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }

  // View alert details
  function viewAlertDetails(alert) {
    setSelectedAlert(alert);
    setIsDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Alerts</h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Monitor and manage alerts from your services
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Alert Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">Total Alerts</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full dark:bg-blue-900/30">
                  <BellIcon className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">Active Alerts</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full dark:bg-yellow-900/30">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">Last 24 Hours</p>
                  <p className="text-2xl font-bold">{stats.lastDay}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full dark:bg-purple-900/30">
                  <ClockIcon className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">Resolution Rate</p>
                  <p className="text-2xl font-bold">
                    {stats.total > 0 
                      ? `${Math.round((stats.byStatus.resolved / stats.total) * 100)}%` 
                      : '100%'}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full dark:bg-green-900/30">
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search alerts..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="down">Down</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
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
      ) : filteredAlerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <CheckCircleIcon className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-medium">No alerts found</p>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-center max-w-md">
              {alerts.length > 0 
                ? 'Try adjusting your filters to see more results' 
                : 'All your services are running smoothly. No alerts have been generated.'}
            </p>
            {alerts.length > 0 && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setSeverityFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card key={alert._id} className="hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(alert.severity)}
                      {getStatusBadge(alert.status)}
                      <span className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {timeAgo(new Date(alert.timestamp))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ServerIcon className="h-4 w-4 text-neutral-500" />
                      <span className="font-medium">{alert.serviceId?.name || 'Unknown Service'}</span>
                    </div>
                    <p className="text-neutral-700 dark:text-neutral-300">{alert.message}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => viewAlertDetails(alert)}
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    {alert.status === 'pending' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateAlertStatus(alert._id, 'acknowledged')}
                        disabled={isUpdating}
                      >
                        Acknowledge
                      </Button>
                    )}
                    {(alert.status === 'pending' || alert.status === 'acknowledged') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateAlertStatus(alert._id, 'resolved')}
                        disabled={isUpdating}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Alert Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Alert Details</DialogTitle>
            <DialogDescription>
              Detailed information about this alert
            </DialogDescription>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getSeverityBadge(selectedAlert.severity)}
                {getStatusBadge(selectedAlert.status)}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">{selectedAlert.serviceId?.name || 'Unknown Service'}</h3>
                <p className="text-neutral-700 dark:text-neutral-300">{selectedAlert.message}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500 dark:text-neutral-400">Metric</p>
                  <p>{selectedAlert.metric}</p>
                </div>
                <div>
                  <p className="text-neutral-500 dark:text-neutral-400">Value</p>
                  <p>{typeof selectedAlert.value === 'object' 
                    ? JSON.stringify(selectedAlert.value) 
                    : selectedAlert.value}</p>
                </div>
                <div>
                  <p className="text-neutral-500 dark:text-neutral-400">Time</p>
                  <p>{new Date(selectedAlert.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-neutral-500 dark:text-neutral-400">Service URL</p>
                  <p className="truncate">{selectedAlert.serviceId?.url || 'N/A'}</p>
                </div>
              </div>
              
              {selectedAlert.acknowledgedBy && (
                <div>
                  <p className="text-neutral-500 dark:text-neutral-400">Acknowledged by</p>
                  <p>{selectedAlert.acknowledgedBy.name} at {new Date(selectedAlert.acknowledgedAt).toLocaleString()}</p>
                </div>
              )}
              
              {selectedAlert.resolvedBy && (
                <div>
                  <p className="text-neutral-500 dark:text-neutral-400">Resolved by</p>
                  <p>{selectedAlert.resolvedBy.name} at {new Date(selectedAlert.resolvedAt).toLocaleString()}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4">
                {selectedAlert.status === 'pending' && (
                  <Button 
                    variant="outline"
                    onClick={() => updateAlertStatus(selectedAlert._id, 'acknowledged')}
                    disabled={isUpdating}
                  >
                    Acknowledge
                  </Button>
                )}
                {(selectedAlert.status === 'pending' || selectedAlert.status === 'acknowledged') && (
                  <Button 
                    variant="default"
                    onClick={() => updateAlertStatus(selectedAlert._id, 'resolved')}
                    disabled={isUpdating}
                  >
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

