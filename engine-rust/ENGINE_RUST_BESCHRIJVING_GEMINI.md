# Engine-rust: uitgebreide beschrijving voor Gemini

Dit document beschrijft wat de **EU AI Act Compliance Engine (Rust)** doet, hoe hij is gebouwd en wat de test- en benchmarkprestaties zijn. Het is bedoeld als context voor AI-assistenten (zoals Gemini) die met deze codebase werken.

---

## Belangrijk: waar wordt Gemini wél gebruikt?

**Ja, we gebruiken Gemini om de context van de prompts te begrijpen.** Dat gebeurt in de **Node API** (niet in Engine-rust):

- **Node API (`src/services/compliance/ComplianceEngine.ts`):**  
  Dit is de **hoofdflow** voor compliance-checks. De flow is:  
  1. PII wordt uit de prompt gestript (Privacy-by-Design).  
  2. Er wordt een embedding van de (gemaskeerde) prompt gegenereerd.  
  3. Semantische search haalt de meest relevante EU AI Act-artikelen op.  
  4. Een **Judge Prompt** wordt gebouwd met: **de gebruikersprompt** + **de opgehaalde artikelen**.  
  5. **Gemini (gemini-2.0-flash)** krijgt deze prompt en beslist: ALLOW, DENY of WARNING, met reden en artikelverwijzing.  

  Dus: **Gemini begrijpt de inhoud van de prompt** en weegt die af tegen de wet. De Node API haalt ~94% accuracy op 36 scenario’s dankzij deze LLM-stap.

- **Engine-rust:**  
  Dit is een **aparte**, **regelgebaseerde** implementatie **zonder LLM**. Hij wordt gebruikt voor **benchmarks en schaalmetingen** (hoeveel chunks kunnen we in &lt;100 ms doorzoeken?) en voor snelle, regel-only evaluaties. Hij vervangt de Node API niet; de productie-compliance die prompt-context begrijpt, loopt via de Node API + Gemini.

**Kort:** voor “juiste context van de prompts” → **Node API + Gemini**. Engine-rust = snelle, regel-only component voor performance/schaal.

### Productie-flow voor compliance checks (Node API)

De **productie-flow** die daadwerkelijk elke compliance-check uitvoert, staat in de **Node API** en gebruikt Gemini. Hieronder de volledige flow.

**Endpoint:** `POST /api/v1/gatekeeper`  
**Request:** `{ "prompt": "string", "context": { "user_id", "department" } (optioneel) }`  
**Response:** `{ "decision": "ALLOW"|"DENY"|"WARNING", "reason": "string", "article_ref": "string"|null, "audit_id": "uuid" }`

**Stappen in volgorde:**

1. **Validatie** – API-key (`x-api-key`) en request body worden gevalideerd.
2. **PII-stripping** – `PIIGateway.stripPII(request.prompt)` maskeert namen, e-mail, telefoon, BSN, adressen enz. De **gemaskeerde prompt** wordt overal verder gebruikt (search, LLM, audit); de originele prompt gaat niet naar Gemini of naar de database.
3. **Embedding** – Van de gemaskeerde prompt wordt een embedding gegenereerd (gecached waar mogelijk).
4. **Semantische search** – De embedding wordt vergeleken met de compliance-knowledge (Supabase/vector). De **top-3** meest relevante EU AI Act-artikelen (chunks) worden opgehaald, inclusief similarity-scores.
5. **Hybride router (Fast Path vs Deep Path):**
   - **ASCF (regel-logica, zelfde als engine-rust):** Op de top-k resultaten wordt Article-Specific Filtering toegepast: als **één** van de top-k Article 5(1) is → DENY; anders als **één** Article 6 of Annex III is → WARNING; anders → ALLOW.
   - **Fast Path:** Als ASCF **DENY** oplevert (duidelijke Article 5-overtreding), wordt **direct** die beslissing teruggegeven **zonder** Gemini-aanroep. Dit bespaart latency en LLM-kosten op duidelijke verboden praktijken.
   - **Deep Path:** Als ASCF WARNING of ALLOW oplevert, gaat de request naar **Gemini** voor contextuele nuance (Judge Prompt + LLM).
