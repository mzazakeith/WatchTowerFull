"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createServiceSchema } from '@/lib/validators/service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const checkTypes = [
  { id: 'http', name: 'HTTP/HTTPS', description: 'HTTP or HTTPS endpoint check' },
  { id: 'ping', name: 'Ping', description: 'ICMP ping check' },
  { id: 'dns', name: 'DNS', description: 'DNS resolution check' },
  { id: 'port', name: 'Port', description: 'TCP port check' },
  { id: 'tcp', name: 'TCP', description: 'Custom TCP connection check' },
  { id: 'ssl', name: 'SSL', description: 'SSL certificate check' },
  { id: 'custom', name: 'Custom', description: 'Custom script check' },
];

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'];

export default function ServiceForm({ service, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  const form = useForm({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: service?.name || '',
      description: service?.description || '',
      url: service?.url || '',
      checkType: service?.checkType || 'http',
      interval: service?.interval || 60,
      timeout: service?.timeout || 30,
      expectedStatusCode: service?.expectedStatusCode || 200,
      expectedResponseContent: service?.expectedResponseContent || '',
      httpMethod: service?.httpMethod || 'GET',
      requestHeaders: service?.requestHeaders || {},
      requestBody: service?.requestBody || '',
      followRedirects: service?.followRedirects ?? true,
      verifySSL: service?.verifySSL ?? true,
      port: service?.port || null,
      tags: service?.tags || [],
      alertThresholds: {
        responseTime: {
          warning: service?.alertThresholds?.responseTime?.warning || 1000,
          critical: service?.alertThresholds?.responseTime?.critical || 3000,
        },
        availability: {
          warning: service?.alertThresholds?.availability?.warning || 95,
          critical: service?.alertThresholds?.availability?.critical || 90,
        },
      },
    },
  });

  const selectedCheckType = form.watch('checkType');

  async function handleSubmit(data) {
    setIsSubmitting(true);
    try {
      // In production, this would call the API
      // const response = await fetch('/api/services', {
      //   method: service ? 'PUT' : 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      // const result = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(`Service ${service ? 'updated' : 'created'} successfully`);
      
      if (onSubmit) {
        onSubmit(data);
      }
    } catch (error) {
      toast.error(`Failed to ${service ? 'update' : 'create'} service`);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{service ? 'Edit Service' : 'Add New Service'}</CardTitle>
        <CardDescription>
          {service 
            ? 'Update your service monitoring settings' 
            : 'Configure a new service to monitor'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
                <TabsTrigger value="alert">Alert Thresholds</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My API" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="checkType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a check type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {checkTypes.map(type => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {checkTypes.find(t => t.id === field.value)?.description}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://api.example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        The URL to check
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description of this service"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="interval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check Interval (seconds)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={10}
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value, 10))}
                          />
                        </FormControl>
                        <FormDescription>
                          How often to check this service
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeout (seconds)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1}
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value, 10))}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum time to wait for a response
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                {selectedCheckType === 'http' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="httpMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>HTTP Method</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select HTTP method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {httpMethods.map(method => (
                                  <SelectItem key={method} value={method}>
                                    {method}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="expectedStatusCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expected Status Code</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value, 10))}
                              />
                            </FormControl>
                            <FormDescription>
                              The status code you expect
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="expectedResponseContent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Response Content</FormLabel>
                          <FormControl>
                            <Input placeholder="String to check for in the response" {...field} />
                          </FormControl>
                          <FormDescription>
                            Check if the response contains this content
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="followRedirects"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Follow Redirects</FormLabel>
                            <Select 
                              onValueChange={value => field.onChange(value === 'true')} 
                              defaultValue={field.value ? 'true' : 'false'}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Follow redirects?" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="verifySSL"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Verify SSL Certificate</FormLabel>
                            <Select 
                              onValueChange={value => field.onChange(value === 'true')} 
                              defaultValue={field.value ? 'true' : 'false'}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Verify SSL?" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {['port', 'tcp'].includes(selectedCheckType) && (
                  <FormField
                    control={form.control}
                    name="port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port Number</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1}
                            max={65535}
                            placeholder="80"
                            {...field}
                            value={field.value || ''}
                            onChange={e => field.onChange(parseInt(e.target.value, 10) || null)}
                          />
                        </FormControl>
                        <FormDescription>
                          The port number to check
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Comma-separated tags"
                          {...field}
                          value={field.value.join(', ')}
                          onChange={e => {
                            const tags = e.target.value
                              .split(',')
                              .map(tag => tag.trim())
                              .filter(Boolean);
                            field.onChange(tags);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Tags help organize and filter services
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="alert" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="alertThresholds.responseTime.warning"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Response Time Warning (ms)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={100}
                            placeholder="1000"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value, 10))}
                          />
                        </FormControl>
                        <FormDescription>
                          Alert when response time exceeds this value
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alertThresholds.responseTime.critical"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Response Time Critical (ms)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={100}
                            placeholder="3000"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value, 10))}
                          />
                        </FormControl>
                        <FormDescription>
                          Alert as critical when response time exceeds this value
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="alertThresholds.availability.warning"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability Warning (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={50}
                            max={99}
                            placeholder="95"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value, 10))}
                          />
                        </FormControl>
                        <FormDescription>
                          Alert when availability falls below this percentage
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alertThresholds.availability.critical"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability Critical (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={50}
                            max={99}
                            placeholder="90"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value, 10))}
                          />
                        </FormControl>
                        <FormDescription>
                          Alert as critical when availability falls below this percentage
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <CardFooter className="p-0">
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 w-full justify-end mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Navigate back or cancel
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 
                    (service ? 'Updating...' : 'Creating...') : 
                    (service ? 'Update Service' : 'Create Service')
                  }
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 