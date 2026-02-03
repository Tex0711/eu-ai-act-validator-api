/**
 * Advanced audit reporting – GDPR-compliant (no original prompt stored).
 * Each request produces an AuditReport with timestamp, detected_pii_types, latency_ms, masked_prompt.
 *
 * @module audit
 */

const PLACEHOLDER_PATTERN = /\[([A-Z]+)\]/g;

/**
 * Derive which PII types were detected from the masked prompt (placeholders present).
 *
 * @param maskedPrompt - Text after stripPII (contains [EMAIL], [ID], [PHONE], etc.).
 * @returns Sorted list of placeholder types found (e.g. ['EMAIL', 'ID']).
 */
export function getDetectedPIITypes(maskedPrompt: string): string[] {
  const types = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = PLACEHOLDER_PATTERN.exec(maskedPrompt)) !== null) {
    types.add(m[1]);
  }
  return [...types].sort();
}

export interface AuditReport {
  timestamp: string;
  detected_pii_types: string[];
  latency_ms: number;
  masked_prompt: string;
}

/**
 * Build an audit report for a request. Never include the original prompt (GDPR).
 *
 * @param maskedPrompt - Prompt after PII stripping.
 * @param latencyMs - Request latency in milliseconds.
 * @returns AuditReport with timestamp, detected_pii_types, latency_ms, masked_prompt.
 */
export function buildAuditReport(
  maskedPrompt: string,
  latencyMs: number
): AuditReport {
  return {
    timestamp: new Date().toISOString(),
    detected_pii_types: getDetectedPIITypes(maskedPrompt),
    latency_ms: latencyMs,
    masked_prompt: maskedPrompt,
  };
}
