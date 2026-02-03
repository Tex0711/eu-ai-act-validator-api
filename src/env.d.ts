/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly GEMINI_API_KEY: string;
  readonly OPENAI_API_KEY?: string;
  readonly API_KEY: string;
  readonly NODE_ENV: 'development' | 'production';
  /** Max requests per minute per API key (default 60). */
  readonly RATE_LIMIT_REQUESTS_PER_MINUTE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
// Triggering fresh Vercel build
