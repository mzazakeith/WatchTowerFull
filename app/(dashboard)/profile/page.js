"use client";

import { useState, useEffect } from 'react';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  GlobeAltIcon, 
  CameraIcon,
  BellIcon,
  KeyIcon,
  ArrowPathIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    company: '',
    bio: '',
    timezone: 'UTC',
    language: 'en',
    twoFactorEnabled: false,
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    accountActivityAlerts: true,
    marketingEmails: false
  });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      try {
        setIsLoading(true);
        // In a real app, you would fetch from an API
        // For now, simulate with a timeout and mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockUserData = {
          id: 'usr_123456',
          name: 'Alex Johnson',
          email: 'alex.johnson@example.com',
          phone: '+1 (555) 123-4567',
          jobTitle: 'DevOps Engineer',
          company: 'TechCorp Solutions',
          bio: 'Experienced DevOps engineer with a passion for monitoring and system reliability. Always looking for ways to improve system observability and performance.',
          avatar: '',
          timezone: 'America/New_York',
          language: 'en',
          twoFactorEnabled: true,
          emailNotifications: true,
          pushNotifications: true,
          weeklyDigest: true,
          accountActivityAlerts: true,
          marketingEmails: false,
          createdAt: '2022-06-15T10:00:00Z',
          lastLogin: '2023-03-18T08:30:00Z',
          role: 'admin'
        };
        
        setUser(mockUserData);
        setFormData({
          name: mockUserData.name,
          email: mockUserData.email,
          phone: mockUserData.phone,
          jobTitle: mockUserData.jobTitle,
          company: mockUserData.company,
          bio: mockUserData.bio,
          timezone: mockUserData.timezone,
          language: mockUserData.language,
          twoFactorEnabled: mockUserData.twoFactorEnabled,
          emailNotifications: mockUserData.emailNotifications,
          pushNotifications: mockUserData.pushNotifications,
          weeklyDigest: mockUserData.weeklyDigest,
          accountActivityAlerts: mockUserData.accountActivityAlerts,
          marketingEmails: mockUserData.marketingEmails
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserData();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle toggle change (for switches)
  const handleToggleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select change
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setUser(prev => ({
        ...prev,
        ...formData
      }));
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Generate avatar fallback from user's name
  const getAvatarFallback = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md"></div>
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col gap-6">
              <div className="h-24 w-24 rounded-full bg-neutral-100 dark:bg-neutral-800 animate-pulse mx-auto"></div>
              <div className="space-y-4">
                <div className="h-8 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md"></div>
                <div className="h-8 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md"></div>
                <div className="h-8 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md"></div>
                <div className="h-24 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-md"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Manage your personal information and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="general" className="flex-1">
            <UserIcon className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1">
            <BellIcon className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1">
            <ShieldCheckIcon className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Picture */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>
                  Your profile picture will be displayed across the application
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center pt-4 space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {getAvatarFallback(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute bottom-0 right-0 rounded-full shadow-sm" 
                  >
                    <CameraIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400 text-center mt-2">
                  <p>Recommended: Square JPG, PNG, or GIF</p>
                  <p>Maximum size: 1MB</p>
                </div>
                <div className="flex gap-3 mt-2">
                  <Button variant="outline" size="sm">Upload New</Button>
                  <Button variant="ghost" size="sm">Remove</Button>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Manage your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input 
                          id="name" 
                          name="name" 
                          placeholder="Your full name" 
                          value={formData.name}
                          onChange={handleChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          placeholder="Your email" 
                          value={formData.email}
                          onChange={handleChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input 
                          id="phone" 
                          name="phone" 
                          placeholder="Your phone number" 
                          value={formData.phone}
                          onChange={handleChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input 
                        id="jobTitle" 
                        name="jobTitle" 
                        placeholder="Your job title" 
                        value={formData.jobTitle}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input 
                        id="company" 
                        name="company" 
                        placeholder="Your company" 
                        value={formData.company}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="language">Preferred Language</Label>
                      <Select 
                        value={formData.language} 
                        onValueChange={(value) => handleSelectChange('language', value)}
                      >
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="zh">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      name="bio" 
                      placeholder="Write a short bio about yourself" 
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                    />
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Brief description of your professional background and interests.
                    </p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you'd like to be notified
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="emailNotifications" className="font-medium">All Email Notifications</Label>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Master control for all email notifications
                          </p>
                        </div>
                        <Switch 
                          id="emailNotifications" 
                          checked={formData.emailNotifications}
                          onCheckedChange={(checked) => handleToggleChange('emailNotifications', checked)}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="weeklyDigest" className="font-medium">Weekly Digest</Label>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Receive a weekly summary of system activity and performance
                          </p>
                        </div>
                        <Switch 
                          id="weeklyDigest" 
                          checked={formData.weeklyDigest}
                          onCheckedChange={(checked) => handleToggleChange('weeklyDigest', checked)}
                          disabled={!formData.emailNotifications}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="accountActivityAlerts" className="font-medium">Account Activity Alerts</Label>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Important security notifications about your account
                          </p>
                        </div>
                        <Switch 
                          id="accountActivityAlerts" 
                          checked={formData.accountActivityAlerts}
                          onCheckedChange={(checked) => handleToggleChange('accountActivityAlerts', checked)}
                          disabled={!formData.emailNotifications}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="marketingEmails" className="font-medium">Marketing Emails</Label>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Receive updates about product features and promotional offers
                          </p>
                        </div>
                        <Switch 
                          id="marketingEmails" 
                          checked={formData.marketingEmails}
                          onCheckedChange={(checked) => handleToggleChange('marketingEmails', checked)}
                          disabled={!formData.emailNotifications}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Push Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="pushNotifications" className="font-medium">Browser Push Notifications</Label>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Receive real-time alerts even when you're not in the app
                          </p>
                        </div>
                        <Switch 
                          id="pushNotifications" 
                          checked={formData.pushNotifications}
                          onCheckedChange={(checked) => handleToggleChange('pushNotifications', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : 'Save Preferences'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Password must be at least 8 characters and include a mixture of uppercase, lowercase, and numbers.
                    </p>
                  </div>
                  
                  <Button type="button">Update Password</Button>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Require a security code in addition to your password
                    </p>
                  </div>
                  <Switch 
                    checked={formData.twoFactorEnabled}
                    onCheckedChange={(checked) => handleToggleChange('twoFactorEnabled', checked)}
                  />
                </div>
                
                {formData.twoFactorEnabled ? (
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-100 p-4 rounded-lg flex items-start">
                    <ShieldCheckIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Two-factor authentication is enabled</p>
                      <p className="text-sm mt-1">Your account is protected by an additional layer of security.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm">
                      We strongly recommend enabling two-factor authentication to protect your account. We'll send a verification code to your phone or email when you sign in.
                    </p>
                    <Button variant="outline" type="button">
                      <KeyIcon className="h-4 w-4 mr-2" />
                      Setup Two-Factor Auth
                    </Button>
                  </div>
                )}
                
                <Separator className="my-6" />
                
                <div>
                  <h3 className="font-medium mb-2">Login Sessions</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                    These are devices that have logged into your account. Revoke any sessions that you do not recognize.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 border-neutral-200 dark:border-neutral-800">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Current Session</p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            MacOS - Chrome - New York, USA
                          </p>
                          <div className="flex items-center mt-1">
                            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-100">
                              Active Now
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" disabled>
                          Current
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 border-neutral-200 dark:border-neutral-800">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Mobile App</p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            iOS - iPhone - San Francisco, USA
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            Last active 2 days ago
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Revoke
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 