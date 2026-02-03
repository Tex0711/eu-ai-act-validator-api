/**
 * PII Gateway – Privacy-by-Design PII stripping (GDPR / ICO Agentic AI).
 *
 * Stateless, regex-only. Replaces PII with placeholders for legal analysis.
 * v1.0: Full support for EU and US identifiers (see docs/INTERNATIONAL_ROADMAP.md).
 * APAC (Japan, India) and LATAM (Brazil) planned for v1.1.
 *
 * European national ID patterns: ipsec.pl/european-personal-data-regexp-patterns.html
 * Order: Email → BSN → SSN → European IDs (most specific first) → Phone → Postcodes → Street → Names.
 * All national IDs use [ID] for downstream LLM consistency.
 *
 * @module PIIGateway
 */

const PLACEHOLDERS = {
  EMAIL: '[EMAIL]',
  PHONE: '[PHONE]',
  ID: '[ID]',
  NAME: '[NAME]',
  ADDRESS: '[ADDRESS]',
} as const;

// ---- Global ----
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

// ---- National IDs (NL, US) ----
// NL – BSN (Burgerservicenummer); exclude when preceded by 06- or 06 or +31 6 (Dutch mobile)
const BSN_RE = /\b(?<!06[- ])(?<!\+31\s?6\s)(?<!06\s)\d{4}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d?\b/g;
// US – SSN; exclude when preceded by +1 (US phone)
const SSN_RE = /\b(?<!\+1\s)\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g;

// ---- European national IDs (source: ipsec.pl; most specific first) ----
// IT – Codice fiscale (letters + digits)
const CF_IT_RE = /\b[A-Z]{6}\d{2}[A-EHLMPR-T]\d{2}[A-Z0-9]{5}\b/gi;
// ES – DNI (8 digits/letters + 1 letter)
const DNI_ES_RE = /\b[0-9XxMmLlKkYy]\d{7}[A-Za-z]\b/g;
// UK – NINO (2 letters + 6 digits + optional A–D)
const NINO_UK_RE = /\b[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]\d{6}[A-Da-d]?\b/g;
// BE – National Register (e.g. 70.01.16-287.31)
const BE_ID_RE = /\b\d{2}\.?\d{2}\.?\d{2}-\d{3}\.?\d{2}\b/g;
// DE – Steuer-ID (e.g. 316/5756/0463)
const STEUER_DE_RE = /\b\d{3}\/?\d{4}\/?\d{4}\b/g;
// DK – CPR (e.g. 020955-2017)
const CPR_DK_RE = /\b\d{2}[01]\d\d{2}-\d{4}\b/g;
// SE – Personnummer (e.g. 610321-3499)
const PERSONNR_SE_RE = /\b\d{2}[01]\d\d{2}[-+]\d{4}\b/g;
// IE – PPS (7 digits + letter, optional W)
const PPS_IE_RE = /\b\d{7}[A-Za-z]W?\b/g;
// UK – NHS number (e.g. 401 023 2137); exclude 06x (Dutch mobile) and +1 (US phone)
const NHS_UK_RE = /\b(?!06\d)(?<!\+1\s)\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/g;
// PL – PESEL (11 digits, month 01–12 or 21–32)
const PESEL_PL_RE = /\b\d{4}[0-3]\d\d{5}\b/g;
// FR – NIR/INSEE (15 digits + optional spaces; simplified)
const NIR_FR_RE = /\b[12]\s?\d{2}\s?[01235]\d\s?[\dA-Z]{5}\s?\d{3}\s?\d{2}\b/gi;

// ---- Phone (after IDs so digit sequences are not eaten) ----
const PHONE_RE = /\b(?:\+31\s?6|\+31\s?[1-9]\d{1}\s?\d|\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,4}(?:[\s.-]?\d{2,4})?\b/g;

// ---- Postal codes (most specific first) ----
const NL_POSTAL_RE = /\b\d{4}\s?[A-Za-z]{2}\b/g;
const US_ZIP_RE = /\b\d{5}(-\d{4})?\b/g;
const UK_POSTAL_RE = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/gi;
const DE_FR_POSTAL_RE = /\b\d{5}\b/g;

// ---- Street + number (multi-language) ----
const STREET_WORDS =
  'Straat|Street|weg|Way|laan|Lane|plein|Square|singel|kade|Kade|Rue|Ave|Avenue|Blvd|Boulevard|Str|Strasse|Platz|Road|Rd|Drive|Lane|Ln';
const STREET_NUMBER_RE = new RegExp(`\\b(?:${STREET_WORDS})\\s+\\d+[A-Za-z]?\\b`, 'gi');
const NUMBER_STREET_RE = new RegExp(`\\b\\d+[A-Za-z]?\\s+(?:${STREET_WORDS})\\b`, 'gi');

