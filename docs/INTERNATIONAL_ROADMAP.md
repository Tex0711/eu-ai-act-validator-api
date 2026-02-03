# International PII & Region Roadmap

This document describes which regions and identifier types are fully supported today and what is planned for future releases.

## v1.0 – EU & US (Current)

**v1.0 is fully optimized for EU (GDPR) and US.**

- **EU:** Full support for national identifiers and formats used in EU/EEA jurisdictions: BSN (NL), Codice Fiscale (IT), DNI (ES), NINO & NHS (UK), National Register (BE), Steuer-ID (DE), CPR (DK), Personnummer (SE), PPS (IE), PESEL (PL), NIR/INSEE (FR). See [PII_PRIVACY_WORKFLOW.md](./PII_PRIVACY_WORKFLOW.md) and `src/lib/pii/PIIGateway.ts`.
- **US:** SSN and US-style phone numbers; US ZIP codes.
- **Global:** Email and international phone formats (e.g. +31, +1) are covered where they do not conflict with regional ID patterns.

Validation is done via the international stress test (EU/US patterns) and unit tests. Run: `npm run test:pii` and `npm run test:pii:international` (the latter also exercises JP/BR/IN/CA samples and reports gaps).

## v1.1 – APAC & LATAM (Planned)

Support for the following is **planned for v1.1**, not included in v1.0:

- **APAC**
  - **Japan (JP):** My Number (12 digits, with/without hyphen), +81 phone, 7-digit postal (123-4567).
  - **India (IN):** Aadhaar (12 digits, space-separated or continuous), PAN (5 letters + 4 digits + 1 letter).
- **LATAM**
  - **Brazil (BR):** CPF (11 digits, formatted as xxx.xxx.xxx-xx or unformatted), +55 phone, CEP (e.g. 01310-100).

Canada (CA) SIN and Canadian postal codes may be included in v1.1 or a follow-up, depending on demand.

## Gap analysis (v1.0)

The test suite `tests/international-stress-test.ts` checks 20 samples from Japan, Brazil, India, and Canada. In v1.0, roughly half of these are caught by existing patterns (e.g. email, or digit sequences that match EU/US rules); the rest are documented as gaps in that test file and in this roadmap.

**We are explicit:** v1.0 does not guarantee correct stripping of JP/BR/IN/CA-specific identifiers. For EU and US use cases, v1.0 is the recommended baseline.

## See also

- [PII_PRIVACY_WORKFLOW.md](./PII_PRIVACY_WORKFLOW.md) – Order of application, placeholders, and EU/US patterns.
- `tests/international-stress-test.ts` – Current coverage and gap report for JP, BR, IN, CA.
- `README.md` – [Supported Regions](../README.md#supported-regions) summary.
