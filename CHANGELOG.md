# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] – 2026-01-31

### Summary

First stable release for **EU AI Act compliance** and **privacy-by-design** prompt evaluation. v1.0 is **fully optimized for EU (GDPR) and US** identifiers. Support for APAC (Japan, India) and LATAM (Brazil) is **planned for v1.1**; see [docs/INTERNATIONAL_ROADMAP.md](docs/INTERNATIONAL_ROADMAP.md) and `npm run test:pii:international` for current coverage and gaps.

### Added

- **Compliance API:** `POST /api/v1/gatekeeper` – EU AI Act compliance check with PII stripping, vector search, and optional LLM evaluation (Gemini or Mock).
- **Health & status:** `GET /api/health`, `GET /api/v1/health` – API status, active LLM provider, database connectivity.
- **PII stripping (EU & US):** BSN (NL), SSN (US), Codice Fiscale (IT), DNI (ES), NINO & NHS (UK), National Register (BE), Steuer-ID (DE), CPR (DK), Personnummer (SE), PPS (IE), PESEL (PL), NIR/INSEE (FR); email, phone, postcodes, street, names. All national IDs replaced with `[ID]`; see `src/lib/pii/PIIGateway.ts` and [docs/PII_PRIVACY_WORKFLOW.md](docs/PII_PRIVACY_WORKFLOW.md).
- **Model-agnostic LLM:** `LLMProvider` interface; Gemini (default) and Mock provider; `LLM_PROVIDER` env (e.g. `mock` for local/testing without API costs).
- **Advanced audit:** Audit report per request with `timestamp`, `detected_pii_types`, `latency_ms`, masked prompt only (original never stored). Optional `detected_pii_types` column in `audit_logs`.
- **International roadmap:** [docs/INTERNATIONAL_ROADMAP.md](docs/INTERNATIONAL_ROADMAP.md) – v1.0 EU/US full; v1.1 APAC/LATAM planned.
- **Tests & benchmarks:** `npm run test`, `npm run test:pii`, `npm run test:pii:international`, `npm run benchmark` (PII latency), `npm run test:load:light` (k6).

### Supported regions (v1.0)

- **Full support:** EU/EEA identifiers and US (SSN, US phone, ZIP). See README [Supported Regions](README.md#supported-regions).
- **In progress:** Asia (Japan, India) and LATAM (Brazil) – planned for v1.1; current gaps documented in `tests/international-stress-test.ts` and [docs/INTERNATIONAL_ROADMAP.md](docs/INTERNATIONAL_ROADMAP.md).

### Security & compliance

- Privacy-by-design: PII stripped before processing; only anonymized placeholders used. No raw prompt stored in audit logs.
- Rate limiting and geo-redacted logging (country code only, no IP in logs).
- Docker and docker-compose for on-premise / private cloud deployment.

### Documentation

- README: Quick Start (Docker), Manual Installation, API usage, Performance benchmarks, Supported Regions, Enterprise & On-Premise.
- docs: PII_PRIVACY_WORKFLOW.md, INTERNATIONAL_ROADMAP.md, ENV_SETUP.md, and API/operational guides.

---

## [Unreleased]

- APAC (Japan, India) and LATAM (Brazil) PII patterns – v1.1.
- Canadian SIN and postal code support – candidate for v1.1 or patch.
