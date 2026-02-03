/**
 * International PII Stress Test – Japan, Brazil, India, Canada
 *
 * Generates 20 PII examples from these countries and checks whether our
 * current regex (PIIGateway) catches them. Reports where we fall short.
 *
 * Run: npm run test:pii:international  (or npx tsx tests/international-stress-test.ts)
 *
 * Current gaps (no dedicated patterns yet):
 * - JP: My Number (12 digits no hyphen), +81 phone, 7-digit postal (123-4567)
 * - BR: CPF formatted (xxx.xxx.xxx-xx), +55 phone, CEP (01310-100)
 * - IN: Aadhaar 12 digits no spaces, PAN (5 letters + 4 digits + 1 letter)
 * - CA: SIN hyphenated (xxx-xxx-xxx), Canadian postal (A1A 1A1)
 */

import { stripPII } from '../src/lib/pii/PIIGateway';

interface Sample {
  country: string;
  label: string;
  text: string;
  /** Raw PII substring that should be replaced (e.g. ID number, email, phone) */
  expectReplaced: string;
  /** Placeholder we expect after strip (e.g. [ID], [EMAIL], [PHONE], [ADDRESS]) */
  expectPlaceholder: string;
}

const SAMPLES: Sample[] = [
  // ---- Japan (5) ----
  {
    country: 'JP',
    label: 'My Number (12 digits, hyphenated)',
    text: '申請者マイナンバー 1234-5678-9012 を確認しました。',
    expectReplaced: '1234-5678-9012',
    expectPlaceholder: '[ID]',
  },
  {
    country: 'JP',
    label: 'My Number (12 digits, no hyphen)',
    text: 'Individual Number: 123456789012',
    expectReplaced: '123456789012',
    expectPlaceholder: '[ID]',
  },
  {
    country: 'JP',
    label: 'Japanese phone +81',
    text: '連絡先 +81 3 1234 5678 まで。',
    expectReplaced: '+81 3 1234 5678',
    expectPlaceholder: '[PHONE]',
  },
  {
    country: 'JP',
    label: 'Japanese email',
    text: '問い合わせ tanaka@example.co.jp まで。',
    expectReplaced: 'tanaka@example.co.jp',
    expectPlaceholder: '[EMAIL]',
  },
  {
    country: 'JP',
    label: 'Japanese postal code (7 digits)',
    text: '住所 〒123-4567 東京都渋谷区。',
    expectReplaced: '123-4567',
    expectPlaceholder: '[ADDRESS]',
  },
  // ---- Brazil (5) ----
  {
    country: 'BR',
    label: 'CPF (11 digits, formatted)',
    text: 'CPF do titular: 123.456.789-00',
    expectReplaced: '123.456.789-00',
    expectPlaceholder: '[ID]',
  },
  {
    country: 'BR',
    label: 'CPF (11 digits, unformatted)',
    text: 'Cadastro 12345678900 para emissão.',
    expectReplaced: '12345678900',
    expectPlaceholder: '[ID]',
  },
  {
    country: 'BR',
    label: 'Brazil phone +55',
    text: 'Ligue +55 11 98765 4321',
    expectReplaced: '+55 11 98765 4321',
    expectPlaceholder: '[PHONE]',
  },
  {
    country: 'BR',
    label: 'Brazil email',
    text: 'Contato: maria.silva@empresa.com.br',
    expectReplaced: 'maria.silva@empresa.com.br',
    expectPlaceholder: '[EMAIL]',
  },
  {
    country: 'BR',
    label: 'CEP (postal code)',
    text: 'Endereço CEP 01310-100 São Paulo.',
    expectReplaced: '01310-100',
    expectPlaceholder: '[ADDRESS]',
  },
  // ---- India (5) ----
  {
    country: 'IN',
    label: 'Aadhaar (12 digits, space-separated)',
    text: 'Aadhaar number 3675 9834 6012 verified.',
    expectReplaced: '3675 9834 6012',
    expectPlaceholder: '[ID]',
  },
  {
    country: 'IN',
    label: 'Aadhaar (12 digits, no spaces)',
    text: 'UID 367598346012',
    expectReplaced: '367598346012',
    expectPlaceholder: '[ID]',
  },
  {
    country: 'IN',
    label: 'PAN (10 char alphanumeric)',
    text: 'PAN card ABCDE1234F is required.',
    expectReplaced: 'ABCDE1234F',
    expectPlaceholder: '[ID]',
  },
  {
    country: 'IN',
    label: 'India phone +91',
    text: 'Call +91 98765 43210',
    expectReplaced: '+91 98765 43210',
    expectPlaceholder: '[PHONE]',
  },
  {
    country: 'IN',
    label: 'India email',
    text: 'Email: rajeev@company.in',
    expectReplaced: 'rajeev@company.in',
    expectPlaceholder: '[EMAIL]',
  },
  // ---- Canada (5) ----
  {
    country: 'CA',
    label: 'SIN (9 digits, hyphenated)',
    text: 'SIN 123-456-782 must be provided.',
    expectReplaced: '123-456-782',
    expectPlaceholder: '[ID]',
  },
  {
    country: 'CA',
    label: 'SIN (9 digits, no hyphen)',
    text: 'Social Insurance No. 123456782',
    expectReplaced: '123456782',
    expectPlaceholder: '[ID]',
  },
  {
    country: 'CA',
    label: 'Canada phone +1',
    text: 'Contact +1 416 555 1234',
    expectReplaced: '+1 416 555 1234',
    expectPlaceholder: '[PHONE]',
  },
  {
    country: 'CA',
    label: 'Canada email',
    text: 'Reply to jean.tremblay@canada.ca',
    expectReplaced: 'jean.tremblay@canada.ca',
    expectPlaceholder: '[EMAIL]',
  },
  {
    country: 'CA',
    label: 'Canadian postal code',
    text: 'Address: 123 Street, Ottawa ON K1A 0B1',
    expectReplaced: 'K1A 0B1',
    expectPlaceholder: '[ADDRESS]',
  },
];

