# Rust engine – teststatus

**Datum:** 31 januari 2026

## Gedaan in je afwezigheid

1. **Export script** – succesvol gedraaid:
   - 36 scenario’s uit `data/scenarios_36.csv` geparsed
   - 36 prompt-embeddings via OpenAI gegenereerd → `data/prompt_embeddings.json`
   - 34 knowledge-chunks uit Supabase geëxporteerd → `data/knowledge.json`

2. **Benchmark** – kon hier niet worden uitgevoerd (geen `cargo` in deze omgeving).

## Wat jij nog doet

In je terminal (Rust/cargo moet geïnstalleerd zijn):

```bash
cd /Users/tacovanderpoel/Development/compliance-code/engine-rust
cargo run --release -- benchmark
```

**Resultaat (na benchmark):**
- **Accuracy:** 28/36 (77.8%)
- **Latency:** avg 0 ms, max 0 ms, target &lt;100 ms: **PASS**

De 8 fouten vallen in drie groepen:
1. **Veilige prompts** (2, 3, 36): bv. “Python function”, “photosynthesis”, “movie recommendation” – retrieval haalt per ongeluk een streng artikel in top-k → false DENY/WARNING. Alleen een LLM kan die nuance doen.
2. **Edge cases** (33, 34, 35): face unlock (= verification), medische emotie-detectie, chatbot – verwacht ALLOW (uitzondering/transparantie), wij geven DENY omdat Article 5/6 in top-k zit. Vereist juridische uitzonderingen die alleen Gemini toepast.
3. **High-risk vs Article 5** (29, 30): krediet/verzekering – verwacht WARNING (high-risk), wij geven DENY doordat ook Article 5(b) (predatory) in top-k staat. Regel-engine kiest de strengste uit top-k.

**Conclusie:** 77.8% is realistisch voor een **alleen retrieval + regels** engine zonder LLM. De Node-API met Gemini haalt ~94% door redenering over uitzonderingen en context.

Optioneel:

```bash
cargo test
cargo bench
```

## Bestanden

- `data/prompt_embeddings.json` – 36 entries (prompt + 1536-dim embedding)
- `data/knowledge.json` – 34 chunks (EU AI Act-artikelen met embeddings)
- `data/scenarios_36.csv` – 36 testscenario’s (ongewijzigd)
