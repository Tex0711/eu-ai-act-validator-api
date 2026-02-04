/**
 * Frontend/API types for audit logs and feedback.
 * Aligns with audit_logs and audit_feedback tables and API responses.
 */

export type AuditDecision = 'ALLOW' | 'DENY' | 'WARNING';

/** Single audit log entry for UI (e.g. LiveFeed). timestamp can be Date or ISO string when serialized from server. */
export interface AuditEntry {
  id: string;
  prompt: string;
  status: AuditDecision;
  articleReference: string;
  timestamp: Date | string;
  reason?: string;
  risk_score?: number | null;
  internal_analysis?: string | null;
  response_time_ms?: number;
  feedback?: AuditFeedbackEntry | null;
}

/** Human feedback for one audit. */
export interface AuditFeedbackEntry {
  is_correct: boolean;
  corrected_decision?: string | null;
  corrected_reason?: string | null;
  created_at?: string;
}

/** Map from API audit_log + optional feedback to AuditEntry */
export function mapAuditToEntry(
  log: {
    id: string;
    prompt: string;
    decision: string;
    article_ref?: string | null;
    created_at: string;
    reason?: string;
    risk_score?: number | null;
    internal_analysis?: string | null;
    response_time_ms?: number;
  },
  feedback?: AuditFeedbackEntry | null
): AuditEntry {
  return {
    id: log.id,
    prompt: log.prompt,
    status: log.decision as AuditDecision,
    articleReference: log.article_ref ?? '—',
    timestamp: new Date(log.created_at),
    reason: log.reason,
    risk_score: log.risk_score ?? null,
    internal_analysis: log.internal_analysis ?? null,
    response_time_ms: log.response_time_ms,
    feedback: feedback ?? null,
  };
}
