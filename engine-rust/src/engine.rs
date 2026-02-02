//! ComplianceEngine - EU AI Act Article-Specific Filtering (ASCF).
//! Triple Semantic Representation: formal text + simplified explanation + real-world examples.
//! Decision: DENY (Article 5) > WARNING (Article 6 / Annex III) > ALLOW.

use crate::vector::cosine_similarity_unrolled;
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::path::Path;
use uuid::Uuid;

/// Single compliance knowledge chunk (one article or sub-article).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceChunk {
    pub id: Option<String>,
    pub content: String,
    pub metadata: Option<ChunkMetadata>,
    #[serde(rename = "embedding")]
    pub embedding: Vec<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChunkMetadata {
    #[serde(rename = "article_ref")]
    pub article_ref: Option<String>,
    pub section: Option<String>,
    pub title: Option<String>,
    #[serde(rename = "simplified_explanation")]
    pub simplified_explanation: Option<String>,
}

/// Result of semantic search: chunk + similarity score.
#[derive(Debug, Clone)]
pub struct SearchResult {
    pub chunk: ComplianceChunk,
    pub similarity: f32,
}

/// Engine decision: ALLOW | DENY | WARNING.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum Decision {
    Allow,
    Deny,
    Warning,
}

impl std::fmt::Display for Decision {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Decision::Allow => write!(f, "ALLOW"),
            Decision::Deny => write!(f, "DENY"),
            Decision::Warning => write!(f, "WARNING"),
        }
    }
}

/// Response from the compliance engine (no LLM; rule-based from top articles).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvaluateResponse {
    pub decision: Decision,
    pub reason: String,
    pub article_ref: Option<String>,
    pub audit_id: String,
}

const MIN_SIMILARITY: f32 = 0.2;
const TOP_K: usize = 3;

/// Returns true if article_ref is a prohibited practice (Article 5(1)(a)-(h)).
#[inline]
fn is_article_5(article_ref: &str) -> bool {
    article_ref.trim().contains("Article 5(1)")
}

/// Returns true if article_ref is high-risk (Article 6 or Annex III).
#[inline]
fn is_high_risk(article_ref: &str) -> bool {
    let r = article_ref.to_lowercase();
    r.contains("article 6") || r.contains("annex iii")
}

/// ASCF rule-based decision from top-k retrieval results.
/// Uses strictest rule: if ANY result is Article 5 -> DENY; else if ANY is Article 6 -> WARNING; else ALLOW.
fn decision_from_results(results: &[SearchResult]) -> (Decision, String, Option<String>) {
    if results.is_empty() {
        return (
            Decision::Warning,
            "Unable to retrieve relevant EU AI Act articles. Manual review recommended.".into(),
            None,
        );
    }
    let first_ref = results[0]
        .chunk
        .metadata
        .as_ref()
        .and_then(|m| m.article_ref.clone())
        .unwrap_or_else(|| "Unknown".into());

    // Strictest rule from top-k: Article 5 wins over Article 6 over ALLOW
    for r in results {
        let article_ref = r
            .chunk
            .metadata
            .as_ref()
            .and_then(|m| m.article_ref.clone())
            .unwrap_or_else(|| "Unknown".into());
        if is_article_5(&article_ref) {
            return (
                Decision::Deny,
                format!(
                    "Prohibited practice under {} of the EU AI Act. Request denied.",
                    article_ref
                ),
                Some(article_ref),
            );
        }
    }
    for r in results {
        let article_ref = r
            .chunk
            .metadata
            .as_ref()
            .and_then(|m| m.article_ref.clone())
            .unwrap_or_else(|| "Unknown".into());
        if is_high_risk(&article_ref) {
            return (
                Decision::Warning,
                format!(
                    "High-risk AI system under {}. Compliance measures required.",
                    article_ref
                ),
                Some(article_ref),
            );
        }
    }
    (
        Decision::Allow,
        format!("No prohibited or high-risk provisions identified. Reference: {}.", first_ref),
        Some(first_ref),
    )
}

