//! Measure c (time per chunk), compute N_max for 100 ms, write max_volume_100ms.json.
//! Run: cargo run --release --bin scale_bench

use compliance_engine::{ChunkMetadata, ComplianceChunk, ComplianceEngine};
use serde::Serialize;
use std::path::Path;
use std::time::Instant;

const EMBEDDING_DIM: usize = 1536;
const TARGET_LATENCY_MS: f64 = 100.0;
const ITERATIONS: u32 = 500;

#[derive(Serialize)]
struct MaxVolumeResult {
    target_latency_ms: f64,
    time_per_chunk_us: f64,
    time_per_chunk_ms: f64,
    n_max_chunks: usize,
    max_vector_data_bytes: u64,
    max_vector_data_mb: f64,
    embedding_dim: usize,
    measurements: Vec<Measurement>,
}

#[derive(Serialize)]
struct Measurement {
    n_chunks: usize,
    total_ms: f64,
    avg_ms: f64,
    c_us_per_chunk: f64,
}

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
            .map(|j| i as f32 * 0.001 + j as f32 * 0.0001)
            .collect();
        chunks.push(dummy_chunk(ref_, emb));
    }
    ComplianceEngine::new(chunks).expect("engine")
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let query = vec![0.0f32; EMBEDDING_DIM];
    let ns = [100, 500, 1000, 2000, 5000, 10_000];

    let mut measurements = Vec::with_capacity(ns.len());
    let mut c_sum_us = 0.0;
    let mut c_count = 0usize;

    println!("Measuring evaluate() for N = {:?} ({} iterations each)\n", ns, ITERATIONS);

    for &n in &ns {
        let engine = make_engine(n);
        let start = Instant::now();
        for _ in 0..ITERATIONS {
            let _ = engine.evaluate(&query);
        }
        let total_ms = start.elapsed().as_secs_f64() * 1000.0;
        let avg_ms = total_ms / ITERATIONS as f64;
        let c_us = (avg_ms * 1000.0) / n as f64;

        c_sum_us += c_us;
        c_count += 1;

        measurements.push(Measurement {
            n_chunks: n,
            total_ms,
            avg_ms,
            c_us_per_chunk: c_us,
        });

        println!(
            "  N = {:5}  total = {:.2} ms  avg = {:.4} ms  c = {:.2} µs/chunk",
            n, total_ms, avg_ms, c_us
        );
    }

    let c_avg_us = c_sum_us / c_count as f64;
    let c_avg_ms = c_avg_us / 1000.0;
    let n_max = (TARGET_LATENCY_MS / c_avg_ms).floor() as usize;
    let bytes_per_vector = EMBEDDING_DIM * 4;
    let max_vector_bytes = n_max as u64 * bytes_per_vector as u64;
    let max_vector_data_mb = max_vector_bytes as f64 / (1024.0 * 1024.0);

    let result = MaxVolumeResult {
        target_latency_ms: TARGET_LATENCY_MS,
        time_per_chunk_us: c_avg_us,
        time_per_chunk_ms: c_avg_ms,
        n_max_chunks: n_max,
        max_vector_data_bytes: max_vector_bytes,
        max_vector_data_mb,
        embedding_dim: EMBEDDING_DIM,
        measurements,
    };

    println!("\n--- Result ---");
    println!("  c (avg)     = {:.2} µs/chunk ({:.4} ms/chunk)", c_avg_us, c_avg_ms);
    println!("  N_max      = {} chunks (at {} ms)", n_max, TARGET_LATENCY_MS);
    println!("  max vector = {} bytes ({:.2} MB)", max_vector_bytes, max_vector_data_mb);

    let out_dir = Path::new("data");
    let out_path = out_dir.join("max_volume_100ms.json");
    std::fs::create_dir_all(out_dir)?;
    std::fs::write(&out_path, serde_json::to_string_pretty(&result)?)?;
    println!("\nWrote {}", out_path.display());

    Ok(())
}
