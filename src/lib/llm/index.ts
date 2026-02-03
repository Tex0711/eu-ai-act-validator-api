import type { LLMProvider } from './LLMProvider';
import { GeminiProvider } from './GeminiProvider';
import { MockProvider } from './MockProvider';

/**
 * Model-agnostic LLM provider. v1.0: Gemini (default) and Mock (local/testing).
 * Set LLM_PROVIDER=mock to avoid API costs. See INTERNATIONAL_ROADMAP.md for region support.
 *
 * @module llm
 */

const PROVIDER = (process.env.LLM_PROVIDER ?? (typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env as Record<string, string>).LLM_PROVIDER : '') ?? 'gemini')
  .toString()
  .toLowerCase()
  .trim();

let _provider: LLMProvider | null = null;

/**
 * Returns the active LLM provider (Gemini or Mock based on LLM_PROVIDER).
 *
 * @returns LLMProvider instance (singleton).
 */
export function getLLMProvider(): LLMProvider {
  if (!_provider) {
    if (PROVIDER === 'mock') {
      _provider = new MockProvider();
    } else {
      _provider = new GeminiProvider();
    }
  }
  return _provider;
}

export type { LLMProvider, LLMEvaluateInput, LLMEvaluateResult } from './LLMProvider';
export { GeminiProvider } from './GeminiProvider';
export { MockProvider } from './MockProvider';
