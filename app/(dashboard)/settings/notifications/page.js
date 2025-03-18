"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const notificationSchema = z.object({
  alertThresholds: z.object({
    responseTime: z.number().min(100).max(10000),
    errorRate: z.number().min(0).max(100),
    cpuUsage: z.number().min(0).max(100),
    memoryUsage: z.number().min(0).max(100),
  }),
  channels: z.object({
    email: z.object({
      enabled: z.boolean(),
      address: z.string().email().optional(),
    }),
    slack: z.object({
      enabled: z.boolean(),
      webhook: z.string().url().optional(),
    }),
    sms: z.object({
      enabled: z.boolean(),
      phoneNumber: z.string().optional(),
    }),
  }),
  severity: z.object({
    info: z.boolean(),
    warning: z.boolean(),
    critical: z.boolean(),
    down: z.boolean(),
  }),
});

export default function NotificationsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      alertThresholds: {
        responseTime: 1000,
        errorRate: 5,
        cpuUsage: 80,
        memoryUsage: 80,
      },
      channels: {
        email: {
          enabled: true,
          address: 'user@example.com',
        },
        slack: {
          enabled: false,
          webhook: '',
        },
        sms: {
          enabled: false,
          phoneNumber: '',
        },
      },
      severity: {
        info: false,
        warning: true,
        critical: true,
        down: true,
      },
    },
  });
  
  async function onSubmit(data) {
    setIsSubmitting(true);
    
    try {
      // In production, this would call the API to save the notification settings
      console.log('Saving notification settings:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Notification settings saved successfully');
    } catch (error) {
      toast.error('Failed to save notification settings');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Configure how and when you receive notifications
        </p>
      </div>
      
      <Tabs defaultValue="thresholds" className="space-y-4">
        <TabsList>
          <TabsTrigger value="thresholds">Alert Thresholds</TabsTrigger>
          <TabsTrigger value="channels">Notification Channels</TabsTrigger>
          <TabsTrigger value="severity">Severity Levels</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="thresholds">
              <Card>
                <CardHeader>
                  <CardTitle>Alert Thresholds</CardTitle>
                  <CardDescription>
                    Configure when alerts should be triggered
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <FormField
                    control={form.control}
                    name="alertThresholds.responseTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Response Time (ms)</FormLabel>
                        <FormDescription>
                          Trigger an alert when response time exceeds this threshold
                        </FormDescription>
                        <FormControl>
                          <Input
                            type="number"
                            min={100}
                            max={10000}
                            step={100}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="alertThresholds.errorRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Error Rate (%)</FormLabel>
                        <FormDescription>
                          Trigger an alert when error rate exceeds this percentage
                        </FormDescription>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step={1}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="alertThresholds.cpuUsage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPU Usage (%)</FormLabel>
                        <FormDescription>
                          Trigger an alert when CPU usage exceeds this percentage
                        </FormDescription>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step={5}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="alertThresholds.memoryUsage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Memory Usage (%)</FormLabel>
                        <FormDescription>
                          Trigger an alert when memory usage exceeds this percentage
                        </FormDescription>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step={5}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="channels">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Channels</CardTitle>
                  <CardDescription>
                    Configure how you want to receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <FormField
                        control={form.control}
                        name="channels.email.enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between mb-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-semibold">
                                Email Notifications
                              </FormLabel>
                              <FormDescription>
                                Receive alert notifications via email
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {form.watch('channels.email.enabled') && (
                        <FormField
                          control={form.control}
                          name="channels.email.address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="you@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <FormField
                        control={form.control}
                        name="channels.slack.enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between mb-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-semibold">
                                Slack Notifications
                              </FormLabel>
                              <FormDescription>
                                Receive alert notifications in Slack
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {form.watch('channels.slack.enabled') && (
                        <FormField
                          control={form.control}
                          name="channels.slack.webhook"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slack Webhook URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://hooks.slack.com/services/..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <FormField
                        control={form.control}
                        name="channels.sms.enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between mb-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-semibold">
                                SMS Notifications
                              </FormLabel>
                              <FormDescription>
                                Receive alert notifications via SMS
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {form.watch('channels.sms.enabled') && (
                        <FormField
                          control={form.control}
                          name="channels.sms.phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="+1234567890" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="severity">
              <Card>
                <CardHeader>
                  <CardTitle>Severity Levels</CardTitle>
                  <CardDescription>
                    Configure which severity levels should trigger notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="severity.info"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                            Info
                          </FormLabel>
                          <FormDescription>
                            Low priority notifications and status updates
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="severity.warning"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                            Warning
                          </FormLabel>
                          <FormDescription>
                            Issues that may need attention but don't affect service
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="severity.critical"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            <span className="inline-block w-3 h-3 rounded-full bg-purple-600 mr-2"></span>
                            Critical
                          </FormLabel>
                          <FormDescription>
                            Serious issues affecting part of the service
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="severity.down"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                            Down
                          </FormLabel>
                          <FormDescription>
                            Service is completely unavailable
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </Button>
          </form>
        </Form>
      </Tabs>
    </div>
  );
} 