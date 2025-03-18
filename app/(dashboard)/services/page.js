"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

// Mock data for services
const mockServices = [
  { id: '1', name: 'API Gateway', status: 'healthy', url: 'https://api.example.com', lastCheck: new Date(), responseTime: 124, checkType: 'http', tags: ['api', 'gateway'] },
  { id: '2', name: 'Authentication Service', status: 'healthy', url: 'https://auth.example.com', lastCheck: new Date(), responseTime: 95, checkType: 'http', tags: ['auth', 'api'] },
  { id: '3', name: 'Database Service', status: 'degraded', url: 'https://db.example.com', lastCheck: new Date(), responseTime: 1350, checkType: 'tcp', tags: ['database'] },
  { id: '4', name: 'Storage Service', status: 'healthy', url: 'https://storage.example.com', lastCheck: new Date(), responseTime: 82, checkType: 'http', tags: ['storage'] },
  { id: '5', name: 'Analytics API', status: 'critical', url: 'https://analytics.example.com', lastCheck: new Date(), responseTime: 4250, checkType: 'http', tags: ['api', 'analytics'] },
  { id: '6', name: 'Payment Processing', status: 'down', url: 'https://payments.example.com', lastCheck: new Date(), responseTime: 0, checkType: 'http', tags: ['payment'] },
  { id: '7', name: 'DNS Server', status: 'healthy', url: 'ns1.example.com', lastCheck: new Date(), responseTime: 45, checkType: 'dns', tags: ['dns', 'infrastructure'] },
  { id: '8', name: 'Load Balancer', status: 'healthy', url: 'lb.example.com', lastCheck: new Date(), responseTime: 110, checkType: 'ping', tags: ['infrastructure'] },
];

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

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [checkTypeFilter, setCheckTypeFilter] = useState('all');
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  // Fetch services data (using mock data for now)
  useEffect(() => {
    // In production, this would fetch from the API
    setServices(mockServices);
    setFilteredServices(mockServices);
    
    // Extract all unique tags
    const allTags = mockServices.reduce((acc, service) => {
      if (service.tags) {
        service.tags.forEach(tag => {
          if (!acc.includes(tag)) {
            acc.push(tag);
          }
        });
      }
      return acc;
    }, []);
    
    setTags(allTags);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = services;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(query) ||
        service.url.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(service => service.status === statusFilter);
    }
    
    // Apply check type filter
    if (checkTypeFilter !== 'all') {
      filtered = filtered.filter(service => service.checkType === checkTypeFilter);
    }
    
    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(service => 
        selectedTags.some(tag => service.tags && service.tags.includes(tag))
      );
    }
    
    setFilteredServices(filtered);
  }, [services, searchQuery, statusFilter, checkTypeFilter, selectedTags]);

  // Toggle tag selection
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

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
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Check Type</label>
              <Select value={checkTypeFilter} onValueChange={setCheckTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by check type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="http">HTTP/HTTPS</SelectItem>
                  <SelectItem value="ping">Ping</SelectItem>
                  <SelectItem value="tcp">TCP</SelectItem>
                  <SelectItem value="dns">DNS</SelectItem>
                  <SelectItem value="port">Port</SelectItem>
                  <SelectItem value="ssl">SSL</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge 
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
                {tags.length === 0 && (
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">No tags found</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle>Services List</CardTitle>
          <CardDescription>
            Showing {filteredServices.length} of {services.length} services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="text-left py-2 font-medium">Name</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-left py-2 font-medium">Type</th>
                  <th className="text-left py-2 font-medium">Response Time</th>
                  <th className="text-left py-2 font-medium">Last Check</th>
                  <th className="text-left py-2 font-medium">Tags</th>
                  <th className="text-left py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredServices.map(service => (
                  <tr key={service.id}>
                    <td className="py-3">
                      <div className="font-medium">{service.name}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">{service.url}</div>
                    </td>
                    <td className="py-3">
                      {getStatusBadge(service.status)}
                    </td>
                    <td className="py-3 capitalize">
                      {service.checkType}
                    </td>
                    <td className="py-3">
                      {formatTime(service.responseTime)}
                    </td>
                    <td className="py-3 text-neutral-500 dark:text-neutral-400">
                      {timeAgo(service.lastCheck)}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {service.tags && service.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <Link href={`/services/${service.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                        <Button variant="ghost" size="sm">Pause</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredServices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-500 dark:text-neutral-400">
                      No services found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 