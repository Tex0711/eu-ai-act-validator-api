import type { APIRoute } from 'astro';
import { supabase } from '@/lib/supabase/client';

/**
 * Health Check Endpoint
 * 
 * Returns the health status of the API and its dependencies.
 * Useful for monitoring, load balancers, and Kubernetes probes.
 */
export const GET: APIRoute = async () => {
  const startTime = Date.now();
  
  const health = {
    status: 'ok' as 'ok' | 'degraded' | 'error',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    uptime: process.uptime(),
    checks: {
      database: { status: 'unknown' as string, latency_ms: 0 },
      embeddings_count: 0,
    },
  };

  try {
    // Check database connection
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
      health.checks.embeddings_count = count || 0;
    }
  } catch (error) {
    health.checks.database.status = 'error: connection failed';
    health.status = 'error';
  }

  // Determine overall status
  const totalLatency = Date.now() - startTime;
  
  return new Response(
    JSON.stringify({
      ...health,
      response_time_ms: totalLatency,
    }),
    {
      status: health.status === 'ok' ? 200 : health.status === 'degraded' ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
};