/// ComplianceEngine: in-memory knowledge base + cosine search + rule-based decision.
pub struct ComplianceEngine {
    chunks: Vec<ComplianceChunk>,
}

impl ComplianceEngine {
    /// Build engine from loaded chunks (must have embeddings).
    pub fn new(chunks: Vec<ComplianceChunk>) -> Result<Self> {
        let valid: Vec<_> = chunks
            .into_iter()
            .filter(|c| !c.embedding.is_empty())
            .collect();
        if valid.is_empty() {
            anyhow::bail!("No chunks with embeddings");
        }
        Ok(Self { chunks: valid })
    }

    /// Load knowledge base from JSON file (export from Supabase or seed).
    pub fn load_knowledge_from_path<P: AsRef<Path>>(path: P) -> Result<Self> {
        let s = std::fs::read_to_string(path.as_ref())?;
        let chunks: Vec<ComplianceChunk> = serde_json::from_str(&s)?;
        Self::new(chunks)
    }

    /// Semantic search: top-k by cosine similarity, threshold 0.2.
    /// If no result above threshold, returns top 1 (safety: never empty when chunks exist).
    pub fn search(&self, query_embedding: &[f32], limit: usize) -> Vec<SearchResult> {
        let mut scored: Vec<SearchResult> = self
            .chunks
            .iter()
            .map(|chunk| {
                let sim = cosine_similarity_unrolled(query_embedding, &chunk.embedding);
                SearchResult {
                    chunk: chunk.clone(),
                    similarity: sim,
                }
            })
            .collect();
        scored.sort_by(|a, b| b.similarity.partial_cmp(&a.similarity).unwrap_or(std::cmp::Ordering::Equal));
        let top: Vec<SearchResult> = scored.into_iter().take(limit).collect();
        let above: Vec<SearchResult> = top.iter().filter(|r| r.similarity > MIN_SIMILARITY).cloned().collect();
        if above.is_empty() && !top.is_empty() {
            vec![top.into_iter().next().unwrap()]
        } else {
            above.into_iter().take(limit).collect()
        }
    }

    /// Evaluate a single prompt given its embedding (no LLM).
    pub fn evaluate(&self, prompt_embedding: &[f32]) -> EvaluateResponse {
        let audit_id = Uuid::new_v4().to_string();
        let results = self.search(prompt_embedding, TOP_K);
        let (decision, reason, article_ref) = decision_from_results(&results);
        EvaluateResponse {
            decision,
            reason,
            article_ref,
            audit_id,
        }
    }

    pub fn num_chunks(&self) -> usize {
        self.chunks.len()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn dummy_chunk(article_ref: &str, embedding: Vec<f32>) -> ComplianceChunk {
        ComplianceChunk {
            id: None,
            content: String::new(),
            metadata: Some(ChunkMetadata {
                article_ref: Some(article_ref.into()),
                section: None,
                title: None,
                simplified_explanation: None,
            }),
            embedding,
        }
    }

    #[test]
    fn decision_article5_deny() {
        let chunks = vec![dummy_chunk("Article 5(1)(f)", vec![0.1; 1536])];
        let engine = ComplianceEngine::new(chunks).unwrap();
        let resp = engine.evaluate(&vec![0.1; 1536]);
        assert_eq!(resp.decision, Decision::Deny);
    }

    #[test]
    fn decision_article6_warning() {
        let chunks = vec![dummy_chunk("Article 6 & Annex III(4)", vec![0.1; 1536])];
        let engine = ComplianceEngine::new(chunks).unwrap();
        let resp = engine.evaluate(&vec![0.1; 1536]);
        assert_eq!(resp.decision, Decision::Warning);
    }

    #[test]
    fn decision_article50_allow() {
        let chunks = vec![dummy_chunk("Article 50", vec![0.1; 1536])];
        let engine = ComplianceEngine::new(chunks).unwrap();
        let resp = engine.evaluate(&vec![0.1; 1536]);
        assert_eq!(resp.decision, Decision::Allow);
    }
}
