"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import ServiceForm from '@/components/forms/ServiceForm';
import Link from 'next/link';
import CheckServiceButton from '@/components/services/CheckServiceButton';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


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

function formatDate(dateString) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleString();
}

export default function ServiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Fetch service data
  useEffect(() => {
    async function fetchService() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/services/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Service not found');
          }
          throw new Error('Failed to fetch service details');
        }
        
        const data = await response.json();
        setService(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching service:', err);
        setError(err.message || 'Failed to load service details');
        toast.error(err.message || 'Failed to load service details');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (id) {
      fetchService();
    }
  }, [id]);

  // Handle service update
  const handleUpdate = async (data) => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update service');
      }
      
      const updatedService = await response.json();
      setService(updatedService);
      setActiveTab('overview');
      toast.success('Service updated successfully');
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error(error.message || 'Failed to update service');
    }
  };

  // Handle service deletion
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete service');
      }
      
      toast.success('Service deleted successfully');
      router.push('/services');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error(error.message || 'Failed to delete service');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle manual service check
  const handleCheck = async () => {
    try {
      setIsChecking(true);
      const response = await fetch(`/api/services/${id}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check service');
      }
      
      const result = await response.json();
      
      // Update service with new status
      setService(prev => ({
        ...prev,
        status: result.status,
        lastCheck: result.timestamp,
        responseTime: result.responseTime || 0
      }));
      
      toast.success(`Service check completed: ${result.status}`);
    } catch (error) {
      console.error('Error checking service:', error);
      toast.error(error.message || 'Failed to check service');
    } finally {
      setIsChecking(false);
    }
  };

  // Update the service detail page to include check history and manual check button
  
  // Add the following imports

  // Add this function to the existing component
  async function fetchServiceChecks() {
    try {
      setIsLoadingChecks(true);
      const response = await fetch(`/api/services/${id}/checks`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch service checks');
      }
      
      const data = await response.json();
      setChecks(data.checks);
      setError(null);
    } catch (err) {
      console.error('Error fetching service checks:', err);
      toast.error(err.message || 'Failed to load service checks');
    } finally {
      setIsLoadingChecks(false);
    }
  }
  
  // Add these state variables to the component
  const [checks, setChecks] = useState([]);
  const [isLoadingChecks, setIsLoadingChecks] = useState(false);
  
  // Add this to the useEffect that fetches service data
  useEffect(() => {
    async function loadData() {
      await fetchService();
      await fetchServiceChecks();
    }
    
    loadData();
  }, [id]);
  
  // Add this to the component's JSX, after the service details card
  <div className="mt-6">
    <Tabs defaultValue="checks">
      <TabsList>
        <TabsTrigger value="checks">Check History</TabsTrigger>
        <TabsTrigger value="alerts">Alerts</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="checks" className="mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Check History</CardTitle>
              <CardDescription>Recent service check results</CardDescription>
            </div>
            <CheckServiceButton 
              serviceId={id} 
              onCheckComplete={(check) => {
                setChecks(prev => [check, ...prev]);
                fetchService(); // Refresh service status
              }} 
            />
          </CardHeader>
          <CardContent>
            {isLoadingChecks ? (
              <div className="flex justify-center items-center h-40">
                <ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : checks.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                No check history available
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Status Code</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checks.map((check) => (
                    <TableRow key={check._id}>
                      <TableCell>{new Date(check.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        {getStatusBadge(check.status)}
                      </TableCell>
                      <TableCell>{check.responseTime}ms</TableCell>
                      <TableCell>{check.statusCode || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {check.error || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="alerts" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Service Alerts</CardTitle>
            <CardDescription>Alerts generated for this service</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Alerts content will be implemented later */}
            <div className="text-center py-8 text-neutral-500">
              Alert history will be displayed here
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="settings" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Service Settings</CardTitle>
            <CardDescription>Configure monitoring settings</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Settings content will be implemented later */}
            <div className="text-center py-8 text-neutral-500">
              Service settings will be displayed here
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">{error}</p>
          <div className="flex space-x-4">
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
            <Link href="/services">
              <Button variant="outline">
                Back to Services
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!service) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">
            Service not found
          </p>
          <Link href="/services">
            <Button>
              Back to Services
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{service.name}</h1>
            {getStatusBadge(service.status)}
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            {service.url}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleCheck} 
            disabled={isChecking}
          >
            {isChecking ? 'Checking...' : 'Check Now'}
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Status</h3>
                  <p>{getStatusBadge(service.status)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Response Time</h3>
                  <p>{formatTime(service.responseTime)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Last Check</h3>
                  <p>{formatDate(service.lastCheck)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Check Type</h3>
                  <p className="capitalize">{service.checkType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Check Interval</h3>
                  <p>{service.interval} seconds</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Timeout</h3>
                  <p>{service.timeout} seconds</p>
                </div>
              </div>
              
              {service.description && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Description</h3>
                  <p>{service.description}</p>
                </div>
              )}
              
              {service.tags && service.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Tags</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {service.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {service.checkType === 'http' && (
            <Card>
              <CardHeader>
                <CardTitle>HTTP Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">HTTP Method</h3>
                    <p>{service.httpMethod || 'GET'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Expected Status Code</h3>
                    <p>{service.expectedStatusCode || '200'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Follow Redirects</h3>
                    <p>{service.followRedirects ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Verify SSL</h3>
                    <p>{service.verifySSL ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                
                {service.expectedResponseContent && (
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Expected Response Content</h3>
                    <p className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 p-2 rounded mt-1">
                      {service.expectedResponseContent}
                    </p>
                  </div>
                )}
                
                {service.requestHeaders && Object.keys(service.requestHeaders).length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Request Headers</h3>
                    <div className="mt-1 bg-neutral-100 dark:bg-neutral-800 rounded p-2">
                      {Object.entries(service.requestHeaders).map(([key, value]) => (
                        <div key={key} className="font-mono text-sm">
                          <span className="text-blue-600 dark:text-blue-400">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Alert Thresholds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Response Time Warning</h3>
                  <p>{formatTime(service.alertThresholds?.responseTime?.warning || 1000)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Response Time Critical</h3>
                  <p>{formatTime(service.alertThresholds?.responseTime?.critical || 3000)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Availability Warning</h3>
                  <p>{service.alertThresholds?.availability?.warning || 95}%</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Availability Critical</h3>
                  <p>{service.alertThresholds?.availability?.critical || 90}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="edit">
          <ServiceForm 
            initialData={{
              ...service,
              // Convert requestHeaders to the format expected by the form
              requestHeaders: service.requestHeaders ? 
                // If it's already an object, ensure it's in the right format
                Object.entries(service.requestHeaders).map(([key, value]) => ({ key, value })) : 
                []
            }} 
            onSubmit={handleUpdate} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}