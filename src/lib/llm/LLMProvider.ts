/**
 * LLM Provider interface – model-agnostic compliance evaluation.
 * Enables swapping Gemini for Mock (local/testing) or other providers without changing the engine.
 */

export interface LLMEvaluateInput {
  judgePrompt: string;
  articleRefFallback?: string;
}

export interface LLMEvaluateResult {
  decision: 'ALLOW' | 'DENY' | 'WARNING';
  reason: string;
  article_ref: string | undefined;
  internal_analysis?: string | null;
  risk_score?: number | null;
}

export interface LLMProvider {
  readonly name: string;
  evaluate(input: LLMEvaluateInput): Promise<LLMEvaluateResult>;
}
