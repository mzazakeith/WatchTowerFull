import { z } from 'zod';

// Schema for login request - supports email or phone
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  identifierType: z.enum(['email', 'phone']).default('email'),
});

// Schema for registration - requires at least email or phone
export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60, 'Name cannot be more than 60 characters'),
  email: z.string().email('Please provide a valid email address').optional(),
  phone: z.string().optional(),
}).refine(data => data.email || data.phone, {
  message: 'At least one contact method (email or phone) is required',
  path: ['email'], // Show error on email field
});

// Schema for verification of auth code
export const verifyCodeSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  identifierType: z.enum(['email', 'phone']).default('email'),
  code: z.string().min(6, 'Please provide the verification code'),
});

// Schema for user profile update
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60, 'Name cannot be more than 60 characters'),
  email: z.string().email('Please provide a valid email address').optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      slack: z.boolean().optional(),
      whatsapp: z.boolean().optional(),
    }).optional(),
    contactInfo: z.object({
      slackUserId: z.string().optional(),
      whatsappNumber: z.string().optional(),
    }).optional(),
  }).optional(),
}).refine(data => data.email || data.phone, {
  message: 'At least one contact method (email or phone) is required',
  path: ['email'], // Show error on email field
});