6. **Judge Prompt (alleen bij Deep Path)** – `buildJudgePrompt(maskedPrompt, relevantArticles)` bouwt één prompt met gebruikersprompt, opgehaalde artikelen en instructies (Lead Auditor, criteria, JSON-output).
7. **Gemini-aanroep (alleen bij Deep Path)** – `callGeminiWithRetry(judgePrompt)` stuurt naar **gemini-2.0-flash**. Gemini retourneert JSON met `decision`, `reason`, `article_ref`.
8. **Parsing** – `parseGeminiResponse(text)` haalt de JSON uit het antwoord (alleen bij Deep Path).
9. **Audit log** – In Supabase `audit_logs` wordt o.a. opgeslagen: `audit_id`, **gemaskeerde prompt**, context, decision, reason, article_ref, response_time_ms (data minimalisatie: geen ruwe PII in de log).
10. **Response** – De gevalideerde response (zonder `masked_prompt`) wordt naar de client teruggestuurd.

**Samenvatting hybride:** Duidelijke Article 5-gevallen (DENY) worden door de **Fast Path** (regels) afgehandeld; WARNING/ALLOW-gevallen door de **Deep Path** (Gemini). Daardoor daalt het aantal Gemini-calls en de gemiddelde latency voor veel requests.

**Belangrijke bestanden:**

- `src/services/compliance/ComplianceEngine.ts` – evaluate(), buildJudgePrompt(), callGeminiWithRetry(), search, PII-stripping.
- `src/services/compliance/PIIGateway.ts` – stripPII().
- `src/pages/api/v1/gatekeeper.ts` – API-route die complianceEngine.evaluate() aanroept en audit schrijft.

Engine-rust maakt **geen** deel uit van deze productie-flow; hij wordt alleen gebruikt voor benchmarks en schaalmetingen.

### Is de productie-flow getest? Is er een dashboard?

**Ja, de volledige flow is getest.** De **36-scenario accuracy-test** roept de hele pipeline aan: PII-stripping → embedding → Supabase retrieval → Judge Prompt → Gemini → beslissing. Per scenario wordt vergeleken: verwachte beslissing (ALLOW/DENY/WARNING) vs. daadwerkelijke API-response.

- **Script:** `scripts/accuracy-test.js`
- **Run:** `npm run test:accuracy` (of `API_URL=http://localhost:3000/api/v1/gatekeeper node scripts/accuracy-test.js`). De API moet draaien (`npm run dev`).
- **Documentatie:** `docs/ACCURACY_TEST_LLM.md` (instructies, laatste resultaten, hoe naar >95% accuracy).

**Dashboard:** Er is een **Compliance Dashboard** op `/dashboard` (na `npm run dev`: `http://localhost:4321/dashboard` of `http://localhost:3000/dashboard` afhankelijk van de Astro-config). Dit dashboard toont:

- **Audit logs** – laatste 50 compliance-checks uit Supabase (timestamp, decision, article_ref, reason, prompt).
- **Statistieken** – totaal checks, violations blocked (DENY), warnings, compliance score.
- **Global health status** – groen/amber/rood op basis van recente DENY/WARNING.
- **Export** – Download Audit Report (CSV).

Het dashboard toont **geen** resultaten van de 36-scenario accuracy-test; die draai je in de terminal en de output staat in de console (en wordt samengevat in `docs/ACCURACY_TEST_LLM.md`). Voor een overzicht van **accuracy-testresultaten** is er dus geen apart dashboard – wel voor **live audit-monitoring**.

---

## 1. Wat doet Engine-rust?

### 1.1 Doel

