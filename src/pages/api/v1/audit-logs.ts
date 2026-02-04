import type { APIRoute } from 'astro';
import { getSupabaseClient } from '@/lib/supabase/client';

/**
 * GET /api/v1/audit-logs
 *
 * Returns the last 10 audit log entries for demo/dashboard.
 * Requires x-api-key header (same as gatekeeper).
 */
export const GET: APIRoute = async ({ request }) => {
  const apiKey = request.headers.get('x-api-key');
  const expectedApiKey = process.env.API_KEY ?? (import.meta.env && (import.meta.env as Record<string, string>).API_KEY);

  if (!expectedApiKey || apiKey !== expectedApiKey) {
    return new Response(
      JSON.stringify({ error: 'Invalid or missing API key' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { data, error } = await getSupabaseClient()
      .from('audit_logs')
      .select('id, prompt, decision, reason, article_ref, created_at, response_time_ms')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('[audit-logs]', error.message);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ logs: data ?? [] }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[audit-logs]', msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
