/**
 * PII Gateway Test Suite (GDPR / ICO Agentic AI – Privacy-by-Design)
 * Run with: npx tsx tests/pii-gateway.test.ts
 */

import { stripPII, hasPII } from '../src/services/compliance/PIIGateway';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function assertIncludes(text: string, substring: string, message?: string): void {
  assert(text.includes(substring), message ?? `Expected "${text}" to include "${substring}"`);
}

function assertNotIncludes(text: string, substring: string, message?: string): void {
  assert(!text.includes(substring), message ?? `Expected "${text}" not to include "${substring}"`);
}

// --- Email
assertIncludes(stripPII('Contact me at john@example.com for details'), '[EMAIL]', 'Email should be replaced');
assertNotIncludes(stripPII('Contact me at john@example.com for details'), 'john@example.com', 'Raw email must not appear');
assert(hasPII('john@example.com'), 'hasPII should detect email');

// --- Phone NL
assertIncludes(stripPII('Bel me op 06-12345678'), '[PHONE]', 'NL mobile should be replaced');
assertIncludes(stripPII('+31 6 12345678'), '[PHONE]', 'NL +31 6 should be replaced');
assertNotIncludes(stripPII('Bel 06-12345678'), '06-12345678', 'Raw phone must not appear');

// --- Phone Int
assertIncludes(stripPII('Call +1 555 123 4567'), '[PHONE]', 'Intl phone should be replaced');

// --- BSN (Dutch Burgerservicenummer)
assertIncludes(stripPII('BSN: 123456782'), '[BSN]', 'BSN should be replaced');
assertIncludes(stripPII('Burgerservicenummer 1234 56 78'), '[BSN]', 'BSN with spaces (8 digits) should be replaced');
assertNotIncludes(stripPII('BSN 123456782'), '123456782', 'Raw BSN must not appear');

// --- NL postal code
assertIncludes(stripPII('Woonachtig 1234 AB Amsterdam'), '[ADDRESS]', 'NL postal 1234 AB should be replaced');
assertNotIncludes(stripPII('Postcode 1234 AB'), '1234 AB', 'Raw postcode must not appear');

// --- Full name (title + name)
assertIncludes(stripPII('Mr. John Smith requested access'), '[NAME]', 'Mr. John Smith should be replaced');
assertIncludes(stripPII('Mevrouw Janneke de Vries'), '[NAME]', 'Mevrouw Janneke de Vries should be replaced');
assertNotIncludes(stripPII('Contact Mr. John Smith'), 'John Smith', 'Raw name must not appear');

// --- Sentence context preserved
const withPII = 'Dear Mr. John Smith, your BSN 123456782 and email john@example.com are required.';
const stripped = stripPII(withPII);
assertIncludes(stripped, '[NAME]', 'Name placeholder');
assertIncludes(stripped, '[BSN]', 'BSN placeholder');
assertIncludes(stripped, '[EMAIL]', 'Email placeholder');
assertIncludes(stripped, 'Dear', 'Sentence start preserved');
assertIncludes(stripped, 'required', 'Sentence end preserved');

// --- No false positives: legal terms unchanged
const legal = 'Article 5(1)(f) and EU AI Act apply.';
assertNotIncludes(stripPII(legal), '[NAME]', 'Article/EU should not be replaced as name');
assertIncludes(stripPII(legal), 'Article 5(1)(f)', 'Legal text preserved');

// --- Empty / edge
assert(stripPII('') === '', 'Empty string unchanged');
assert(stripPII('No PII here') === 'No PII here', 'No PII unchanged');
assert(!hasPII(''), 'Empty has no PII');
assert(!hasPII('No PII here'), 'Plain text has no PII');

// --- Performance <50ms
const longText = 'John Smith j.smith@test.nl 06-12345678 BSN 123456782 '.repeat(100);
const start = performance.now();
for (let i = 0; i < 100; i++) stripPII(longText);
const elapsed = performance.now() - start;
assert(elapsed < 50, `PII strip must be <50ms for 100 runs on long text; was ${elapsed.toFixed(2)}ms`);

console.log('All PII Gateway tests passed.');
process.exit(0);