// ---- Names: titles + capitalized words ----
const TITLE_NAME_RE =
  /\b(?:Mr|Mrs|Ms|Dr|Prof|Mevrouw|Meneer|Dhr|Mw|Frau|Herr|Mme|M\.|Monsieur|Señor|Sra|Sr\.|Sig\.|Dott\.|Ing\.)\.?\s+[A-Za-zÀ-ÿ][a-zà-ÿ]+(?:\s+(?:de|van|von|da|di)\s+[A-Za-zÀ-ÿ][a-zà-ÿ]+|\s+[A-Za-zÀ-ÿ][a-zà-ÿ]+)*\b/g;
const CAPITALIZED_NAME_RE = /\b([A-ZÀ-Ÿ][a-zà-ÿ]+\s+[A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)?)\b/g;
const NON_NAME_WORDS = new Set([
  'Article', 'EU', 'AI', 'Act', 'Annex', 'Regulation', 'High', 'Risk', 'Natural', 'Person', 'Prompt', 'User', 'System',
  'Compliance', 'Decision', 'Allow', 'Deny', 'Warning', 'Technical', 'Specification', 'Annex', 'Chapter', 'Section',
]);

/**
 * Strip PII from text. Order: Email → BSN → SSN → European IDs → Phone → Postcodes → Street → Names.
 * All national IDs become [ID]. Target: <50ms.
 */
export function stripPII(text: string): string {
  if (!text || typeof text !== 'string') return text;
  let out = text;

  // 1. Email
  out = out.replace(EMAIL_RE, PLACEHOLDERS.EMAIL);
  // 2. BSN
  out = out.replace(BSN_RE, PLACEHOLDERS.ID);
  // 3. SSN
  out = out.replace(SSN_RE, PLACEHOLDERS.ID);
  // 4. European IDs (most specific first)
  out = out.replace(CF_IT_RE, PLACEHOLDERS.ID);
  out = out.replace(DNI_ES_RE, PLACEHOLDERS.ID);
  out = out.replace(NINO_UK_RE, PLACEHOLDERS.ID);
  out = out.replace(BE_ID_RE, PLACEHOLDERS.ID);
  out = out.replace(STEUER_DE_RE, PLACEHOLDERS.ID);
  out = out.replace(CPR_DK_RE, PLACEHOLDERS.ID);
  out = out.replace(PERSONNR_SE_RE, PLACEHOLDERS.ID);
  out = out.replace(PPS_IE_RE, PLACEHOLDERS.ID);
  out = out.replace(NHS_UK_RE, PLACEHOLDERS.ID);
  out = out.replace(PESEL_PL_RE, PLACEHOLDERS.ID);
  out = out.replace(NIR_FR_RE, PLACEHOLDERS.ID);
  // 5. Phone
  out = out.replace(PHONE_RE, PLACEHOLDERS.PHONE);
  // 6. Postcodes
  out = out.replace(NL_POSTAL_RE, PLACEHOLDERS.ADDRESS);
  out = out.replace(US_ZIP_RE, PLACEHOLDERS.ADDRESS);
  out = out.replace(UK_POSTAL_RE, PLACEHOLDERS.ADDRESS);
  out = out.replace(DE_FR_POSTAL_RE, PLACEHOLDERS.ADDRESS);
  // 7. Street + number
  out = out.replace(STREET_NUMBER_RE, PLACEHOLDERS.ADDRESS);
  out = out.replace(NUMBER_STREET_RE, PLACEHOLDERS.ADDRESS);
  // 8. Names last
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
 * Check if text contains likely PII (EU/US patterns in v1.0). Uses new RegExp per test so global lastIndex is not mutated.
 *
 * @param text - Input to scan.
 * @returns True if any known PII pattern matches.
 */
export function hasPII(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return (
    new RegExp(EMAIL_RE.source).test(text) ||
    new RegExp(BSN_RE.source).test(text) ||
    new RegExp(SSN_RE.source).test(text) ||
    new RegExp(CF_IT_RE.source, 'i').test(text) ||
    new RegExp(DNI_ES_RE.source).test(text) ||
    new RegExp(NINO_UK_RE.source).test(text) ||
    new RegExp(BE_ID_RE.source).test(text) ||
    new RegExp(STEUER_DE_RE.source).test(text) ||
    new RegExp(CPR_DK_RE.source).test(text) ||
    new RegExp(PERSONNR_SE_RE.source).test(text) ||
    new RegExp(PPS_IE_RE.source).test(text) ||
    new RegExp(NHS_UK_RE.source).test(text) ||
    new RegExp(PESEL_PL_RE.source).test(text) ||
    new RegExp(NIR_FR_RE.source, 'i').test(text) ||
    new RegExp(PHONE_RE.source).test(text) ||
    new RegExp(NL_POSTAL_RE.source).test(text) ||
    new RegExp(US_ZIP_RE.source).test(text) ||
    new RegExp(UK_POSTAL_RE.source, 'i').test(text) ||
    new RegExp(DE_FR_POSTAL_RE.source).test(text) ||
    new RegExp(TITLE_NAME_RE.source).test(text)
  );
}
