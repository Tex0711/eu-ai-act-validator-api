import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL ?? import.meta.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
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
}
