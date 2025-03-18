"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  IconCreditCard, 
  IconReceipt, 
  IconArrowUpRight,
  IconShieldCheck, 
  IconRefresh,
  IconCurrencyDollar
} from '@tabler/icons-react';

export default function BillingPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock billing data
  const [billing, setBilling] = useState({
    plan: 'pro',
    billingCycle: 'monthly',
    nextBillingDate: '2023-04-15',
    amount: 49,
    currency: 'USD',
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'visa',
      expMonth: 12,
      expYear: 2025
    },
    invoices: [
      { id: 'inv_123', date: '2023-03-15', amount: 49, status: 'paid', pdf: '#' },
      { id: 'inv_122', date: '2023-02-15', amount: 49, status: 'paid', pdf: '#' },
      { id: 'inv_121', date: '2023-01-15', amount: 49, status: 'paid', pdf: '#' },
    ],
    usage: {
      services: { used: 15, limit: 25 },
      checks: { used: 120, limit: 250 },
      teamMembers: { used: 3, limit: 10 },
      dataRetention: { days: 90 }
    }
  });
  
  // Function to handle plan upgrade/downgrade
  const handlePlanChange = async (newPlan) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setBilling(prev => ({
        ...prev,
        plan: newPlan
      }));
      
      toast.success(`Successfully switched to ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)} plan`);
    } catch (error) {
      toast.error('Failed to change plan');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle billing cycle change
  const handleBillingCycleChange = async (newCycle) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update amount based on cycle
      const newAmount = newCycle === 'annual' ? 39 * 12 : 49;
      
      // Update local state
      setBilling(prev => ({
        ...prev,
        billingCycle: newCycle,
        amount: newAmount
      }));
      
      toast.success(`Successfully switched to ${newCycle} billing`);
    } catch (error) {
      toast.error('Failed to change billing cycle');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to update payment method
  const handleUpdatePayment = () => {
    // In a real app, this would open a payment form or redirect to a payment provider
    toast.info('Payment update feature would be implemented here');
  };
  
  // Format currency
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  // Calculate usage percentage
  const calculateUsagePercentage = (used, limit) => {
    return Math.round((used / limit) * 100);
  };

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription, payment methods, and billing history.
          </p>
        </div>
        
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              Your current subscription plan and usage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              {/* Plan Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold capitalize">{billing.plan} Plan</h2>
                  <Badge variant={billing.plan === 'pro' ? 'default' : 'outline'}>
                    {billing.billingCycle === 'annual' ? 'Annual' : 'Monthly'}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {formatCurrency(billing.amount, billing.currency)} / {billing.billingCycle === 'annual' ? 'year' : 'month'}
                </p>
                <p className="text-sm">
                  Next billing date: <span className="font-medium">{billing.nextBillingDate}</span>
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col gap-2">
                {billing.plan !== 'free' && (
                  <Button 
                    variant="outline" 
                    className="w-full md:w-auto"
                    onClick={() => handlePlanChange('free')}
                    disabled={isLoading}
                  >
                    Downgrade to Free
                  </Button>
                )}
                {billing.plan !== 'pro' && (
                  <Button 
                    className="w-full md:w-auto"
                    onClick={() => handlePlanChange('pro')}
                    disabled={isLoading}
                  >
                    Upgrade to Pro
                  </Button>
                )}
                {billing.plan !== 'enterprise' && (
                  <Button 
                    variant={billing.plan === 'free' ? 'default' : 'outline'} 
                    className="w-full md:w-auto"
                    onClick={() => handlePlanChange('enterprise')}
                    disabled={isLoading}
                  >
                    Upgrade to Enterprise
                  </Button>
                )}
              </div>
            </div>
            
            <Separator />
            
            {/* Billing Cycle Toggle */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Billing Cycle</h3>
              <div className="flex items-center gap-4">
                <Button 
                  variant={billing.billingCycle === 'monthly' ? 'default' : 'outline'}
                  onClick={() => handleBillingCycleChange('monthly')}
                  disabled={isLoading}
                >
                  Monthly
                </Button>
                <Button 
                  variant={billing.billingCycle === 'annual' ? 'default' : 'outline'}
                  onClick={() => handleBillingCycleChange('annual')}
                  disabled={isLoading}
                >
                  Annual (Save 20%)
                </Button>
              </div>
            </div>
            
            <Separator />
            
            {/* Usage Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Current Usage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Services</Label>
                    <span className="text-sm">{billing.usage.services.used} / {billing.usage.services.limit}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${calculateUsagePercentage(billing.usage.services.used, billing.usage.services.limit)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Checks</Label>
                    <span className="text-sm">{billing.usage.checks.used} / {billing.usage.checks.limit}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${calculateUsagePercentage(billing.usage.checks.used, billing.usage.checks.limit)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Team Members</Label>
                    <span className="text-sm">{billing.usage.teamMembers.used} / {billing.usage.teamMembers.limit}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${calculateUsagePercentage(billing.usage.teamMembers.used, billing.usage.teamMembers.limit)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Data Retention</Label>
                    <span className="text-sm">{billing.usage.dataRetention.days} days</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Manage your payment methods and billing information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-16 rounded-md bg-slate-100 flex items-center justify-center">
                  <IconCreditCard className="h-6 w-6 text-slate-700" />
                </div>
                <div>
                  <p className="font-medium capitalize">{billing.paymentMethod.brand} •••• {billing.paymentMethod.last4}</p>
                  <p className="text-sm text-muted-foreground">
                    Expires {String(billing.paymentMethod.expMonth).padStart(2, '0')}/{billing.paymentMethod.expYear}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleUpdatePayment}>
                Update
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Billing Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" defaultValue="Acme Inc." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Billing Email</Label>
                  <Input id="email" type="email" defaultValue="billing@acme.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Billing Address</Label>
                  <Input id="address" defaultValue="123 Business St." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                  <Input id="taxId" defaultValue="US123456789" />
                </div>
              </div>
              <Button className="mt-2">Save Billing Information</Button>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Payments</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically charge your payment method when billing is due.
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              Your recent invoices and payment history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-4 border-b px-4 py-3 font-medium">
                <div>Date</div>
                <div>Invoice</div>
                <div>Amount</div>
                <div className="text-right">Status</div>
              </div>
              {billing.invoices.map((invoice) => (
                <div key={invoice.id} className="grid grid-cols-4 items-center border-b last:border-0 px-4 py-3">
                  <div>{invoice.date}</div>
                  <div className="flex items-center gap-2">
                    <IconReceipt size={16} className="text-muted-foreground" />
                    <span>{invoice.id}</span>
                  </div>
                  <div>{formatCurrency(invoice.amount, billing.currency)}</div>
                  <div className="flex justify-end items-center gap-2">
                    <Badge variant={invoice.status === 'paid' ? 'outline' : 'destructive'}>
                      {invoice.status}
                    </Badge>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={invoice.pdf} target="_blank" rel="noopener noreferrer">
                        <IconArrowUpRight size={16} />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Cancel Subscription */}
        <Card className="border-red-200">
          <CardHeader className="text-red-500">
            <CardTitle>Cancel Subscription</CardTitle>
            <CardDescription className="text-red-500/80">
              Cancel your subscription and downgrade to the free plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-md border border-red-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">Cancel Subscription</h4>
                  <p className="text-sm text-muted-foreground">
                    You will lose access to premium features at the end of your current billing period. 
                    Your data will be retained for 30 days after cancellation.
                  </p>
                </div>
                <Button variant="destructive">Cancel Subscription</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 