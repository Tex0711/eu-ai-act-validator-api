/**
 * PII Gateway - Privacy-by-Design PII stripping layer (GDPR / ICO Agentic AI).
 * Stateless, functional. Replaces detected PII with placeholders to preserve
 * sentence context for legal analysis. Target: <50ms.
 */

const PLACEHOLDERS = {
  EMAIL: '[EMAIL]',
  PHONE: '[PHONE]',
  BSN: '[BSN]',
  NAME: '[NAME]',
  ADDRESS: '[ADDRESS]',
} as const;

// Email: local@domain.tld
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

// Phone NL: 06-12345678, 0612345678, +31 6 12345678, +31612345678, 06 12 34 56 78
// Phone Int: +1 555 123 4567, +44 20 7946 0958, etc.
const PHONE_RE = /\b(?:\+31\s?6|\+31\s?[1-9]\d{1}\s?\d|\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,4}(?:[\s.-]?\d{2,4})?\b/g;

// BSN: 8 or 9 digits, optional spaces/dashes (Dutch Burgerservicenummer)
const BSN_RE = /\b\d{4}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d?\b/g;

// NL postal code: 1234 AB (exactly 4 digits + space + 2 letters)
const NL_POSTAL_RE = /\b\d{4}\s?[A-Za-z]{2}\b/g;

// Street number patterns: "Straat 123", "Hoofdweg 42a", "42 Main Street"
const STREET_NUMBER_RE = /\b(?:Straat|Street|weg|Way|laan|Lane|plein|Square|singel|kade|Kade)\s+\d+[A-Za-z]?\b/gi;
const NUMBER_STREET_RE = /\b\d+[A-Za-z]?\s+(?:Straat|Street|weg|Way|laan|Lane|plein|Square|singel|kade|Kade)\b/gi;

// Full name: title + capitalized words (Mr. John Smith, Dr. Jane Doe, Mevrouw Janneke de Vries)
const TITLE_NAME_RE = /\b(?:Mr|Mrs|Ms|Dr|Prof|Mevrouw|Meneer|Dhr|Mw)\.?\s+[A-Za-z][a-z]+(?:\s+(?:de|van|von)\s+[A-Za-z][a-z]+|\s+[A-Za-z][a-z]+)*\b/g;
// Standalone 2–3 capitalized words (likely names); skip common false positives
const CAPITALIZED_NAME_RE = /\b([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g;
const NON_NAME_WORDS = new Set(['Article', 'EU', 'AI', 'Act', 'Annex', 'Regulation', 'High', 'Risk', 'Natural', 'Person', 'Prompt', 'User', 'System', 'Compliance', 'Decision', 'Allow', 'Deny', 'Warning']);

/**
 * Strip PII from text and replace with placeholders. Order matters: email/phone/BSN/address first, then names.
 * Preserves sentence structure for legal analysis.
 */
export function stripPII(text: string): string {
  if (!text || typeof text !== 'string') return text;
  let out = text;

  // Order: BSN before PHONE (so 8–9 digit BSN is not matched as phone), then email/phone
  out = out.replace(EMAIL_RE, PLACEHOLDERS.EMAIL);
  out = out.replace(BSN_RE, PLACEHOLDERS.BSN);
  out = out.replace(PHONE_RE, PLACEHOLDERS.PHONE);
  out = out.replace(NL_POSTAL_RE, PLACEHOLDERS.ADDRESS);
  out = out.replace(STREET_NUMBER_RE, PLACEHOLDERS.ADDRESS);
  out = out.replace(NUMBER_STREET_RE, PLACEHOLDERS.ADDRESS);
  out = out.replace(TITLE_NAME_RE, PLACEHOLDERS.NAME);
  out = out.replace(CAPITALIZED_NAME_RE, (match) => {
    const words = match.split(/\s+/);
    if (words.some((w) => NON_NAME_WORDS.has(w))) return match;
    if (match.length <= 4 || match === match.toUpperCase()) return match;
    return PLACEHOLDERS.NAME;
  });

  return out.trim();
}

/**
 * Check if text contains likely PII (for tests or logging).
 */
export function hasPII(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return (
    new RegExp(EMAIL_RE.source).test(text) ||
    new RegExp(PHONE_RE.source).test(text) ||
    new RegExp(BSN_RE.source).test(text) ||
    new RegExp(NL_POSTAL_RE.source).test(text) ||
    new RegExp(TITLE_NAME_RE.source).test(text)
  );
}
