# Beta live zetten – snelle stappen

Doel: **ComplianceCode.eu** (website + API) als werkende beta online, zonder onnodige complexiteit.

---

## "Ik heb alleen een URL, nog geen hosting"

Dat is genoeg. **Hosting** = het platform waar de app draait (Railway, Render, Fly.io). Je hebt geen eigen server of hostingpakket nodig.

1. **Account bij Railway of Render** (gratis) → repo koppelen → deploy → je krijgt direct een URL van het platform (bijv. `https://compliance-code.up.railway.app`). Dat is je beta, live.
2. **Eigen domein (jouw URL)** gebruik je daarna: in het dashboard van Railway/Render voeg je je domein toe (bijv. `beta.compliancecode.eu`), en bij je domeinregistrar zet je een CNAME naar de URL van het platform. Dan werkt jouw URL ook.

Dus: eerst hosting = platform kiezen en deployen → daarna (optioneel) jouw URL aan dat platform koppelen.

---

## Wat je hebt

- **Eén Node-app:** Astro (website + API routes). Website op `/`, API op `/api/v1/gatekeeper`, health op `/api/health`.
- **Build:** `npm run build` → `dist/` met standalone server.
- **Productie starten:** `npm run start` (verwacht `PORT` in de omgeving; standaard 8080).
- **Externe diensten:** Supabase (DB + embeddings), Gemini API, OpenAI API. Alleen env vars nodig.

---

## Stappen om de beta live te zetten

### 1. Repo klaar voor deploy

- Code op **GitHub** (of GitLab) in een repo dat je kunt koppelen aan je hosting.
- Geen secrets in de repo; alles via **environment variables** op het platform.

### 2. Hosting kiezen (één van deze)

| Platform   | Voordeel                    | EU-regio        | Opzet                      |
|-----------|-----------------------------|-----------------|----------------------------|
| **Railway** | Eenvoudig, goede free tier   | Ja (regio kiezen) | GitHub connect → deploy   |
| **Render**  | Eenvoudig, free tier        | Ja (Frankfurt)   | GitHub connect → Web Service |
| **Fly.io**  | Goede controle, EU          | Ja              | `fly launch` + Dockerfile of buildpack |

**Aanbeveling voor “snel”:** **Railway** of **Render**: repo koppelen, build- en startcommando’s zetten, env vars invullen, klaar.

### 3. Build- en startcommando’s (Railway / Render)

- **Build command:** `npm install && npm run build`
- **Start command:** `npm run start`
- **Root directory:** (leeg = repo root)
- **Node version:** 18 of 20 (in `engines` in `package.json` of via env `NODE_VERSION` als het platform dat ondersteunt).

Zorg dat het platform **PORT** zet (Railway en Render doen dat automatisch).

### 4. Environment variables zetten

Op het hostingplatform (Railway/Render/Fly) alle onderstaande **invullen** (geen placeholder in productie):

| Variable | Verplicht | Opmerking |
|----------|----------|-----------|
| `SUPABASE_URL` | Ja | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Ja | Service role key (geheim) |
| `GEMINI_API_KEY` | Ja | Voor compliance-evaluatie (Deep Path) |
| `OPENAI_API_KEY` | Ja | Voor embeddings |
| `API_KEY` | Ja | Jouw API-key voor `/api/v1/gatekeeper` (bijv. lang random geheim) |
| `NODE_ENV` | Optioneel | `production` |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | Optioneel | Default 60 |

Geen `.env` in de repo; alles via het platform.

### 5. Eerste deploy

1. Nieuwe “Project” / “Web Service” aanmaken.
2. Repo koppelen (GitHub).
3. Build command: `npm install && npm run build`
4. Start command: `npm run start`
5. Alle env vars uit stap 4 invullen.
6. Deploy starten. Na een paar minuten krijg je een URL, bijv. `https://jouw-app.up.railway.app` of `https://jouw-app.onrender.com`.

### 6. Controleren

- **Website:** `https://<jouw-url>/` → homepage, docs, pioneer, dashboard.
- **Health:** `https://<jouw-url>/api/health` → moet 200 OK geven.
- **API:**  
  `curl -X POST https://<jouw-url>/api/v1/gatekeeper \  
    -H "Content-Type: application/json" \  
    -H "x-api-key: <jouw-API_KEY>" \  
    -d '{"prompt":"test"}'`  
  → verwacht JSON met `decision` (ALLOW/DENY/WARNING).

### 7. (Optioneel) Eigen domein

- In Railway/Render: Settings → Custom Domain → `beta.compliancecode.eu` (of wat je wilt) toevoegen.
- Bij je DNS-provider: CNAME naar de door het platform gegeven hostname (bijv. `jouw-app.up.railway.app`). HTTPS wordt door het platform geregeld.

---

## Checklist vóór “live” als beta

- [ ] HTTPS (platform regelt dit; geen HTTP-only calls).
- [ ] Alle env vars gezet, geen default/placeholder secrets.
- [ ] Rate limiting actief (default 60/min; evt. `RATE_LIMIT_REQUESTS_PER_MINUTE` zetten).
- [ ] Supabase-auditlogs: controleren dat logs binnenkomen na een paar test-requests.
- [ ] Eén keer accuracy-test tegen de live URL (zie `docs/ACCURACY_TEST_LLM.md`) als je 36/36 wilt bevestigen.

Zie ook **`docs/GO_LIVE_CHECKLIST.md`** voor security en hardening.

---

## Samenvatting

1. Code op GitHub.
2. Railway of Render: nieuw project, repo koppelen.
3. Build: `npm install && npm run build` | Start: `npm run start`.
4. Env vars (Supabase, Gemini, OpenAI, API_KEY) invullen.
5. Deploy → URL testen (site + `/api/health` + POST `/api/v1/gatekeeper`).
6. (Optioneel) eigen domein koppelen.

Daarmee staat je beta live met website én echte API.
