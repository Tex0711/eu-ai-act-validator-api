import { supabase, type ComplianceKnowledge } from '@/lib/supabase/client';
import type { GatekeeperRequest, GatekeeperResponse } from '@/lib/validation/schemas';
import { randomUUID } from 'crypto';
import { stripPII } from './PIIGateway';
import { getLLMProvider, type LLMProvider } from '@/lib/llm';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? (typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env as Record<string, string>).OPENAI_API_KEY : undefined);
const MAX_RESPONSE_TIME_MS = 800;
const EMBEDDING_CACHE_SIZE = 100;
const EMBEDDING_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Minimum similarity for retrieval (align with Rust engine). */
const MIN_SIMILARITY = 0.2;
/** Top-k articles for ASCF and Judge (align with Rust). */
const TOP_K = 3;
/** Fast Path DENY only when best Article 5 match is above this (avoids false DENY on e.g. "Python function", "chatbot", "face unlock"). */
const FAST_PATH_DENY_MIN_SIMILARITY = 0.7;

/**
 * ComplianceEngine – core "Legal Guardrail" service for EU AI Act compliance.
 *
 * 1. Strips PII from the prompt (EU/US in v1.0; see INTERNATIONAL_ROADMAP.md).
 * 2. Generates embeddings for the masked prompt.
 * 3. Performs semantic search on EU AI Act articles (Supabase/pgvector).
 * 4. Uses LLM (Gemini or Mock via LLM_PROVIDER) to evaluate compliance.
 * 5. Returns structured decisions with audit_id and masked_prompt.
 *
 * @module ComplianceEngine
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
  private llmProvider: LLMProvider;
  // Simple LRU cache for embeddings (reduces OpenAI API calls for repeated prompts)
  private embeddingCache = new Map<string, CacheEntry>();

  constructor(provider?: LLMProvider) {
    this.llmProvider = provider ?? getLLMProvider();
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
   * Construct the "Judge Prompt" for LLM evaluation.
   * Full-spectrum audit: Articles 4, 5, 6, 7, 9, 10, 14, 50, and Annex III.
   */
  private buildJudgePrompt(
    userPrompt: string,
    relevantArticles: ComplianceKnowledge[]
  ): string {
    const articlesText = relevantArticles
      .map((article) => {
        const ref = article.metadata?.article_ref || 'Unknown';
        const simplified = article.metadata?.simplified_explanation
          ? `\n[Context: ${article.metadata.simplified_explanation}]`
          : '';
        return `**Article ${ref}**${simplified}\n${article.content}`;
      })
      .join('\n\n---\n\n');

    return `You are the Lead EU AI Act Auditor. Your role is to perform a systematic compliance audit focusing on Articles 4, 5, 6, 7, 9, 10, 14, 50, and Annex III.

### INPUT DATA
1. **User Prompt to Audit:** "${userPrompt}"
2. **Retrieved Legal Context (RAG):** ${articlesText || 'Apply general principles of Regulation 2024/1689.'}

### AUDIT PHASES (Sequential Filtering)

**PHASE 1: Prohibited Practices (Article 5 - MANDATORY DENY)**
Check if the prompt involves:
- (5.1.a/b) Subliminal, manipulative, or deceptive techniques / exploiting vulnerabilities.
- (5.1.c/d) Social scoring / predictive policing based on personality traits or past behavior.
- (5.1.e) Untargeted facial image scraping.
- (5.1.f/g) Emotion recognition (workplace/education) or biometric categorization of sensitive traits.
- (5.1.h) Real-time biometric identification in publicly accessible spaces.
-> **If matched: decision = "DENY", risk_score >= 0.9.**

**PHASE 2: High-Risk Classification (Article 6 & Annex III - MANDATORY WARNING)**
Check if the use case falls under:
- **Employment/HR:** Recruitment, screening, performance monitoring.
- **Education:** Admissions, grading, exam proctoring.
- **Critical Services:** Credit scoring, insurance, medical triage, public benefits.
- **Law Enforcement & Justice.**
-> **If matched: decision = "WARNING", risk_score = 0.5 - 0.8.** Reference mandatory compliance: **Articles 9 (Risk Management)**, **10 (Data Quality)**, and **14 (Human Oversight)**.

**PHASE 3: Transparency & Literacy (Article 4 & 50)**
- (Art 50) Chatbots/Deepfakes: Use **ALLOW** but mandate transparency in the reasoning.
- (Art 4) Organizational deployment without mention of training: Use **WARNING** and cite AI Literacy obligations.
- Otherwise: If no red flags, use **ALLOW**, risk_score <= 0.3.

### EDGE CASES
- **1:1 Biometric Verification (FaceID):** Use **ALLOW**.
- **Exam Proctoring (Cheating detection, NO emotion AI):** Use **WARNING** (Annex III).
- **General Productivity (Summarizing, coding):** Use **ALLOW**.

### OUTPUT SPECIFICATIONS
- **Language:** Detect the language of the **User Prompt to Audit** above. Output "reason" and "decision_label" in that same language (e.g. Dutch → Dutch, English → English). Keep "decision" as exactly one of: ALLOW | WARNING | DENY (canonical, for logic).
- **Reason length:** Keep "reason" short. For **ALLOW**: one short sentence only. For **WARNING** or **DENY**: 1–3 sentences; cite Articles and mandatory measures where relevant.
- **decision_label:** A short human-readable label in the prompt's language (e.g. "Toegestaan" / "Allowed", "Waarschuwing" / "Warning", "Geweigerd" / "Denied").
- **Alignment:** risk_score must match decision (DENY: 0.9-1.0, WARNING: 0.4-0.8, ALLOW: 0.0-0.3).
- **Format:** JSON object only. No markdown.

### JSON SCHEMA
{
  "internal_analysis": "Mapping: Step 1 (Art 5) -> Step 2 (Annex III) -> Step 3 (Art 50/4).",
  "decision": "ALLOW" | "WARNING" | "DENY",
  "decision_label": "Short label in the prompt's language (e.g. Toegestaan, Waarschuwing, Geweigerd).",
  "reason": "Short explanation in the prompt's language. One sentence for ALLOW; 1-3 sentences for WARNING/DENY with Article refs.",
  "article_ref": "Specific Article or Annex reference",
  "risk_score": number
}

Now, perform the audit:`;
  }

  /**
   * Main evaluation: strip PII, embed, search EU AI Act articles, optionally call LLM, return decision.
   * PII is stripped first; masked prompt is used for search, LLM, and audit (data minimization).
   * EU & US PII fully supported in v1.0 (see INTERNATIONAL_ROADMAP.md).
   *
   * @param request - Gatekeeper request with prompt and optional context.
   * @returns Decision (ALLOW/DENY/WARNING), reason, article_ref, audit_id, masked_prompt.
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
        console.log(`[ComplianceEngine] Deep Path: ASCF ${ascf.decision} – calling LLM (${this.llmProvider.name}) for evaluation`);
      }
      const judgePrompt = this.buildJudgePrompt(maskedPrompt, searchResults);
      const llmResult = await this.llmProvider.evaluate({
        judgePrompt,
        articleRefFallback: searchResults[0]?.metadata?.article_ref,
      });

      const response: GatekeeperResponse & {
        masked_prompt?: string;
        decision_label?: string | null;
        internal_analysis?: string | null;
        risk_score?: number | null;
      } = {
        decision: llmResult.decision,
        reason: llmResult.reason,
        article_ref: llmResult.article_ref,
        audit_id: auditId,
        masked_prompt: maskedPrompt,
        decision_label: llmResult.decision_label ?? null,
        internal_analysis: llmResult.internal_analysis ?? null,
        risk_score: llmResult.risk_score ?? null,
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
