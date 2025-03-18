'use client'

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
  ServerIcon
} from '@heroicons/react/24/outline';

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
        <Button variant="ghost" size="sm">
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
  
  // Mock data
  const teams = [
    {
      id: 1,
      name: 'Core Infrastructure',
      description: 'Manages core servers and infrastructure',
      type: 'operations',
      members: [
        { id: 1, name: 'Alex Johnson', role: 'Team Lead', avatar: '/avatars/alex.jpg', status: 'online' },
        { id: 2, name: 'Sarah Miller', role: 'DevOps Engineer', avatar: '/avatars/sarah.jpg', status: 'offline' },
        { id: 3, name: 'James Wilson', role: 'SRE', avatar: '/avatars/james.jpg', status: 'online' },
        { id: 4, name: 'Linda Chen', role: 'Network Engineer', avatar: '/avatars/linda.jpg', status: 'online' },
        { id: 5, name: 'David Park', role: 'Systems Admin', avatar: '/avatars/david.jpg', status: 'offline' },
        { id: 6, name: 'Michael Brown', role: 'Cloud Engineer', avatar: '/avatars/michael.jpg', status: 'online' },
      ],
      services: 18,
      activeIncidents: 2,
      tags: ['infrastructure', 'cloud', 'networking']
    },
    {
      id: 2,
      name: 'Application Support',
      description: 'Frontend and backend application monitoring',
      type: 'development',
      members: [
        { id: 7, name: 'Emma Davis', role: 'Team Lead', avatar: '/avatars/emma.jpg', status: 'online' },
        { id: 8, name: 'Ryan Taylor', role: 'Full-stack Developer', avatar: '/avatars/ryan.jpg', status: 'offline' },
        { id: 9, name: 'Olivia Martin', role: 'Frontend Developer', avatar: '/avatars/olivia.jpg', status: 'online' },
        { id: 10, name: 'Noah Garcia', role: 'Backend Developer', avatar: '/avatars/noah.jpg', status: 'online' },
      ],
      services: 12,
      activeIncidents: 1,
      tags: ['frontend', 'backend', 'api']
    },
    {
      id: 3,
      name: 'Security Operations',
      description: 'Security monitoring and incident response',
      type: 'admin',
      members: [
        { id: 11, name: 'Sophia Lee', role: 'Security Lead', avatar: '/avatars/sophia.jpg', status: 'online' },
        { id: 12, name: 'William Clark', role: 'Security Analyst', avatar: '/avatars/william.jpg', status: 'offline' },
        { id: 13, name: 'Ava Rodriguez', role: 'Compliance Specialist', avatar: '/avatars/ava.jpg', status: 'online' },
      ],
      services: 8,
      activeIncidents: 0,
      tags: ['security', 'compliance', 'auditing']
    },
    {
      id: 4,
      name: 'Data Engineering',
      description: 'Database and data pipeline monitoring',
      type: 'development',
      members: [
        { id: 14, name: 'Ethan Wilson', role: 'Data Lead', avatar: '/avatars/ethan.jpg', status: 'online' },
        { id: 15, name: 'Isabella Thomas', role: 'Database Engineer', avatar: '/avatars/isabella.jpg', status: 'offline' },
        { id: 16, name: 'Jacob Martinez', role: 'Data Scientist', avatar: '/avatars/jacob.jpg', status: 'online' },
        { id: 17, name: 'Mia Johnson', role: 'ETL Developer', avatar: '/avatars/mia.jpg', status: 'online' },
      ],
      services: 15,
      activeIncidents: 1,
      tags: ['database', 'data-pipeline', 'analytics']
    }
  ];
  
  const activeMembers = [
    { id: 1, name: 'Alex Johnson', role: 'Team Lead', avatar: '/avatars/alex.jpg', status: 'online' },
    { id: 3, name: 'James Wilson', role: 'SRE', avatar: '/avatars/james.jpg', status: 'online' },
    { id: 4, name: 'Linda Chen', role: 'Network Engineer', avatar: '/avatars/linda.jpg', status: 'online' },
    { id: 6, name: 'Michael Brown', role: 'Cloud Engineer', avatar: '/avatars/michael.jpg', status: 'online' },
    { id: 7, name: 'Emma Davis', role: 'Team Lead', avatar: '/avatars/emma.jpg', status: 'online' },
    { id: 9, name: 'Olivia Martin', role: 'Frontend Developer', avatar: '/avatars/olivia.jpg', status: 'online' },
    { id: 10, name: 'Noah Garcia', role: 'Backend Developer', avatar: '/avatars/noah.jpg', status: 'online' },
    { id: 11, name: 'Sophia Lee', role: 'Security Lead', avatar: '/avatars/sophia.jpg', status: 'online' },
    { id: 13, name: 'Ava Rodriguez', role: 'Compliance Specialist', avatar: '/avatars/ava.jpg', status: 'online' },
    { id: 14, name: 'Ethan Wilson', role: 'Data Lead', avatar: '/avatars/ethan.jpg', status: 'online' },
    { id: 17, name: 'Mia Johnson', role: 'ETL Developer', avatar: '/avatars/mia.jpg', status: 'online' },
  ];
  
  const teamStats = {
    totalMembers: 17,
    servicesManaged: 53,
    activeIncidents: 4,
    avgResponseTime: '12m 30s',
  };
  
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
          <Button>
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Team
          </Button>
          <Button variant="outline">
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add Member
          </Button>
        </div>
      </div>
      
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
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src="/avatars/alex.jpg" alt="Alex Johnson" />
                      <AvatarFallback>AJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Alex Johnson</span>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">closed an incident</span>
                      </div>
                      <p className="text-neutral-700 dark:text-neutral-300 mt-1">
                        Resolved "API Gateway Performance Degradation" after implementing load balancing fix.
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                        <ClockIcon className="h-3 w-3" />
                        <span>2 hours ago</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src="/avatars/sophia.jpg" alt="Sophia Lee" />
                      <AvatarFallback>SL</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Sophia Lee</span>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">added a new service</span>
                      </div>
                      <p className="text-neutral-700 dark:text-neutral-300 mt-1">
                        Added "Payment API Gateway" to monitoring with enhanced security checks.
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                        <ClockIcon className="h-3 w-3" />
                        <span>4 hours ago</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src="/avatars/emma.jpg" alt="Emma Davis" />
                      <AvatarFallback>ED</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Emma Davis</span>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">updated alert thresholds</span>
                      </div>
                      <p className="text-neutral-700 dark:text-neutral-300 mt-1">
                        Modified response time thresholds for frontend services from 500ms to 400ms.
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                        <ClockIcon className="h-3 w-3" />
                        <span>6 hours ago</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src="/avatars/ethan.jpg" alt="Ethan Wilson" />
                      <AvatarFallback>EW</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Ethan Wilson</span>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">added team member</span>
                      </div>
                      <p className="text-neutral-700 dark:text-neutral-300 mt-1">
                        Added Mia Johnson to the Data Engineering team as ETL Developer.
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                        <ClockIcon className="h-3 w-3" />
                        <span>Yesterday at 15:30</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 