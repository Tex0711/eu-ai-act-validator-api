# Go-to-Market: website en beta-communicatie

## Uitgangspunt

- **Ja, als beta communiceren** – Duidelijk maken dat het product in beta is: “Early access”, “We verbeteren continu”, “Feedback welkom”. Verlaagt verwachtingen en maakt juridische positionering (inspanningsverplichting, best effort) geloofwaardig.
- **Website = eerste indruk + API-toegang** – Niet alles in één keer; focus op: wat doet het, voor wie, hoe kom ik aan toegang (API key / contact).

---

## Voorstel website-opzet

### 1. Homepage (/)

- **Hero**
  - Korte claim, bijv.: “EU AI Act compliance voor elke prompt op je netwerk.”
  - Subtekst: “Legal Guardrail API – check prompts vóór ze naar ChatGPT, Copilot of je eigen AI gaan. ALLOW, DENY of WARNING, met artikelverwijzing.”
  - **Beta-badge** duidelijk zichtbaar: “Beta – early access”.
- **Wat het doet** (3 bullets)
  - Alle prompts door één compliance-check (Art. 5, 6, Annex III).
  - Snel: duidelijke gevallen sub-second; complexe gevallen met juridische nuance (~2 s).
  - Audit trail: gemaskeerde prompt + beslissing voor verantwoording.
- **Hoe het werkt** (1–2 zinnen)
  - “Integreer via proxy, SDK of API gateway. Jij stuurt de prompt; wij geven ALLOW / DENY / WARNING + reden + artikel.”
- **CTA**
  - Primaire: “API-toegang aanvragen” of “Start beta” (formulier of mailto/link naar contact).
  - Secundaire: “Documentation” (link naar /docs of externe docs).
- **Beta-disclaimer** (onderaan of in footer)
  - “ComplianceCode.eu is momenteel in beta. We verbeteren continu op basis van feedback. De API wordt aangeboden op basis van inspanning (best effort); geen resultaatgarantie. Geschikt voor early adopters en pilots.”

---

### 2. Product / Features (/product of sectie op homepage)

- Kort over: Article-Specific Filtering (ASCF), PII-stripping, Fast Path vs Deep Path (zonder technisch jargon: “snel pad voor duidelijke gevallen, diep pad voor nuance”).
- “36 scenario’s gevalideerd; 100% accuracy op onze testset.” (evt. “in onze tests” om juridisch voorzichtig te blijven.)
- Link naar “Documentation” voor technische details.

---

### 3. Documentatie (/docs of /documentation)

- **API-reference** – Endpoint, request/response, headers (x-api-key), voorbeelden (curl of Postman).
  - Gebruik bestaande README/API-beschrijving; eventueel OpenAPI/Swagger later.
- **Quick start** – Stappen: API key aanvragen, eerste request, interpretatie van ALLOW/DENY/WARNING.
- **Integratie** – Korte uitleg: proxy, in-app (SDK), API gateway. Verwijzen naar “Contact” voor maatwerk.
- **Rate limits, security** – Kort: rate limit (60/min), geen volledige API key in logs, audit trail.

---

### 4. Pricing (/pricing)

- **Beta-fase:** “Beta-toegang: gratis of tegen kostprijs. Limieten en voorwaarden op aanvraag.”
- Of: “Vraag beta-toegang aan” + contactformulier; geen vaste prijzen tot na beta.
- Later: Freemium (10k checks), Starter, Pro, Enterprise (zoals eerder besproken).

---

### 5. Over / Contact (/over, /contact)

- **Over** – Kort: “ComplianceCode.eu – Legal Guardrail voor de EU AI Act. We helpen bedrijven alle prompts op het netwerk binnen de wet te houden.”
- **Contact** – “API-toegang of pilot”: mailto of formulier (e-mail, naam, bedrijf, use case). Optioneel: Calendly voor demo.

---

### 6. Footer

- Links: Documentation, Pricing, Contact, Privacy, Terms (placeholder mag eerst).
- **Beta-disclaimer** nogmaals kort: “Product in beta – best effort, geen garantie.”
- Geen technische stack (geen “Powered by …”).

---

## Wat (nog) niet op de site

- Geen uitgebreide “Playground” op dag 1 – wel later als lead-magnet (“Test een prompt”).
- Geen live dashboard voor bezoekers – alleen voor klanten met API key (bestaande /dashboard).
- Geen case studies tot er pilot-klanten zijn.

---

## Technische kant (bestaande codebase)

- Huidige Astro-app: **homepage** (/) en **dashboard** (/dashboard) bestaan al.
- **Aanpassen:** Homepage uitbreiden met bovenstaande secties (hero, wat/hoe, CTA, beta-disclaimer); nieuwe pagina’s: /docs (of /documentation), /pricing, /contact (of /over).
- **Docs:** Content uit README + `docs/` hergebruiken; evt. later een aparte docs-site (VitePress, Docusaurus) of embedded markdown.

---

## Korte checklist voor beta-launch site

- [ ] Homepage: hero, 3 bullets, “Hoe het werkt”, CTA “API-toegang aanvragen”, beta-badge + disclaimer.
- [ ] Pagina Documentatie: API-reference, quick start, integratie (proxy/SDK/gateway), rate limits.
- [ ] Pagina Pricing: “Beta – toegang op aanvraag” + contact.
- [ ] Pagina Contact: formulier of mailto voor API-toegang / pilot.
- [ ] Footer: disclaimer beta, links, geen stack.
- [ ] Geen “Powered by” of technische headers in de API-responses (al geregeld).

---

*Dit voorstel sluit aan op de bestaande API, rate limiting, en go-live checklist. Aanvullen met jullie huisstijl en concrete teksten.*

---

## Checklist (geïmplementeerd)

- [x] **&lt;50ms latency claim in de Hero** – Homepage: “Real-time AI Governance in &lt;50ms” + subtekst over stateless Legal Guardrail, gebouwd in Rust.
- [x] **Code-Tabs voor 3 integratiemethoden** – Homepage: tabs Proxy (Nginx), SDK (3 regels Python), API Gateway (Kong) met voorbeeldconfiguraties.
- [x] **EU Sovereign badge + stateless-uitleg** – Homepage: sectie “Sovereignty &amp; Trust” met 100% EU-Hosted, Stateless by Design, Audit-Ready (Art. 12).
- [x] **CTA = Beta Pioneer Program** – Homepage + /pioneer: “Join the Beta Pioneer Program” met aanvraagformulier (naam, e-mail, bedrijf, use-case). Formulier op submit → mailto (later Formspree/eigen endpoint).
- [x] **Beta-disclaimer prominent** – Footer (Layout.astro) + bij het aanvraagformulier (/pioneer): inspanningsverplichting, best effort, geen resultaatgarantie.
- [x] **/docs pagina** – API-reference, Latency Benchmarks tabel, Article Mapping (Art. 5, 6, Annex III, 4, 12, 50), Error Handling (Fail-Closed vs Fail-Open), Rate limits.
- [x] **Nav + footer** – Layout: links Home, Docs, Beta Pioneer, Dashboard; footer met disclaimer.
