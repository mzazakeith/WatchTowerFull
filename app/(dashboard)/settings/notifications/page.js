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
import { IconBell, IconMail, IconBrandSlack, IconMessage, IconPhone, IconDeviceMobile } from '@tabler/icons-react';

const notificationSchema = z.object({
  channels: z.object({
    email: z.object({
      enabled: z.boolean(),
      address: z.string().email().optional(),
    }),
    browser: z.object({
      enabled: z.boolean(),
    }),
    mobile: z.object({
      enabled: z.boolean(),
      phoneNumber: z.string().optional(),
    }),
    slack: z.object({
      enabled: z.boolean(),
      webhook: z.string().url().or(z.string().length(0)).optional(),
      channel: z.string().optional(),
    }),
    sms: z.object({
      enabled: z.boolean(),
      phoneNumber: z.string().optional(),
    }),
  }),
  alerts: z.object({
    thresholds: z.object({
      responseTime: z.number().min(100).max(10000),
      errorRate: z.number().min(0).max(100),
      cpuUsage: z.number().min(0).max(100),
      memoryUsage: z.number().min(0).max(100),
    }),
    severity: z.object({
      info: z.boolean(),
      warning: z.boolean(),
      critical: z.boolean(),
      down: z.boolean(),
    }),
  }),
  preferences: z.object({
    dailyDigest: z.boolean(),
    weeklyReport: z.boolean(),
    quietHours: z.object({
      enabled: z.boolean(),
      start: z.string(),
      end: z.string(),
    }),
  }),
});

export default function NotificationsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      channels: {
        email: {
          enabled: true,
          address: 'user@example.com',
        },
        browser: {
          enabled: true,
        },
        mobile: {
          enabled: false,
          phoneNumber: '',
        },
        slack: {
          enabled: false,
          webhook: '',
          channel: '',
        },
        sms: {
          enabled: false,
          phoneNumber: '',
        },
      },
      alerts: {
        thresholds: {
          responseTime: 1000,
          errorRate: 5,
          cpuUsage: 80,
          memoryUsage: 80,
        },
        severity: {
          info: false,
          warning: true,
          critical: true,
          down: true,
        },
      },
      preferences: {
        dailyDigest: true,
        weeklyReport: true,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
        },
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
      
      <Tabs defaultValue="channels" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="channels">Notification Channels</TabsTrigger>
          <TabsTrigger value="alerts">Alert Settings</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="channels">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Channels</CardTitle>
                  <CardDescription>
                    Choose how you'd like to receive notifications and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email Channel */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconMail size={24} />
                        <div>
                          <h3 className="text-lg font-medium">Email Notifications</h3>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Receive notifications via email
                          </p>
                        </div>
                      </div>
                      <FormField
                        control={form.control}
                        name="channels.email.enabled"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {form.watch("channels.email.enabled") && (
                      <div className="pt-2">
                        <FormField
                          control={form.control}
                          name="channels.email.address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="your@email.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Email address for receiving notifications
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Browser Channel */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconBell size={24} />
                        <div>
                          <h3 className="text-lg font-medium">Browser Notifications</h3>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Get notifications in your browser
                          </p>
                        </div>
                      </div>
                      <FormField
                        control={form.control}
                        name="channels.browser.enabled"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Mobile Channel */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconDeviceMobile size={24} />
                        <div>
                          <h3 className="text-lg font-medium">Mobile Push Notifications</h3>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Receive notifications on your mobile device
                          </p>
                        </div>
                      </div>
                      <FormField
                        control={form.control}
                        name="channels.mobile.enabled"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {form.watch("channels.mobile.enabled") && (
                      <div className="pt-2">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                          Download our mobile app and sign in to receive push notifications
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* SMS Channel */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconPhone size={24} />
                        <div>
                          <h3 className="text-lg font-medium">SMS Alerts</h3>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Get critical alerts via text message
                          </p>
                        </div>
                      </div>
                      <FormField
                        control={form.control}
                        name="channels.sms.enabled"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {form.watch("channels.sms.enabled") && (
                      <div className="pt-2">
                        <FormField
                          control={form.control}
                          name="channels.sms.phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="+1 (555) 123-4567"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Phone number for receiving SMS alerts
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Slack Channel */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconBrandSlack size={24} className="text-[#4A154B]" />
                        <div>
                          <h3 className="text-lg font-medium">Slack Notifications</h3>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Get notifications in your Slack workspace
                          </p>
                        </div>
                      </div>
                      <FormField
                        control={form.control}
                        name="channels.slack.enabled"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {form.watch("channels.slack.enabled") && (
                      <div className="space-y-4 pt-2">
                        <FormField
                          control={form.control}
                          name="channels.slack.webhook"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Webhook URL</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://hooks.slack.com/services/xxx/yyy/zzz"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                The webhook URL for your Slack workspace
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="channels.slack.channel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Channel</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="#alerts"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                The channel where notifications will be sent
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="alerts">
              <Card>
                <CardHeader>
                  <CardTitle>Alert Settings</CardTitle>
                  <CardDescription>
                    Configure when alerts should be triggered and their severity levels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Alert Thresholds</h3>
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="alerts.thresholds.responseTime"
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
                        name="alerts.thresholds.errorRate"
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
                        name="alerts.thresholds.cpuUsage"
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
                        name="alerts.thresholds.memoryUsage"
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
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Severity Levels</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                      Choose which severity levels should trigger notifications
                    </p>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="alerts.severity.info"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border">
                            <div>
                              <FormLabel className="font-medium">Info</FormLabel>
                              <FormDescription>
                                Informational alerts (no action required)
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
                        name="alerts.severity.warning"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border">
                            <div>
                              <FormLabel className="font-medium">Warning</FormLabel>
                              <FormDescription>
                                Warning alerts (might require attention)
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
                        name="alerts.severity.critical"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border">
                            <div>
                              <FormLabel className="font-medium">Critical</FormLabel>
                              <FormDescription>
                                Critical alerts (requires immediate attention)
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
                        name="alerts.severity.down"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border">
                            <div>
                              <FormLabel className="font-medium">Service Down</FormLabel>
                              <FormDescription>
                                Service outage alerts (highest priority)
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Customize how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="preferences.dailyDigest"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border">
                          <div>
                            <FormLabel className="font-medium">Daily Digest</FormLabel>
                            <FormDescription>
                              Receive a daily summary of all activity
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
                      name="preferences.weeklyReport"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border">
                          <div>
                            <FormLabel className="font-medium">Weekly Report</FormLabel>
                            <FormDescription>
                              Receive a weekly summary with detailed analytics
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
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="preferences.quietHours.enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4 rounded-lg border">
                          <div>
                            <FormLabel className="font-medium">Quiet Hours</FormLabel>
                            <FormDescription>
                              Don't send notifications during specific hours
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
                    
                    {form.watch("preferences.quietHours.enabled") && (
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <FormField
                          control={form.control}
                          name="preferences.quietHours.start"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                When quiet hours begin
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="preferences.quietHours.end"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                When quiet hours end
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <CardFooter className="flex justify-end px-0">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Tabs>
    </div>
  );
} 