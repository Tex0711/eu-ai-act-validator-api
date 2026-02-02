//! Efficient cosine similarity and vector math for 1536-dim embeddings.
//! Uses ndarray for SIMD-friendly operations; target <100ms latency.

use ndarray::{Array1, ArrayView1};
use std::f32;

/// Cosine similarity between two vectors (0.0 .. 1.0 for normalized).
/// Optimized for 1536-dimensional embeddings (OpenAI text-embedding-3-small).
#[inline]
pub fn cosine_similarity(a: ArrayView1<f32>, b: ArrayView1<f32>) -> f32 {
    let n = a.len();
    if n != b.len() || n == 0 {
        return 0.0;
    }
    let dot: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
    let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();
    let magnitude = norm_a * norm_b;
    if magnitude <= 0.0 {
        return 0.0;
    }
    (dot / magnitude).clamp(-1.0, 1.0)
}

/// Cosine similarity with loop-unrolled inner loop for 1536 dims (8x unroll).
pub fn cosine_similarity_unrolled(a: &[f32], b: &[f32]) -> f32 {
    let len = a.len();
    if len != b.len() || len == 0 {
        return 0.0;
    }
    let unroll_limit = len - (len % 8);
    let mut dot = 0.0f32;
    let mut norm_a = 0.0f32;
    let mut norm_b = 0.0f32;
    let mut i = 0;
    while i < unroll_limit {
        let a0 = a[i];
        let a1 = a[i + 1];
        let a2 = a[i + 2];
        let a3 = a[i + 3];
        let a4 = a[i + 4];
        let a5 = a[i + 5];
        let a6 = a[i + 6];
        let a7 = a[i + 7];
        let b0 = b[i];
        let b1 = b[i + 1];
        let b2 = b[i + 2];
        let b3 = b[i + 3];
        let b4 = b[i + 4];
        let b5 = b[i + 5];
        let b6 = b[i + 6];
        let b7 = b[i + 7];
        dot += a0 * b0 + a1 * b1 + a2 * b2 + a3 * b3 + a4 * b4 + a5 * b5 + a6 * b6 + a7 * b7;
        norm_a += a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3 + a4 * a4 + a5 * a5 + a6 * a6 + a7 * a7;
        norm_b += b0 * b0 + b1 * b1 + b2 * b2 + b3 * b3 + b4 * b4 + b5 * b5 + b6 * b6 + b7 * b7;
        i += 8;
    }
    for j in i..len {
        dot += a[j] * b[j];
        norm_a += a[j] * a[j];
        norm_b += b[j] * b[j];
    }
    let magnitude = norm_a.sqrt() * norm_b.sqrt();
    if magnitude <= 0.0 {
        return 0.0;
    }
    (dot / magnitude).clamp(-1.0, 1.0)
}

/// Convert slice to ndarray Array1 (copy).
pub fn to_array1(v: &[f32]) -> Array1<f32> {
    Array1::from_vec(v.to_vec())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cosine_identical() {
        let v: Vec<f32> = (0..100).map(|i| (i as f32) * 0.01).collect();
        let a = Array1::from_vec(v.clone());
        let b = Array1::from_vec(v);
        let sim = cosine_similarity(a.view(), b.view());
        assert!((sim - 1.0).abs() < 1e-5);
    }

    #[test]
    fn cosine_orthogonal() {
        let mut a = vec![0.0f32; 10];
        a[0] = 1.0;
        let mut b = vec![0.0f32; 10];
        b[1] = 1.0;
        let sim = cosine_similarity(
            Array1::from_vec(a).view(),
            Array1::from_vec(b).view(),
        );
        assert!(sim.abs() < 1e-5);
    }

    #[test]
    fn unrolled_matches_ndarray() {
        let a: Vec<f32> = (0..1536).map(|i| (i as f32).sin()).collect();
        let b: Vec<f32> = (0..1536).map(|i| (i as f32 * 0.7).cos()).collect();
        let arr_a = Array1::from_vec(a.clone());
        let arr_b = Array1::from_vec(b.clone());
        let s1 = cosine_similarity(arr_a.view(), arr_b.view());
        let s2 = cosine_similarity_unrolled(&a, &b);
        assert!((s1 - s2).abs() < 1e-5);
    }
}
