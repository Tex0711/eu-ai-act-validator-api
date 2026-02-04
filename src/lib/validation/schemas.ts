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

/**
 * Request schema for POST /api/v1/feedback
 * When is_correct is false, corrected_decision and corrected_reason are required.
 */
export const FeedbackRequestSchema = z
  .object({
    audit_id: z.string().uuid(),
    is_correct: z.boolean(),
    corrected_decision: z.enum(['ALLOW', 'DENY', 'WARNING']).optional(),
    corrected_reason: z.string().max(5000).optional(),
  })
  .refine(
    (data) => data.is_correct === true || (data.corrected_decision != null && (data.corrected_reason ?? '').trim().length > 0),
    { message: 'When is_correct is false, corrected_decision and corrected_reason are required.', path: ['corrected_reason'] }
  );

export type FeedbackRequest = z.infer<typeof FeedbackRequestSchema>;
