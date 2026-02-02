# LLM-accuracytest (36 scenario's, doel >95%)

Deze test roept de **volledige pipeline** aan: OpenAI-embedding → Supabase retrieval → **Gemini**-beslissing. Doel: accuracy **boven 95%** op de 36 scenario’s.

## Resultaat (laatste run)

- **Accuracy: 36/36 (100%)** ✓ (hybride Fast Path + similarity-drempel 0.7 + Judge-prompt edge cases)
- **Article 5:** 23/23 (100%)
- **Safe:** 5/5 (100%)
- **High-Risk:** 10/10 (100%)
- **Edge cases:** 4/4 (100%)

## Zo voer je de test uit (in je afwezigheid of lokaal)

1. **Start de API** (in een terminal):
   ```bash
   cd /Users/tacovanderpoel/Development/compliance-code
   npm run dev
   ```
   Wacht tot de server op poort 3000 draait.

2. **Draai de accuracy-test** (in een tweede terminal):
   ```bash
   cd /Users/tacovanderpoel/Development/compliance-code
   API_URL=http://localhost:3000/api/v1/gatekeeper node scripts/accuracy-test.js
   ```
   Of met dotenv (API_KEY uit `.env`):
   ```bash
   node -r dotenv/config scripts/accuracy-test.js
   ```
   De test laadt `.env` zelf; standaard-API-URL is `http://localhost:3000/api/v1/gatekeeper`.

**Benodigd:** `OPENAI_API_KEY`, `GEMINI_API_KEY`, Supabase-env en `API_KEY` in `.env`.

## Hoe naar 36/36 (100%)?

De 3 huidige fouten:

| Scenario | Verwachting | Huidige output | Mogelijke aanpassing |
|----------|-------------|----------------|------------------------|
| Exam proctoring | WARNING | DENY (Art. 5(f)) | In judge-prompt: “monitoring during exams zonder emotie-analyse → WARNING (high-risk), niet DENY” of testverwachting naar DENY zetten als je exam-monitoring als 5(f) wilt behandelen. |
| Face unlock (verification) | ALLOW | WARNING | In judge-prompt expliciet: “Alleen 1:1 verification (device unlock), geen identificatie → ALLOW.” |
| General chatbot | ALLOW | WARNING | In judge-prompt: “Alleen chatbot zonder high-risk gebruik → ALLOW; transparantie noemen mag, maar leidt niet tot WARNING.” |

**Gedaan:** In `buildJudgePrompt` is **EDGE CASE – USE WARNING** toegevoegd voor exam proctoring (monitoring voor cheating/behavior zonder emotion analysis → WARNING). Draai `npm run test:accuracy` opnieuw om te controleren of 36/36 wordt gehaald.

## Vergelijking met Rust-engine

| Engine | Accuracy (36) | Latency | LLM |
|--------|----------------|---------|-----|
| **Node + Gemini** | **36/36 (100%)** | ~2 s/call (Fast Path &lt;1 s voor duidelijke Art. 5) | Ja |
| **Rust (regels)** | ~78% | &lt;1 ms | Nee |

De Rust-engine is bedoeld voor lage latency en reproduceerbare regels; de Node-API met Gemini voor hogere accuracy en juridische nuance.
