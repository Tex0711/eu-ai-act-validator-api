/**
 * PII Stripper Performance Benchmark
 *
 * Measures latency of stripPII under:
 * - Baseline: short prompt (50 words)
 * - Heavy Load: long prompt (2000 words) full of PII
 * - Concurrency: 100 consecutive calls per scenario → AVG & P99
 *
 * Run: npx tsx scripts/benchmark-performance.ts
 */

import { stripPII } from '../src/lib/pii/PIIGateway';

const WARMUP_RUNS = 5;
const BENCHMARK_RUNS = 100;

function measureOne(text: string): number {
  const start = performance.now();
  stripPII(text);
  return performance.now() - start;
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)] ?? 0;
}

function avg(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// ---- Sample texts ----

const BASELINE_WORDS =
  'The EU AI Act requires that high-risk AI systems be designed with human oversight and transparency. ' +
  'Contact support at help@example.com for more information. Providers must ensure accuracy and robustness. ' +
  'This is a short prompt of exactly fifty words for baseline performance measurement.';

const HEAVY_BLOCK =
  'Patient record: Jan de Vries, BSN 123456782, email jan.devries@hospital.nl, phone +31 6 12345678. ' +
  'Italian resident: Codice fiscale RSSMRA85M01H501Z. UK NINO JG103759A. German Steuer-ID 316/5756/0463. ' +
  'Spanish DNI 12345678A. French NIR 1 85 05 75 112 34 78. Belgian 70.01.16-287.31. Danish CPR 010190-1234. ' +
  'Swedish 610321-3499. Irish PPS 1234567T. Polish PESEL 44051401359. UK NHS 401 023 2137. ' +
  'Address: Hoofdstraat 42, 1234 AB Amsterdam. US SSN 555-12-3456. ' +
  'Another person: maria.garcia@empresa.es, +34 912 345 678, Calle Mayor 1, 28001 Madrid. ';

function repeatToWordCount(block: string, targetWords: number): string {
  const words = block.split(/\s+/).length;
  const repeat = Math.ceil(targetWords / words);
  return Array(repeat)
    .fill(block)
    .join(' ')
    .split(/\s+/)
    .slice(0, targetWords)
    .join(' ');
}

function formatMs(ms: number): string {
  return ms < 1 ? `${(ms * 1000).toFixed(2)}µs` : `${ms.toFixed(2)}ms`;
}

function runScenario(name: string, text: string): { avg: number; p99: number; samples: number[] } {
  // Warmup
  for (let i = 0; i < WARMUP_RUNS; i++) {
    stripPII(text);
  }

  const samples: number[] = [];
  for (let i = 0; i < BENCHMARK_RUNS; i++) {
    samples.push(measureOne(text));
  }
  samples.sort((a, b) => a - b);

  return {
    avg: avg(samples),
    p99: percentile(samples, 99),
    samples,
  };
}

function main() {
  const baselineText = repeatToWordCount(BASELINE_WORDS, 50);
  const baselineWordCount = baselineText.split(/\s+/).length;

  const heavyText = repeatToWordCount(HEAVY_BLOCK, 2000);
  const heavyWordCount = heavyText.split(/\s+/).length;

  console.log('PII Stripper Performance Benchmark');
  console.log('====================================\n');
  console.log(`Warmup: ${WARMUP_RUNS} runs | Benchmark: ${BENCHMARK_RUNS} consecutive calls per scenario\n`);

  const baseline = runScenario('Baseline', baselineText);
  const heavy = runScenario('Heavy Load', heavyText);

  console.log('Results');
  console.log('-------');
  console.log(
    '| Scenario      | Words | AVG (ms) | P99 (ms) |'
  );
  console.log(
    '|---------------|-------|----------|----------|'
  );
  console.log(
    `| Baseline      | ${String(baselineWordCount).padStart(5)} | ${formatMs(baseline.avg).padStart(8)} | ${formatMs(baseline.p99).padStart(8)} |`
  );
  console.log(
    `| Heavy Load    | ${String(heavyWordCount).padStart(5)} | ${formatMs(heavy.avg).padStart(8)} | ${formatMs(heavy.p99).padStart(8)} |`
  );
  console.log('');

  console.log('Summary');
  console.log('-------');
  console.log(`Baseline (${baselineWordCount} words): avg ${formatMs(baseline.avg)}, P99 ${formatMs(baseline.p99)}`);
  console.log(`Heavy Load (${heavyWordCount} words, PII-dense): avg ${formatMs(heavy.avg)}, P99 ${formatMs(heavy.p99)}`);
  console.log('');
}

main();
