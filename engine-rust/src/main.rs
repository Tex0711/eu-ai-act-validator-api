//! CLI: benchmark (run 36 scenarios from CSV) or eval (single embedding).

use anyhow::Result;
use clap::{Parser, Subcommand};
use compliance_engine::{ComplianceEngine, Decision};
use std::path::PathBuf;
use std::time::Instant;

#[derive(Parser)]
#[command(name = "compliance-engine")]
#[command(about = "EU AI Act Compliance Engine - ASCF in Rust")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Run benchmark: load scenarios CSV + prompt embeddings JSON, report accuracy and latency.
    Benchmark {
        /// Path to knowledge base JSON (chunks with embeddings).
        #[arg(short, long, default_value = "data/knowledge.json")]
        knowledge: PathBuf,
        /// Path to scenarios CSV (prompt, expected_decision).
        #[arg(short, long, default_value = "data/scenarios_36.csv")]
        scenarios: PathBuf,
        /// Path to prompt embeddings JSON: array of { "prompt": "...", "embedding": [f32,...] }.
        #[arg(short, long, default_value = "data/prompt_embeddings.json")]
        embeddings: PathBuf,
    },
    /// Evaluate one prompt embedding from stdin (JSON array of 1536 floats).
    Eval {
        /// Path to knowledge base JSON.
        #[arg(short, long, default_value = "data/knowledge.json")]
        knowledge: PathBuf,
    },
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Commands::Benchmark {
            knowledge,
            scenarios,
            embeddings,
        } => run_benchmark(&knowledge, &scenarios, &embeddings),
        Commands::Eval { knowledge } => run_eval(&knowledge),
    }
}

const EMBEDDING_DIM: usize = 1536;

fn run_benchmark(
    knowledge_path: &PathBuf,
    scenarios_path: &PathBuf,
    embeddings_path: &PathBuf,
) -> Result<()> {
    println!("Loading knowledge from {}...", knowledge_path.display());
    let engine = ComplianceEngine::load_knowledge_from_path(knowledge_path)?;
    println!("  Chunks: {}", engine.num_chunks());

    println!("Loading scenarios from {}...", scenarios_path.display());
    let scenarios = load_scenarios(scenarios_path)?;
    println!("  Scenarios: {}", scenarios.len());

    let prompt_embeddings = if embeddings_path.exists() {
        println!("Loading prompt embeddings from {}...", embeddings_path.display());
        load_prompt_embeddings(embeddings_path)?
    } else {
        println!(
            "Embeddings file not found. Using placeholder embeddings (accuracy will be placeholder). \
             Run scripts/export-for-rust-engine.js to generate real embeddings."
        );
        scenarios
            .iter()
            .map(|s| PromptEmbeddingEntry {
                prompt: s.prompt.clone(),
                embedding: vec![0.0; EMBEDDING_DIM],
            })
            .collect()
    };
    if prompt_embeddings.len() != scenarios.len() {
        anyhow::bail!(
            "Embeddings count ({}) != scenarios count ({})",
            prompt_embeddings.len(),
            scenarios.len()
        );
    }

    println!("\nRunning benchmark ({} scenarios)...\n", scenarios.len());
    let mut correct = 0usize;
    let mut latencies_ms: Vec<u64> = Vec::with_capacity(scenarios.len());

    for (i, scenario) in scenarios.iter().enumerate() {
        let emb = &prompt_embeddings[i];
        if emb.prompt != scenario.prompt {
            eprintln!(
                "Warning: prompt mismatch at index {}: CSV vs embeddings order may differ.",
                i
            );
        }
        let start = Instant::now();
        let response = engine.evaluate(&emb.embedding);
        let elapsed = start.elapsed().as_millis() as u64;
        latencies_ms.push(elapsed);

        let expected = parse_decision(&scenario.expected_decision);
        let passed = response.decision == expected;
        if passed {
            correct += 1;
        }
        let status = if passed { "OK" } else { "FAIL" };
        println!(
            "[{:2}/36] {} | expected {} got {} | {} ms",
            i + 1,
            status,
            scenario.expected_decision,
            response.decision,
            elapsed
        );
    }

    let accuracy = (correct as f64 / scenarios.len() as f64) * 100.0;
    let avg_ms: f64 = latencies_ms.iter().copied().map(|x| x as f64).sum::<f64>() / latencies_ms.len() as f64;
    let max_ms = latencies_ms.iter().copied().max().unwrap_or(0);
    let p95_idx = (latencies_ms.len() as f64 * 0.95) as usize;
    latencies_ms.sort_unstable();
    let p95_ms = latencies_ms.get(p95_idx).copied().unwrap_or(0);

    println!("\n--- Results ---");
    println!("Accuracy: {}/{} ({:.1}%)", correct, scenarios.len(), accuracy);
    println!("Latency: avg {:.1} ms, max {} ms, p95 {} ms", avg_ms, max_ms, p95_ms);
    println!("Target <100 ms: {}", if avg_ms < 100.0 { "PASS" } else { "FAIL" });
    Ok(())
}

fn run_eval(knowledge_path: &PathBuf) -> Result<()> {
    let engine = ComplianceEngine::load_knowledge_from_path(knowledge_path)?;
    let stdin = std::io::stdin();
    let embedding: Vec<f32> = serde_json::from_reader(stdin.lock())?;
    let response = engine.evaluate(&embedding);
    println!("{}", serde_json::to_string_pretty(&response)?);
    Ok(())
}

#[derive(serde::Deserialize)]
struct ScenarioRow {
    prompt: String,
    expected_decision: String,
}

fn load_scenarios(path: &PathBuf) -> Result<Vec<ScenarioRow>> {
    let mut rdr = csv::Reader::from_path(path)?;
    let mut rows = Vec::new();
    for result in rdr.deserialize() {
        let row: ScenarioRow = result?;
        rows.push(row);
    }
    Ok(rows)
}

#[derive(serde::Deserialize)]
struct PromptEmbeddingEntry {
    prompt: String,
    embedding: Vec<f32>,
}

fn load_prompt_embeddings(path: &PathBuf) -> Result<Vec<PromptEmbeddingEntry>> {
    let s = std::fs::read_to_string(path)?;
    let entries: Vec<PromptEmbeddingEntry> = serde_json::from_str(&s)?;
    Ok(entries)
}

fn parse_decision(s: &str) -> Decision {
    match s.to_uppercase().trim() {
        "ALLOW" => Decision::Allow,
        "DENY" => Decision::Deny,
        "WARNING" => Decision::Warning,
        _ => Decision::Warning,
    }
}
