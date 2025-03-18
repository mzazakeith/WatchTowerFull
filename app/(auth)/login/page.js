"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, verifyCodeSchema } from '@/lib/validators/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [verifyStep, setVerifyStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const router = useRouter();

  // Login form
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
    },
  });

  // Registration form
  const registerForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  });

  // Verification form
  const verifyForm = useForm({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      email: '',
      code: '',
    },
  });

  // Update login submit handler
  async function onLoginSubmit(data) {
    setIsLoading(true);
    try {
      // For development, generate and log the code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`[DEV] Verification code for ${data.email}: ${code}`);
      setGeneratedCode(code);
      
      toast.success('Verification code sent to your email');
      
      setEmail(data.email);
      verifyForm.setValue('email', data.email);
      setVerifyStep(true);
    } catch (error) {
      toast.error('Failed to send verification code');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // Update register submit handler
  async function onRegisterSubmit(data) {
    setIsLoading(true);
    try {
      // For development, generate and log the code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`[DEV] Verification code for new user ${data.name} (${data.email}): ${code}`);
      setGeneratedCode(code);
      
      toast.success('Account created! Verification code sent to your email');
      
      setEmail(data.email);
      verifyForm.setValue('email', data.email);
      setVerifyStep(true);
    } catch (error) {
      toast.error('Failed to create account');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // Update verify submit handler
  async function onVerifySubmit(data) {
    setIsLoading(true);
    try {
      // For development, check against the generated code
      if (data.code === generatedCode) {
        toast.success('Successfully authenticated');
        router.push('/dashboard');
      } else {
        toast.error('Invalid verification code');
      }
    } catch (error) {
      toast.error('Failed to verify code');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // Go back to login/register step
  function handleBack() {
    setVerifyStep(false);
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
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
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
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
            <h2 className="text-2xl font-bold">Verify Your Email</h2>
            <p className="text-muted-foreground">
              We sent a verification code to <strong>{email}</strong>
            </p>
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