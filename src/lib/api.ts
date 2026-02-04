/**
 * Client-side API helpers for gatekeeper and feedback.
 * Use these in the frontend (e.g. LiveFeed, dashboard form).
 */

export interface GatekeeperResponse {
  decision: 'ALLOW' | 'DENY' | 'WARNING';
  reason: string;
  article_ref?: string | null;
  audit_id: string;
}

export interface FeedbackResponse {
  ok?: boolean;
  message?: string;
  error?: string;
}

/**
 * Submit a prompt for compliance audit (POST /api/v1/gatekeeper).
 * Returns the decision, reason, article_ref, audit_id.
 */
export async function submitAudit(
  prompt: string,
  apiKey: string,
  context?: Record<string, string>
): Promise<GatekeeperResponse> {
  const res = await fetch('/api/v1/gatekeeper', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({ prompt, context: context ?? {} }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? data.error ?? `HTTP ${res.status}`);
  return data as GatekeeperResponse;
}

/**
 * Submit "Correct" feedback (POST /api/v1/feedback).
 */
export async function submitFeedbackCorrect(
  auditId: string,
  apiKey: string
): Promise<FeedbackResponse> {
  const res = await fetch('/api/v1/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({ audit_id: auditId, is_correct: true }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? data.error ?? `HTTP ${res.status}`);
  return data as FeedbackResponse;
}

/**
 * Submit "Incorrect" feedback with corrected decision and reason (POST /api/v1/feedback).
 */
export async function submitFeedbackIncorrect(
  auditId: string,
  correctedDecision: 'ALLOW' | 'DENY' | 'WARNING',
  correctedReason: string,
  apiKey: string
): Promise<FeedbackResponse> {
  const res = await fetch('/api/v1/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      audit_id: auditId,
      is_correct: false,
      corrected_decision: correctedDecision,
      corrected_reason: correctedReason.trim(),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? data.error ?? `HTTP ${res.status}`);
  return data as FeedbackResponse;
}
