# Minimale elementen voor een website die een API-aanbod verkoopt

Checklist voor een site die een API-aanbinding verkoopt of aanbiedt (zoals ComplianceCode.eu). **Minimaal** nodig voor geloofwaardigheid, conversie en (juridische) basis.

---

## 1. Product & waarde

| Element | Doel |
|--------|------|
| **Duidelijke value proposition** | In één zin: wat doet de API, voor wie, welk probleem lost het op? |
| **Call-to-action (CTA)** | Eén primaire actie: "Start beta", "Vraag API-key aan", "Registreer". |
| **Pricing of toegang** | Transparant: gratis tier, prijzen, of "Neem contact op". Bij beta: "Early access" / "Pioneer" is voldoende. |

**ComplianceCode:** ✓ Home met value prop, ✓ CTA (Beta Pioneer), ✓ Beta = early access (geen prijzen nodig voor nu).

---

## 2. Documentatie (verplicht)

Zonder docs kunnen ontwikkelaars de API niet aansluiten. Minimaal:

| Element | Doel |
|--------|------|
| **API-reference** | Endpoint(s), methode (POST/GET), authenticatie (bijv. `x-api-key` of Bearer). |
| **Request / response** | Body-formaat (JSON), verplichte en optionele velden, voorbeeld-response. |
| **Quick start of voorbeelden** | Minimaal: één werkend voorbeeld (curl of code-snippet) om de eerste call te doen. |
| **Foutafhandeling** | HTTP-statuscodes (4xx/5xx), evt. error-body; wat te doen bij rate limit (429). |
| **Rate limits** | Vermelden (bijv. 60 req/min) en hoe overschrijding wordt gemeld (429 + Retry-After). |

Optioneel maar sterk: integratievoorbeelden (proxy, SDK, gateway), artikel-mapping, security/sovereignty-uitleg.

**ComplianceCode:** ✓ Docs-pagina met API reference, request/response, ✓ Integration tabs (proxy, SDK, gateway), ✓ Error handling, ✓ Rate limits, ✓ Security & Sovereignty, ✓ Article mapping.

---

## 3. Technische aansluiting (naast docs)

| Element | Doel |
|--------|------|
| **Bereikbare API** | Health-check of status-endpoint (bijv. `/api/health`) voor monitoring. |
| **Consistent gedrag** | Wat in de docs staat, moet de live API doen (zelfde velden, foutcodes). |

**ComplianceCode:** ✓ `/api/health`, ✓ Docs sluiten aan op gatekeeper-API.

---

## 4. Vertrouwen & juridisch

| Element | Doel |
|--------|------|
| **Disclaimer / beperking** | Bij beta: "best effort", geen garantie, geen verzekering. |
| **Algemene voorwaarden (Terms)** | Wie mag de API gebruiken, wat mag niet, aansprakelijkheid, opzegging. |
| **Privacyverklaring** | Welke data verwerkt, waarom, hoe lang, rechten (AVG). |
| **Aanbieder / contact** | Wie is de partij achter de API (bedrijfsnaam, rechtsvorm) + contact (e-mail of formulier). |

**ComplianceCode:** ✓ Beta-disclaimer in footer. ⚠ Ontbreekt (voor live): Terms, Privacy, Contact/aanbieder.

---

## 5. Support & communicatie

| Element | Doel |
|--------|------|
| **Contact** | Minimaal: e-mail of contactformulier voor vragen en API-key aanvragen. |
| **Status (optioneel)** | Bij uitval: waar kijken (statuspagina of "bij problemen: mail ons"). |

**ComplianceCode:** ✓ Pioneer-pagina als intake; ⚠ Geen expliciete "Contact"-pagina of mailadres in footer (kan via Pioneer).

---

## Samenvatting: minimaal voor een "verkoop"-site van een API

| Categorie | Minimaal nodig |
|-----------|----------------|
| **Product** | Value prop, duidelijke CTA, pricing of "early access". |
| **Documentatie** | API-reference (endpoint, auth), request/response, minimaal één voorbeeld (curl/code), foutafhandeling, rate limits. |
| **Technisch** | Live API die doet wat de docs zeggen; evt. health-endpoint. |
| **Juridisch** | Disclaimer (bij beta), Terms of Use, Privacyverklaring. |
| **Vertrouwen** | Aanbieder (naam) + contact (e-mail of formulier). |

---

## Wat ComplianceCode nu heeft vs. ontbreekt

| Element | Status |
|--------|--------|
| Value prop + CTA | ✓ |
| **Documentatie** (API-reference, request/response, voorbeelden, errors, rate limits) | ✓ |
| Beta-disclaimer | ✓ |
| **Algemene voorwaarden** | ❌ Nog toevoegen (pagina of PDF + link in footer). |
| **Privacyverklaring** | ❌ Nog toevoegen (pagina of PDF + link in footer). |
| **Aanbieder + contact** | ⚠ Pioneer = intake; overweeg: "Contact: mail@…" of link in footer. |

Voor een **beta die echt live gaat**: een korte Terms-pagina, een korte Privacy-pagina en een zichtbaar contactmailadres (of link naar Pioneer) zijn de minimale extra’s. **Documentation** heb je al: Docs-pagina met API reference, voorbeelden, error handling, rate limits en Security & Sovereignty.
