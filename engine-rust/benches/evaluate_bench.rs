//! Criterion benchmark: evaluate latency (target <100 ms per call).

use compliance_engine::{ChunkMetadata, ComplianceChunk, ComplianceEngine};
use criterion::{black_box, criterion_group, criterion_main, Criterion};
use std::path::Path;

fn load_engine() -> ComplianceEngine {
    let path = Path::new("data/knowledge.json");
    if path.exists() {
        ComplianceEngine::load_knowledge_from_path(path).expect("load knowledge")
    } else {
        let chunk = ComplianceChunk {
            id: None,
            content: String::new(),
            metadata: Some(ChunkMetadata {
                article_ref: Some("Article 50".into()),
                section: None,
                title: None,
                simplified_explanation: None,
            }),
            embedding: vec![0.0; 1536],
        };
        ComplianceEngine::new(vec![chunk]).expect("engine")
    }
}

fn bench_evaluate(c: &mut Criterion) {
    let engine = load_engine();
    let embedding = vec![0.0f32; 1536];
    c.bench_function("evaluate_single", |b| {
        b.iter(|| engine.evaluate(black_box(&embedding)));
    });
}

criterion_group!(benches, bench_evaluate);
criterion_main!(benches);
