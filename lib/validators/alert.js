import { z } from 'zod';

// Schema for updating an alert
export const updateAlertSchema = z.object({
  status: z.enum(['acknowledged', 'resolved', 'closed']),
  message: z.string().optional(),
});

// Schema for filtering alerts
export const filterAlertsSchema = z.object({
  status: z.enum(['pending', 'acknowledged', 'resolved', 'closed', 'all']).optional(),
  severity: z.enum(['warning', 'critical', 'down', 'all']).optional(),
  metric: z.enum(['response_time', 'status_code', 'availability', 'ssl', 'custom', 'all']).optional(),
  serviceId: z.string().optional(),
  search: z.string().optional(),
  from: z.date().optional(),
  to: z.date().optional(),
  teamId: z.string().optional(),
});

// Schema for bulk actions on alerts
export const bulkActionAlertsSchema = z.object({
  alertIds: z.array(z.string()).min(1, 'At least one alert must be selected'),
  action: z.enum(['acknowledge', 'resolve', 'close']),
  message: z.string().optional(),
});

// Schema for creating an incident from alerts
export const createIncidentFromAlertsSchema = z.object({
  alertIds: z.array(z.string()).min(1, 'At least one alert must be selected'),
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot be more than 100 characters'),
  description: z.string().max(500, 'Description cannot be more than 500 characters').optional(),
  severity: z.enum(['minor', 'major', 'critical']),
  teamId: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
  impactedAreas: z.array(z.string()).optional(),
}); 