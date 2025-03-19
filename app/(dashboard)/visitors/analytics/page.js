'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ChartBarIcon,
  ChartPieIcon,
  GlobeAltIcon,
  DeviceTabletIcon,
  ArrowPathIcon,
  UsersIcon,
  ClockIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export default function VisitorAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch analytics data
  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setIsLoading(true);
        
        // In a real app, you would fetch from your API
        // const response = await fetch(`/api/visitors/analytics?range=${timeRange}`);
        // if (!response.ok) throw new Error('Failed to fetch analytics data');
        // const data = await response.json();
        
        // For now, we'll use mock data
        setTimeout(() => {
          const mockData = generateMockData(timeRange);
          setAnalyticsData(mockData);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast.error('Failed to load analytics data');
        setIsLoading(false);
      }
    }
    
    fetchAnalyticsData();
  }, [timeRange]);

  // Generate mock data based on time range
  function generateMockData(range) {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    
    // Generate daily visitor counts with some randomness but an upward trend
    const dailyVisitors = Array.from({ length: days }, (_, i) => {
      const baseValue = 500 + i * 10; // Gradually increasing base
      const randomVariation = Math.floor(Math.random() * 100) - 50; // Random variation ±50
      return {
        date: new Date(Date.now() - (days - i - 1) * 86400000).toISOString().split('T')[0],
        count: Math.max(baseValue + randomVariation, 50) // Ensure minimum of 50 visitors
      };
    });
    
    const totalVisitors = dailyVisitors.reduce((sum, day) => sum + day.count, 0);
    const averageVisitors = Math.round(totalVisitors / days);
    
    // Calculate change percentage
    const prevPeriodAvg = averageVisitors * (Math.random() * 0.4 + 0.8); // 80-120% of current avg
    const changePercentage = ((averageVisitors - prevPeriodAvg) / prevPeriodAvg) * 100;
    
    return {
      overview: {
        totalVisitors,
        averageVisitors,
        changePercentage: Math.round(changePercentage * 10) / 10, // Round to 1 decimal
        peakDay: dailyVisitors.reduce((max, day) => day.count > max.count ? day : max, { count: 0 }),
        dailyVisitors
      },
      devices: {
        mobile: Math.round(totalVisitors * 0.52), // 52% mobile
        desktop: Math.round(totalVisitors * 0.38), // 38% desktop
        tablet: Math.round(totalVisitors * 0.1) // 10% tablet
      },
      geography: [
        { country: 'United States', visitors: Math.round(totalVisitors * 0.35) },
        { country: 'United Kingdom', visitors: Math.round(totalVisitors * 0.12) },
        { country: 'Germany', visitors: Math.round(totalVisitors * 0.08) },
        { country: 'France', visitors: Math.round(totalVisitors * 0.07) },
        { country: 'Canada', visitors: Math.round(totalVisitors * 0.06) },
        { country: 'Australia', visitors: Math.round(totalVisitors * 0.05) },
        { country: 'Japan', visitors: Math.round(totalVisitors * 0.04) },
        { country: 'India', visitors: Math.round(totalVisitors * 0.04) },
        { country: 'Brazil', visitors: Math.round(totalVisitors * 0.03) },
        { country: 'Other', visitors: Math.round(totalVisitors * 0.16) }
      ],
      sources: [
        { source: 'Direct', visitors: Math.round(totalVisitors * 0.30) },
        { source: 'Google', visitors: Math.round(totalVisitors * 0.25) },
        { source: 'Social Media', visitors: Math.round(totalVisitors * 0.20) },
        { source: 'Referral', visitors: Math.round(totalVisitors * 0.15) },
        { source: 'Email', visitors: Math.round(totalVisitors * 0.07) },
        { source: 'Other', visitors: Math.round(totalVisitors * 0.03) }
      ]
    };
  }

  // Format number with commas
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Change percentage indicator
  function renderChangeIndicator(percentage) {
    const isPositive = percentage > 0;
    return (
      <div className={`flex items-center text-sm ${isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
        <span className={`mr-1 ${isPositive ? 'rotate-0' : 'rotate-180'}`}>↑</span>
        <span>{Math.abs(percentage)}%</span>
      </div>
    );
  }

  // Simple bar chart component
  function BarChart({ data, valueKey, labelKey, height = 200, showValues = true }) {
    const maxValue = Math.max(...data.map(item => item[valueKey]));
    
    return (
      <div className="w-full overflow-x-auto">
        <div className="min-w-full" style={{ height: `${height}px` }}>
          <div className="flex h-full items-end space-x-2">
            {data.map((item, index) => {
              const percentage = (item[valueKey] / maxValue) * 100;
              return (
                <div key={index} className="relative flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-primary/90 rounded-t hover:bg-primary transition-all"
                    style={{ height: `${percentage}%` }}
                  ></div>
                  {showValues && (
                    <div className="absolute bottom-full mb-1 text-xs font-medium">
                      {formatNumber(item[valueKey])}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-center truncate w-full" title={item[labelKey]}>
                    {item[labelKey]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Visitor Analytics</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Track and analyze your website visitor traffic and behavior
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="secondary" onClick={() => {
            setIsLoading(true);
            setTimeout(() => {
              setAnalyticsData(generateMockData(timeRange));
              setIsLoading(false);
              toast.success('Analytics data refreshed');
            }, 800);
          }}>
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <UsersIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Total Visitors
                    </p>
                    <h4 className="text-2xl font-bold mt-1">
                      {formatNumber(analyticsData.overview.totalVisitors)}
                    </h4>
                    <div className="flex items-center mt-1">
                      {renderChangeIndicator(analyticsData.overview.changePercentage)}
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">
                        vs previous period
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Daily Average
                    </p>
                    <h4 className="text-2xl font-bold mt-1">
                      {formatNumber(analyticsData.overview.averageVisitors)}
                    </h4>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : 'Last 90 days'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <DeviceTabletIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Mobile Visitors
                    </p>
                    <h4 className="text-2xl font-bold mt-1">
                      {formatNumber(analyticsData.devices.mobile)}
                    </h4>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {Math.round((analyticsData.devices.mobile / analyticsData.overview.totalVisitors) * 100)}% of total
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <ClockIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      Peak Day
                    </p>
                    <h4 className="text-2xl font-bold mt-1">
                      {formatNumber(analyticsData.overview.peakDay.count)}
                    </h4>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {new Date(analyticsData.overview.peakDay.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Detailed Analytics */}
          <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="geography">
                <GlobeAltIcon className="h-4 w-4 mr-2" />
                Geography
              </TabsTrigger>
              <TabsTrigger value="devices">
                <DeviceTabletIcon className="h-4 w-4 mr-2" />
                Devices
              </TabsTrigger>
              <TabsTrigger value="sources">
                <ChartPieIcon className="h-4 w-4 mr-2" />
                Traffic Sources
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Visitors Over Time</CardTitle>
                  <CardDescription>Daily visitor counts for the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <BarChart 
                      data={analyticsData.overview.dailyVisitors.slice(-30)} 
                      valueKey="count" 
                      labelKey="date" 
                      height={280} 
                      showValues={false}
                    />
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-neutral-500 dark:text-neutral-400">
                  Showing {analyticsData.overview.dailyVisitors.length} days of visitor data
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="geography">
              <Card>
                <CardHeader>
                  <CardTitle>Visitors by Country</CardTitle>
                  <CardDescription>Geographic distribution of your visitors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="h-80">
                      <BarChart 
                        data={analyticsData.geography} 
                        valueKey="visitors" 
                        labelKey="country" 
                        height={280}
                      />
                    </div>
                    <div className="border rounded-md divide-y">
                      {analyticsData.geography.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{item.country}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatNumber(item.visitors)}</span>
                            <span className="text-neutral-500 dark:text-neutral-400 text-sm">
                              ({Math.round((item.visitors / analyticsData.overview.totalVisitors) * 100)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="devices">
              <Card>
                <CardHeader>
                  <CardTitle>Visitors by Device</CardTitle>
                  <CardDescription>Device breakdown of your visitors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1 md:col-span-2">
                      <div className="flex items-center justify-center h-60">
                        <div className="w-60 h-60 rounded-full border-8 border-primary relative">
                          <div className="absolute inset-0 bg-primary rounded-full" 
                               style={{ 
                                 clipPath: `polygon(50% 50%, 50% 0, ${50 + 50 * Math.cos(Math.PI * 2 * 0.52)}% ${50 - 50 * Math.sin(Math.PI * 2 * 0.52)}%)` 
                               }}>
                          </div>
                          <div className="absolute inset-0 bg-blue-500 rounded-full" 
                               style={{ 
                                 clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(Math.PI * 2 * 0.52)}% ${50 - 50 * Math.sin(Math.PI * 2 * 0.52)}%, ${50 + 50 * Math.cos(Math.PI * 2 * 0.9)}% ${50 - 50 * Math.sin(Math.PI * 2 * 0.9)}%)` 
                               }}>
                          </div>
                          <div className="absolute inset-0 bg-green-500 rounded-full" 
                               style={{ 
                                 clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(Math.PI * 2 * 0.9)}% ${50 - 50 * Math.sin(Math.PI * 2 * 0.9)}%, 50% 0)` 
                               }}>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white dark:bg-neutral-900 rounded-full h-32 w-32 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-sm text-neutral-500 dark:text-neutral-400">Total</div>
                                <div className="text-xl font-bold">{formatNumber(analyticsData.overview.totalVisitors)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-md">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-4 h-4 bg-primary rounded-full"></div>
                            <span className="font-medium">Mobile</span>
                          </div>
                          <div className="text-2xl font-bold">{formatNumber(analyticsData.devices.mobile)}</div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {Math.round((analyticsData.devices.mobile / analyticsData.overview.totalVisitors) * 100)}% of total
                          </div>
                        </div>
                        <div className="p-4 border rounded-md">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                            <span className="font-medium">Desktop</span>
                          </div>
                          <div className="text-2xl font-bold">{formatNumber(analyticsData.devices.desktop)}</div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {Math.round((analyticsData.devices.desktop / analyticsData.overview.totalVisitors) * 100)}% of total
                          </div>
                        </div>
                        <div className="p-4 border rounded-md">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                            <span className="font-medium">Tablet</span>
                          </div>
                          <div className="text-2xl font-bold">{formatNumber(analyticsData.devices.tablet)}</div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {Math.round((analyticsData.devices.tablet / analyticsData.overview.totalVisitors) * 100)}% of total
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sources">
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>Where your visitors are coming from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="h-80">
                      <BarChart 
                        data={analyticsData.sources} 
                        valueKey="visitors" 
                        labelKey="source" 
                        height={280}
                      />
                    </div>
                    <div className="border rounded-md divide-y">
                      {analyticsData.sources.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{item.source}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatNumber(item.visitors)}</span>
                            <span className="text-neutral-500 dark:text-neutral-400 text-sm">
                              ({Math.round((item.visitors / analyticsData.overview.totalVisitors) * 100)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
} 