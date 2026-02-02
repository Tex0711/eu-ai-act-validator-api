# Go-live checklist

Gebruik dit lijstje **voordat je live gaat** (ComplianceCode.eu / gatekeeper API).

---

## Beveiliging & secret sauce

- [ ] **HTTPS** – API alleen via HTTPS (Vercel/Cloudflare doen dit standaard; controleer dat er geen onversleutelde calls zijn).
- [ ] **API key-rotatie** – Proces klaar om bij lek een key te invalideren en een nieuwe uit te rollen; evt. meerdere keys per klant.
- [ ] **Rate limiting** – Actief (standaard 60/min per key); evt. `RATE_LIMIT_REQUESTS_PER_MINUTE` in productie gezet.
- [ ] **Anomaly-reactie** – Metrics worden gelogd; evt. actie: bij verdacht patroon (veel req/min, vergelijkbare promptlengtes) throttlen of alerten (Logtail/Datadog/CloudWatch).
- [ ] **WAF / DDoS** – Edge (Vercel/Cloudflare) biedt basis; evt. extra WAF-regels of rate limits op edge.
- [ ] **IP-allowlisting** (optioneel) – Voor enterprise: alleen bepaalde IP-ranges toestaan.

---

## Overig

- [ ] **Environment** – Alle secrets in platform (Vercel etc.), geen `.env` in repo.
- [ ] **Audit logs** – Controleer dat `audit_logs` in Supabase correct wordt gevuld en retentie/back-up helder is.
- [ ] **Accuracy** – Evt. nog een keer `npm run test:accuracy` op productie-URL (36/36).

---

*Lijst gebaseerd op de security- en go-live-afwegingen in de codebase. Aanvullen waar nodig.*
