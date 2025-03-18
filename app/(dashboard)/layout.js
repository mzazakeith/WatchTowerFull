"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { 
  HomeIcon, 
  ServerIcon, 
  BellIcon, 
  ShieldExclamationIcon, 
  UserGroupIcon, 
  UserIcon, 
  CogIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  MoonIcon,
  SunIcon,
  BellAlertIcon,
  UsersIcon,
  ChartBarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Navigation items configuration
const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Services', href: '/services', icon: ServerIcon },
  { name: 'Alerts', href: '/alerts', icon: BellIcon },
  { name: 'Incidents', href: '/incidents', icon: ShieldExclamationIcon },
  { name: 'Teams', href: '/teams', icon: UserGroupIcon },
  { name: 'Visitors', icon: UsersIcon, 
    submenu: [
      { name: 'Visitor Count', href: '/visitors/count' },
      { name: 'Visitor Identification', href: '/visitors/identification' },
      { name: 'Analytics', href: '/visitors/analytics' },
    ]
  },
  { name: 'SEO', href: '/seo-analysis', icon: GlobeAltIcon },
  { 
    name: 'Settings', 
    icon: CogIcon,
    submenu: [
      { name: 'Profile', href: '/profile' },
      { name: 'Preferences', href: '/settings/preferences' },
      { name: 'Notifications', href: '/settings/notifications' },
      { name: 'API Keys', href: '/settings/api-keys' },
      { name: 'Billing', href: '/settings/billing' },
      { name: 'Team', href: '/settings/team' },
    ] 
  },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const toggleSubmenu = (name) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  const isActive = (href) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Sidebar header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
              <div className="absolute w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">WT</span>
              </div>
            </div>
            <span className="text-xl font-bold">WatchTower</span>
          </Link>
          <button 
            className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar content */}
        <div className="py-4 overflow-y-auto h-[calc(100vh-4rem)]">
          <nav className="px-2 space-y-1">
            {navigationItems.map((item) => (
              item.submenu ? (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`flex items-center justify-between w-full px-3 py-2 text-left text-sm font-medium rounded-md transition-colors ${openSubmenu === item.name ? 'bg-neutral-100 dark:bg-neutral-800 text-primary' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                  >
                    <div className="flex items-center">
                      <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      {item.name}
                    </div>
                    <ChevronDownIcon 
                      className={`w-4 h-4 transition-transform ${openSubmenu === item.name ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  
                  {openSubmenu === item.name && (
                    <div className="pl-10 space-y-1">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.name}
                          href={subitem.href}
                          className={`block px-3 py-2 text-sm rounded-md ${isActive(subitem.href) ? 'bg-neutral-100 dark:bg-neutral-800 text-primary' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                        >
                          {subitem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.href) ? 'bg-neutral-100 dark:bg-neutral-800 text-primary' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  {item.name}
                </Link>
              )
            ))}
          </nav>

          {/* Status indicator */}
          <div className="px-4 pt-6 mt-6 border-t border-neutral-200 dark:border-neutral-800">
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-400">All systems operational</h3>
                  <div className="mt-1 text-xs text-green-700 dark:text-green-500">
                    Updated 2 minutes ago
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
          <div className="h-16 flex items-center justify-between px-4 sm:px-6">
            {/* Left section: Mobile menu button and search */}
            <div className="flex items-center space-x-4">
              <button
                className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              
              <div className="hidden sm:flex items-center space-x-2 bg-neutral-100 dark:bg-neutral-800 rounded-md pl-3 pr-1">
                <MagnifyingGlassIcon className="w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent focus:outline-none py-1.5 w-48 text-sm"
                />
              </div>
            </div>
            
            {/* Right section: Theme toggle, notifications, profile */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <Button variant="ghost" size="icon" className="rounded-full">
                <SunIcon className="w-5 h-5 dark:hidden" />
                <MoonIcon className="w-5 h-5 hidden dark:block" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full relative">
                    <BellIcon className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex justify-between items-center px-4 py-2 border-b border-neutral-200 dark:border-neutral-800">
                    <h3 className="font-medium">Notifications</h3>
                    <Button variant="ghost" size="sm" className="text-xs">Mark all as read</Button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                      <div className="flex items-start">
                        <BellAlertIcon className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium mb-1">Payment Processing is down</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">Service has been unreachable for 5 minutes</p>
                          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">2 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                      <div className="flex items-start">
                        <BellIcon className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium mb-1">Analytics API response time degraded</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">Response time exceeded warning threshold</p>
                          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">15 minutes ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 border-t border-neutral-200 dark:border-neutral-800 text-center">
                    <Button variant="ghost" size="sm" className="w-full text-primary text-xs">
                      View all notifications
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="" alt="User" />
                      <AvatarFallback className="bg-primary text-primary-foreground">JD</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden md:inline-block">John Doe</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="p-2 border-b border-neutral-200 dark:border-neutral-800">
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">john.doe@example.com</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings/preferences">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/api-keys">API Keys</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="text-red-500 dark:text-red-400">Logout</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      
      <Toaster />
    </div>
  );
} 