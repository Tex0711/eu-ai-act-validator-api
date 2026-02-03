# Privacy / PII workflow – international & fast

## Sources (free, reused in PIIGateway)

- **European national IDs:** [ipsec.pl – European personal data regexp patterns](https://ipsec.pl/european-personal-data-regexp-patterns.html). All European ID patterns in `src/lib/pii/PIIGateway.ts` are derived from or aligned with this source.
- **Postal codes:** Wikipedia “List of postal codes”, GitHub `regex-patterns-of-all-countries` (MIT).
- **Presidio (Microsoft):** Open-source recognizers; regex patterns can be copied from [Presidio GitHub](https://github.com/microsoft/presidio) for reference.

## Supported countries (national IDs)

| Country | ID type          | Placeholder |
|---------|------------------|-------------|
| NL      | BSN              | [ID]        |
| US      | SSN              | [ID]        |
| IT      | Codice Fiscale   | [ID]        |
| ES      | DNI              | [ID]        |
| UK      | NINO, NHS        | [ID]        |
| BE      | National Register| [ID]        |
| DE      | Steuer-ID        | [ID]        |
| DK      | CPR              | [ID]        |
| SE      | Personnummer     | [ID]        |
| IE      | PPS              | [ID]        |
| PL      | PESEL            | [ID]        |
| FR      | NIR/INSEE        | [ID]        |

## Approach: international + &lt;50ms

1. **Regex-only, no NER/ML** – No external APIs, no heavy libraries. Single-threaded string replace with precompiled regexes keeps latency low and predictable.
2. **Layered patterns** – Run in a fixed order to avoid false positives (e.g. national ID before generic phone).
3. **Same placeholders everywhere** – `[EMAIL]`, `[PHONE]`, `[ID]`, `[NAME]`, `[ADDRESS]`. No region-specific placeholders; keeps downstream (LLM, audit) simple.
4. **Optional region config (future)** – If you need to enable/disable regions (e.g. `PII_REGIONS=NL,UK,US`), you can branch per region; for now we run all international patterns. Regex cost is linear in text length; a few extra patterns stay well under 50ms.

## Order of application (why it matters)

1. **Email** – Global, very distinctive.
2. **BSN** – Dutch Burgerservicenummer. Excluded when preceded by `+31 6 ` or `06` so Dutch mobile numbers are not matched as BSN.
3. **SSN** – US Social Security Number. Excluded when preceded by `+1 ` so US phone numbers are not matched as SSN.
4. **European IDs** – Most specific first (IT Codice Fiscale, ES DNI, UK NINO, BE National Register, DE Steuer-ID, DK CPR, SE Personnummer, IE PPS, UK NHS, PL PESEL, FR NIR/INSEE). NHS excluded when preceded by `+1 ` so US phone digits are not matched. Before phone so digit sequences are not eaten by phone regex.
5. **Phone** – International format (+country, digits).
6. **Postal codes** – NL (1234 AB), US (12345), UK (SW1A 1AA), DE/FR (5 digits). Before generic “address” so postcodes are normalized first.
7. **Address / street** – Street + number patterns (multi-language).
8. **Names** – Titles + capitalized words last, with a blocklist to avoid false positives (e.g. “EU”, “Article”, “High Risk”).

## How to add a new region

1. Add regex(es) in `PIIGateway.ts` (precompiled `const`).
2. Map to existing placeholders: `[ID]`, `[ADDRESS]`, `[NAME]` (or keep BSN/SSN as `[BSN]`/`[SSN]` if you want to distinguish in audit).
3. Insert in `stripPII()` in the order above (IDs before phone, postal before street, names last).
4. Add a test in `tests/` or `src/` that asserts the new pattern is stripped and that a similar non-PII string is unchanged.
5. Run `npm run test` and, if you have one, a quick load test to confirm latency is still acceptable.

## Performance

- Target: **&lt;50ms** for PII stripping on typical prompt length (e.g. 500–2000 chars).
- All regexes are `const` (compiled once). No regex creation inside the request path.
- Single pass: one `replace()` per pattern; total cost is O(n × number of patterns). Keeping the number of patterns in the tens keeps this negligible.

## See also

- `src/lib/pii/PIIGateway.ts` – Canonical implementation (European IDs, order, placeholders).
- `src/services/compliance/PIIGateway.ts` – Re-exports from `src/lib/pii/PIIGateway.ts`.
- `src/services/compliance/ComplianceEngine.ts` – Uses `stripPII(request.prompt)` before embedding and LLM.
- `src/pages/api/v1/gatekeeper.ts` – Audit stores only masked prompt.
