import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

function getEnv(name: string): string | undefined {
  if (typeof process !== 'undefined' && process.env?.[name]) return process.env[name];
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const v = (import.meta.env as Record<string, string | undefined>)[name];
    if (v) return v;
  }
  return undefined;
}

/**
 * Returns the Supabase client. Creates it on first use.
 * Throws only when called at runtime with missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.
 * Safe during build: env is read only when this function is invoked.
 */
export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;
  const url = getEnv('SUPABASE_URL');
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!url?.trim() || !key?.trim()) {
    throw new Error(
      'Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required'
    );
  }
  _client = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return _client;
}

/**
 * Lazy Supabase client. Same as getSupabaseClient() but as a drop-in instance.
 * Safe during build: no env read until first property access.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseClient() as Record<string, unknown>)[prop as string];
  },
}) as SupabaseClient;

// Type definitions for our tables
export interface ComplianceKnowledge {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    article_ref: string;
    section?: string;
    title?: string;
    created_at?: string;
  };
}

export interface AuditLog {
  id: string;
  prompt: string;
  context?: Record<string, unknown>;
  decision: 'ALLOW' | 'DENY' | 'WARNING';
  reason: string;
  article_ref?: string;
  created_at: string;
  response_time_ms: number;
  detected_pii_types?: string[];
}
