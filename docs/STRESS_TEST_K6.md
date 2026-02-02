# Stress test (k6) en Postman-collection

## k6 load test

### Installatie

- **macOS (Homebrew):** `brew install k6`
- **Linux/Windows:** https://k6.io/docs/get-started/installation/

### Uitvoeren (lokaal = geldige resultaten)

De test moet **op dezelfde machine** draaien als de server, anders krijg je `connection refused` en 100% failures (geen zinvolle p95/error-metrics).

1. **Terminal 1:** start de server  
   `npm run dev` of `npm run start`
2. **Terminal 2:** wacht tot de server klaar is, dan:  
   ```bash
   cd /path/to/compliance-code
   API_KEY=$(grep '^API_KEY=' .env | cut -d '=' -f2-) k6 run scripts/load-test.js
   ```
   Of met expliciete key:  
   `API_KEY=your_api_key k6 run scripts/load-test.js`

**Tegen staging/productie:**  
`API_KEY=your_api_key BASE_URL=https://your-app.up.railway.app k6 run scripts/load-test.js`

`API_KEY` is verplicht; `BASE_URL` default is `http://localhost:3000`.

**Pre-flight:** Het script doet eerst een GET naar `/api/health`. Als de server niet bereikbaar is (connection refused), stopt k6 direct met een duidelijke foutmelding in plaats van 2+ minuten 100% failures te rapporteren. Zorg dus dat de server in terminal 1 draait vóór je k6 start.

**Light variant (8 GB / lokaal):** Op een machine met weinig RAM (bijv. MacBook Air 8 GB) kan de volledige test (500 VUs) te zwaar zijn. Gebruik dan de light variant: `k6 run scripts/load-test-light.js` of `npm run test:load:light`. Die gebruikt max 100 VUs (warm-up 5, stress 30, spike 100) en dezelfde thresholds (p95 &lt; 3 s, &lt; 1% failures).

### Fases

| Fase     | Duur  | VUs  | Doel                          |
|----------|-------|------|-------------------------------|
| Warm-up  | 30 s  | 10   | Server opwarmen               |
| Stress   | 1 min | 100  | Duurzame load                 |
| Spike    | 30 s  | 500  | Piekbelasting                 |
| Ramp-down| 20 s  | 0    | Uitlopen                      |

### Thresholds

- **http_req_duration p(95) < 3000 ms**  
  De gatekeeper heeft een **Fast Path** (&lt;50 ms) en een **Deep Path** (Gemini, ~1,5–2,5 s). Bij gemengd verkeer kan p95 ruim boven 200 ms liggen; 3 s sluit aan bij gemengd Fast/Deep-verkeer. Voor alleen Fast Path kun je een strengere drempel (bijv. 200 ms) gebruiken.

- **http_req_failed &lt; 1%**  
  Minder dan 1% van de requests mag falen (4xx/5xx).

### Log-identifier onder load

De **identifier** (`key:***xyz1:cc:NL`) wordt **server-side** gebouwd en gaat alleen naar **stdout** van de Node-server; hij zit **niet** in de API-response. Onder load verifiëren:

1. **Serverlogs** – Tijdens de k6-run de terminal waar `npm run start` (of `npm run dev`) draait in de gaten houden. Elke request produceert één regel JSON met `event: "gatekeeper_request"` en `identifier: "key:***xxxx:cc:XX"`. Filter op `gatekeeper_request` of `identifier` om te zien of geo-lookup onder druk correct blijft (landcode, geen IP).
2. **Optioneel (debug)** – Voor expliciete controle in k6 kun je tijdelijk een response-header (bijv. `X-Log-Identifier`) toevoegen in de gatekeeper die dezelfde waarde doorgeeft; dan kun je die in k6 loggen. Standaard blijft de identifier alleen in serverlogs.

---

## Postman-collection

Een basis-collection voor Health en Gatekeeper staat in:

**`docs/ComplianceCode-Gatekeeper.postman_collection.json`**

### Gebruik

1. Open Postman (of Insomnia met Postman-import).
2. Import → Upload bestand → kies `ComplianceCode-Gatekeeper.postman_collection.json`.
3. Stel **collection variables** in:
   - **baseUrl** – bijv. `http://localhost:3000` of je staging-URL.
   - **apiKey** – jouw API-key (zelfde als in `.env` of hosting).

4. Run **Health** (GET) en **Gatekeeper (compliance check)** (POST). De Gatekeeper-request heeft een voorbeeld-body; pas de `prompt` aan naar wens.

### Requests in de collection

| Request | Method | Endpoint              | Beschrijving                    |
|---------|--------|------------------------|---------------------------------|
| Health  | GET    | `{{baseUrl}}/api/health` | Health check, versie, DB-status |
| Gatekeeper | POST | `{{baseUrl}}/api/v1/gatekeeper` | Compliance-check; header `x-api-key` + JSON body |

---

## Zie ook

- **RATE_LIMIT_AND_ANOMALY.md** – Rate limiting en metrics (identifier, landcode).
- **API_TEST_GUIDE.md** / **HOW_TO_TEST_API.md** – Handmatig testen van de API.