function run(): void {
  console.log('International PII Stress Test (Japan, Brazil, India, Canada)\n');
  console.log('Total samples:', SAMPLES.length);
  console.log('');

  const results: { sample: Sample; caught: boolean; output: string }[] = [];

  for (const sample of SAMPLES) {
    const output = stripPII(sample.text);
    const stillPresent = output.includes(sample.expectReplaced);
    const hasPlaceholder = output.includes(sample.expectPlaceholder);
    const caught = !stillPresent && hasPlaceholder;

    results.push({ sample, caught, output });
  }

  // Report table
  console.log('| #  | Country | Label                          | Caught? |');
  console.log('|----|---------|--------------------------------|--------|');
  results.forEach((r, i) => {
    const n = (i + 1).toString().padStart(2);
    const country = r.sample.country.padEnd(2);
    const label = (r.sample.label.slice(0, 30) + (r.sample.label.length > 30 ? '…' : '')).padEnd(30);
    const status = r.caught ? 'Yes' : 'No';
    console.log(`| ${n} | ${country}   | ${label} | ${status.padEnd(6)} |`);
  });

  const caughtCount = results.filter((r) => r.caught).length;
  const missed = results.filter((r) => !r.caught);

  console.log('');
  console.log('Summary:', caughtCount, '/', SAMPLES.length, 'caught');
  console.log('');

  if (missed.length > 0) {
    console.log('--- Where we fall short ---');
    for (const { sample, output } of missed) {
      console.log('');
      console.log(`[${sample.country}] ${sample.label}`);
      console.log('  Input:  ', sample.text);
      console.log('  Output: ', output);
      console.log('  Expected to replace:', sample.expectReplaced, '→', sample.expectPlaceholder);
    }
    console.log('');
    console.log('Recommendation: Add regex patterns for JP (My Number), BR (CPF), IN (Aadhaar, PAN), CA (SIN),');
    console.log('and extend postal/phone patterns for JP/BR/IN/CA where needed. See docs/PII_PRIVACY_WORKFLOW.md.');
  } else {
    console.log('All 20 international PII samples were caught by the current regex set.');
  }
}

run();
