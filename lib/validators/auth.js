import { z } from 'zod';

// Schema for login request
export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  name: z.string().optional(),
});

// Schema for verification of auth code
export const verifyCodeSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  code: z.string().min(6, 'Please provide the verification code'),
});

// Schema for user profile update
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60, 'Name cannot be more than 60 characters'),
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
      phone: z.string().optional(),
      slackUserId: z.string().optional(),
      whatsappNumber: z.string().optional(),
    }).optional(),
  }).optional(),
}); 