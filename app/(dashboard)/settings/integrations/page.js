"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { IconBrandSlack, IconBrandDiscord, IconBrandGithub, IconApi, IconWebhook } from '@tabler/icons-react';

const integrationsSchema = z.object({
  messaging: z.object({
    slack: z.object({
      enabled: z.boolean(),
      webhookUrl: z.string().url().or(z.string().length(0)).optional(),
      channel: z.string().optional(),
    }),
    discord: z.object({
      enabled: z.boolean(),
      webhookUrl: z.string().url().or(z.string().length(0)).optional(),
      channel: z.string().optional(),
    }),
  }),
  devops: z.object({
    github: z.object({
      enabled: z.boolean(),
      token: z.string().optional(),
      repository: z.string().optional(),
    }),
    pagerduty: z.object({
      enabled: z.boolean(),
      apiKey: z.string().optional(),
      serviceId: z.string().optional(),
    }),
  }),
  custom: z.object({
    webhook: z.object({
      enabled: z.boolean(),
      url: z.string().url().or(z.string().length(0)).optional(),
      headers: z.string().optional(),
    }),
    api: z.object({
      enabled: z.boolean(),
      endpoint: z.string().url().or(z.string().length(0)).optional(),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).optional(),
      apiKey: z.string().optional(),
    }),
  }),
});

export default function IntegrationsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(integrationsSchema),
    defaultValues: {
      messaging: {
        slack: {
          enabled: false,
          webhookUrl: '',
          channel: '',
        },
        discord: {
          enabled: false,
          webhookUrl: '',
          channel: '',
        },
      },
      devops: {
        github: {
          enabled: false,
          token: '',
          repository: '',
        },
        pagerduty: {
          enabled: false,
          apiKey: '',
          serviceId: '',
        },
      },
      custom: {
        webhook: {
          enabled: false,
          url: '',
          headers: '',
        },
        api: {
          enabled: false,
          endpoint: '',
          method: 'POST',
          apiKey: '',
        },
      },
    },
  });
  
  async function onSubmit(data) {
    setIsSubmitting(true);
    
    try {
      // In production, this would call the API to save the integration settings
      console.log('Saving integration settings:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Integration settings saved successfully');
    } catch (error) {
      toast.error('Failed to save integration settings');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Connect WatchTower with your favorite tools and services
        </p>
      </div>
      
      <Tabs defaultValue="messaging" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="devops">DevOps</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="messaging">
              <Card>
                <CardHeader>
                  <CardTitle>Messaging Integrations</CardTitle>
                  <CardDescription>
                    Connect to messaging platforms to receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Slack Integration */}
                  <div className="rounded-lg border p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconBrandSlack size={24} className="text-[#4A154B]" />
                        <h3 className="text-lg font-medium">Slack</h3>
                      </div>
                      <FormField
                        control={form.control}
                        name="messaging.slack.enabled"
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
                    
                    {form.watch("messaging.slack.enabled") && (
                      <div className="space-y-4 pt-2">
                        <FormField
                          control={form.control}
                          name="messaging.slack.webhookUrl"
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
                          name="messaging.slack.channel"
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
                  
                  {/* Discord Integration */}
                  <div className="rounded-lg border p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconBrandDiscord size={24} className="text-[#5865F2]" />
                        <h3 className="text-lg font-medium">Discord</h3>
                      </div>
                      <FormField
                        control={form.control}
                        name="messaging.discord.enabled"
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
                    
                    {form.watch("messaging.discord.enabled") && (
                      <div className="space-y-4 pt-2">
                        <FormField
                          control={form.control}
                          name="messaging.discord.webhookUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Webhook URL</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://discord.com/api/webhooks/xxx/yyy"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                The webhook URL for your Discord server
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="messaging.discord.channel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Channel</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="#monitoring"
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
            
            <TabsContent value="devops">
              <Card>
                <CardHeader>
                  <CardTitle>DevOps Integrations</CardTitle>
                  <CardDescription>
                    Connect with your development and operations tools
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* GitHub Integration */}
                  <div className="rounded-lg border p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconBrandGithub size={24} />
                        <h3 className="text-lg font-medium">GitHub</h3>
                      </div>
                      <FormField
                        control={form.control}
                        name="devops.github.enabled"
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
                    
                    {form.watch("devops.github.enabled") && (
                      <div className="space-y-4 pt-2">
                        <FormField
                          control={form.control}
                          name="devops.github.token"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Access Token</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="ghp_xxxxxxxxxxxxxxxx"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                GitHub personal access token with repo scope
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="devops.github.repository"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Repository</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="owner/repository"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                The GitHub repository to integrate with
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* PagerDuty Integration */}
                  {/* <div className="rounded-lg border p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconBrandPager size={24} className="text-[#06AC38]" />
                        <h3 className="text-lg font-medium">PagerDuty</h3>
                      </div>
                      <FormField
                        control={form.control}
                        name="devops.pagerduty.enabled"
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
                    
                    {form.watch("devops.pagerduty.enabled") && (
                      <div className="space-y-4 pt-2">
                        <FormField
                          control={form.control}
                          name="devops.pagerduty.apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="xxxxxxxxxxxx"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Your PagerDuty API key
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="devops.pagerduty.serviceId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service ID</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="PXXXXXX"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                The PagerDuty service ID to integrate with
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div> */}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="custom">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Integrations</CardTitle>
                  <CardDescription>
                    Set up custom webhooks and API endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Custom Webhook */}
                  <div className="rounded-lg border p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconWebhook size={24} />
                        <h3 className="text-lg font-medium">Custom Webhook</h3>
                      </div>
                      <FormField
                        control={form.control}
                        name="custom.webhook.enabled"
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
                    
                    {form.watch("custom.webhook.enabled") && (
                      <div className="space-y-4 pt-2">
                        <FormField
                          control={form.control}
                          name="custom.webhook.url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Webhook URL</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://example.com/webhook"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                The URL to send webhook events to
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="custom.webhook.headers"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom Headers (JSON)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder='{"Authorization": "Bearer token"}'
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Any custom headers to include with webhook requests (JSON format)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Custom API */}
                  <div className="rounded-lg border p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconApi size={24} />
                        <h3 className="text-lg font-medium">Custom API</h3>
                      </div>
                      <FormField
                        control={form.control}
                        name="custom.api.enabled"
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
                    
                    {form.watch("custom.api.enabled") && (
                      <div className="space-y-4 pt-2">
                        <FormField
                          control={form.control}
                          name="custom.api.endpoint"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Endpoint</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://api.example.com/events"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                The endpoint to send API requests to
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="custom.api.method"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>HTTP Method</FormLabel>
                              <div className="flex items-center space-x-4">
                                {['GET', 'POST', 'PUT', 'DELETE'].map((method) => (
                                  <div key={method} className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      id={`method-${method}`}
                                      checked={field.value === method}
                                      onChange={() => field.onChange(method)}
                                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor={`method-${method}`}>{method}</label>
                                  </div>
                                ))}
                              </div>
                              <FormDescription>
                                The HTTP method to use for API requests
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="custom.api.apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="xxxxxxxxxxxxxx"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                API key for authentication (if required)
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