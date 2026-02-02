# Rate limiting en anomaly detection (gatekeeper API)

## Overzicht

De gatekeeper API (`POST /api/v1/gatekeeper`) heeft **rate limiting** en **metrics-logging** om misbruik en model extraction te beperken.

---

## 1. Waar in de code

| Onderdeel | Bestand | Rol |
|-----------|---------|-----|
| Rate limiter + metrics | `src/lib/rate-limit.ts` | Sliding-window limiet per identifier; `recordRequestMetric()` voor structured logs (succes) |
| **Metrics logger** | `src/lib/metrics.ts` | `logRequestMetric()` – één JSON-regel per request (200, 400, 401, 429, 500) voor monitoring en aggregatie |
| **Log-identifier (AVG)** | `src/lib/rate-limit.ts` + `src/lib/geo.ts` | `getLogIdentifier(apiKey, clientIp)` → `key:***xyz1:cc:NL` (landcode, geen IP in logs); `geoip-lite` voor IP → country |
| Integratie | `src/pages/api/v1/gatekeeper.ts` | Na API-keyvalidatie: `checkRateLimit(identifier)`; bij elke response: `logRequestMetric(..., identifier: getLogIdentifier(...))`; bij succes ook `recordRequestMetric(...)` |

Geen aparte middleware: Astro API-routes hebben geen globale middleware, dus de check staat aan het begin van de POST-handler.

---

## 2. Rate limiting

- **Methode:** Sliding window (1 minuut). Per identifier tellen we requests in de laatste 60 seconden.
- **Identifier:** `apiKey` + optioneel `clientIp` (uit `x-forwarded-for` of `x-real-ip`). Zonder IP: alleen per API key.
- **Limiet:** Standaard **60 requests per minuut** per identifier. Optioneel via env: `RATE_LIMIT_REQUESTS_PER_MINUTE=100`.
- **Bij overschrijding:** HTTP **429 Too Many Requests**, header `Retry-After` (seconden).

**Config:**

- `.env`: `RATE_LIMIT_REQUESTS_PER_MINUTE=60` (optioneel; default 60). Bij **load testing** (k6) tijdelijk verhogen, bijv. `RATE_LIMIT_REQUESTS_PER_MINUTE=5000`, anders krijgt bijna elke request 429.
- Meerdere serverinstances: in-memory limiter deelt state niet. Voor gedeelde limiet gebruik Redis (bijv. `rate-limiter-flexible`) en vervang de logica in `src/lib/rate-limit.ts`.

---

## 3. Metrics logger (elke request)

Bij **elke** API-response (succes én fout) wordt één regel structured JSON gelogd (stdout) via `logRequestMetric()`:

- **event:** `gatekeeper_request`
- **timestamp**, **status_code** (200, 400, 401, 429, 500), **response_time_ms**, **identifier** (geredacteerd), **path**
- Optioneel: **decision**, **prompt_length** (bij 200), **error** (bij 4xx/5xx)

**AVG/GDPR:** De **identifier** bevat geen IP; alleen landcode: `key:***xyz1:cc:NL` (via `getLogIdentifier()` + `geoip-lite`). Private/local IPs → `cc:??`. Geen volledig IP in stdout of log-aggregator.

Geschikt voor log-aggregatie (Logtail, Datadog, CloudWatch) en dashboards (aantal requests, error rate, latency p95).

---

## 4. Metrics voor anomaly detection (succes)

Bij elke **succesvolle** compliance-check wordt daarnaast één regel structured JSON gelogd (console) via `recordRequestMetric()`, zonder volledige API key:

```json
{
  "type": "gatekeeper_metric",
  "ts": 1706723456789,
  "identifier": "key:***xyz1:cc:NL",
  "prompt_length": 142,
  "response_time_ms": 1850,
  "decision": "ALLOW"
}
```

- **identifier:** Geredacteerd (laatste 4 tekens van API key + landcode `cc:NL`). Geen volledige key en **geen IP** in logs (AVG-safe).
- **prompt_length:** Lengte van de prompt (ruwe indicator voor “veel kleine variaties” = mogelijk scraping).
- **response_time_ms:** Responsetijd.
- **decision:** ALLOW / DENY / WARNING.

**Anomaly detection (buiten deze repo):**

- Logs door een aggregator (Datadog, Logtail, CloudWatch, etc.) laten lopen en daar:
  - **Volume:** Veel requests per identifier per minuut (bijv. >80% van limiet).
  - **Patroon:** Veel requests met vergelijkbare `prompt_length` en korte intervallen → mogelijk model extraction.
- Optioneel: metrics naar Supabase (bijv. tabel `api_metrics`) schrijven en in het dashboard volume per key tonen.

---

## 5. Geen technische headers

De API stuurt geen `X-Powered-By` of andere stack-details. Alleen o.a. `Content-Type`, `X-Response-Time-Ms` en bij 429 `Retry-After`.

---

## 6. Samenvatting

| Onderdeel | Keuze |
|-----------|--------|
| **Waar** | `src/lib/rate-limit.ts` + start gatekeeper POST in `src/pages/api/v1/gatekeeper.ts` |
| **Library** | Geen; in-memory sliding window (eenvoudig, geen extra dependency). Voor multi-instance: later Redis + bijv. `rate-limiter-flexible`. |
| **Limiet** | 60/min per (API key + optioneel IP); instelbaar via `RATE_LIMIT_REQUESTS_PER_MINUTE`. |
| **Metrics** | Elke request: `logRequestMetric()` → `event: gatekeeper_request`, `status_code`, `response_time_ms`, `identifier` (redacted), optioneel `decision`, `prompt_length`, `error`. Succes: daarnaast `recordRequestMetric()` voor anomaly. Beide → JSON naar console; uitbreidbaar naar log-aggregator. |
