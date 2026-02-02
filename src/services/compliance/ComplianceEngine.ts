import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase, type ComplianceKnowledge } from '@/lib/supabase/client';
import type { GatekeeperRequest, GatekeeperResponse } from '@/lib/validation/schemas';
import { randomUUID } from 'crypto';
import { stripPII } from './PIIGateway';

const GEMINI_API_KEYS = (process.env.GEMINI_API_KEY ?? import.meta.env.GEMINI_API_KEY ?? '').split(',').map((k: string) => k.trim()).filter(Boolean);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? import.meta.env.OPENAI_API_KEY;
const MAX_RESPONSE_TIME_MS = 800;
const MAX_GEMINI_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;
const EMBEDDING_CACHE_SIZE = 100;
const EMBEDDING_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Minimum similarity for retrieval (align with Rust engine). */
const MIN_SIMILARITY = 0.2;
/** Top-k articles for ASCF and Judge (align with Rust). */
const TOP_K = 3;
/** Fast Path DENY only when best Article 5 match is above this (avoids false DENY on e.g. "Python function", "chatbot", "face unlock"). */
const FAST_PATH_DENY_MIN_SIMILARITY = 0.7;

if (GEMINI_API_KEYS.length === 0) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

console.log(`[Gemini] Loaded ${GEMINI_API_KEYS.length} API key(s)`);

// Create clients for all API keys
const geminiClients = GEMINI_API_KEYS.map((key: string) => new GoogleGenerativeAI(key));

/**
 * ComplianceEngine - The core "Legal Guardrail" service
 * 
 * This service:
 * 1. Generates embeddings for user prompts
 * 2. Performs semantic search on EU AI Act articles
 * 3. Uses Gemini 1.5 Pro to evaluate compliance
 * 4. Returns structured decisions with audit trails
 */
/**
 * Simple LRU cache entry for embeddings
 */
interface CacheEntry {
  embedding: number[];
  timestamp: number;
}

/** Search result: article + similarity (for Fast Path router and metrics). */
export type SearchResultItem = ComplianceKnowledge & { similarity: number };

/** ASCF rule-based result (same logic as engine-rust). */
interface ASCFResult {
  decision: 'ALLOW' | 'DENY' | 'WARNING';
  reason: string;
  article_ref: string | undefined;
}

export class ComplianceEngine {
  // Rotate through API keys to distribute rate limits
  private currentKeyIndex = 0;
  
  // Simple LRU cache for embeddings (reduces OpenAI API calls for repeated prompts)
  private embeddingCache = new Map<string, CacheEntry>();
  
