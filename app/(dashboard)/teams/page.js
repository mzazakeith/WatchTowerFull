'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  UserGroupIcon, 
  MagnifyingGlassIcon, 
  PlusIcon, 
  UsersIcon,
  UserPlusIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  ClockIcon,
  ServerIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';

// Team Card Component
function TeamCard({ team }) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 border border-neutral-200 dark:border-neutral-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
              <UserGroupIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>{team.name}</CardTitle>
              <CardDescription>{team.description}</CardDescription>
            </div>
          </div>
          <Badge variant={team.type === 'admin' ? 'destructive' : team.type === 'operations' ? 'default' : 'outline'}>
            {team.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="pt-4">
          <div className="flex -space-x-2 mb-4">
            {team.members.slice(0, 5).map((member, index) => (
              <Avatar key={index} className="border-2 border-white dark:border-neutral-900">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {team.members.length > 5 && (
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 border-2 border-white dark:border-neutral-900 text-sm font-medium">
                +{team.members.length - 5}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="text-neutral-500 dark:text-neutral-400">Services:</span>
              <div className="font-medium">{team.services}</div>
            </div>
            <div>
              <span className="text-neutral-500 dark:text-neutral-400">Active Incidents:</span>
              <div className="font-medium">{team.activeIncidents}</div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-2">
            {team.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="bg-neutral-100 dark:bg-neutral-800">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex justify-between">
        <Button variant="outline" size="sm">View Team</Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            setSelectedTeam(team.id);
            setAddMemberOpen(true);
          }}
        >
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </CardFooter>
    </Card>
  );
}

// Team Member component
function TeamMember({ member }) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 last:border-0">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={member.avatar} alt={member.name} />
          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{member.name}</div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">{member.role}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Badge variant={member.status === 'online' ? 'success' : 'secondary'} className={member.status === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'}>
          {member.status}
        </Badge>
        <Button variant="ghost" size="sm">Details</Button>
      </div>
    </div>
  );
}

// Team stats component
function TeamStats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UsersIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Total Members
              </div>
              <div className="text-2xl font-bold mt-1">{stats.totalMembers}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ServerIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Services Managed
              </div>
              <div className="text-2xl font-bold mt-1">{stats.servicesManaged}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BellIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Active Incidents
              </div>
              <div className="text-2xl font-bold mt-1">{stats.activeIncidents}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ClockIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Avg. Response Time
              </div>
              <div className="text-2xl font-bold mt-1">{stats.avgResponseTime}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [teams, setTeams] = useState([]);
  const [activeMembers, setActiveMembers] = useState([]);
  const [teamStats, setTeamStats] = useState({
    totalMembers: 0,
    servicesManaged: 0,
    activeIncidents: 0,
    avgResponseTime: '0m 0s'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("member");

  // Fetch teams data
  useEffect(() => {
    async function fetchTeams() {
      try {
        setIsLoading(true);
        
        // Fetch teams data
        const teamsResponse = await fetch('/api/teams');
        
        if (!teamsResponse.ok) {
          throw new Error('Failed to fetch teams');
        }
        
        const teamsData = await teamsResponse.json();
        
        // Format the teams data for display
        const formattedTeams = teamsData.map(team => ({
          id: team._id,
          name: team.name,
          description: team.description || 'No description provided',
          type: team.settings?.type || 'operations',
          members: team.members.map(member => ({
            id: member.userId?._id || member.userId,
            name: member.userId?.name || 'Unknown User',
            avatar: member.userId?.avatar || '',
            role: member.role
          })),
          services: team.settings?.servicesCount || 0,
          activeIncidents: team.settings?.activeIncidentsCount || 0,
          tags: team.settings?.tags || ['monitoring', 'alerts']
        }));
        
        setTeams(formattedTeams);
        
        // Fetch activity data
        fetchActivityData();
        
        // Set dummy stats for now - will be replaced with real data
        setTeamStats({
          totalMembers: formattedTeams.reduce((acc, team) => acc + team.members.length, 0),
          servicesManaged: formattedTeams.reduce((acc, team) => acc + team.services, 0),
          activeIncidents: formattedTeams.reduce((acc, team) => acc + team.activeIncidents, 0),
          responseTime: '5.2 min'
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching teams data:', err);
        setError(err.message || 'Failed to load teams data');
        toast.error(err.message || 'Failed to load teams data');
        
        // Set empty data if fetch fails
        setTeams([]);
        setActiveMembers([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTeams();
  }, []);

  // Fetch activity data
  async function fetchActivityData() {
    try {
      // Make API call to get recent activities
      const response = await fetch('/api/teams/activity');
      
      if (response.ok) {
        const activityData = await response.json();
        setActivityData(activityData);
        
        // Extract active members from activity data
        const activeUsers = [...new Map(activityData
          .filter(item => item.user)
          .map(item => [item.user.id, {
            id: item.user.id,
            name: item.user.name,
            avatar: item.user.avatar,
            role: item.user.role || 'Member',
            status: 'online',
            team: item.team?.name || 'Unknown Team'
          }])
        ).values()];
        
        setActiveMembers(activeUsers);
      } else {
        // If API fails, handle the error properly
        console.error('Failed to fetch activity data:', response.statusText);
        toast.error('Failed to fetch activity data');
        
        // Set empty activity data instead of dummy data
        setActivityData([]);
        setActiveMembers([]);
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
      toast.error('Error loading activity data');
      setActivityData([]);
      setActiveMembers([]);
    }
  }

  // Handle creating a new team
  async function handleCreateTeam() {
    try {
      // Show a modal to collect team information
      const teamName = prompt('Enter team name:');
      if (!teamName) return;
      
      const teamDescription = prompt('Enter team description (optional):');
      
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: teamName,
          description: teamDescription,
          settings: {
            type: 'operations',
            tags: ['monitoring', 'alerts']
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create team');
      }
      
      const data = await response.json();
      
      // Add the new team to state
      setTeams(prev => [...prev, {
        id: data.team._id,
        name: data.team.name,
        description: data.team.description || 'No description provided',
        type: 'operations',
        members: [{
          id: data.team.owner,
          name: 'You',
          role: 'admin'
        }],
        services: 0,
        activeIncidents: 0,
        tags: ['monitoring', 'alerts']
      }]);
      
      toast.success('Team created successfully');
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error(error.message || 'Failed to create team');
    }
  }

  // Handle adding a team member
  async function handleAddMember(e) {
    e.preventDefault();
    try {
      if (!selectedTeam) {
        toast.error('Please select a team');
        return;
      }
      
      if (!memberEmail) {
        toast.error('Please enter member email');
        return;
      }
      
      if (!['admin', 'member', 'viewer'].includes(memberRole)) {
        toast.error('Invalid role. Must be admin, member, or viewer.');
        return;
      }
      
      const response = await fetch('/api/teams/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: selectedTeam,
          email: memberEmail,
          role: memberRole
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add team member');
      }
      
      const data = await response.json();
      
      // Update the teams state with the new member
      setTeams(prev => prev.map(team => {
        if (team.id === selectedTeam) {
          return {
            ...team,
            members: [...team.members, {
              id: data.member.userId,
              name: data.member.name,
              role: data.member.role
            }]
          };
        }
        return team;
      }));
      
      toast.success(data.message || 'Member added successfully');
      setAddMemberOpen(false);
      
      // Reset form fields
      setSelectedTeam("");
      setMemberEmail("");
      setMemberRole("member");
    } catch (error) {
      console.error('Error adding team member:', error);
      toast.error(error.message || 'Failed to add team member');
    }
  }

  // Handle refresh
  async function handleRefresh() {
    try {
      await fetchTeams();
      toast.success('Teams data refreshed');
    } catch (error) {
      console.error('Error refreshing teams data:', error);
      toast.error(error.message || 'Failed to refresh teams data');
    }
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage your monitoring and incident response teams
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={handleCreateTeam}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Team
          </Button>
          <Button variant="outline" onClick={() => setAddMemberOpen(true)}>
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add Member
          </Button>
          <Button variant="secondary" onClick={handleRefresh} disabled={isLoading}>
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to one of your teams
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMember}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="team" className="text-right">
                  Team
                </Label>
                <div className="col-span-3">
                  <Select 
                    value={selectedTeam} 
                    onValueChange={setSelectedTeam}
                  >
                    <SelectTrigger id="team">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map(team => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="member@example.com"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select 
                  value={memberRole} 
                  onValueChange={setMemberRole}
                >
                  <SelectTrigger id="role" className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddMemberOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Member</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <TeamStats stats={teamStats} />
      
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="relative w-full sm:w-96">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
          <Input 
            placeholder="Search teams or members..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            All Teams
          </Button>
          <Button variant="outline" size="sm">
            Operations
          </Button>
          <Button variant="outline" size="sm">
            Development
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="teams" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="teams">
            <UserGroupIcon className="h-4 w-4 mr-2" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="members">
            <UsersIcon className="h-4 w-4 mr-2" />
            Members
          </TabsTrigger>
          <TabsTrigger value="activity">
            <ChartBarIcon className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="teams" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map(team => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Active Members</CardTitle>
              <CardDescription>Team members currently online</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {activeMembers.map(member => (
                  <TeamMember key={member.id} member={member} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Team Activity</CardTitle>
              <CardDescription>Recent actions by team members</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6">
                <div className="space-y-8">
                  {activityData && activityData.length > 0 ? (
                    activityData.map((activity, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={activity.user?.avatar} alt={activity.user?.name} />
                          <AvatarFallback>{activity.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{activity.user?.name}</span>
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">{activity.actionType}</span>
                          </div>
                          <p className="text-neutral-700 dark:text-neutral-300 mt-1">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                            <ClockIcon className="h-3 w-3" />
                            <span>{activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Unknown time'}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="rounded-full bg-neutral-100 dark:bg-neutral-800 p-3 mb-4">
                        <ChartBarIcon className="h-6 w-6 text-neutral-500" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">No activity yet</h3>
                      <p className="text-neutral-500 dark:text-neutral-400 text-center max-w-md">
                        Team activity will appear here when members take actions like resolving incidents or adding services.
                      </p>
                      <Button variant="outline" className="mt-4" onClick={handleRefresh}>
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        Refresh Activity
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 