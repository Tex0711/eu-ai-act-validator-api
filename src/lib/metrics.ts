/**
 * Metrics logger for the gatekeeper API.
 * Logs one structured JSON line per request (success and errors) for monitoring,
 * anomaly detection, and log aggregation (e.g. Logtail, Datadog, CloudWatch).
 * No PII or full API keys; identifier is redacted.
 */

export type MetricsLogPayload = {
  /** Event type for filtering */
  event: 'gatekeeper_request';
  /** Unix ms */
  timestamp: number;
  /** HTTP status (200, 400, 401, 429, 500) */
  status_code: number;
  /** Response time in ms */
  response_time_ms: number;
  /** Redacted identifier (e.g. key:***abcd:ip:1.2.3.4 or key:missing) */
  identifier: string;
  /** Request path (e.g. /api/v1/gatekeeper) */
  path: string;
  /** Compliance decision; only set when status_code === 200 */
  decision?: 'ALLOW' | 'DENY' | 'WARNING';
  /** Prompt length in chars; only set when body was valid */
  prompt_length?: number;
  /** Error type or message; set for 4xx/5xx when useful */
  error?: string;
};

/**
 * Log one request metric as a single JSON line to stdout.
 * Call on every API response (success and failure) for full visibility.
 */
export function logRequestMetric(payload: {
  statusCode: number;
  responseTimeMs: number;
  identifier: string;
  path?: string;
  decision?: 'ALLOW' | 'DENY' | 'WARNING';
  promptLength?: number;
  error?: string;
}): void {
  const timestamp = Date.now();
  const logPayload: MetricsLogPayload = {
    event: 'gatekeeper_request',
    timestamp,
    status_code: payload.statusCode,
    response_time_ms: payload.responseTimeMs,
    identifier: payload.identifier,
    path: payload.path ?? '/api/v1/gatekeeper',
  };
  if (payload.decision != null) logPayload.decision = payload.decision;
  if (payload.promptLength != null) logPayload.prompt_length = payload.promptLength;
  if (payload.error != null) logPayload.error = payload.error;

  console.log(JSON.stringify(logPayload));
}
