import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase/client';
import { getLLMProvider } from '@/lib/llm';

/**
 * GET /api/v1/health
 *
 * Reports API status, active LLM provider, and database connection only.
 * No sensitive system info (no IPs, hostnames, or internal paths) is exposed.
 * For load balancers, Kubernetes probes, and monitoring.
 */
export const GET: APIRoute = async () => {
  const startTime = Date.now();
  let llmProviderName = 'unknown';
  try {
    llmProviderName = getLLMProvider().name;
  } catch {
    llmProviderName = 'unavailable';
  }

  const health: {
    status: 'ok' | 'degraded' | 'error';
    timestamp: string;
    version: string;
    llm_provider: string;
    checks: {
      database: { status: string; latency_ms: number };
      embeddings_count?: number;
    };
    response_time_ms?: number;
  } = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    llm_provider: llmProviderName,
    checks: {
      database: { status: 'unknown', latency_ms: 0 },
    },
  };

  try {
    const dbStart = Date.now();
    const { count, error } = await supabase
      .from('compliance_knowledge')
      .select('*', { count: 'exact', head: true });
    health.checks.database.latency_ms = Date.now() - dbStart;

    if (error) {
      health.checks.database.status = 'error: ' + error.message;
      health.status = 'degraded';
    } else {
      health.checks.database.status = 'ok';
      health.checks.embeddings_count = count ?? 0;
    }
  } catch (err) {
    health.checks.database.status = 'error: connection failed';
    health.status = 'error';
  }

  health.response_time_ms = Date.now() - startTime;

  return new Response(JSON.stringify(health), {
    status: health.status === 'ok' ? 200 : health.status === 'degraded' ? 200 : 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
};
