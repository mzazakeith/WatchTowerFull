'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  GlobeAltIcon,
  DeviceTabletIcon,
  PhoneIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

export default function VisitorCountPage() {
  const [visitorData, setVisitorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState('24h');

  // Sample data - this would be replaced with real API data
  useEffect(() => {
    const fetchVisitorData = async () => {
      try {
        setIsLoading(true);
        
        // This would be a real API call
        // const response = await fetch('/api/visitors/count?timeFrame=' + timeFrame);
        // const data = await response.json();
        
        // Simulated data for now
        setTimeout(() => {
          const data = generateMockData(timeFrame);
          setVisitorData(data);
          setError(null);
          setIsLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error fetching visitor data:', err);
        setError('Failed to load visitor data');
        toast.error('Failed to load visitor data');
        setIsLoading(false);
      }
    };

    fetchVisitorData();
  }, [timeFrame]);

  // Generate mock data for demo
  const generateMockData = (timeFrame) => {
    let totalVisitors, uniqueVisitors, bounceRate, avgSessionDuration;
    let visitorsByTime = [];
    let visitorsBySource = [];
    let visitorsByDevice = [];
    
    switch(timeFrame) {
      case '24h':
        totalVisitors = 2478;
        uniqueVisitors = 1842;
        bounceRate = 32.4;
        avgSessionDuration = '2m 15s';
        
        // Generate hourly data for the last 24 hours
        for (let i = 0; i < 24; i++) {
          const hour = new Date();
          hour.setHours(hour.getHours() - (23 - i));
          visitorsByTime.push({
            time: hour.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            visitors: Math.floor(Math.random() * 200) + 50,
            uniqueVisitors: Math.floor(Math.random() * 150) + 30
          });
        }
        break;
      case '7d':
        totalVisitors = 15234;
        uniqueVisitors = 9876;
        bounceRate = 28.7;
        avgSessionDuration = '2m 42s';
        
        // Generate daily data for the last 7 days
        for (let i = 0; i < 7; i++) {
          const day = new Date();
          day.setDate(day.getDate() - (6 - i));
          visitorsByTime.push({
            time: day.toLocaleDateString([], {weekday: 'short'}),
            visitors: Math.floor(Math.random() * 2000) + 1000,
            uniqueVisitors: Math.floor(Math.random() * 1500) + 800
          });
        }
        break;
      case '30d':
        totalVisitors = 58745;
        uniqueVisitors = 31890;
        bounceRate = 30.2;
        avgSessionDuration = '2m 38s';
        
        // Generate data for the last 30 days (grouped by 3 days)
        for (let i = 0; i < 10; i++) {
          const day = new Date();
          day.setDate(day.getDate() - (29 - i*3));
          visitorsByTime.push({
            time: day.toLocaleDateString([], {month: 'short', day: 'numeric'}),
            visitors: Math.floor(Math.random() * 6000) + 3000,
            uniqueVisitors: Math.floor(Math.random() * 4000) + 2000
          });
        }
        break;
    }
    
    // Traffic sources data
    visitorsBySource = [
      { source: 'Direct', count: Math.floor(Math.random() * totalVisitors * 0.3), percentage: 0 },
      { source: 'Organic Search', count: Math.floor(Math.random() * totalVisitors * 0.25), percentage: 0 },
      { source: 'Social Media', count: Math.floor(Math.random() * totalVisitors * 0.2), percentage: 0 },
      { source: 'Referral', count: Math.floor(Math.random() * totalVisitors * 0.15), percentage: 0 },
      { source: 'Email', count: Math.floor(Math.random() * totalVisitors * 0.1), percentage: 0 }
    ];
    
    // Calculate percentages
    const totalFromSources = visitorsBySource.reduce((sum, source) => sum + source.count, 0);
    visitorsBySource = visitorsBySource.map(source => ({
      ...source,
      percentage: ((source.count / totalFromSources) * 100).toFixed(1)
    }));
    
    // Device breakdown
    visitorsByDevice = [
      { device: 'Mobile', count: Math.floor(totalVisitors * 0.48), percentage: 48 },
      { device: 'Desktop', count: Math.floor(totalVisitors * 0.42), percentage: 42 },
      { device: 'Tablet', count: Math.floor(totalVisitors * 0.1), percentage: 10 }
    ];
    
    return {
      totalVisitors,
      uniqueVisitors,
      bounceRate,
      avgSessionDuration,
      visitorsByTime,
      visitorsBySource,
      visitorsByDevice
    };
  };

  const getChangeIndicator = (percentage) => {
    if (percentage > 0) {
      return <ArrowUpIcon className="w-4 h-4 text-green-500" />;
    } else if (percentage < 0) {
      return <ArrowDownIcon className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const getDeviceIcon = (device) => {
    switch(device.toLowerCase()) {
      case 'mobile':
        return <PhoneIcon className="w-5 h-5 text-primary" />;
      case 'tablet':
        return <DeviceTabletIcon className="w-5 h-5 text-primary" />;
      case 'desktop':
        return <ComputerDesktopIcon className="w-5 h-5 text-primary" />;
      default:
        return <PhoneIcon className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Visitor Count</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Monitor and analyze your website traffic
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setTimeFrame(timeFrame)}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => setTimeFrame(timeFrame)}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {!isLoading && !error && visitorData && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-primary" />
                  <span>Total Visitors</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{visitorData.totalVisitors.toLocaleString()}</div>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-600 dark:text-green-400">
                  <ArrowUpIcon className="w-4 h-4" />
                  <span>12.3% from previous period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-primary" />
                  <span>Unique Visitors</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{visitorData.uniqueVisitors.toLocaleString()}</div>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-600 dark:text-green-400">
                  <ArrowUpIcon className="w-4 h-4" />
                  <span>8.7% from previous period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-primary" />
                  <span>Bounce Rate</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{visitorData.bounceRate}%</div>
                <div className="flex items-center gap-1 mt-2 text-sm text-red-600 dark:text-red-400">
                  <ArrowUpIcon className="w-4 h-4" />
                  <span>2.1% from previous period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-primary" />
                  <span>Avg. Session</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{visitorData.avgSessionDuration}</div>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-600 dark:text-green-400">
                  <ArrowUpIcon className="w-4 h-4" />
                  <span>5.3% from previous period</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visitor Trend Graph */}
          <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
            <CardHeader>
              <CardTitle>Visitor Trend</CardTitle>
              <CardDescription>
                {timeFrame === '24h' ? 'Hourly' : timeFrame === '7d' ? 'Daily' : 'Weekly'} visitor count
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {/* Simple chart visualization using DIVs for demo */}
                <div className="flex h-64 gap-1 items-end">
                  {visitorData.visitorsByTime.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                      <div className="relative w-full">
                        <div 
                          className="bg-primary/20 w-full rounded-t-sm" 
                          style={{ height: `${(data.uniqueVisitors / Math.max(...visitorData.visitorsByTime.map(d => d.visitors))) * 200}px` }}
                        ></div>
                        <div 
                          className="bg-primary absolute bottom-0 w-full rounded-t-sm" 
                          style={{ height: `${(data.visitors / Math.max(...visitorData.visitorsByTime.map(d => d.visitors))) * 200}px` }}
                        ></div>
                        
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          <div>Total: {data.visitors}</div>
                          <div>Unique: {data.uniqueVisitors}</div>
                        </div>
                      </div>
                      <div className="text-xs mt-2 text-neutral-500 dark:text-neutral-400">{data.time}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-sm"></div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Visitors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary/20 rounded-sm"></div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Unique Visitors</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources and Device Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>
                  Where your visitors are coming from
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {visitorData.visitorsBySource.map((source, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-sm font-medium">{source.source}</div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {source.count.toLocaleString()} ({source.percentage}%)
                        </div>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${source.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
                <CardDescription>
                  Types of devices used by your visitors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {visitorData.visitorsByDevice.map((device, index) => (
                    <div key={index} className="flex flex-col items-center p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        {getDeviceIcon(device.device)}
                      </div>
                      <div className="text-lg font-bold">{device.percentage}%</div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">{device.device}</div>
                      <div className="text-xs mt-1">{device.count.toLocaleString()} visitors</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
} 