De Engine-rust is een **hoge-performance, regelgebaseerde compliance-engine** voor de EU AI Act. Hij beoordeelt of een gebruikersvraag (een “AI-use-case prompt”) onder verboden praktijken (Article 5), high-risk (Article 6 / Annex III) of overige bepalingen valt, en geeft een **beslissing**: `ALLOW`, `WARNING` of `DENY`.

- **Geen LLM in Rust:** de engine doet alleen **semantische retrieval** (vector search) + **regelgebaseerde beslissingslogica**. Er wordt geen taalmodel aangeroepen. Voor volledige redenering met juridische nuance wordt de Node API met Gemini gebruikt.
- **Doel-latency:** evaluatie in **minder dan 100 ms** per request, ook bij grotere knowledge bases.

### 1.2 Triple Semantic Representation

De knowledge base is opgebouwd volgens **Triple Semantic Representation**:

- **Formele tekst** – letterlijke wettekst (EU AI Act-artikelen)
- **Vereenvoudigde uitleg** – begrijpelijke samenvatting
- **Real-world voorbeelden** – concrete use cases

Elke “chunk” in de engine bevat o.a. `content`, `metadata` (inclusief `article_ref`, `simplified_explanation`) en een **embedding** (1536 dimensies, compatibel met OpenAI text-embedding-3-small).

### 1.3 Article-Specific Filtering (ASCF)

De beslissingslogica heet **ASCF (Article-Specific Filtering)**:

1. **Retrieval:** gegeven een **query-embedding** (van de gebruikersprompt) wordt cosine similarity berekend tegen alle chunks. De **top-k** (k=3) meest relevante chunks worden geselecteerd, met een minimum similarity-drempel van 0,2.
2. **Regels (strengste wint):**
   - Als **één** van de top-k chunks verwijst naar **Article 5(1)** (verboden praktijken) → **DENY**.
   - Anders, als **één** verwijst naar **Article 6** of **Annex III** (high-risk) → **WARNING**.
   - Anders → **ALLOW**.

Er wordt dus geen juridische redenering gedaan; de engine kijkt alleen naar de `article_ref` van de opgehaalde chunks en past deze vaste regels toe. Dat verklaart waarom de accuracy op 36 scenario’s lager is (~78%) dan de Node API met Gemini (~94%): nuance, uitzonderingen en context worden alleen door de LLM afgehandeld.

### 1.4 Input/output

- **Input:** een **embedding** van de prompt (1536 floats). De prompt zelf wordt in deze Rust-engine niet verwerkt; embedding wordt extern gegenereerd (bijv. via OpenAI of het exportscript).
- **Output:** een `EvaluateResponse` met:
  - `decision`: `ALLOW` | `WARNING` | `DENY`
  - `reason`: korte tekstuele motivatie
  - `article_ref`: het artikel dat de beslissing bepaalt (indien van toepassing)
  - `audit_id`: UUID voor traceerbaarheid

---

## 2. Hoe is Engine-rust gebouwd?

### 2.1 Projectstructuur (Cargo)

- **Package:** `compliance-engine` (Rust 2021 edition).
- **Belangrijkste bronbestanden:**
  - `src/lib.rs` – publieke API (her-exports).
  - `src/vector.rs` – cosine similarity (ndarray + loop-unrolled voor 1536 dims).
  - `src/engine.rs` – `ComplianceEngine`, search, ASCF-beslissing, datastructuren.
  - `src/main.rs` – CLI: subcommando’s `benchmark` en `eval`.
  - `src/bin/scale_bench.rs` – standalone binary om schaalbaarheid te meten (c, N_max, max_vector_data_mb).

### 2.2 Vectorberekening (vector.rs)

- **Embeddingdimensie:** 1536 (OpenAI text-embedding-3-small).
- **Cosine similarity:**  
  - Eén versie met **ndarray** (`cosine_similarity`).  
  - Een **loop-unrolled** versie (`cosine_similarity_unrolled`) met 8x unroll voor de binnenste loop, om CPU-pipeline en cache beter te benutten; deze wordt in de engine gebruikt.
