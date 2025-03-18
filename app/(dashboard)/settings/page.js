"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { IconSettings, IconBell, IconUser, IconLock, IconBrandHipchat, IconAppWindow } from '@tabler/icons-react';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  const accountForm = useForm({
    defaultValues: {
      name: 'John Doe',
      email: 'john@example.com',
    }
  });
  
  const notificationForm = useForm({
    defaultValues: {
      emailAlerts: true,
      smsAlerts: false,
      slackAlerts: true,
      digestEmails: true,
    }
  });
  
  const securityForm = useForm({
    defaultValues: {
      twoFactorEnabled: false,
    }
  });
  
  const appearanceForm = useForm({
    defaultValues: {
      theme: 'system',
      compactMode: false,
    }
  });
  
  const integrationForm = useForm({
    defaultValues: {
      slackWebhook: 'https://hooks.slack.com/services/XXXX/YYYY/ZZZZ',
      discordWebhook: '',
    }
  });

  // Handle account form submission
  const onAccountSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Account settings updated successfully');
    } catch (error) {
      toast.error('Failed to update account settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle notification form submission
  const onNotificationSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification settings updated successfully');
    } catch (error) {
      toast.error('Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle security form submission
  const onSecuritySubmit = async (data) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Security settings updated successfully');
    } catch (error) {
      toast.error('Failed to update security settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle appearance form submission
  const onAppearanceSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Appearance settings updated successfully');
    } catch (error) {
      toast.error('Failed to update appearance settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle integration form submission
  const onIntegrationSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Integration settings updated successfully');
    } catch (error) {
      toast.error('Failed to update integration settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences.
          </p>
        </div>
        
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <IconUser size={16} />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <IconBell size={16} />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <IconLock size={16} />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <IconAppWindow size={16} />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <IconBrandHipchat size={16} />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Account Settings */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update your account information and email settings.
                </CardDescription>
              </CardHeader>
              <form onSubmit={accountForm.handleSubmit(onAccountSubmit)}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        {...accountForm.register('name')}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        {...accountForm.register('email')}
                      />
                      <p className="text-xs text-muted-foreground">
                        This email will be used for account-related notifications.
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Delete Account</h3>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all of your data. This action cannot be undone.
                    </p>
                    <Button variant="destructive" type="button">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how and when you want to receive alerts and notifications.
                </CardDescription>
              </CardHeader>
              <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="emailAlerts">Email Alerts</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive alerts via email when incidents occur.
                        </p>
                      </div>
                      <Switch
                        id="emailAlerts"
                        checked={notificationForm.watch('emailAlerts')}
                        onCheckedChange={(checked) => 
                          notificationForm.setValue('emailAlerts', checked)
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="smsAlerts">SMS Alerts</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive alerts via SMS for critical incidents.
                        </p>
                      </div>
                      <Switch
                        id="smsAlerts"
                        checked={notificationForm.watch('smsAlerts')}
                        onCheckedChange={(checked) => 
                          notificationForm.setValue('smsAlerts', checked)
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="slackAlerts">Slack Alerts</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive alerts in your configured Slack channels.
                        </p>
                      </div>
                      <Switch
                        id="slackAlerts"
                        checked={notificationForm.watch('slackAlerts')}
                        onCheckedChange={(checked) => 
                          notificationForm.setValue('slackAlerts', checked)
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="digestEmails">Weekly Digest</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive a weekly summary of all incidents and alerts.
                        </p>
                      </div>
                      <Switch
                        id="digestEmails"
                        checked={notificationForm.watch('digestEmails')}
                        onCheckedChange={(checked) => 
                          notificationForm.setValue('digestEmails', checked)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and authentication options.
                </CardDescription>
              </CardHeader>
              <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="twoFactorEnabled">Two-Factor Authentication</Label>
                        <p className="text-xs text-muted-foreground">
                          Add an extra layer of security to your account.
                        </p>
                      </div>
                      <Switch
                        id="twoFactorEnabled"
                        checked={securityForm.watch('twoFactorEnabled')}
                        onCheckedChange={(checked) => 
                          securityForm.setValue('twoFactorEnabled', checked)
                        }
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Active Sessions</h3>
                    <div className="rounded-md border p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Current Session</p>
                          <p className="text-sm text-muted-foreground">
                            Chrome on macOS • IP: 192.168.1.1
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">Active now</p>
                      </div>
                    </div>
                    <Button variant="outline" type="button">
                      Log Out All Other Sessions
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of your dashboard.
                </CardDescription>
              </CardHeader>
              <form onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="theme">Theme</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={appearanceForm.watch('theme') === 'light' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={() => appearanceForm.setValue('theme', 'light')}
                        >
                          Light
                        </Button>
                        <Button
                          type="button"
                          variant={appearanceForm.watch('theme') === 'dark' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={() => appearanceForm.setValue('theme', 'dark')}
                        >
                          Dark
                        </Button>
                        <Button
                          type="button"
                          variant={appearanceForm.watch('theme') === 'system' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={() => appearanceForm.setValue('theme', 'system')}
                        >
                          System
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="compactMode">Compact Mode</Label>
                        <p className="text-xs text-muted-foreground">
                          Use a more compact display for dashboard items.
                        </p>
                      </div>
                      <Switch
                        id="compactMode"
                        checked={appearanceForm.watch('compactMode')}
                        onCheckedChange={(checked) => 
                          appearanceForm.setValue('compactMode', checked)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          {/* Integration Settings */}
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>
                  Connect WatchTower with your favorite tools and services.
                </CardDescription>
              </CardHeader>
              <form onSubmit={integrationForm.handleSubmit(onIntegrationSubmit)}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="slackWebhook">Slack Webhook URL</Label>
                      <Input
                        id="slackWebhook"
                        {...integrationForm.register('slackWebhook')}
                        placeholder="https://hooks.slack.com/services/..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Alerts will be sent to this Slack webhook URL.
                      </p>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="discordWebhook">Discord Webhook URL</Label>
                      <Input
                        id="discordWebhook"
                        {...integrationForm.register('discordWebhook')}
                        placeholder="https://discord.com/api/webhooks/..."
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Connected Services</h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <IconBrandHipchat size={24} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Slack</p>
                            <p className="text-sm text-muted-foreground">
                              Connected to #alerts channel
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Disconnect</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 