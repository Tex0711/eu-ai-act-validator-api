import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LLMProvider, LLMEvaluateInput, LLMEvaluateResult } from './LLMProvider';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

const GEMINI_KEY =
  process.env.GEMINI_API_KEY ??
  (typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env as Record<string, string>).GEMINI_API_KEY : undefined);
const API_KEYS = (GEMINI_KEY ?? '')
  .toString()
  .split(',')
  .map((k: string) => k.trim())
  .filter(Boolean);

/** Strip markdown code blocks (e.g. ```json ... ```) and extract JSON for parsing */
function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlock) return codeBlock[1].trim();
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) return trimmed.slice(firstBrace, lastBrace + 1);
  return trimmed;
}

function parseJsonResponse(text: string): Partial<LLMEvaluateResult> {
  try {
    const jsonText = extractJson(text);
    const parsed = JSON.parse(jsonText);
    const decision = parsed.decision;
    const validDecision = decision === 'ALLOW' || decision === 'DENY' || decision === 'WARNING';
    let riskScore: number | null = null;
    if (typeof parsed.risk_score === 'number' && !Number.isNaN(parsed.risk_score)) {
      riskScore = Math.max(0, Math.min(1, parsed.risk_score));
    }
    return {
      decision: validDecision ? decision : 'WARNING',
      reason: typeof parsed.reason === 'string' && parsed.reason ? parsed.reason : 'Unable to determine compliance status',
      article_ref: parsed.article_ref ?? undefined,
      internal_analysis: typeof parsed.internal_analysis === 'string' ? parsed.internal_analysis : null,
      risk_score: riskScore,
    };
  } catch {
    return {
      decision: 'WARNING',
      reason: 'Failed to parse compliance evaluation. Please review manually.',
    };
  }
}

export class GeminiProvider implements LLMProvider {
  readonly name = 'gemini';
  private clients: GoogleGenerativeAI[] = [];
  private keyIndex = 0;

  constructor() {
    if (API_KEYS.length === 0) {
      throw new Error('Missing GEMINI_API_KEY for GeminiProvider');
    }
    this.clients = API_KEYS.map((key) => new GoogleGenerativeAI(key));
  }

  async evaluate(input: LLMEvaluateInput): Promise<LLMEvaluateResult> {
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const client = this.clients[this.keyIndex % this.clients.length];
        this.keyIndex += 1;
        const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(input.judgePrompt);
        const response = result.response;
        if (!response) throw new Error('No response from Gemini');
        let text: string;
        try {
          text = response.text();
        } catch {
          const candidates = response.candidates;
          text = candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join('') ?? '';
        }
        if (!text) throw new Error('Empty response from Gemini');
        const parsed = parseJsonResponse(text);
        return {
          decision: (parsed.decision as 'ALLOW' | 'DENY' | 'WARNING') ?? 'WARNING',
          reason: parsed.reason ?? 'Compliance evaluation completed',
          article_ref: parsed.article_ref ?? input.articleRefFallback,
          internal_analysis: parsed.internal_analysis ?? null,
          risk_score: parsed.risk_score ?? null,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const msg = lastError.message.toLowerCase();
        const retryable = msg.includes('429') || msg.includes('quota') || msg.includes('rate') || msg.includes('fetch') || msg.includes('network') || msg.includes('timeout');
        if (!retryable || attempt === MAX_RETRIES) throw lastError;
        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw lastError ?? new Error('Gemini evaluation failed');
  }
}
