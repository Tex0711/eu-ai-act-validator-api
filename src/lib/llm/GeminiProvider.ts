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

function parseJsonResponse(text: string): Partial<LLMEvaluateResult> {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    const parsed = JSON.parse(jsonText.trim());
    return {
      decision: parsed.decision || 'WARNING',
      reason: parsed.reason || 'Unable to determine compliance status',
      article_ref: parsed.article_ref ?? undefined,
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
