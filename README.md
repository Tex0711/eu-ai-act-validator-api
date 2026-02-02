# EU AI Act Validator API

[![CI](https://github.com/Tex0711/eu-ai-act-validator-api/actions/workflows/ci.yml/badge.svg)](https://github.com/Tex0711/eu-ai-act-validator-api/actions/workflows/ci.yml)

High-performance EU AI Act compliance API: real-time risk assessment with Gemini 2 Flash. Privacy-by-design: PII stripped before processing.

*Repository: `eu-ai-act-validator-api` · Product: ComplianceCode.eu*

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Supabase account with pgvector extension enabled
- Google Gemini API key
- OpenAI API key (for embeddings)

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for admin operations)
- `GEMINI_API_KEY` - Google Gemini API key for compliance evaluation
- `OPENAI_API_KEY` - OpenAI API key for text embeddings
- `API_KEY` - Your custom API key for endpoint authentication

### Database Setup

1. Run the migration in your Supabase SQL editor:

```bash
# Copy contents of supabase/migrations/001_initial_schema.sql
# Execute in Supabase SQL Editor
```

2. Seed the database with EU AI Act content (see `scripts/seed-db.ts` for example)

### Development

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api/v1/gatekeeper`

## 📡 API Usage

### Endpoint

`POST /api/v1/gatekeeper`

### Authentication

Include your API key in the request header:

```
x-api-key: your_api_key_here
```

### Request

```json
{
  "prompt": "Create a system that uses facial recognition to track employees",
  "context": {
    "user_id": "user_123",
    "department": "HR"
  }
}
```

### Response

```json
{
  "decision": "DENY",
  "reason": "Facial recognition for employee tracking may violate Article 5(1)(d) prohibiting social scoring for employment purposes.",
  "article_ref": "Article 5",
  "audit_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Response Codes

- `200` - Success
- `400` - Invalid request format
- `401` - Invalid or missing API key
- `429` - Rate limit exceeded (see `Retry-After` header)
- `500` - Internal server error

## 🏗️ Architecture

**Proprietary Hybrid Evaluation Engine:** Optimized for the EU AI Act. Our engine leverages a multi-stage validation process, combining deterministic rule-sets with advanced LLM reasoning to deliver sub-second responses and enterprise-grade cost efficiency.

**Benefits:**

- **Speed** – Many requests complete in under a second; full evaluation typically 1.5–2.5s where nuance is required.
- **Cost efficiency** – Intelligent routing minimizes LLM calls without sacrificing accuracy.
- **Accuracy** – Validated against 36+ EU AI Act scenarios; safety-first defaults (DENY/WARNING on errors).

**Privacy-by-design:** PII is stripped before processing; only anonymized placeholders are used for compliance checks. No PII stored.

### Performance (benchmarks)

| Scenario              | Typical latency | Notes        |
|-----------------------|-----------------|-------------|
| Deterministic checks  | &lt; 800 ms     | Rule-based  |
| Full LLM evaluation  | 1.5–2.5 s       | When needed  |
| Accuracy (36 scenarios) | 100%          | See `npm run test:accuracy` |

## 📊 Database Schema

### compliance_knowledge

Stores chunks of EU AI Act text with vector embeddings for semantic search.

### audit_logs

Complete audit trail including:
- **Prompt (masked)** – PII stripped; only placeholders stored (data minimization)
- Decision (ALLOW/DENY/WARNING)
- Reasoning
- Article references
- Response time

## 🔒 Security

- API key authentication required
- **Rate limiting:** 60 requests/minute per API key (configurable via `RATE_LIMIT_REQUESTS_PER_MINUTE`). 429 + `Retry-After` when exceeded. See `docs/RATE_LIMIT_AND_ANOMALY.md`.
- **Anomaly metrics:** Per request, structured JSON is logged (identifier redacted, prompt length, response time, decision) for later anomaly detection.
- All requests logged for audit purposes
- Environment variables for sensitive data
- Safety-first error handling (defaults to DENY on failures)

## 📚 Documentation

- **`STYLE_GUIDE.md`** – Sovereign Trust visual identity (colors, typography, design principles) for website and marketing.
- **`docs/`** – Setup, troubleshooting, testing, deployment:
  - `docs/ACCURACY_TEST_LLM.md` – 36-scenario accuracy test (target 100%)
  - `docs/STRESS_TEST_K6.md` – k6 load test (phases, thresholds), Postman collection
  - `docs/ComplianceCode-Gatekeeper.postman_collection.json` – Postman collection (Health + Gatekeeper)
  - `docs/QUICK_START.md`, `docs/ENV_SETUP.md`, `docs/OPENAI_SETUP.md` – Setup
  - `docs/TROUBLESHOOTING.md` – Common issues
  - `docs/PDF_EXPORT_INSTRUCTIONS_EN.md` – PDF export for i-DEPOT
- **`docs/specs/`** – Technical specification variants and annex

## 🤖 CI / GitHub Actions

Workflow: `.github/workflows/ci.yml` (bij elke push/PR op `main` of `master`).

**Stappen:** build → compliance test (engine) → start server → accuracy test (gatekeeper API) → load test (light).

**Repository secrets (Settings → Secrets and variables → Actions):**

- `API_KEY` – API-key voor de gatekeeper (zelfde waarde als in `.env`)
- `GEMINI_API_KEY` – Google Gemini API key
- `SUPABASE_URL` – Supabase project URL (voor compliance test + server)
- `SUPABASE_SERVICE_ROLE_KEY` – Supabase service role key
- `OPENAI_API_KEY` – OpenAI API key (voor embeddings in compliance engine)

Zonder deze secrets faalt de compliance-, accuracy- of loadtest in CI.

## 🚢 Deployment

**Beta snel live:** zie **`docs/DEPLOY_BETA.md`** voor stappen (Railway, Render of Fly.io). Build: `npm run build`. Start: `npm run start` (verwacht `PORT`). Alle secrets via environment variables; geen `.env` in productie.

## 📝 License

Proprietary - ComplianceCode.eu

