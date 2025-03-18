"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, verifyCodeSchema, registerSchema } from '@/lib/validators/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [verifyStep, setVerifyStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState('email');
  const [generatedCode, setGeneratedCode] = useState('');
  const router = useRouter();

  // Login form
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      identifierType: 'email',
    },
  });

  // Registration form
  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      phone: '',
      name: '',
    },
  });

  // Verification form
  const verifyForm = useForm({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      identifier: '',
      identifierType: 'email',
      code: '',
    },
  });

  // Update login submit handler
  async function onLoginSubmit(data) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: data.identifier,
          identifierType: data.identifierType,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send verification code');
      }
      
      toast.success('Verification code sent successfully');
      
      // If in development mode, show the code
      if (result.debug?.code) {
        console.log(`[DEV] Verification code for ${data.identifier}: ${result.debug.code}`);
        setGeneratedCode(result.debug.code);
      }
      
      setIdentifier(data.identifier);
      setIdentifierType(data.identifierType);
      verifyForm.setValue('identifier', data.identifier);
      verifyForm.setValue('identifierType', data.identifierType);
      setVerifyStep(true);
    } catch (error) {
      toast.error(error.message || 'Failed to send verification code');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // Update register submit handler
  async function onRegisterSubmit(data) {
    setIsLoading(true);
    try {
      // Determine which identifier to use (email or phone)
      const hasEmail = !!data.email;
      const hasPhone = !!data.phone;
      
      if (!hasEmail && !hasPhone) {
        throw new Error('Please provide either an email or phone number');
      }
      
      // Prefer email if both are provided
      const identifierType = hasEmail ? 'email' : 'phone';
      const identifier = hasEmail ? data.email : data.phone;
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          identifierType,
          name: data.name,
          // Include both for user profile
          email: data.email,
          phone: data.phone,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account');
      }
      
      toast.success('Account created! Verification code sent');
      
      // If in development mode, show the code
      if (result.debug?.code) {
        console.log(`[DEV] Verification code for new user ${data.name} (${identifier}): ${result.debug.code}`);
        setGeneratedCode(result.debug.code);
      }
      
      setIdentifier(identifier);
      setIdentifierType(identifierType);
      verifyForm.setValue('identifier', identifier);
      verifyForm.setValue('identifierType', identifierType);
      setVerifyStep(true);
    } catch (error) {
      toast.error(error.message || 'Failed to create account');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // Update verify submit handler
  async function onVerifySubmit(data) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: data.identifier,
          identifierType: data.identifierType,
          code: data.code,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to verify code');
      }
      
      toast.success('Successfully authenticated');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to verify code');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // Go back to login/register step
  function handleBack() {
    setVerifyStep(false);
  }

  // Handle identifier type change
  function handleIdentifierTypeChange(value, formContext) {
    formContext.setValue('identifierType', value);
    formContext.setValue('identifier', ''); // Clear the identifier field
  }

  // Render identifier input based on type
  function renderIdentifierInput(field, formContext, identifierType) {
    if (identifierType === 'phone') {
      return (
        <PhoneInput
          country={'us'}
          value={field.value}
          onChange={(phone) => formContext.setValue('identifier', phone)}
          inputClass="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          containerClass="w-full"
          buttonClass="border border-input bg-background"
        />
      );
    }
    
    return (
      <Input 
        placeholder={identifierType === 'email' ? "you@example.com" : "+1234567890"} 
        {...field} 
      />
    );
  }

  return (
    <div className="w-full">
      {!verifyStep ? (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-muted-foreground">Sign in to your WatchTower account</p>
            </div>
            
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="identifierType"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Login Method</FormLabel>
                      <Select
                        onValueChange={(value) => handleIdentifierTypeChange(value, loginForm)}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select login method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone Number</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {loginForm.watch('identifierType') === 'email' ? 'Email' : 'Phone Number'}
                      </FormLabel>
                      <FormControl>
                        {renderIdentifierInput(field, loginForm, loginForm.watch('identifierType'))}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Create Account</h2>
              <p className="text-muted-foreground">Join WatchTower to monitor your services</p>
            </div>
            
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                        type = "email"
                        placeholder="you@example.com" {
                          ...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <PhoneInput
                          country={'us'}
                          value={field.value}
                          onChange={(phone) => registerForm.setValue('phone', phone)}
                          inputClass="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          containerClass="w-full"
                          buttonClass="border border-input bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">At least one contact method is required</p>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      ) : (
        // Verification Step
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Verify Your {identifierType === 'email' ? 'Email' : 'Phone'}</h2>
            <p className="text-muted-foreground">
              We sent a verification code to <strong>{identifier}</strong>
            </p>
            {process.env.NODE_ENV === 'development' && generatedCode && (
              <p className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-sm">
                <strong>DEV MODE:</strong> Verification code is <code className="font-mono bg-yellow-200 dark:bg-yellow-800 px-1 rounded">{generatedCode}</code>
              </p>
            )}
          </div>
          
          <Form {...verifyForm}>
            <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="space-y-6">
              <FormField
                control={verifyForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter 6-digit code" {...field} className="text-lg tracking-wider text-center" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  Back
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}