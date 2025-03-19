"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Define the validation schema
const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60, 'Name cannot be more than 60 characters'),
  description: z.string().max(200, 'Description cannot be more than 200 characters').optional(),
  url: z.string().min(1, 'URL is required'),
  checkType: z.enum(['http', 'ping', 'tcp', 'dns', 'ssl', 'port', 'custom']),
  interval: z.number().min(10, 'Interval must be at least 10 seconds').default(60),
  timeout: z.number().min(1, 'Timeout must be at least 1 second').default(30),
  expectedStatusCode: z.number().optional(),
  expectedResponseContent: z.string().optional(),
  httpMethod: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH']).optional(),
  followRedirects: z.boolean().default(true),
  verifySSL: z.boolean().default(true),
  port: z.number().min(1, 'Port must be at least 1').max(65535, 'Port cannot be more than 65535').optional(),
  tags: z.array(z.string()).default([]),
  alertThresholds: z.object({
    responseTime: z.object({
      warning: z.number().default(1000),
      critical: z.number().default(3000),
    }),
    availability: z.object({
      warning: z.number().default(95),
      critical: z.number().default(90),
    }),
  }).optional(),
});

export default function ServiceForm({ initialData, onSubmit }) {
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [requestHeaders, setRequestHeaders] = useState(initialData?.requestHeaders || []);
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');

  // Initialize form with default values or initial data
  const form = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      url: '',
      checkType: 'http',
      interval: 60,
      timeout: 30,
      expectedStatusCode: 200,
      expectedResponseContent: '',
      httpMethod: 'GET',
      followRedirects: true,
      verifySSL: true,
      tags: [],
      alertThresholds: {
        responseTime: {
          warning: 1000,
          critical: 3000,
        },
        availability: {
          warning: 95,
          critical: 90,
        },
      },
    },
  });

  // Handle form submission
  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Convert requestHeaders array to Map format for API
      const headersMap = {};
      requestHeaders.forEach(header => {
        headersMap[header.key] = header.value;
      });
      
      // Add headers to data
      const serviceData = {
        ...data,
        requestHeaders: headersMap,
      };
      
      await onSubmit(serviceData);
      toast.success('Service saved successfully');
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle adding a new tag
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    const currentTags = form.getValues('tags') || [];
    if (!currentTags.includes(newTag)) {
      form.setValue('tags', [...currentTags, newTag]);
    }
    setNewTag('');
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  // Handle adding a new header
  const handleAddHeader = () => {
    if (!newHeaderKey.trim() || !newHeaderValue.trim()) return;
    
    setRequestHeaders([...requestHeaders, { key: newHeaderKey, value: newHeaderValue }]);
    setNewHeaderKey('');
    setNewHeaderValue('');
  };

  // Handle removing a header
  const handleRemoveHeader = (index) => {
    const updatedHeaders = [...requestHeaders];
    updatedHeaders.splice(index, 1);
    setRequestHeaders(updatedHeaders);
  };

  // Determine if additional fields should be shown based on check type
  const showHttpFields = form.watch('checkType') === 'http';
  const showPortField = ['tcp', 'port'].includes(form.watch('checkType'));
  const showSslFields = ['http', 'ssl'].includes(form.watch('checkType'));

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
        </TabsList>
        
        {/* Basic Settings Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    id="name"
                    placeholder="My API Service"
                    {...form.register('name')}
                    error={form.formState.errors.name?.message}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url">URL / Endpoint</Label>
                  <Input
                    id="url"
                    placeholder="https://api.example.com"
                    {...form.register('url')}
                  />
                  {form.formState.errors.url && (
                    <p className="text-sm text-red-500">{form.formState.errors.url.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this service"
                  {...form.register('description')}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkType">Check Type</Label>
                  <Select
                    onValueChange={(value) => form.setValue('checkType', value)}
                    defaultValue={form.getValues('checkType')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select check type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="http">HTTP/HTTPS</SelectItem>
                      <SelectItem value="ping">Ping</SelectItem>
                      <SelectItem value="tcp">TCP</SelectItem>
                      <SelectItem value="dns">DNS</SelectItem>
                      <SelectItem value="port">Port</SelectItem>
                      <SelectItem value="ssl">SSL Certificate</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interval">Check Interval (seconds)</Label>
                  <Input
                    id="interval"
                    type="number"
                    min="10"
                    {...form.register('interval', { valueAsNumber: true })}
                  />
                  {form.formState.errors.interval && (
                    <p className="text-sm text-red-500">{form.formState.errors.interval.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.watch('tags')?.map((tag, index) => (
                    <Badge key={index} className="flex items-center gap-1">
                      {tag}
                      <XMarkIcon 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" size="sm" onClick={handleAddTag}>
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Advanced Settings Tab */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    min="1"
                    {...form.register('timeout', { valueAsNumber: true })}
                  />
                  {form.formState.errors.timeout && (
                    <p className="text-sm text-red-500">{form.formState.errors.timeout.message}</p>
                  )}
                </div>
                
                {showPortField && (
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      type="number"
                      min="1"
                      max="65535"
                      placeholder="443"
                      {...form.register('port', { valueAsNumber: true })}
                    />
                    {form.formState.errors.port && (
                      <p className="text-sm text-red-500">{form.formState.errors.port.message}</p>
                    )}
                  </div>
                )}
              </div>
              
              {showHttpFields && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="httpMethod">HTTP Method</Label>
                      <Select
                        onValueChange={(value) => form.setValue('httpMethod', value)}
                        defaultValue={form.getValues('httpMethod')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select HTTP method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="HEAD">HEAD</SelectItem>
                          <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="expectedStatusCode">Expected Status Code</Label>
                      <Input
                        id="expectedStatusCode"
                        type="number"
                        placeholder="200"
                        {...form.register('expectedStatusCode', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expectedResponseContent">Expected Response Content (Optional)</Label>
                    <Textarea
                      id="expectedResponseContent"
                      placeholder="Content that should be present in the response"
                      {...form.register('expectedResponseContent')}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="followRedirects"
                        checked={form.watch('followRedirects')}
                        onCheckedChange={(checked) => form.setValue('followRedirects', checked)}
                      />
                      <Label htmlFor="followRedirects">Follow Redirects</Label>
                    </div>
                    
                    {showSslFields && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="verifySSL"
                          checked={form.watch('verifySSL')}
                          onCheckedChange={(checked) => form.setValue('verifySSL', checked)}
                        />
                        <Label htmlFor="verifySSL">Verify SSL Certificate</Label>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alert Thresholds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Response Time</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="responseTimeWarning">Warning Threshold (ms)</Label>
                    <Input
                      id="responseTimeWarning"
                      type="number"
                      min="0"
                      placeholder="1000"
                      {...form.register('alertThresholds.responseTime.warning', { valueAsNumber: true })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="responseTimeCritical">Critical Threshold (ms)</Label>
                    <Input
                      id="responseTimeCritical"
                      type="number"
                      min="0"
                      placeholder="3000"
                      {...form.register('alertThresholds.responseTime.critical', { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Availability</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="availabilityWarning">Warning Threshold (%)</Label>
                    <Input
                      id="availabilityWarning"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="95"
                      {...form.register('alertThresholds.availability.warning', { valueAsNumber: true })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="availabilityCritical">Critical Threshold (%)</Label>
                    <Input
                      id="availabilityCritical"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="90"
                      {...form.register('alertThresholds.availability.critical', { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Headers Tab (for HTTP checks) */}
        <TabsContent value="headers">
          <Card>
            <CardHeader>
              <CardTitle>Request Headers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {showHttpFields ? (
                <>
                  <div className="space-y-4">
                    {requestHeaders.map((header, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={header.key}
                          onChange={(e) => {
                            const updatedHeaders = [...requestHeaders];
                            updatedHeaders[index].key = e.target.value;
                            setRequestHeaders(updatedHeaders);
                          }}
                          placeholder="Header name"
                          className="flex-1"
                        />
                        <Input
                          value={header.value}
                          onChange={(e) => {
                            const updatedHeaders = [...requestHeaders];
                            updatedHeaders[index].value = e.target.value;
                            setRequestHeaders(updatedHeaders);
                          }}
                          placeholder="Header value"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveHeader(index)}
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="headerKey">Header Name</Label>
                      <Input
                        id="headerKey"
                        value={newHeaderKey}
                        onChange={(e) => setNewHeaderKey(e.target.value)}
                        placeholder="Content-Type"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="headerValue">Header Value</Label>
                      <Input
                        id="headerValue"
                        value={newHeaderValue}
                        onChange={(e) => setNewHeaderValue(e.target.value)}
                        placeholder="application/json"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddHeader}
                      className="mb-0.5"
                    >
                      Add
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-neutral-500 dark:text-neutral-400">
                  Headers are only available for HTTP/HTTPS checks.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialData ? 'Update Service' : 'Create Service'}
            </Button>
          </div>
        </form>
      );
    }