import { z } from 'zod';

/**
 * Request schema for the gatekeeper API endpoint
 */
export const GatekeeperRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty').max(10000, 'Prompt exceeds maximum length'),
  context: z.object({
    user_id: z.string().optional(),
    department: z.string().optional(),
    application: z.string().optional(),
  }).optional(),
});

export type GatekeeperRequest = z.infer<typeof GatekeeperRequestSchema>;

/**
 * Response schema for the gatekeeper API endpoint
 */
export const GatekeeperResponseSchema = z.object({
  decision: z.enum(['ALLOW', 'DENY', 'WARNING']),
  reason: z.string().min(1).max(2000),
  article_ref: z.string().optional(),
  audit_id: z.string().uuid(),
});

export type GatekeeperResponse = z.infer<typeof GatekeeperResponseSchema>;
