//! EU AI Act Compliance Engine (Rust)
//! Article-Specific Filtering (ASCF) with Triple Semantic Representation.
//! Target: <100ms latency via efficient vector math (ndarray / loop-unrolled cosine).

pub mod engine;
pub mod vector;

pub use engine::{
    ChunkMetadata, ComplianceChunk, ComplianceEngine, Decision, EvaluateResponse, SearchResult,
};
pub use vector::{cosine_similarity, cosine_similarity_unrolled};
