import type { LLMProvider, LLMEvaluateInput, LLMEvaluateResult } from './LLMProvider';

/**
 * Mock LLM provider for local testing and CI without API costs.
 * Returns ALLOW with a fixed reason for every request.
 */
export class MockProvider implements LLMProvider {
  readonly name = 'mock';

  async evaluate(input: LLMEvaluateInput): Promise<LLMEvaluateResult> {
    await Promise.resolve(); // simulate async
    return {
      decision: 'ALLOW',
      reason: 'MockProvider: no external LLM call. Set LLM_PROVIDER=gemini for real evaluation.',
      article_ref: input.articleRefFallback ?? 'Article 50',
    };
  }
}