  /**
   * Get the current Gemini model, rotating keys on each call
   */
  private getModel() {
    const client = geminiClients[this.currentKeyIndex];
    // Rotate to next key for next call
    this.currentKeyIndex = (this.currentKeyIndex + 1) % geminiClients.length;
    return client.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  /**
   * Generate embedding for a text prompt
   * Uses caching to reduce API calls for repeated prompts
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // Check cache first
    const cacheKey = text.toLowerCase().trim();
    const cached = this.embeddingCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < EMBEDDING_CACHE_TTL_MS) {
      console.log('[Embedding] Cache hit');
      return cached.embedding;
    }
    
    try {
      // Use OpenAI embeddings (reliable, well-documented)
      if (OPENAI_API_KEY) {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small', // 1536 dimensions, fast and cost-effective
            input: text,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        const embedding = data.data[0].embedding;
        
        // Store in cache (with LRU eviction)
        if (this.embeddingCache.size >= EMBEDDING_CACHE_SIZE) {
          // Remove oldest entry
          const oldestKey = this.embeddingCache.keys().next().value;
          if (oldestKey) this.embeddingCache.delete(oldestKey);
        }
        this.embeddingCache.set(cacheKey, { embedding, timestamp: Date.now() });
        
        return embedding;
      }

      // Option 2: Use Vertex AI embeddings via REST API
      // Note: This requires Vertex AI setup. For MVP, OpenAI is recommended.
      throw new Error('Embedding generation not configured. Set OPENAI_API_KEY or configure Vertex AI.');
    } catch (error) {
      console.error('Embedding generation failed:', error instanceof Error ? error.message : String(error));
      throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Perform semantic search on compliance knowledge base.
   * Returns top-k articles with similarity (for Fast Path router and Judge).
   */
  private async searchComplianceKnowledge(
    embedding: number[],
    limit: number = TOP_K
  ): Promise<SearchResultItem[]> {
    try {
      console.log(`[VectorSearch] Starting search with embedding length: ${embedding.length}`);
      
      // Workaround for PostgREST/pgvector bug:
      // PostgREST cannot correctly handle vector similarity operations via RPC.
      // Solution: Fetch all records and calculate similarity in JavaScript.
      
      // Step 1: Fetch all compliance knowledge with embeddings
      const { data: allRecords, error } = await supabase
        .from('compliance_knowledge')
        .select('id, content, metadata, embedding')
        .not('embedding', 'is', null);
      
      if (error) {
        console.error('[VectorSearch] Failed to fetch records:', error.message);
        throw error;
      }

      if (!allRecords || allRecords.length === 0) {
        console.warn('[VectorSearch] No records found in database');
        return [];
      }

      console.log(`[VectorSearch] Fetched ${allRecords.length} records, calculating similarity...`);
      
      // Step 2: Calculate cosine similarity in JavaScript
      const resultsWithSimilarity = allRecords.map((record) => {
        // Parse embedding from string if needed (Supabase returns vector as string)
        let recordEmbedding: number[];
        if (typeof record.embedding === 'string') {
          recordEmbedding = JSON.parse(record.embedding);
        } else {
          recordEmbedding = record.embedding;
        }
        
        const similarity = this.cosineSimilarity(embedding, recordEmbedding);
        return {
          id: record.id,
          content: record.content,
          metadata: record.metadata,
          similarity,
        };
      });
      
      // Step 3: Sort by similarity (descending) and take top N
      const sorted = resultsWithSimilarity
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
      
      console.log(`[VectorSearch] Found ${sorted.length} results`);
      if (sorted.length > 0) {
        console.log(`[VectorSearch] Similarity range: ${(sorted[sorted.length - 1].similarity * 100).toFixed(1)}% - ${(sorted[0].similarity * 100).toFixed(1)}%`);
        console.log(`[VectorSearch] First result: ${sorted[0].metadata?.article_ref || 'Unknown'}, similarity: ${(sorted[0].similarity * 100).toFixed(1)}%`);
      }
      
      // Filter results by minimum similarity (align with Rust MIN_SIMILARITY)
      const filtered = sorted.filter((item) => item.similarity > MIN_SIMILARITY);
      
      if (filtered.length === 0 && sorted.length > 0) {
        console.warn('[VectorSearch] All results have similarity < 0.2, using top result anyway');
        return [sorted[0]];
      }
      
      console.log(`[VectorSearch] Returning ${filtered.length} articles with similarity > ${MIN_SIMILARITY}`);
      return filtered;
    } catch (error) {
      console.error('Semantic search error:', error instanceof Error ? error.message : String(error));
      // Safety first: if search fails, return empty array (will trigger WARNING)
      return [];
    }
  }
  
  /**
   * Calculate cosine similarity between two vectors
   * Optimized with loop unrolling for better performance on 1536-dim vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    const len = a.length;
    if (len !== b.length) {
      console.error(`[VectorSearch] Vector length mismatch: ${len} vs ${b.length}`);
      return 0;
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    // Process 8 elements at a time (loop unrolling)
    const unrollLimit = len - (len % 8);
    let i = 0;
    
    for (; i < unrollLimit; i += 8) {
      const a0 = a[i], a1 = a[i+1], a2 = a[i+2], a3 = a[i+3];
      const a4 = a[i+4], a5 = a[i+5], a6 = a[i+6], a7 = a[i+7];
      const b0 = b[i], b1 = b[i+1], b2 = b[i+2], b3 = b[i+3];
      const b4 = b[i+4], b5 = b[i+5], b6 = b[i+6], b7 = b[i+7];
      
      dotProduct += a0*b0 + a1*b1 + a2*b2 + a3*b3 + a4*b4 + a5*b5 + a6*b6 + a7*b7;
      normA += a0*a0 + a1*a1 + a2*a2 + a3*a3 + a4*a4 + a5*a5 + a6*a6 + a7*a7;
      normB += b0*b0 + b1*b1 + b2*b2 + b3*b3 + b4*b4 + b5*b5 + b6*b6 + b7*b7;
    }
    
    // Handle remaining elements
    for (; i < len; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    if (magnitude === 0) return 0;
    
    return dotProduct / magnitude;
  }

  /**
   * ASCF (Article-Specific Filtering) – same logic as engine-rust.
   * Article 5(1) → prohibited; Article 6 / Annex III → high-risk.
   */
  private isArticle5(articleRef: string): boolean {
    return articleRef.trim().includes('Article 5(1)');
  }

  private isHighRisk(articleRef: string): boolean {
    const r = articleRef.toLowerCase();
    return r.includes('article 6') || r.includes('annex iii');
  }

  /**
   * Rule-based decision from top-k search results (strictest wins).
   * DENY if any Article 5; else WARNING if any Article 6/Annex III; else ALLOW.
   */
  private decisionFromSearchResults(results: SearchResultItem[]): ASCFResult {
    if (results.length === 0) {
      return {
        decision: 'WARNING',
        reason: 'Unable to retrieve relevant EU AI Act articles. Manual review recommended.',
        article_ref: undefined,
      };
    }
    const firstRef = results[0].metadata?.article_ref ?? 'Unknown';

    for (const r of results) {
      const ref = r.metadata?.article_ref ?? 'Unknown';
      if (this.isArticle5(ref)) {
        return {
          decision: 'DENY',
          reason: `Prohibited practice under ${ref} of the EU AI Act. Request denied.`,
          article_ref: ref,
        };
      }
    }
    for (const r of results) {
      const ref = r.metadata?.article_ref ?? 'Unknown';
      if (this.isHighRisk(ref)) {
        return {
          decision: 'WARNING',
          reason: `High-risk AI system under ${ref}. Compliance measures required.`,
          article_ref: ref,
        };
      }
    }
    return {
      decision: 'ALLOW',
      reason: `No prohibited or high-risk provisions identified. Reference: ${firstRef}.`,
      article_ref: firstRef,
    };
  }

  /**
   * Call Gemini with retry logic and exponential backoff
   */
  private async callGeminiWithRetry(prompt: string): Promise<string> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= MAX_GEMINI_RETRIES; attempt++) {
      try {
        // Get model with rotating API key
        const model = this.getModel();
        const keyNum = ((this.currentKeyIndex - 1 + geminiClients.length) % geminiClients.length) + 1;
        console.log(`[Gemini] Attempt ${attempt} using API key ${keyNum}/${geminiClients.length}`);
        
        const result = await model.generateContent(prompt);
        console.log('[Gemini] Got result, extracting response...');
        
        const response = result.response;
        console.log('[Gemini] Response exists:', !!response);
        
        if (!response) {
          throw new Error('No response from Gemini');
        }
        
        // Try to get text - handle different response formats
        let text: string;
        try {
          text = response.text();
        } catch (textError) {
          console.error('[Gemini] Error getting text:', textError instanceof Error ? textError.message : String(textError));
          // Try alternative method
          const candidates = response.candidates;
          if (candidates && candidates.length > 0 && candidates[0].content) {
            text = candidates[0].content.parts?.map((p: any) => p.text).join('') || '';
          } else {
            throw new Error('Could not extract text from Gemini response');
          }
        }
        
        console.log('[Gemini] Got text, length:', text?.length || 0);
        
        if (!text) {
          throw new Error('Empty response from Gemini');
        }
        
        return text;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const errorMessage = lastError.message.toLowerCase();
        
        // Check if it's a rate limit error (429) - worth retrying
        const isRateLimitError = errorMessage.includes('429') || 
                                  errorMessage.includes('quota') ||
                                  errorMessage.includes('rate');
        
        // Check if it's a transient error worth retrying
        const isTransientError = errorMessage.includes('fetch') ||
                                  errorMessage.includes('network') ||
                                  errorMessage.includes('timeout');
        
        if (!isRateLimitError && !isTransientError) {
          // Don't retry for non-transient errors (e.g., invalid API key, model not found)
          console.error(`[Gemini] Non-retryable error: ${lastError.message.substring(0, 100)}`);
          throw lastError;
        }
        
        if (attempt < MAX_GEMINI_RETRIES) {
          // Exponential backoff: 1s, 2s, 4s...
          const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          console.warn(`[Gemini] Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    throw lastError || new Error('Gemini call failed after retries');
  }

  /**
   * Construct the "Judge Prompt" for Gemini evaluation
   */
  private buildJudgePrompt(
    userPrompt: string,
    relevantArticles: ComplianceKnowledge[]
  ): string {
    const articlesText = relevantArticles
      .map((article) => {
        const ref = article.metadata?.article_ref || 'Unknown';
        const simplified = article.metadata?.simplified_explanation 
          ? `\n[Simplified: ${article.metadata.simplified_explanation}]` 
          : '';
        return `**Article ${ref}**${simplified}\n${article.content}`;
      })
      .join('\n\n---\n\n');

    return `You are the ComplianceCode.ai Lead Auditor, an expert in EU AI Act compliance evaluation.

YOUR IDENTITY: You are a senior compliance auditor specializing in the EU AI Act (Regulation 2024/1689). Your role is to evaluate whether AI system prompts violate EU AI Act provisions.

INPUT:
- User Prompt: "${userPrompt}"
- Relevant EU AI Act Articles (retrieved via semantic search):

${articlesText || 'No specific articles found - apply strict interpretation based on general EU AI Act principles.'}

TASK: Evaluate if the user prompt leads to an AI system that would violate EU AI Act provisions.

EVALUATION CRITERIA:
1. **Article 5 Violations (PROHIBITED - Always DENY):**
   - Subliminal/manipulative techniques (5a)
   - Exploiting vulnerabilities (5b)
   - Social scoring systems (5c)
   - Predictive crime risk assessment (5d)
   - Untargeted facial recognition scraping (5e)
   - Emotion recognition in workplace/education (5f)
   - Biometric categorization by sensitive attributes (5g)
   - Real-time biometric identification without exceptions (5h)

2. **High-Risk AI Systems (Article 6 & Annex III):**
   - If the prompt describes a high-risk use case (employment, education, law enforcement, etc.), it requires WARNING or DENY depending on context
   - High-risk systems must meet strict requirements - if prompt doesn't indicate compliance, use WARNING

3. **AI Literacy (Article 4):**
   - If deploying AI systems, ensure staff training is mentioned - otherwise WARNING

STRICTNESS RULES:
- **If in doubt, default to "WARNING"** - Better to flag potential issues than miss violations
- **If clear Article 5 violation, use "DENY"** - Prohibited practices are absolute
- **If high-risk use case without compliance measures, use "WARNING"**
- **Only use "ALLOW" if clearly compliant** and no red flags exist

EDGE CASES – USE ALLOW (not WARNING):
- **1:1 biometric verification only** (e.g. face unlock for a smartphone, single-user device authentication, no identification of third parties, no mass surveillance): This is NOT Article 5(1)(h) real-time biometric identification in publicly accessible spaces. Use ALLOW.
- **General customer service chatbot** (e.g. e-commerce chatbot that discloses it is AI, transparency required): If the prompt describes only a transparent chatbot without prohibited practices or high-risk use (employment, credit, law enforcement, etc.), use ALLOW. Article 50 transparency does not by itself require WARNING when the use case is low-risk.

EDGE CASE – USE WARNING (not DENY):
- **Exam proctoring / online exam monitoring**: If the prompt describes monitoring students during online exams for **cheating or behavior detection** (e.g. detecting looking away, multiple faces, unauthorized materials) and does NOT explicitly ask for **emotion or affect analysis** (e.g. stress, anxiety, emotions), treat as **high-risk (WARNING)** under Article 6 & Annex III (education). Use WARNING, not DENY. Reserve DENY under Article 5(1)(f) for prompts that explicitly aim at emotion or affect recognition in education or workplace.

OUTPUT FORMAT:
Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "decision": "ALLOW" | "DENY" | "WARNING",
  "reason": "Clear, concise explanation (150-200 words). Reference specific article numbers. Explain why the decision was made.",
  "article_ref": "Article X" or null
}

EXAMPLES:
- Prompt about emotion recognition for HR → DENY (Article 5(1)(f))
- Prompt about predictive policing → DENY (Article 5(1)(d))
- Prompt about CV screening tool → WARNING (High-risk, needs compliance measures)
- Prompt about creative writing → ALLOW (No violations)
- Face unlock for smartphone (1:1 verification only) → ALLOW (not mass surveillance)
- Customer service chatbot with transparency → ALLOW (low-risk, transparent)
- Exam proctoring (monitoring for cheating, no emotion analysis) → WARNING (high-risk Annex III education), not DENY

Now evaluate the user prompt:`;
  }

  /**
   * Parse Gemini's JSON response safely
   */
  private parseGeminiResponse(text: string): Partial<GatekeeperResponse> {
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
      const parsed = JSON.parse(jsonText.trim());

      return {
        decision: parsed.decision || 'WARNING',
        reason: parsed.reason || 'Unable to determine compliance status',
        article_ref: parsed.article_ref || undefined,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Failed to parse Gemini response:', errorMsg);
      console.error('Raw text was:', text.substring(0, 500));
      return {
        decision: 'WARNING',
        reason: 'Failed to parse compliance evaluation. Please review manually.',
      };
    }
  }

  /**
   * Main evaluation method - checks prompt against EU AI Act.
   * PII is stripped first; masked prompt is used for search, LLM, and audit (data minimization).
   */
  async evaluate(request: GatekeeperRequest): Promise<GatekeeperResponse & { masked_prompt?: string }> {
    const startTime = Date.now();
    const auditId = randomUUID();

    // Step 0: PII stripping (Privacy-by-Design) – masked prompt used for search, LLM, and audit
    const maskedPrompt = stripPII(request.prompt);

    try {
      // Step 1: Generate embedding for the masked prompt
      const promptEmbedding = await this.generateEmbedding(maskedPrompt);

      // Step 2: Search for relevant compliance articles (returns items with similarity)
      console.log(`[ComplianceEngine] Searching for articles with embedding (${promptEmbedding.length} dims)`);
      const searchResults = await this.searchComplianceKnowledge(promptEmbedding, TOP_K);
      console.log(`[ComplianceEngine] Found ${searchResults.length} relevant articles`);

      // Step 3: Safety check - if no articles found or search failed, default to WARNING
      if (searchResults.length === 0) {
        console.warn(`[ComplianceEngine] No articles found for prompt: "${maskedPrompt.substring(0, 50)}..."`);
        const responseTime = Date.now() - startTime;
        return {
          decision: 'WARNING',
          reason: 'Unable to retrieve relevant EU AI Act articles. Manual review recommended.',
          audit_id: auditId,
          masked_prompt: maskedPrompt,
        };
      }

      console.log(`[ComplianceEngine] Articles found: ${searchResults.map((a) => a.metadata?.article_ref || 'Unknown').join(', ')}`);

      // Step 4: Hybrid router – Fast Path (ASCF) vs Deep Path (Gemini)
      const ascf = this.decisionFromSearchResults(searchResults);
      if (ascf.decision === 'DENY') {
        // Only Fast Path when the best Article 5 match has high similarity (avoids false DENY on edge cases)
        const article5Similarity = searchResults
          .filter((r) => this.isArticle5(r.metadata?.article_ref ?? ''))
          .map((r) => r.similarity)
          .reduce((max, s) => Math.max(max, s), 0);
        if (article5Similarity >= FAST_PATH_DENY_MIN_SIMILARITY) {
          console.log(`[ComplianceEngine] Fast Path: ASCF DENY (Article 5, sim=${(article5Similarity * 100).toFixed(0)}%) – returning without Gemini`);
          const responseTime = Date.now() - startTime;
          return {
            decision: 'DENY',
            reason: ascf.reason,
            article_ref: ascf.article_ref,
            audit_id: auditId,
            masked_prompt: maskedPrompt,
          };
        }
        console.log(`[ComplianceEngine] Deep Path: ASCF DENY but low Article 5 similarity (${(article5Similarity * 100).toFixed(0)}% < ${FAST_PATH_DENY_MIN_SIMILARITY * 100}%) – calling Gemini for disambiguation`);
      } else {
        // Deep Path: WARNING or ALLOW – use Gemini for contextual nuance
        console.log(`[ComplianceEngine] Deep Path: ASCF ${ascf.decision} – calling Gemini for evaluation`);
      }
      const judgePrompt = this.buildJudgePrompt(maskedPrompt, searchResults);
      const responseText = await this.callGeminiWithRetry(judgePrompt);

      // Step 5: Parse and validate response
      const parsed = this.parseGeminiResponse(responseText);
      const articleRef = parsed.article_ref ?? searchResults[0]?.metadata?.article_ref;

      const response: GatekeeperResponse & { masked_prompt?: string } = {
        decision: (parsed.decision as 'ALLOW' | 'DENY' | 'WARNING') ?? 'WARNING',
        reason: parsed.reason ?? 'Compliance evaluation completed',
        article_ref: articleRef,
        audit_id: auditId,
        masked_prompt: maskedPrompt,
      };

      // Step 7: Performance check
      const responseTime = Date.now() - startTime;
      if (responseTime > MAX_RESPONSE_TIME_MS) {
        console.warn(`Response time ${responseTime}ms exceeds target ${MAX_RESPONSE_TIME_MS}ms`);
      }

      return response;
    } catch (error) {
      // Avoid console.error crash on Gemini error objects by only logging the message
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Compliance evaluation error:', errorMessage);
      const responseTime = Date.now() - startTime;
      
      // Safety first: on error, default to DENY
      return {
        decision: 'DENY',
        reason: `Compliance check failed: ${errorMessage.substring(0, 200)}. For safety, request is denied.`,
        audit_id: auditId,
        masked_prompt: maskedPrompt,
      };
    }
  }
}

export const complianceEngine = new ComplianceEngine();
