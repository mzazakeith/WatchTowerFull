"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  ServerIcon, 
  BellIcon, 
  ShieldExclamationIcon,
  ArrowUpIcon, 
  ArrowDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  ArrowPathIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';

// Helper functions
function getStatusColor(status) {
  switch (status) {
    case 'healthy': return 'bg-green-500';
    case 'degraded': return 'bg-yellow-500';
    case 'warning': return 'bg-orange-500';
    case 'critical': return 'bg-purple-600';
    case 'down': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
}

function getStatusBadge(status) {
  const variants = {
    healthy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/50',
    degraded: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50',
    warning: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-900/50',
    critical: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-900/50',
    down: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/50',
    pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
  };
  
  return (
    <Badge variant="outline" className={`${variants[status] || 'bg-gray-100 text-gray-800'} border`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function getIncidentStatusBadge(status) {
  const variants = {
    investigating: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
    identified: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50',
    monitoring: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-900/50',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/50',
  };
  
  return (
    <Badge variant="outline" className={`${variants[status] || 'bg-gray-100 text-gray-800'} border`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function formatTime(ms) {
  if (!ms || ms === 0) return 'N/A';
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

function getResponseTimeIndicator(time) {
  if (!time || time === 0) return { icon: null, color: 'text-neutral-400' };
  if (time < 200) return { icon: <ArrowDownIcon className="w-4 h-4 text-green-500" />, color: 'text-green-500' };
  if (time < 1000) return { icon: <ArrowUpIcon className="w-4 h-4 text-neutral-500" />, color: 'text-neutral-500' };
  if (time < 3000) return { icon: <ArrowUpIcon className="w-4 h-4 text-yellow-500" />, color: 'text-yellow-500' };
  return { icon: <ArrowUpIcon className="w-4 h-4 text-red-500" />, color: 'text-red-500' };
}

// Dashboard component
export default function DashboardPage() {
  const [services, setServices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({ 
    total: 0, 
    healthy: 0, 
    degraded: 0, 
    warning: 0, 
    critical: 0, 
    down: 0,
    uptime: 0
  });
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      
      setServices(data.services || []);
      setAlerts(data.activeAlerts || []);
      setIncidents(data.activeIncidents || []);
      setStats(data.stats || { 
        total: 0, 
        healthy: 0, 
        degraded: 0, 
        warning: 0, 
        critical: 0, 
        down: 0,
        uptime: 0
      });
      setChartData(data.responseTimeChartData || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      toast.error(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }

  // Handle refresh
  function handleRefresh() {
    fetchDashboardData();
    toast.success('Dashboard refreshed');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Monitor your services and infrastructure
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleRefresh} disabled={isLoading}>
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Link href="/services/add">
            <Button size="sm" className="flex items-center gap-1">
              <PlusIcon className="w-4 h-4" />
              <span>Add Service</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-lg font-medium">{error}</p>
            <Button onClick={handleRefresh} variant="outline" className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Content */}
      {!isLoading && !error && (
        <>
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <ServerIcon className="w-5 h-5 text-primary" />
                  <span>Services</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Healthy</div>
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">{stats.healthy}</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Degraded</div>
                    <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                      {stats.degraded + stats.warning}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Down</div>
                    <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                      {stats.down + stats.critical}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <RocketLaunchIcon className="w-5 h-5 text-primary" />
                  <span>Uptime</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.uptime}%</div>
                <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-green-500" 
                    style={{ width: `${stats.uptime}%` }}
                  ></div>
                </div>
                <div className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                  Last 30 days average across all services
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BellIcon className="w-5 h-5 text-primary" />
                  <span>Active Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{alerts.length}</div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Warning</div>
                    <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                      {alerts.filter(a => a.severity === 'warning').length}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Critical</div>
                    <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      {alerts.filter(a => a.severity === 'critical').length}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Down</div>
                    <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                      {alerts.filter(a => a.severity === 'down').length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <ShieldExclamationIcon className="w-5 h-5 text-primary" />
                  <span>Incidents</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{incidents.length}</div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Active</div>
                    <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                      {incidents.filter(i => i.status !== 'resolved').length}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Resolved</div>
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {incidents.filter(i => i.status === 'resolved').length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="incidents">Incidents</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Response Time Chart */}
              <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Response Time Trends</CardTitle>
                  <CardDescription>Average response time across all services for the last 24 hours</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {chartData.length > 0 ? (
                    <div className="h-full w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis 
                            stroke="#888888" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(value) => `${value}ms`}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              borderRadius: '8px', 
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              border: '1px solid #e5e5e5' 
                            }}
                            formatter={(value) => [`${value}ms`, null]}
                          />
                          <Legend />
                          {Object.keys(chartData[0] || {}).filter(key => key !== 'name').map((key, index) => (
                            <Line 
                              key={key}
                              type="monotone" 
                              dataKey={key} 
                              name={key}
                              stroke={[
                                '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
                                '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'
                              ][index % 10]} 
                              activeDot={{ r: 8 }}
                              strokeWidth={2}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-800/50 rounded-md">
                      <p className="text-neutral-500">No response time data available</p>
                      <p className="text-neutral-400 text-sm mt-2">Add services and wait for checks to accumulate data</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Services Table */}
              <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Services Status</CardTitle>
                      <CardDescription>Current status of all your services</CardDescription>
                    </div>
                    <Link href="/services">
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {services.length === 0 ? (
                    <div className="text-center py-12">
                      <ServerIcon className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No Services Found</h3>
                      <p className="text-neutral-500 dark:text-neutral-400 mt-1 mb-4">
                        Add your first service to start monitoring
                      </p>
                      <Link href="/services/add">
                        <Button>Add Service</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-xs text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
                          <tr>
                            <th className="text-left py-3 px-4 font-medium">Service</th>
                            <th className="text-left py-3 px-4 font-medium">Status</th>
                            <th className="text-left py-3 px-4 font-medium">Response Time</th>
                            <th className="text-left py-3 px-4 font-medium">Last Check</th>
                            <th className="text-right py-3 px-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                          {services.map(service => {
                            const responseTimeIndicator = getResponseTimeIndicator(service.responseTime);
                            
                            return (
                              <tr key={service._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="font-medium">{service.name}</div>
                                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{service.url}</div>
                                </td>
                                <td className="py-3 px-4">
                                  {getStatusBadge(service.status)}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-1">
                                    <span className={responseTimeIndicator.color}>{formatTime(service.responseTime)}</span>
                                    {responseTimeIndicator.icon}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-neutral-500 dark:text-neutral-400">
                                  <div className="flex items-center gap-1.5">
                                    <ClockIcon className="w-3.5 h-3.5" />
                                    <span>{timeAgo(service.updatedAt)}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <Link href={`/services/${service._id}`}>
                                    <Button variant="ghost" size="sm">View</Button>
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Alerts Tab */}
            <TabsContent value="alerts" className="space-y-4">
              <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Recent Alerts</CardTitle>
                      <CardDescription>Alerts from your services requiring attention</CardDescription>
                    </div>
                    <Link href="/alerts">
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {alerts.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium">All Clear!</h3>
                      <p className="text-neutral-500 dark:text-neutral-400 mt-1">No alerts to display</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {alerts.map(alert => (
                        <div key={alert._id} className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {alert.severity === 'down' ? (
                              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                                <ExclamationTriangleIcon className="w-6 h-6" />
                              </div>
                            ) : alert.severity === 'critical' ? (
                              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <ExclamationTriangleIcon className="w-6 h-6" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                                <ExclamationTriangleIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{alert.serviceId?.name || 'Unknown Service'}</h3>
                              <Badge variant="outline" className="text-xs">
                                {timeAgo(alert.timestamp)}
                              </Badge>
                            </div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{alert.message}</p>
                            <div className="mt-3 flex items-center gap-2">
                              <Link href={`/alerts`}>
                                <Button size="sm" variant="default">View Alert</Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Incidents Tab */}
            <TabsContent value="incidents" className="space-y-4">
              <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Active Incidents</CardTitle>
                      <CardDescription>Ongoing incidents affecting your services</CardDescription>
                    </div>
                    <Link href="/incidents">
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {incidents.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No Active Incidents</h3>
                      <p className="text-neutral-500 dark:text-neutral-400 mt-1">All systems are operating normally</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {incidents.map(incident => (
                        <div key={incident._id} className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{incident.title}</h3>
                            {getIncidentStatusBadge(incident.status)}
                          </div>
                          
                          <div className="mt-3 flex flex-wrap gap-2">
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                              <ClockIcon className="w-3.5 h-3.5" />
                              <span>Started {timeAgo(incident.startedAt)}</span>
                            </div>
                            
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                              <ServerIcon className="w-3.5 h-3.5" />
                              <span>
                                Affected services: {incident.services.map(s => 
                                  typeof s === 'object' ? s.name : 'Unknown'
                                ).join(', ')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center gap-2">
                            <Link href={`/incidents/${incident._id}`}>
                              <Button size="sm">View Incident</Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}