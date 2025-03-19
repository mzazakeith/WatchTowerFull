"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { toast } from 'sonner';

// Helper functions
function getStatusBadge(status) {
  const variants = {
    healthy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    degraded: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    warning: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    critical: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    down: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  };
  
  return (
    <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function formatTime(ms) {
  if (ms === 0) return 'N/A';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function timeAgo(date) {
  if (!date) return 'Never';
  
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
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

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isCheckingService, setIsCheckingService] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch services from the API
  useEffect(() => {
    async function fetchServices() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/services');
        
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        
        const data = await response.json();
        setServices(data);
        setFilteredServices(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err.message || 'Failed to load services');
        toast.error(err.message || 'Failed to load services');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchServices();
  }, []);

  // Apply filters and sorting to services
  useEffect(() => {
    let result = [...services];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(service => 
        service.name.toLowerCase().includes(query) ||
        service.url.toLowerCase().includes(query) ||
        (service.description && service.description.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(service => service.status === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'status') {
        // Custom status order: down > critical > warning > degraded > healthy
        const statusOrder = {
          'down': 0,
          'critical': 1,
          'warning': 2, 
          'degraded': 3,
          'healthy': 4,
          'pending': 5
        };
        comparison = (statusOrder[a.status] || 6) - (statusOrder[b.status] || 6);
      } else if (sortBy === 'responseTime') {
        // Services without responseTime come last
        if (a.responseTime === undefined && b.responseTime === undefined) {
          comparison = 0;
        } else if (a.responseTime === undefined) {
          comparison = 1;
        } else if (b.responseTime === undefined) {
          comparison = -1;
        } else {
          comparison = a.responseTime - b.responseTime;
        }
      } else if (sortBy === 'lastChecked') {
        // Services without lastChecked come last
        const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
        const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
        comparison = dateA - dateB;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredServices(result);
  }, [services, searchQuery, statusFilter, sortBy, sortDirection]);

  // Function to manually check a service
  async function checkService(serviceId) {
    try {
      setIsCheckingService(serviceId);
      
      const response = await fetch('/api/services/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check service');
      }
      
      const data = await response.json();
      
      // Update the service in the local state
      setServices(prevServices => 
        prevServices.map(service => 
          service._id === serviceId 
            ? { 
                ...service, 
                status: data.status || data.check.status,
                responseTime: data.responseTime || data.check.responseTime,
                lastCheck: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              } 
            : service
        )
      );
      
      toast.success(`Service check completed: ${data.status || data.check.status}`);
    } catch (error) {
      console.error('Error checking service:', error);
      toast.error(error.message || 'Failed to check service');
    } finally {
      setIsCheckingService(null);
    }
  }

  // Function to toggle a service's paused state
  async function toggleServicePaused(serviceId, currentPaused) {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paused: !currentPaused }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update service');
      }
      
      const data = await response.json();
      
      // Update the service in the local state
      setServices(prevServices => 
        prevServices.map(service => 
          service._id === serviceId 
            ? { ...service, paused: data.paused } 
            : service
        )
      );
      
      toast.success(`Service ${data.paused ? 'paused' : 'resumed'} successfully`);
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error(error.message || 'Failed to update service');
    }
  }

  // Handle refresh
  async function handleRefresh() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/services');
      
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      
      const data = await response.json();
      setServices(data);
      toast.success('Services refreshed');
    } catch (error) {
      console.error('Error refreshing services:', error);
      toast.error(error.message || 'Failed to refresh services');
    } finally {
      setIsLoading(false);
    }
  }

  // Toggle sort direction or change sort field
  function handleSort(field) {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Services</h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Monitor and manage your services.
          </p>
        </div>
        <Link href="/services/add">
          <Button>
            Add Service
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input 
                placeholder="Search by name or URL"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="degraded">Degraded</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="down">Down</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={handleSort}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="responseTime">Response Time</SelectItem>
                  <SelectItem value="lastChecked">Last Checked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : filteredServices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              {services.length === 0 
                ? "No services found. Add your first service to start monitoring."
                : "No services match your filters."}
            </p>
            {services.length === 0 && (
              <Link href="/services/add">
                <Button>
                  Add Service
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <Card key={service._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription className="truncate max-w-[200px]">
                      {service.url}
                    </CardDescription>
                  </div>
                  {getStatusBadge(service.status)}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">Response Time:</span>
                    <span>{formatTime(service.responseTime)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">Last Check:</span>
                    <span>{timeAgo(service.lastCheck)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">Check Type:</span>
                    <span className="capitalize">{service.checkType}</span>
                  </div>
                  {service.tags && service.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {service.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={() => checkService(service._id)}>
                  Check Now
                </Button>
                <Link href={`/services/${service._id}`}>
                  <Button variant="ghost" size="sm">
                    Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}