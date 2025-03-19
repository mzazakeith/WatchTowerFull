 'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  UsersIcon,
  FingerPrintIcon,
  CodeBracketIcon,
  FolderIcon,
  BellIcon,
  CheckIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowsRightLeftIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

export default function VisitorIdentificationPage() {
  const [visitorIdentification, setVisitorIdentification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('settings');
  const [configurations, setConfigurations] = useState({
    fingerprintEnabled: true,
    cookiesEnabled: true,
    ipTrackingEnabled: true,
    userAgentEnabled: true,
    geoLocationEnabled: false,
    analyticsIntegration: true,
    storageType: 'database',
    retentionPeriod: '90',
    anonymizationLevel: 'partial'
  });

  // Sample data - would be replaced with real API data
  useEffect(() => {
    const fetchIdentificationData = async () => {
      try {
        setIsLoading(true);
        
        // Simulated API call
        // const response = await fetch('/api/visitors/identification');
        // const data = await response.json();
        
        // Simulated data for now
        setTimeout(() => {
          const data = generateMockData();
          setVisitorIdentification(data);
          setConfigurations(data.settings);
          setError(null);
          setIsLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error fetching visitor identification data:', err);
        setError('Failed to load visitor identification data');
        toast.error('Failed to load visitor identification data');
        setIsLoading(false);
      }
    };

    fetchIdentificationData();
  }, []);

  // Generate mock data for demo
  const generateMockData = () => {
    return {
      stats: {
        identifiedVisitors: 18759,
        anonymousVisitors: 3215,
        identificationRate: 85.4,
        returningVisitors: 12453,
        newVisitors: 9521,
      },
      topReferrers: [
        { name: 'Google', count: 8975, percentage: 41 },
        { name: 'Direct', count: 5241, percentage: 24 },
        { name: 'Twitter', count: 2893, percentage: 13 },
        { name: 'LinkedIn', count: 1764, percentage: 8 },
        { name: 'Facebook', count: 1105, percentage: 5 },
      ],
      identificationMethods: [
        { method: 'Browser Fingerprint', count: 12543, percentage: 57 },
        { method: 'Cookies', count: 8745, percentage: 40 },
        { method: 'IP Address', count: 574, percentage: 3 },
      ],
      recentVisitors: [
        { id: 'vis_12345', fingerprint: 'fp_a1b2c3d4', ipAddress: '192.168.1.xx', location: 'New York, US', lastVisit: '2 minutes ago', visits: 12, identified: true },
        { id: 'vis_12346', fingerprint: 'fp_b2c3d4e5', ipAddress: '10.0.0.xx', location: 'London, UK', lastVisit: '15 minutes ago', visits: 5, identified: true },
        { id: 'vis_12347', fingerprint: 'fp_c3d4e5f6', ipAddress: '172.16.0.xx', location: 'Tokyo, JP', lastVisit: '32 minutes ago', visits: 1, identified: false },
        { id: 'vis_12348', fingerprint: 'fp_d4e5f6g7', ipAddress: '169.254.xx.xx', location: 'Paris, FR', lastVisit: '1 hour ago', visits: 8, identified: true },
        { id: 'vis_12349', fingerprint: 'fp_e5f6g7h8', ipAddress: '127.0.0.xx', location: 'Sydney, AU', lastVisit: '3 hours ago', visits: 2, identified: true },
      ],
      settings: {
        fingerprintEnabled: true,
        cookiesEnabled: true,
        ipTrackingEnabled: true,
        userAgentEnabled: true,
        geoLocationEnabled: false,
        analyticsIntegration: true,
        storageType: 'database',
        retentionPeriod: '90',
        anonymizationLevel: 'partial'
      }
    };
  };

  const handleToggleChange = (field) => {
    setConfigurations(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
    
    toast.success(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ${!configurations[field] ? 'enabled' : 'disabled'}`);
  };

  const handleSelectChange = (field, value) => {
    setConfigurations(prev => ({
      ...prev,
      [field]: value
    }));
    
    toast.success(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} updated to ${value}`);
  };

  const handleSaveSettings = () => {
    // This would send the configurations to the API
    // const saveSettings = async () => {
    //   const response = await fetch('/api/visitors/identification/settings', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(configurations),
    //   });
    //   
    //   if (!response.ok) {
    //     throw new Error('Failed to save settings');
    //   }
    // };
    
    toast.success('Identification settings saved successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Visitor Identification</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Configure and manage visitor identification settings
          </p>
        </div>
        <Button onClick={handleSaveSettings}>
          Save Settings
        </Button>
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
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {!isLoading && !error && visitorIdentification && (
        <>
          {/* Key Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <FingerPrintIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">
                    {visitorIdentification.stats.identificationRate}%
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    Identification Rate
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <UsersIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">
                    {visitorIdentification.stats.identifiedVisitors.toLocaleString()}
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    Identified Visitors
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <EyeIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">
                    {visitorIdentification.stats.anonymousVisitors.toLocaleString()}
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    Anonymous Visitors
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">
                    {visitorIdentification.stats.returningVisitors.toLocaleString()}
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    Returning Visitors
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <UsersIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">
                    {visitorIdentification.stats.newVisitors.toLocaleString()}
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    New Visitors
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content with tabs */}
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="settings">
                <CodeBracketIcon className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="data">
                <FolderIcon className="h-4 w-4 mr-2" />
                Data & Storage
              </TabsTrigger>
              <TabsTrigger value="visitors">
                <UsersIcon className="h-4 w-4 mr-2" />
                Recent Visitors
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="space-y-4">
              <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Identification Methods</CardTitle>
                  <CardDescription>
                    Configure which methods to use for visitor identification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Browser Fingerprinting</Label>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Identify visitors based on their browser characteristics
                      </p>
                    </div>
                    <Switch 
                      checked={configurations.fingerprintEnabled}
                      onCheckedChange={() => handleToggleChange('fingerprintEnabled')}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Cookies</Label>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Use cookies to identify returning visitors
                      </p>
                    </div>
                    <Switch 
                      checked={configurations.cookiesEnabled}
                      onCheckedChange={() => handleToggleChange('cookiesEnabled')}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">IP Address Tracking</Label>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Identify visitors based on their IP address
                      </p>
                    </div>
                    <Switch 
                      checked={configurations.ipTrackingEnabled}
                      onCheckedChange={() => handleToggleChange('ipTrackingEnabled')}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">User Agent</Label>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Store and use user agent information for identification
                      </p>
                    </div>
                    <Switch 
                      checked={configurations.userAgentEnabled}
                      onCheckedChange={() => handleToggleChange('userAgentEnabled')}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Geolocation</Label>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Request permission for precise geolocation data
                      </p>
                    </div>
                    <Switch 
                      checked={configurations.geoLocationEnabled}
                      onCheckedChange={() => handleToggleChange('geoLocationEnabled')}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Integration Settings</CardTitle>
                  <CardDescription>
                    Configure how visitor identification integrates with other systems
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Analytics Integration</Label>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Connect visitor identification with analytics data
                      </p>
                    </div>
                    <Switch 
                      checked={configurations.analyticsIntegration}
                      onCheckedChange={() => handleToggleChange('analyticsIntegration')}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="data" className="space-y-4">
              <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Data Storage</CardTitle>
                  <CardDescription>
                    Configure how visitor identification data is stored
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Storage Type</Label>
                    <Select 
                      value={configurations.storageType} 
                      onValueChange={(value) => handleSelectChange('storageType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select storage type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="database">Database</SelectItem>
                        <SelectItem value="localStorage">Browser Local Storage</SelectItem>
                        <SelectItem value="hybrid">Hybrid (Both)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      How visitor identification data will be stored
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Data Retention Period (Days)</Label>
                    <Select 
                      value={configurations.retentionPeriod} 
                      onValueChange={(value) => handleSelectChange('retentionPeriod', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select retention period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="365">365 days</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      How long visitor identification data will be kept
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Anonymization Level</Label>
                    <Select 
                      value={configurations.anonymizationLevel} 
                      onValueChange={(value) => handleSelectChange('anonymizationLevel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select anonymization level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Full Data)</SelectItem>
                        <SelectItem value="partial">Partial (IP Masking)</SelectItem>
                        <SelectItem value="full">Full Anonymization</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      How visitor data will be anonymized
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Identification Methods Usage</CardTitle>
                  <CardDescription>
                    How visitors are being identified on your site
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {visitorIdentification.identificationMethods.map((method, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-sm font-medium">{method.method}</div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {method.count.toLocaleString()} ({method.percentage}%)
                          </div>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${method.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="visitors" className="space-y-4">
              <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Recent Visitors</CardTitle>
                  <CardDescription>
                    Recently identified visitors to your website
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800">
                          <th className="text-left py-3 px-4 text-neutral-500 dark:text-neutral-400 font-medium text-sm">Visitor ID</th>
                          <th className="text-left py-3 px-4 text-neutral-500 dark:text-neutral-400 font-medium text-sm">Status</th>
                          <th className="text-left py-3 px-4 text-neutral-500 dark:text-neutral-400 font-medium text-sm">IP Address</th>
                          <th className="text-left py-3 px-4 text-neutral-500 dark:text-neutral-400 font-medium text-sm">Location</th>
                          <th className="text-left py-3 px-4 text-neutral-500 dark:text-neutral-400 font-medium text-sm">Last Visit</th>
                          <th className="text-left py-3 px-4 text-neutral-500 dark:text-neutral-400 font-medium text-sm">Visits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visitorIdentification.recentVisitors.map((visitor, index) => (
                          <tr key={index} className="border-b border-neutral-200 dark:border-neutral-800">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <FingerPrintIcon className="h-4 w-4 mr-2 text-primary" />
                                <span>{visitor.id}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {visitor.identified ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                  Identified
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                                  Anonymous
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                              {visitor.ipAddress}
                            </td>
                            <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                              {visitor.location}
                            </td>
                            <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                              {visitor.lastVisit}
                            </td>
                            <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                              {visitor.visits}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-neutral-200 dark:border-neutral-800 pt-4">
                  <Button variant="outline">
                    View All Visitors
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-white dark:bg-neutral-900 border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Top Referrers</CardTitle>
                  <CardDescription>
                    Sources bringing visitors to your site
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {visitorIdentification.topReferrers.map((referrer, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-sm font-medium">{referrer.name}</div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {referrer.count.toLocaleString()} ({referrer.percentage}%)
                          </div>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${referrer.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
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