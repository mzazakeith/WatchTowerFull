'use client'
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckIcon, ShieldCheckIcon, BellIcon, ServerIcon, ChartBarIcon, BoltIcon } from '@heroicons/react/24/outline';

// Hero Feature Item component
function HeroFeatureItem({ icon, title }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm font-medium">{title}</span>
    </div>
  );
}

// Feature Card component
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6 border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all duration-200">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-neutral-600 dark:text-neutral-400">{description}</p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="fixed w-full bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md z-50 py-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10">
              <div className="absolute w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">WT</span>
              </div>
            </div>
            <span className="text-2xl font-bold">WatchTower</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-neutral-700 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-neutral-700 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="#about" className="text-neutral-700 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-colors">
              About
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Sign in</Button>
            </Link>
            <Link href="/login?tab=register" className="hidden md:block">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Monitor your services with <span className="text-primary">confidence</span>
              </h1>
              
              <p className="text-lg text-neutral-700 dark:text-neutral-300">
                WatchTower provides real-time monitoring, alerting, and incident management for your web services, APIs, and server resources.
              </p>
              
              <div className="grid grid-cols-2 gap-3 py-4">
                <HeroFeatureItem 
                  icon={<CheckIcon className="w-5 h-5 text-primary" />}
                  title="Real-time monitoring"
                />
                <HeroFeatureItem 
                  icon={<
                    BoltIcon className="w-5 h-5 text-primary" />}
                  title="Instant alerts"
                />
                <HeroFeatureItem 
                  icon={<ShieldCheckIcon className="w-5 h-5 text-primary" />}
                  title="Secure platform"
                />
                <HeroFeatureItem 
                  icon={<BellIcon className="w-5 h-5 text-primary" />}
                  title="Multi-channel notifications"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/login?tab=register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Monitoring Now
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Explore Features
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-purple-600/50 rounded-xl blur-xl opacity-75"></div>
                <div className="relative bg-white dark:bg-neutral-900 rounded-xl shadow-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
                  <img 
                    src="/images/dashboard-preview.png" 
                    alt="WatchTower Dashboard" 
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/600x400/5046e4/white?text=WatchTower+Dashboard";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-neutral-50 dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Monitoring Features</h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              WatchTower provides comprehensive monitoring capabilities to keep your services running smoothly
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ServerIcon className="w-6 h-6 text-primary" />}
              title="Service Health Monitoring"
              description="Monitor the health of your web services with customizable checks and thresholds."
            />
            <FeatureCard 
              icon={<BellIcon className="w-6 h-6 text-primary" />}
              title="Multi-level Alerting"
              description="Configure alerts with different severity levels and notification channels."
            />
            <FeatureCard 
              icon={<ChartBarIcon className="w-6 h-6 text-primary" />}
              title="Real-time Analytics"
              description="Visualize performance metrics and trends to identify issues before they become problems."
            />
            <FeatureCard 
              icon={<ShieldCheckIcon className="w-6 h-6 text-primary" />}
              title="SSL Certificate Monitoring"
              description="Track SSL certificate validity and get alerts before they expire."
            />
            <FeatureCard 
              icon={<BoltIcon className="w-6 h-6 text-primary" />}
              title="Incident Management"
              description="Streamline incident response with automated tracking and resolution workflows."
            />
            <FeatureCard 
              icon={<CheckIcon className="w-6 h-6 text-primary" />}
              title="Response Time Tracking"
              description="Monitor response times and get alerted when performance degrades."
            />
          </div>
        </div>
      </section>

      {/* Future Features Section */}
      <section className="py-20 bg-white dark:bg-neutral-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Coming Soon</h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              We&apos;re constantly improving WatchTower. Here&apos;s what&apos;s coming in our roadmap.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 bg-neutral-50 dark:bg-neutral-900">
              <h3 className="text-xl font-semibold mb-3">Server Resource Monitoring</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Monitor CPU, memory, disk, and network usage across your infrastructure.
              </p>
            </div>
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 bg-neutral-50 dark:bg-neutral-900">
              <h3 className="text-xl font-semibold mb-3">Cloud Integration</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Seamless integration with AWS, Azure, and GCP monitoring services.
              </p>
            </div>
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 bg-neutral-50 dark:bg-neutral-900">
              <h3 className="text-xl font-semibold mb-3">Advanced Notifications</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Enhanced notification options including SMS, Slack, and Microsoft Teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to monitor your services?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of developers and operations teams who trust WatchTower for their monitoring needs.
          </p>
          <Link href="/login?tab=register">
            <Button size="lg" variant="secondary" className="font-medium">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-neutral-900 text-neutral-400">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-8 h-8">
                  <div className="absolute w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-xs">WT</span>
                  </div>
                </div>
                <span className="text-xl font-bold text-white">WatchTower</span>
              </div>
              <p className="max-w-xs">
                Real-time monitoring for your web services, APIs, and infrastructure.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-white font-medium mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Documentation</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><Link href="#" className="hover:text-primary transition-colors">About</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><Link href="#" className="hover:text-primary transition-colors">Privacy</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Terms</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Security</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-neutral-800 text-center">
            <p>© {new Date().getFullYear()} WatchTower. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 