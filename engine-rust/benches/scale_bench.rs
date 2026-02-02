//! Criterion benchmark: evaluate latency for varying N (chunks).
//! Measures t_search/N to estimate max data volume under 100 ms.

use compliance_engine::{ChunkMetadata, ComplianceChunk, ComplianceEngine};
use criterion::{black_box, criterion_group, criterion_main, BenchmarkId, Criterion};
use std::time::Instant;

const EMBEDDING_DIM: usize = 1536;
const QUERY: [f32; EMBEDDING_DIM] = [0.0; EMBEDDING_DIM];

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

fn make_engine(n: usize) -> ComplianceEngine {
    let mut chunks = Vec::with_capacity(n);
    for i in 0..n {
        let ref_ = match i % 3 {
            0 => "Article 5(1)(a)",
            1 => "Article 6 & Annex III(4)",
            _ => "Article 50",
        };
        let emb: Vec<f32> = (0..EMBEDDING_DIM)
            .map(|j| (i as f32 * 0.001 + j as f32 * 0.0001))
            .collect();
        chunks.push(dummy_chunk(ref_, emb));
    }
    ComplianceEngine::new(chunks).expect("engine")
}

fn bench_scale(c: &mut Criterion) {
    let ns = [100, 500, 1000, 2000, 5000, 10_000];
    let query = vec![0.0f32; EMBEDDING_DIM];

    let mut group = c.benchmark_group("evaluate_varying_n");
    for &n in &ns {
        let engine = make_engine(n);
        group.bench_with_input(
            BenchmarkId::new("evaluate", n),
            &(engine, query.as_slice()),
            |b, (engine, q)| b.iter(|| engine.evaluate(black_box(q))),
        );
    }
    group.finish();
}

criterion_group!(benches, bench_scale);
criterion_main!(benches);
