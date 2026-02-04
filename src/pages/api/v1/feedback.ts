import type { APIRoute } from 'astro';
import { FeedbackRequestSchema } from '@/lib/validation/schemas';
import { getSupabaseClient } from '@/lib/supabase/client';
import { randomUUID } from 'crypto';

const FEEDBACK_PATH = '/api/v1/feedback';
const AUDIT_FEEDBACK_TABLE = 'audit_feedback';

function getEnv(name: string): string | undefined {
  return process.env[name] ?? (import.meta.env && (import.meta.env as Record<string, string>)[name]);
}

/**
 * POST /api/v1/feedback
 *
 * Submit human review feedback for an audit log.
 * Body: { audit_id, is_correct, corrected_decision?, corrected_reason? }
 * When is_correct is false, corrected_decision and corrected_reason are required.
 * Auth: x-api-key (same as gatekeeper).
 */
export const POST: APIRoute = async ({ request }) => {
  const apiKey = request.headers.get('x-api-key');
  const expectedApiKey = getEnv('API_KEY');

  if (!expectedApiKey || apiKey !== expectedApiKey) {
    return new Response(
      JSON.stringify({ error: 'Invalid or missing API key' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON in request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const parsed = FeedbackRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: 'Validation failed',
        details: parsed.error.errors,
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { audit_id, is_correct, corrected_decision, corrected_reason } = parsed.data;

  try {
    const { error } = await getSupabaseClient()
      .from(AUDIT_FEEDBACK_TABLE)
      .insert({
        id: randomUUID(),
        audit_id,
        is_correct,
        corrected_decision: is_correct ? null : (corrected_decision ?? null),
        corrected_reason: is_correct ? null : (corrected_reason?.trim() ?? null),
      });

    if (error) {
      console.error('[feedback] Insert failed:', error.message);
      return new Response(
        JSON.stringify({ error: 'Feedback write failed', message: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, message: 'Feedback saved' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[feedback]', msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
