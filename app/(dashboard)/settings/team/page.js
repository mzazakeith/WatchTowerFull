"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  IconEdit, 
  IconTrash, 
  IconUserPlus, 
  IconUser, 
  IconUserExclamation, 
  IconUserCheck
} from '@tabler/icons-react';

export default function TeamSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  
  // Mock team data
  const [team, setTeam] = useState({
    id: 'team_123',
    name: 'Operations Team',
    description: 'Main team responsible for system operations and monitoring.',
    avatar: null, // URL of team avatar
    dateCreated: '2023-01-15',
    members: [
      { id: 'user_1', name: 'John Doe', email: 'john@example.com', role: 'admin', joined: '2023-01-15' },
      { id: 'user_2', name: 'Jane Smith', email: 'jane@example.com', role: 'member', joined: '2023-01-16' },
      { id: 'user_3', name: 'Mike Johnson', email: 'mike@example.com', role: 'member', joined: '2023-02-01' },
    ],
    pendingInvites: [
      { email: 'alex@example.com', role: 'member', sent: '2023-03-10' }
    ]
  });
  
  // Team settings form
  const teamForm = useForm({
    defaultValues: {
      name: team.name,
      description: team.description,
    }
  });
  
  // Invite form
  const inviteForm = useForm({
    defaultValues: {
      email: '',
      role: 'member'
    }
  });
  
  // Handle team settings form submission
  const onTeamSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setTeam(prev => ({
        ...prev,
        name: data.name,
        description: data.description
      }));
      
      toast.success('Team settings updated successfully');
    } catch (error) {
      toast.error('Failed to update team settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle invite form submission
  const onInviteSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      const now = new Date().toISOString().split('T')[0];
      setTeam(prev => ({
        ...prev,
        pendingInvites: [...prev.pendingInvites, { ...data, sent: now }]
      }));
      
      // Reset form
      inviteForm.reset();
      setShowInviteForm(false);
      
      toast.success(`Invitation sent to ${data.email}`);
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle member removal
  const handleRemoveMember = async (memberId) => {
    // In a real app, you would show a confirmation dialog first
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setTeam(prev => ({
        ...prev,
        members: prev.members.filter(m => m.id !== memberId)
      }));
      
      toast.success('Team member removed');
    } catch (error) {
      toast.error('Failed to remove team member');
    }
  };
  
  // Handle invitation cancellation
  const handleCancelInvite = async (email) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setTeam(prev => ({
        ...prev,
        pendingInvites: prev.pendingInvites.filter(i => i.email !== email)
      }));
      
      toast.success('Invitation cancelled');
    } catch (error) {
      toast.error('Failed to cancel invitation');
    }
  };
  
  // Handle member role change
  const handleRoleChange = async (memberId, newRole) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setTeam(prev => ({
        ...prev,
        members: prev.members.map(m => 
          m.id === memberId ? { ...m, role: newRole } : m
        )
      }));
      
      toast.success('Member role updated');
    } catch (error) {
      toast.error('Failed to update member role');
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team details, members, and permissions.
          </p>
        </div>
        
        {/* Team Information */}
        <Card>
          <CardHeader>
            <CardTitle>Team Information</CardTitle>
            <CardDescription>
              Update your team's profile information.
            </CardDescription>
          </CardHeader>
          <form onSubmit={teamForm.handleSubmit(onTeamSubmit)}>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Team Name</Label>
                  <Input
                    id="name"
                    {...teamForm.register('name')}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...teamForm.register('description')}
                    rows={3}
                    placeholder="Describe your team's purpose and responsibilities"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Team Information'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        {/* Team Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage team members and their roles.
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowInviteForm(!showInviteForm)} 
              className="flex items-center gap-1"
            >
              <IconUserPlus size={16} />
              <span>Invite Member</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Invite Form */}
            {showInviteForm && (
              <div className="rounded-md border p-4 mb-4">
                <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="space-y-4">
                  <h3 className="font-medium">Invite New Member</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="colleague@example.com"
                        {...inviteForm.register('email')}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <select
                        id="role"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...inviteForm.register('role')}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowInviteForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Sending...' : 'Send Invitation'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Team Members Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <select
                          className="rounded-md text-sm bg-transparent border-0 focus:ring-0 p-0 hover:cursor-pointer"
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          disabled={member.role === 'admin' && team.members.filter(m => m.role === 'admin').length === 1}
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </TableCell>
                      <TableCell>{member.joined}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={member.role === 'admin' && team.members.filter(m => m.role === 'admin').length === 1}
                        >
                          <IconTrash size={16} className="text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Pending Invitations */}
            {team.pendingInvites.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Pending Invitations</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Sent On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {team.pendingInvites.map((invite) => (
                        <TableRow key={invite.email}>
                          <TableCell className="font-medium">{invite.email}</TableCell>
                          <TableCell>{invite.role}</TableCell>
                          <TableCell>{invite.sent}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleCancelInvite(invite.email)}
                            >
                              <IconTrash size={16} className="text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Team Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Team Permissions</CardTitle>
            <CardDescription>
              Configure what team members can do.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Member Invitations</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow members to invite new users to the team
                  </p>
                </div>
                <Switch defaultChecked={false} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Service Creation</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow members to create new services
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alert Configuration</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow members to configure alert settings
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Billing Access</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow members to view and manage billing information
                  </p>
                </div>
                <Switch defaultChecked={false} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button>Save Permissions</Button>
          </CardFooter>
        </Card>
        
        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader className="text-red-500">
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription className="text-red-500/80">
              Destructive actions that cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-md border border-red-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">Delete Team</h4>
                  <p className="text-sm text-muted-foreground">
                    This will permanently delete the team and all associated data. This action cannot be undone.
                  </p>
                </div>
                <Button variant="destructive">Delete Team</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 