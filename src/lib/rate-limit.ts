/**
 * Rate limiting and anomaly metrics for the gatekeeper API.
 * In-memory sliding window per API key (and optional IP); no external deps.
 * For multi-instance deployments, replace with Redis-backed limiter (e.g. rate-limiter-flexible).
 */

import { ipToCountryCode } from '@/lib/geo';

const WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS_PER_MINUTE = 60;

/** Per-key sliding window: list of timestamps of recent requests. */
const windows = new Map<string, number[]>();

/** Config from env (optional). process.env for .env when running dev/build. */
function getMaxRequestsPerMinute(): number {
  const raw = process.env.RATE_LIMIT_REQUESTS_PER_MINUTE ?? import.meta.env.RATE_LIMIT_REQUESTS_PER_MINUTE ?? '';
  if (raw === undefined || raw === '') return DEFAULT_MAX_REQUESTS_PER_MINUTE;
  const n = parseInt(String(raw), 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_REQUESTS_PER_MINUTE;
}

/**
 * Prune timestamps outside the sliding window and return current count.
 */
function pruneAndCount(key: string, now: number): number {
  const list = windows.get(key) ?? [];
  const cutoff = now - WINDOW_MS;
  const kept = list.filter((t) => t > cutoff);
  windows.set(key, kept);
  return kept.length;
}

/**
 * Check rate limit for identifier (e.g. apiKey or apiKey + ip).
 * Returns { allowed: true } or { allowed: false, retryAfterMs }.
 */
export function checkRateLimit(identifier: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const max = getMaxRequestsPerMinute();
  const count = pruneAndCount(identifier, now);

  if (count >= max) {
    const oldest = windows.get(identifier)?.[0];
    const retryAfterMs = oldest != null ? Math.ceil(oldest + WINDOW_MS - now) : WINDOW_MS;
    return { allowed: false, retryAfterMs: Math.max(0, retryAfterMs) };
  }

  windows.get(identifier)?.push(now) ?? windows.set(identifier, [now]);
  return { allowed: true };
}

/**
 * Record one request for anomaly metrics (call after successful evaluation).
 * Logs structured JSON to console; use redacted identifier (no full API key).
 * Can be extended to Supabase or external analytics.
 */
export function recordRequestMetric(metric: {
  identifierForLog: string; // redacted, e.g. "key:***abcd:ip:1.2.3.4"
  promptLength: number;
  responseTimeMs: number;
  decision: 'ALLOW' | 'DENY' | 'WARNING';
  timestamp?: number;
}): void {
  const ts = metric.timestamp ?? Date.now();
  const payload = {
    type: 'gatekeeper_metric',
    ts,
    identifier: metric.identifierForLog,
    prompt_length: metric.promptLength,
    response_time_ms: metric.responseTimeMs,
    decision: metric.decision,
  };
  console.log(JSON.stringify(payload));
}

/**
 * Redact API key for logging: only last 4 chars + optional location suffix.
 * Use getLogIdentifier(apiKey, clientIp) for AVG-safe logging (country code instead of IP).
 */
export function redactIdentifierForLog(apiKey: string, locationSuffix?: string | null): string {
  const suffix = apiKey.length >= 4 ? apiKey.slice(-4) : '****';
  const part = `key:***${suffix}`;
  if (locationSuffix) return `${part}:${locationSuffix}`;
  return part;
}

/**
 * AVG-safe log identifier: key:***xyz1:cc:NL (country code only, no IP in logs).
 * Uses ipToCountryCode(clientIp); private/local IPs → "??".
 */
export function getLogIdentifier(apiKey: string, clientIp?: string | null): string {
  const cc = ipToCountryCode(clientIp);
  const locationSuffix = cc !== '??' ? `cc:${cc}` : null;
  return redactIdentifierForLog(apiKey, locationSuffix);
}

/**
 * Build a stable identifier for rate limiting: API key (last 4 chars for logging only, full key for bucket).
 * Optionally include IP if available (e.g. from x-forwarded-for).
 */
export function rateLimitIdentifier(apiKey: string, clientIp?: string | null): string {
  if (clientIp) return `key:${apiKey}:ip:${clientIp}`;
  return `key:${apiKey}`;
}
