# Prior Art & Market Research Report: ComplianceCode

**Gegenereerd op:** 2026-01-31 22:03:17

**Focus:** Ontkoppelde architectuur - externe API als onafhankelijke compliance-laag voor AI agents

**Regulatory Focus:** EU AI Act (Articles 5, 10, 52)

---

## Executive Summary

Dit rapport onderzoekt de uniciteit van ComplianceCode's architectuur: 
een externe, ontkoppelde API die fungeert als onafhankelijke compliance-laag voor AI agents,
met specifieke focus op EU AI Act enforcement.

### Kernbevindingen

| Aspect | Bevinding |
|--------|-----------|
| **Architectuur** | Weinig concurrenten bieden volledig ontkoppelde compliance API's |
| **EU AI Act Focus** | Grote gap - de meeste guardrails focussen op security, niet regulering |
| **Onafhankelijke Rol** | ComplianceCode's positie als 'derde partij controleur' is zeldzaam |

## 1. Competitive Mapping

Uitgebreide vergelijking van concurrenten met **EU AI Act Specificity** classificatie:

| Bedrijf/Project | Architectuur | EU AI Act Specificity | Focus | Regulatory Gap |
|-----------------|--------------|----------------------|-------|----------------|
| [Guardrails AI](https://guardrailsai.com) | Internal SDK | **Laag** | Python library voor output validatie... | Geen EU AI Act specifieke rules, ge... |
| [NeMo Guardrails](https://github.com/NVIDIA/NeMo-Guardrails) | Internal SDK | **Laag** | NVIDIA framework voor conversational AI... | Framework-gebonden, geen regulatory... |
| [Lakera Guard](https://lakera.ai) | External API | **Midden** | API voor prompt injection en content mod... | Focus op security, niet op EU AI Ac... |
| [Rebuff AI](https://rebuff.ai) | Hybrid | **Laag** | Prompt injection detectie... | Smalle focus op prompt injection al... |
| [Arthur AI](https://arthur.ai) | Hybrid | **Midden** | ML observability en monitoring platform... | Breder platform, niet specifiek voo... |
| [Portkey AI Gateway](https://portkey.ai) | External API | **Laag** | AI Gateway met guardrails integratie... | Focus op routing/caching, guardrail... |
| [LiteLLM](https://litellm.ai) | Hybrid | **Laag** | Proxy server voor meerdere LLM APIs... | Geen compliance focus, alleen API u... |
| [Patronus AI](https://patronus.ai) | External API | **Midden** | LLM evaluation en testing platform... | Focus op testing, niet real-time en... |

### Dynamisch Gevonden Partijen

| Bron | Architectuur | EU AI Act | URL |
|------|--------------|-----------|-----|
| AI Compliance as a Service... | External API (Ontkoppeld) | Hoog | [Link](https://www.trustpath.ai/blog/ai-compliance-as-a-service-navigating-the-new-regulatory-landscape) |
| Responsible AI and third-party risk... | External API (Ontkoppeld) | Midden | [Link](https://www.pwc.com/us/en/tech-effect/ai-analytics/responsible-ai-tprm.html) |
| AI Compliance FAQ – What Businesses... | External API (Ontkoppeld) | Laag | [Link](https://www.fasken.com/en/knowledge/2025/12/ai-compliance-faq-what-businesses-and-developers-need-to-know) |
| AI Compliance in 2026: Definition, ... | External API (Ontkoppeld) | Hoog | [Link](https://www.wiz.io/academy/ai-security/ai-compliance) |
| Third-Party Risk Management for AI:... | External API (Ontkoppeld) | Midden | [Link](https://www.credo.ai/blog/third-party-risk-management-for-ai-a-governance-first-approach) |
| What is an AI Audit? A Security Per... | External API (Ontkoppeld) | Midden | [Link](https://www.wiz.io/academy/ai-security/ai-audit) |
| Definitive Guide to AI Auditing Sof... | External API (Ontkoppeld) | Midden | [Link](https://www.v7labs.com/blog/ai-auditing-software-for-accountants-guide) |
| How to Select the Right AI Audit Pl... | Onbekend | Midden | [Link](https://www.finspectors.ai/blog/how-to-select-the-right-ai-audit-platform-for-enterprise-use) |
| AuditBoard AI | Accelerate Audit, R... | Internal SDK (Gekoppeld) | Laag | [Link](https://auditboard.com/platform/ai) |
| Petri: An open-source auditing tool... | External API (Ontkoppeld) | Laag | [Link](https://www.anthropic.com/research/petri-open-source-auditing) |

## 2. EU AI Act Regulatory Analysis

Analyse van hoe concurrenten omgaan met specifieke EU AI Act artikelen:

### 2.1. Article 5: Prohibited AI Practices / Verboden praktijken

**Beschrijving:** Verbiedt AI-systemen die manipulatief, exploitatief of schadelijk zijn

**Keywords:** prohibited, manipulation, subliminal, exploitation, social scoring

**Gevonden referenties:**

- [EU AI Act: Summary & Compliance Requirements - ModelOp](https://www.modelop.com/ai-governance/ai-regulations-standards/eu-ai-act)
- [[PDF] The AI Act: Road to Compliance | ECIIA](https://www.eciia.eu/wp-content/uploads/2025/01/The-AI-Act-Road-to-Compliance-Final.pdf)
- [[PDF] Conformity Assessments under the EU AI Act](https://fpf.org/wp-content/uploads/2025/04/OT-comformity-assessment-under-the-eu-ai-act-WP-1.pdf)

### 2.2. Article 10: Data and Data Governance

**Beschrijving:** Eisen voor trainingsdata, validatie en governance

**Keywords:** data governance, training data, bias, validation, data quality

**Gevonden referenties:**

- [The EU AI Act: Best Practices for Data and Governance as ... - Medium](https://medium.com/@axel.schwanke/compliance-under-the-eu-ai-act-best-practices-for-data-and-governance-as-a-strategic-opportunity-bc2ff223c066)
- [The EU AI Act Compliance Playbook: A Step-by-Step Guide for High ...](https://www.linkedin.com/pulse/eu-ai-act-compliance-playbook-step-by-step-guide-high-risk-khan-g7htf)
- [AI Act Service Desk - Article 10: Data and data governance](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-10)

### 2.3. Article 52: Transparency Obligations

**Beschrijving:** Transparantie-eisen voor AI-systemen, disclosure aan gebruikers

**Keywords:** transparency, disclosure, inform users, AI-generated, deepfake

**Gevonden referenties:**

- [EU AI Act Article 52 Implementation Guide - AIGC Compliance](https://aigc-compliance.com/blog/eu-ai-act-article-52-implementation-guide)
- [AI Act Compliance: What GPAI Providers Need to Know](https://deleporte-wentz-avocat.com/en/actualite-ai-act-compliance-what-gpai-providers-need-to-know)
- [The EU AI Act: Navigating Compliance for High-Risk Businesses](https://www.sekurno.com/post/the-eu-ai-act-navigating-compliance-for-high-risk-businesses)

### 2.4. Gevonden EU AI Act API Oplossingen

- **Supervision and Enforcement of the European Union's AI Act**
  - URL: https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20241217-supervision-and-enforcement-of-the-european-unions-ai-act
  - Query: _API for EU AI Act enforcement_

- **How to Achieve EU AI Act Compliance and Build Trustworthy AI**
  - URL: https://secureframe.com/blog/eu-ai-act-compliance
  - Query: _API for EU AI Act enforcement_

- **Governance and enforcement of the AI Act**
  - URL: https://digital-strategy.ec.europa.eu/en/policies/ai-act-governance-and-enforcement
  - Query: _API for EU AI Act enforcement_

- **EU AI Act: Timeline, Enforcement & Fines And How To Prepare**
  - URL: https://www.spektr.com/blog/eu-ai-act-timeline-enforcement-fines-and-how-to-prepare
  - Query: _API for EU AI Act enforcement_

- **EU AI Act: Summary & Compliance Requirements - ModelOp**
  - URL: https://www.modelop.com/ai-governance/ai-regulations-standards/eu-ai-act
  - Query: _API for EU AI Act enforcement_

- **EU AI Act: Next Steps for Implementation - IAPP**
  - URL: https://iapp.org/resources/article/eu-ai-act-timeline
  - Query: _API for EU AI Act enforcement_

- **EU AI Act**
  - URL: https://artificialintelligenceact.eu/
  - Query: _API for EU AI Act enforcement_

- **AI Act | Shaping Europe's digital future - European Union**
  - URL: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai
  - Query: _API for EU AI Act enforcement_

## 3. The Regulatory Gap

**Waar bestaande security-gateways tekortschieten in het afdwingen van Europese wetgeving:**

### 3.1 Security Focus vs Regulatory Focus

| Security Gateway | Wat ze doen | Wat ze NIET doen (Regulatory Gap) |
|------------------|-------------|-----------------------------------|
| **Lakera Guard** | Prompt injection detectie, PII filtering | Geen Article 5 verboden praktijken check |
| **Portkey Gateway** | Rate limiting, caching, fallbacks | Geen compliance logging voor AI Act |
| **Guardrails AI** | Output validatie, JSON schemas | Geen transparency verplichtingen (Art. 52) |
| **NeMo Guardrails** | Conversational flows, topic control | Gekoppelde architectuur, geen audit trail |

### 3.2 Specifieke Tekortkomingen

#### Article 5 - Verboden Praktijken
- **Gap:** Geen bestaande gateway checkt actief op manipulatieve of subliminale AI-technieken
- **Kans:** ComplianceCode kan real-time screening bieden voor prohibited practices

#### Article 10 - Data Governance
- **Gap:** Guardrails valideren output, niet de onderliggende data governance
- **Kans:** ComplianceCode kan data provenance en bias checks integreren

#### Article 52 - Transparency
- **Gap:** Geen automatische disclosure wanneer content AI-gegenereerd is
- **Kans:** ComplianceCode kan transparency headers en watermarks afdwingen

### 3.3 Onderzoeksresultaten over Gaps

- [Embracing the Future: A Comprehensive Guide to Responsible AI](https://www.lakera.ai/blog/responsible-ai)
- [Limitations and Loopholes in the E.U. AI Act and AI Liability Directives](https://law.yale.edu/isp/publications/digital-public-sphere/artificial-intelligence-and-digital-public-sphere-0)
- [The EU AI Act: A Stepping Stone Towards Safe and Secure AI - Lakera](https://www.lakera.ai/blog/eu-ai-act)
- [AI Risks: Exploring the Critical Challenges of Artificial Intelligence](https://www.lakera.ai/blog/risks-of-ai)
- [Comprehensive Guide to Large Language Model (LLM) Security](https://www.lakera.ai/blog/llm-security)

## 4. Architectuur Validatie: External vs Internal

ComplianceCode's kernpropositie is de **ontkoppelde architectuur**.
Hieronder de vergelijking met concurrenten:

### 4.1 Third-Party Compliance as a Service

Partijen die, net als ComplianceCode, de rol van **Onafhankelijke Controleur** innemen:

| Architectuur Type | Aantal Concurrenten | ComplianceCode's Voordeel |
|-------------------|---------------------|---------------------------|
| External API (Ontkoppeld) | 3 | Directe concurrent, maar geen EU focus |
| Internal SDK (Gekoppeld) | 2 | Volledig andere aanpak - lock-in |
| Hybrid | 3 | Minder duidelijke value proposition |

### 4.2 Voordelen Ontkoppelde Architectuur

| Voordeel | Beschrijving |
|----------|--------------|
| **Vendor-agnostisch** | Werkt met elke LLM provider (OpenAI, Anthropic, lokaal) |
| **Geen code changes** | Integratie via proxy, geen SDK in applicatie |
| **Centrale governance** | Eén plek voor alle compliance policies |
| **Audit-ready** | Alle requests/responses gelogd voor compliance rapportage |
| **Onafhankelijke verificatie** | Derde partij controle, niet self-attestation |

## 5. EU Regulatory Sandboxes

Overzicht van EU Regulatory Sandboxes die AI compliance oplossingen testen:

- **How different jurisdictions approach AI regulatory sandboxes - IAPP**
  - Under Article 57 of the EU AI Act, each member state must set up its own AI regulatory sandbox or participate in a multistate sandbox. The AI regulato...
  - [Lees meer](https://iapp.org/news/a/how-different-jurisdictions-approach-ai-regulatory-sandboxes)

- **AI Regulatory Sandbox Approaches: EU Member State Overview**
  - EU Artificial Intelligence Act

# AI Regulatory Sandbox Approaches: EU Member State Overview

02 May, 2025

AI regulatory sandboxes are an important p...
  - [Lees meer](https://artificialintelligenceact.eu/ai-regulatory-sandbox-approaches-eu-member-state-overview/)

- **EU Regulatory Sandboxes for AI**
  - EUSAiR is a two-year project funded by the European Union’s Digital Europe program, working in cooperation with the AI office to support the implement...
  - [Lees meer](https://eusair-project.eu/app/uploads/2025/04/Roadmap_EUSAIR.pdf)

- **Sandboxes for AI: Tools for a new frontier**
  - 16 The EU is currently made up of 27 countries in Europe: Austria, Belgium, Bulgaria, Croatia, Cyprus, Czechia, Denmark, Estonia, Finland, France, Ger...
  - [Lees meer](https://www.thedatasphere.org/wp-content/uploads/2025/02/Report-Sandboxes-for-AI-2025.pdf)

- **EU Artificial Intelligence Act | Up-to-date developments and ...**
  - May 2, 2025

AI regulatory sandboxes are an important part of the implementation of the EU AI Act. According to Article 57 of the AI Act, each Member ...
  - [Lees meer](https://artificialintelligenceact.eu/)

- **[PDF] EU Regulatory Sandboxes for AI (EUSAiR) Roadmap**
  - (especially Start-ups and SMEs) Regulatory Compliance Support: Guidance on complying with the AI Act, which enhances legal certainty and reduces compl...
  - [Lees meer](https://eusair-project.eu/app/uploads/2025/04/EUSAIR_RoadMap_v1_final.pdf)

- **Sandboxes and AI innovation in Europe - The Datasphere Initiative**
  - Sandboxes are becoming a continent-wide tool for AI innovation and testing

One of the ways that the EU’s Artificial Intelligence Act envisages foster...
  - [Lees meer](https://www.thedatasphere.org/news/sandboxes-and-ai-innovation-in-europe/)

### 5.1 Aanbevolen Sandboxes voor ComplianceCode

| Land | Sandbox / Autoriteit | Relevantie |
|------|---------------------|------------|
| 🇳🇱 Nederland | Autoriteit Persoonsgegevens AI Sandbox | Hoog - GDPR + AI Act |
| 🇧🇪 België | Belgian AI4Belgium Sandbox | Midden - Innovation focus |
| 🇩🇪 Duitsland | BaFin Regulatory Sandbox | Hoog - FinTech + AI |
| 🇪🇺 EU-breed | AI Office Sandbox | Hoog - Direct bij EC |

## 6. Technische Prior Art

### 6.1 Patent Landscape

**Aanbevolen zoekqueries voor patentonderzoek:**

- [external AI governance gateway](https://patents.google.com/?q=external%20AI%20governance%20gateway)
- [decoupled agent compliance architecture](https://patents.google.com/?q=decoupled%20agent%20compliance%20architecture)
- [standalone AI compliance API](https://patents.google.com/?q=standalone%20AI%20compliance%20API)
- [independent LLM governance layer](https://patents.google.com/?q=independent%20LLM%20governance%20layer)
- [external real-time AI policy enforcement](https://patents.google.com/?q=external%20real-time%20AI%20policy%20enforcement)
- [real-time LLM compliance filter API](https://patents.google.com/?q=real-time%20LLM%20compliance%20filter%20API)
- [AI agent middleware compliance gateway](https://patents.google.com/?q=AI%20agent%20middleware%20compliance%20gateway)
- [external prompt filtering service](https://patents.google.com/?q=external%20prompt%20filtering%20service)

### 6.2 Academische Literatuur

**TikTok's Research API: Problems Without Explanations**
- Auteurs: Carlos Entrena-Serrano, Martin Degeling, Salvatore Romano
- Link: http://arxiv.org/abs/2506.09746v2
- Samenvatting: Following the Digital Services Act of 2023, which requires Very Large Online Platforms (VLOPs) and Very Large Online Search Engines (VLOSEs) to facilitate data accessibility for independent research, ...

**Compliance Brain Assistant: Conversational Agentic AI for Assisting Compliance Tasks in Enterprise Environments**
- Auteurs: Shitong Zhu, Chenhao Fang, Derek Larson
- Link: http://arxiv.org/abs/2507.17289v3
- Samenvatting: This paper presents Compliance Brain Assistant (CBA), a conversational, agentic AI assistant designed to boost the efficiency of daily compliance tasks for personnel in enterprise environments. To str...

**The Accountability Paradox: How Platform API Restrictions Undermine AI Transparency Mandates**
- Auteurs: Florian A. D. Burnat, Brittany I. Davidson
- Link: http://arxiv.org/abs/2505.11577v2
- Samenvatting: Recent application programming interface (API) restrictions on major social media platforms challenge compliance with the EU Digital Services Act [20], which mandates data access for algorithmic trans...

**Assertion-Conditioned Compliance: A Provenance-Aware Vulnerability in Multi-Turn Tool-Calling Agents**
- Auteurs: Daud Waqas, Aaryamaan Golthi, Erika Hayashida
- Link: http://arxiv.org/abs/2512.00332v2
- Samenvatting: Multi-turn tool-calling LLMs (models capable of invoking external APIs or tools across several user turns) have emerged as a key feature in modern AI assistants, enabling extended dialogues from benig...

**SAMEP: A Secure Protocol for Persistent Context Sharing Across AI Agents**
- Auteurs: Hari Masoor
- Link: http://arxiv.org/abs/2507.10562v1
- Samenvatting: Current AI agent architectures suffer from ephemeral memory limitations, preventing effective collaboration and knowledge sharing across sessions and agent boundaries. We introduce SAMEP (Secure Agent...

### 6.3 Open Source Projecten

| Repository | Stars | Beschrijving |
|------------|-------|--------------|
| [BerriAI/litellm](https://github.com/BerriAI/litellm) | ⭐ 34914 | Python SDK, Proxy Server (AI Gateway) to call 100+... |
| [Portkey-AI/gateway](https://github.com/Portkey-AI/gateway) | ⭐ 10459 | A blazing fast AI Gateway with integrated guardrai... |
| [theopenco/llmgateway](https://github.com/theopenco/llmgateway) | ⭐ 838 | Route, manage, and analyze your LLM requests acros... |
| [zszszszsz/.config](https://github.com/zszszszsz/.config) | ⭐ 311 | # # Automatically generated file; DO NOT EDIT. # O... |
| [ithena-one/mcp-governance-sdk](https://github.com/ithena-one/mcp-governance-sdk) | ⭐ 36 | Enterprise Governance Layer (Identity, RBAC, Crede... |
| [galfrevn/promptsmith](https://github.com/galfrevn/promptsmith) | ⭐ 28 | 🧠 A TypeScript library for crafting structured, ma... |
| [jagreehal/ai-sdk-guardrails](https://github.com/jagreehal/ai-sdk-guardrails) | ⭐ 19 | Middleware for the Vercel AI SDK that adds safety,... |
| [faramesh/faramesh-core](https://github.com/faramesh/faramesh-core) | ⭐ 9 | faramesh-core... |
| [SafellmHub/hguard-go](https://github.com/SafellmHub/hguard-go) | ⭐ 7 | Guardrails for LLMs: detect and block hallucinated... |
| [aws-samples/detect-guardrails-not-used-on-amazon-bedrock-inference-calls](https://github.com/aws-samples/detect-guardrails-not-used-on-amazon-bedrock-inference-calls) | ⭐ 4 | This is a sample solution that demonstrates how a ... |

## 7. Trademark & Naam Beschikbaarheid

### 7.1 Directe Database Links

**TMVIEW:**
- [ComplianceCode](https://www.tmdn.org/tmview/#/tmview/results?page=1&pageSize=30&criteria=C&basicSearch=ComplianceCode)
- [Compliance Code](https://www.tmdn.org/tmview/#/tmview/results?page=1&pageSize=30&criteria=C&basicSearch=Compliance%20Code)

**BOIP:**
- [ComplianceCode](https://www.boip.int/en/trademarks-register?search=ComplianceCode)
- [Compliance Code](https://www.boip.int/en/trademarks-register?search=Compliance%20Code)

**USPTO:**
- [ComplianceCode](https://tmsearch.uspto.gov/bin/gate.exe?f=tess&state=4801:11qhb.1.1&search=ComplianceCode)
- [Compliance Code](https://tmsearch.uspto.gov/bin/gate.exe?f=tess&state=4801:11qhb.1.1&search=Compliance%20Code)

**WIPO:**
- [ComplianceCode](https://branddb.wipo.int/en/quicksearch/brand/ComplianceCode)
- [Compliance Code](https://branddb.wipo.int/en/quicksearch/brand/Compliance%20Code)

### 7.2 Potentiële Conflicten

- **Compliance as Code - Drata**
  - URL: https://drata.com/product/compliance-as-code
- **Product Compliance Software | UL Solutions**
  - URL: https://www.ul.com/software/product-compliance-software
- **Compliance as code | Thoughtworks United States**
  - URL: https://www.thoughtworks.com/en-us/insights/decoder/c/compliance-as-code
- **RegScale | Automated Governance, Risk & Compliance Software**
  - URL: https://regscale.com/
- **Turning Your Code Of Ethics Into Code - StarCompliance**
  - URL: https://www.starcompliance.com/turning-your-code-of-ethics-into-code/

## 8. Conclusie & Aanbevelingen

### 8.1 Uniciteit Assessment

| Aspect | Status | Toelichting |
|--------|--------|-------------|
| Ontkoppelde architectuur | 🟡 Matig uniek | Lakera, Portkey zijn ook extern |
| EU AI Act enforcement | 🟢 **Zeer uniek** | Geen concurrent focust hierop |
| Article-specifieke filtering | 🟢 **Zeer uniek** | Niet gevonden bij concurrenten |
| Real-time compliance API | 🟢 Uniek | Weinig pure API-first oplossingen |
| Onafhankelijke controleur rol | 🟢 Uniek | Third-party attestation is zeldzaam |

### 8.2 Strategische Aanbevelingen

#### Positionering
1. **Primaire differentiatie:** "De enige API die EU AI Act compliance afdwingt"
2. **Secundaire differentiatie:** Onafhankelijke derde partij (niet self-attestation)
3. **Vermijd:** Concurrentie op 'guardrails' - te generiek en crowded

#### Product Roadmap
1. **Phase 1:** Article 5 (Prohibited Practices) screening
2. **Phase 2:** Article 52 (Transparency) auto-disclosure
3. **Phase 3:** Article 10 (Data Governance) audit capabilities

#### Go-to-Market
1. **Regulatory Sandbox:** Aanmelden bij NL/BE/DE AI sandboxes
2. **Early Adopters:** Target enterprises met EU AI Act compliance deadline
3. **Partnerships:** Integreer met bestaande gateways (Portkey, LiteLLM) als compliance add-on

#### IP Strategie
1. **Patent:** Overweeg patentering van Article-specifieke filtering methode
2. **Trademark:** Registreer 'ComplianceCode' in Nice klassen 9, 42
3. **Trade Secret:** Bescherm specifieke EU AI Act rule implementations

---

*Dit rapport is automatisch gegenereerd door de Prior Art & Market Research Agent.*

*Handmatige verificatie van alle bevindingen wordt aanbevolen.*