- Geen ANN-index (geen HNSW/IVF): **brute-force O(N)** over alle chunks. Dat is bewust: bij ~1 µs per chunk blijft de latency onder 100 ms tot ~90k chunks.

### 2.3 Engine (engine.rs)

- **ComplianceEngine** houdt een `Vec<ComplianceChunk>` in memory. Chunks zonder embedding worden bij het laden gefilterd.
- **search(query_embedding, limit):**  
  - Berekent cosine similarity van de query tegen elke chunk.  
  - Sorteert op similarity, neemt top-`limit` (standaard 3).  
  - Filtert op similarity > 0,2; als niets boven drempel zit, wordt toch de top-1 teruggegeven (veilige fallback).
- **evaluate(prompt_embedding):** roept `search(..., TOP_K)` aan, past `decision_from_results` toe op de top-k, en retourneert `EvaluateResponse` met gegenereerde `audit_id`.
- **Beslissingsfuncties:**  
  - `is_article_5(article_ref)` – detecteert "Article 5(1)" in de referentie.  
  - `is_high_risk(article_ref)` – detecteert "article 6" of "annex iii".  
  - `decision_from_results(results)` – past de ASCF-regels toe; lege resultaten → WARNING met “manual review” reden.

### 2.4 Dataformaten

- **knowledge.json:** array van objecten met o.a. `id`, `content`, `metadata` (o.a. `article_ref`, `section`, `title`, `simplified_explanation`), `embedding` (array van 1536 floats). Wordt geëxporteerd uit Supabase of als fixture gebruikt.
- **scenarios_36.csv:** kolommen `prompt` en `expected_decision` (ALLOW/DENY/WARNING); 36 vaste testscenario’s.
- **prompt_embeddings.json:** array van `{ "prompt": "...", "embedding": [ ... ] }`; gegenereerd door `scripts/export-for-rust-engine.js` (OpenAI embeddings voor de 36 prompts).

### 2.5 CLI (main.rs)

- **Subcommando’s (clap):**
  - **benchmark** – laadt knowledge, scenarios CSV en (optioneel) prompt_embeddings.json; voert voor elk scenario `evaluate` uit; rapporteert accuracy (aantal correcte beslissingen) en latency (avg, max, p95). Doel: <100 ms gemiddeld.
  - **eval** – leest één embedding (JSON-array van 1536 floats) van stdin, roept `evaluate` aan, print de response als JSON.
- Standaard paden: `data/knowledge.json`, `data/scenarios_36.csv`, `data/prompt_embeddings.json`.

### 2.6 Benchmarks

- **evaluate_bench (Criterion):** meet de latency van één `evaluate`-aanroep (met bestaande knowledge of dummy chunk). Doel: <100 ms.
- **scale_bench (Criterion):** meet `evaluate` voor verschillende aantallen chunks N (100, 500, 1000, 2000, 5000, 10_000).
- **scale_bench binary (`src/bin/scale_bench.rs`):**  
  - Draait 500 iteraties per N, berekent gemiddelde tijd per evaluate en daaruit **c** (µs per chunk).  
  - Berekent **N_max = 100 ms / c** (max. aantal chunks binnen 100 ms).  
  - Berekent **max_vector_data_mb** (N_max × 1536 × 4 bytes).  
  - Schrijft resultaat naar `data/max_volume_100ms.json`.

### 2.7 Afhankelijkheden

- **serde, serde_json** – (de)serialisatie.
- **csv** – inlezen scenarios CSV.
- **ndarray** – vectorberekening (alternatieve cosine).
- **uuid** – audit_id (v4).
- **anyhow, thiserror** – foutafhandeling.
- **clap** – CLI.
- **criterion, rand** – alleen dev/bench.

---

## 3. Test- en benchmarkprestaties

### 3.1 Unit tests

- **vector.rs:** cosine identical, orthogonal, unrolled vs ndarray gelijk.
- **engine.rs:** beslissing voor Article 5 → DENY, Article 6/Annex III → WARNING, Article 50 → ALLOW.

