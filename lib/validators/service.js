import { z } from 'zod';

// Schema for creating a new service
export const createServiceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60, 'Name cannot be more than 60 characters'),
  description: z.string().max(200, 'Description cannot be more than 200 characters').optional(),
  url: z.string().url('Please provide a valid URL'),
  checkType: z.enum(['http', 'ping', 'port', 'tcp', 'dns', 'ssl', 'custom'], {
    required_error: 'Please select a check type',
  }),
  interval: z.number().min(10, 'Interval cannot be less than 10 seconds').default(60),
  timeout: z.number().min(1, 'Timeout cannot be less than 1 second').default(30),
  expectedStatusCode: z.number().optional(),
  expectedResponseContent: z.string().optional(),
  httpMethod: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH']).optional().default('GET'),
  requestHeaders: z.record(z.string()).optional(),
  requestBody: z.string().optional(),
  followRedirects: z.boolean().optional().default(true),
  verifySSL: z.boolean().optional().default(true),
  port: z.number().min(1, 'Port cannot be less than 1').max(65535, 'Port cannot be more than 65535').optional(),
  tags: z.array(z.string()).optional(),
  alertThresholds: z.object({
    responseTime: z.object({
      warning: z.number().min(100, 'Warning threshold must be at least 100ms').default(1000),
      critical: z.number().min(100, 'Critical threshold must be at least 100ms').default(3000),
    }).optional(),
    availability: z.object({
      warning: z.number().min(50, 'Warning threshold must be at least 50%').max(99, 'Warning threshold must be less than 100%').default(95),
      critical: z.number().min(50, 'Critical threshold must be at least 50%').max(99, 'Critical threshold must be less than 100%').default(90),
    }).optional(),
  }).optional(),
  teamId: z.string().optional(),
});

// Schema for updating an existing service
export const updateServiceSchema = createServiceSchema.partial().extend({
  paused: z.boolean().optional(),
});

// Schema for updating service status
export const updateServiceStatusSchema = z.object({
  paused: z.boolean(),
});

// Schema for filtering services
export const filterServicesSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'warning', 'critical', 'down', 'pending', 'all']).optional(),
  checkType: z.enum(['http', 'ping', 'port', 'tcp', 'dns', 'ssl', 'custom', 'all']).optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  teamId: z.string().optional(),
});

// Schema for bulk actions on services
export const bulkActionServicesSchema = z.object({
  serviceIds: z.array(z.string()).min(1, 'At least one service must be selected'),
  action: z.enum(['pause', 'resume', 'delete', 'tag', 'move']),
  data: z.any().optional(), // Additional data for the action (e.g., tags, teamId)
}); 