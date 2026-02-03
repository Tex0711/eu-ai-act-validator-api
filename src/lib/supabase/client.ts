import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL ?? (typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env as Record<string, string>).SUPABASE_URL : undefined);
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? (typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env as Record<string, string>).SUPABASE_SERVICE_ROLE_KEY : undefined);

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }
  _supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  return _supabase;
}

/** Lazy-initialized Supabase client. Fails only when used if env vars are missing (so build can succeed). */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabase()[prop as keyof SupabaseClient];
  }
});

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