Draaien met: `cargo test`. Bij gebruik van `cargo bench` kunnen tests als “ignored” geteld worden; dan `cargo test -- --include-ignored` gebruiken.

### 3.2 Accuracy (36 scenario’s)

- **Methode:** `cargo run --release -- benchmark` met echte `knowledge.json` en `prompt_embeddings.json` (gegenereerd door `scripts/export-for-rust-engine.js`).
- **Typisch resultaat:** **28/36 correct (77,8%)**.
- **Verwachting:** ~78% is realistisch voor een **alleen retrieval + regels** engine zonder LLM. De 8 fouten vallen grofweg in:
  1. **Veilige prompts** (bv. “Python function”, “photosynthesis”, “movie recommendation”) – retrieval haalt per ongeluk een streng artikel in top-k → false DENY/WARNING; alleen een LLM kan die nuance geven.
  2. **Edge cases** (face unlock, medische emotie-detectie, chatbot) – verwacht ALLOW of uitzondering; engine geeft DENY omdat Article 5/6 in top-k zit; juridische uitzonderingen worden alleen door Gemini toegepast.
  3. **High-risk vs Article 5** (krediet/verzekering) – verwacht WARNING; engine geeft DENY omdat ook Article 5 in top-k staat; regel-engine kiest altijd de strengste uit top-k.

De **Node API met Gemini** haalt op dezelfde 36 scenario’s ~94% doordat de LLM redeneert over context en uitzonderingen.

### 3.3 Latency

- **Benchmark (36 scenario’s):** met ~34 chunks is de gemiddelde latency **0 ms** (sub-milliseconde); target <100 ms is ruimschoots gehaald.
- **Schaalbaarheid (scale_bench):**  
  - Gemeten **c** (tijd per chunk): circa **~1,1 µs/chunk** (afhankelijk van hardware).  
  - **N_max:** circa **~90.000 chunks** binnen 100 ms.  
  - **max_vector_data_mb:** circa **~526 MB** (alleen embeddings: N_max × 1536 × 4 bytes).

Concreet resultaat (uit `data/max_volume_100ms.json`):

- `time_per_chunk_us`: ~1,11  
- `n_max_chunks`: 89.847  
- `max_vector_data_mb`: ~526,4  
- `embedding_dim`: 1536  

Methode: in-memory brute-force O(N), top-3, geen ANN-index. De huidige knowledge base (~34 chunks) blijft ver onder 1 ms; managed vector-API’s rapporteren vaak 10–50 ms voor 100k vectoren, terwijl deze engine ~90k chunks binnen 100 ms aankan zonder index.

### 3.4 Samenvatting voor Gemini

| Aspect            | Waarde / korte beschrijving                                      |
|------------------|-------------------------------------------------------------------|
| **Rol**          | Regelgebaseerde EU AI Act compliance-engine (retrieval + ASCF).  |
| **Geen LLM**     | Alleen vector search + vaste regels; voor nuance → Node + Gemini.|
| **Input**        | 1536-dim embedding van de gebruikersprompt.                       |
| **Output**       | ALLOW / WARNING / DENY + reason + article_ref + audit_id.         |
| **Accuracy**     | ~77,8% op 36 scenario’s (bewust lager dan Node+Gemini ~94%).      |
| **Latency**      | Sub-ms bij ~34 chunks; ~1 µs/chunk → ~90k chunks in 100 ms.      |
| **Max volume**   | ~526 MB vectordata binnen 100 ms (brute-force, geen ANN).        |
| **Build/test**   | `cargo build --release`, `cargo test`, `cargo run --release -- benchmark`. |
| **Schaalmeting** | `cargo run --release --bin scale_bench` → `data/max_volume_100ms.json`.   |

Dit document geeft Gemini (of een andere AI-assistent) voldoende context over wat Engine-rust doet, hoe hij is opgezet en welke test- en benchmarkprestaties realistisch zijn.
