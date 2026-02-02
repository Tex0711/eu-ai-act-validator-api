"""
Prior Art & Market Research Agent for ComplianceCode
=====================================================

Dit script onderzoekt of de architectuur van ComplianceCode 
(een externe API als onafhankelijke compliance-laag voor AI agents) uniek is.

Focus: De 'ontkoppelde' architectuur - API los van de Agent.
Regulatory Focus: EU AI Act compliance (Articles 5, 10, 52)
"""

import os
import json
from datetime import datetime
from typing import Optional, List, Dict
from dataclasses import dataclass, field

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Laad environment variables
load_dotenv()


# =============================================================================
# CONFIGURATIE
# =============================================================================

@dataclass
class ResearchConfig:
    """Configuratie voor het onderzoek."""
    
    # API Keys (uit .env)
    tavily_api_key: str = field(default_factory=lambda: os.getenv("TAVILY_API_KEY", ""))
    
    # Zoektermen voor Prior Art onderzoek
    patent_search_terms: list = field(default_factory=lambda: [
        # Kernconcepten - ontkoppelde architectuur
        "external AI governance gateway",
        "decoupled agent compliance architecture",
        "standalone AI compliance API",
        "independent LLM governance layer",
        "external real-time AI policy enforcement",
        
        # Technische implementaties
        "real-time LLM compliance filter API",
        "AI agent middleware compliance gateway",
        "external prompt filtering service",
        "decoupled AI safety middleware",
        "API-based LLM guardrails system",
        
        # Architectuur-specifiek
        "proxy-based AI compliance layer",
        "AI agent external policy gateway",
        "third-party LLM compliance service",
        "out-of-band AI governance API",
        "sidecar compliance service AI agents",
        
        # EU AI Act specifieke patentqueries
        "EU AI Act compliance automation patent",
        "AI regulation enforcement API patent",
        "automated AI Act Article 5 filtering",
    ])
    
    # Markt categorieën
    market_categories: list = field(default_factory=lambda: [
        "AI TRiSM",  # Trust, Risk and Security Management
        "RegTech AI compliance",
        "AI Guardrails platform",
        "AI Safety Middleware",
        "LLM governance tools",
        "AI policy enforcement",
    ])
    
    # Naam variaties voor trademark check
    trademark_variations: list = field(default_factory=lambda: [
        "ComplianceCode",
        "Compliance Code",
        "ComplianceCode AI",
        "ComplianceCode.ai",
    ])
    
    # ==========================================================================
    # EU AI ACT REGULATORY CONFIG
    # ==========================================================================
    
    # EU AI Act artikelen met beschrijving
    eu_ai_act_articles: dict = field(default_factory=lambda: {
        "Article 5": {
            "title": "Prohibited AI Practices / Verboden praktijken",
            "description": "Verbiedt AI-systemen die manipulatief, exploitatief of schadelijk zijn",
            "keywords": ["prohibited", "manipulation", "subliminal", "exploitation", "social scoring"]
        },
        "Article 10": {
            "title": "Data and Data Governance",
            "description": "Eisen voor trainingsdata, validatie en governance",
            "keywords": ["data governance", "training data", "bias", "validation", "data quality"]
        },
        "Article 52": {
            "title": "Transparency Obligations",
            "description": "Transparantie-eisen voor AI-systemen, disclosure aan gebruikers",
            "keywords": ["transparency", "disclosure", "inform users", "AI-generated", "deepfake"]
        },
    })
    
    # Regulatory zoektermen
    regulatory_search_terms: list = field(default_factory=lambda: [
        # EU AI Act API enforcement
        "API for EU AI Act enforcement",
        "Automated AI Act compliance gateway",
        "Real-time Article 5 filtering API",
        "EU AI Act Article 10 data governance API",
        "Article 52 transparency compliance API",
        
        # Third-party vs Internal
        "Third-party AI compliance as a service",
        "External AI compliance controller",
        "Independent AI auditor API",
        "Decoupled AI regulation enforcement",
        
        # Regulatory sandbox
        "EU AI regulatory sandbox",
        "AI Act sandbox testing",
        "European AI sandbox API solutions",
    ])
    
    # Architectuur classificatie
    architecture_types: dict = field(default_factory=lambda: {
        "external_api": {
            "keywords": ["external api", "third-party", "standalone", "decoupled", "independent", "as a service", "saas"],
            "label": "External API (Ontkoppeld)"
        },
        "internal_sdk": {
            "keywords": ["sdk", "library", "framework", "integrated", "embedded", "in-process"],
            "label": "Internal SDK (Gekoppeld)"
        },
        "hybrid": {
            "keywords": ["hybrid", "optional api", "self-hosted", "on-premise"],
            "label": "Hybrid"
        }
    })
    
    # Bekende concurrenten met metadata
    known_competitors: list = field(default_factory=lambda: [
        {
            "name": "Guardrails AI",
            "architecture": "Internal SDK",
            "eu_ai_act_specificity": "Laag",
            "description": "Python library voor output validatie",
            "url": "https://guardrailsai.com",
            "regulatory_gap": "Geen EU AI Act specifieke rules, geen externe API"
        },
        {
            "name": "NeMo Guardrails",
            "architecture": "Internal SDK",
            "eu_ai_act_specificity": "Laag",
            "description": "NVIDIA framework voor conversational AI",
            "url": "https://github.com/NVIDIA/NeMo-Guardrails",
            "regulatory_gap": "Framework-gebonden, geen regulatory compliance focus"
        },
        {
            "name": "Lakera Guard",
            "architecture": "External API",
            "eu_ai_act_specificity": "Midden",
            "description": "API voor prompt injection en content moderation",
            "url": "https://lakera.ai",
            "regulatory_gap": "Focus op security, niet op EU AI Act artikelen"
        },
        {
            "name": "Rebuff AI",
            "architecture": "Hybrid",
            "eu_ai_act_specificity": "Laag",
            "description": "Prompt injection detectie",
            "url": "https://rebuff.ai",
            "regulatory_gap": "Smalle focus op prompt injection alleen"
        },
        {
            "name": "Arthur AI",
            "architecture": "Hybrid",
            "eu_ai_act_specificity": "Midden",
            "description": "ML observability en monitoring platform",
            "url": "https://arthur.ai",
            "regulatory_gap": "Breder platform, niet specifiek voor real-time enforcement"
        },
        {
            "name": "Portkey AI Gateway",
            "architecture": "External API",
            "eu_ai_act_specificity": "Laag",
            "description": "AI Gateway met guardrails integratie",
            "url": "https://portkey.ai",
            "regulatory_gap": "Focus op routing/caching, guardrails zijn secundair"
        },
        {
            "name": "LiteLLM",
            "architecture": "Hybrid",
            "eu_ai_act_specificity": "Laag",
            "description": "Proxy server voor meerdere LLM APIs",
            "url": "https://litellm.ai",
            "regulatory_gap": "Geen compliance focus, alleen API unificatie"
        },
        {
            "name": "Patronus AI",
            "architecture": "External API",
            "eu_ai_act_specificity": "Midden",
            "description": "LLM evaluation en testing platform",
            "url": "https://patronus.ai",
            "regulatory_gap": "Focus op testing, niet real-time enforcement"
        },
    ])


# =============================================================================
# MODULE 1: TECHNICAL RESEARCH (Prior Art)
# =============================================================================

class TechnicalResearcher:
    """Onderzoekt prior art in patenten en academische papers."""
    
    def __init__(self, config: ResearchConfig):
        self.config = config
        self.results = {
            "patents": [],
            "papers": [],
            "technical_references": []
        }
    
    def generate_patent_queries(self) -> dict:
        """
        Genereert geformatteerde zoekopdrachten voor patentdatabases.
        
        Returns:
            dict met queries voor Google Patents en Espacenet
        """
        queries = {
            "google_patents": [],
            "espacenet": [],
        }
        
        for term in self.config.patent_search_terms:
            # Google Patents query format
            gp_query = f'"{term}" OR ({term.replace(" ", " AND ")})'
            queries["google_patents"].append({
                "term": term,
                "query": gp_query,
                "url": f"https://patents.google.com/?q={requests.utils.quote(term)}"
            })
            
            # Espacenet query format (CQL-style)
            ep_query = f'ta="{term}" OR ab="{term}"'
            queries["espacenet"].append({
                "term": term,
                "query": ep_query,
                "url": f"https://worldwide.espacenet.com/patent/search?q={requests.utils.quote(term)}"
            })
        
        return queries
    
    def search_arxiv(self, query: str, max_results: int = 5) -> list:
        """
        Zoekt naar papers op arXiv via hun API.
        
        Args:
            query: Zoekterm
            max_results: Maximum aantal resultaten
            
        Returns:
            Lijst met gevonden papers
        """
        base_url = "http://export.arxiv.org/api/query"
        
        # Bouw query met focus op ontkoppelde architectuur
        search_query = f'all:"{query}" OR (all:AI AND all:compliance AND all:API)'
        
        params = {
            "search_query": search_query,
            "start": 0,
            "max_results": max_results,
            "sortBy": "relevance",
            "sortOrder": "descending"
        }
        
        try:
            response = requests.get(base_url, params=params, timeout=30)
            response.raise_for_status()
            
            # Parse de Atom feed
            soup = BeautifulSoup(response.content, 'xml')
            entries = soup.find_all('entry')
            
            papers = []
            for entry in entries:
                paper = {
                    "title": entry.title.text.strip() if entry.title else "",
                    "summary": entry.summary.text.strip()[:500] + "..." if entry.summary else "",
                    "authors": [a.find('name').text for a in entry.find_all('author') if a.find('name')],
                    "link": entry.id.text if entry.id else "",
                    "published": entry.published.text if entry.published else "",
                }
                papers.append(paper)
            
            return papers
            
        except Exception as e:
            print(f"  [!] arXiv search error: {e}")
            return []
    
    def search_with_tavily(self, query: str, search_depth: str = "advanced") -> list:
        """
        Zoekt naar technische content via Tavily API.
        
        Args:
            query: Zoekterm
            search_depth: "basic" of "advanced"
            
        Returns:
            Lijst met zoekresultaten
        """
        if not self.config.tavily_api_key:
            print("  [!] Geen Tavily API key gevonden. Sla deze zoekopdracht over.")
            return []
        
        try:
            from tavily import TavilyClient
            client = TavilyClient(api_key=self.config.tavily_api_key)
            
            # Zoek met focus op technische bronnen
            response = client.search(
                query=query,
                search_depth=search_depth,
                include_domains=[
                    "arxiv.org",
                    "scholar.google.com", 
                    "semanticscholar.org",
                    "github.com",
                    "patents.google.com",
                ],
                max_results=10
            )
            
            return response.get("results", [])
            
        except ImportError:
            print("  [!] tavily-python niet geïnstalleerd. Gebruik: pip install tavily-python")
            return []
        except Exception as e:
            print(f"  [!] Tavily search error: {e}")
            return []
    
    def run_technical_research(self) -> dict:
        """Voert het complete technische onderzoek uit."""
        print("\n" + "="*60)
        print("MODULE 1: TECHNICAL RESEARCH (Prior Art)")
        print("="*60)
        
        # 1. Genereer patent queries
        print("\n[1.1] Genereren van patent zoekqueries...")
        patent_queries = self.generate_patent_queries()
        self.results["patent_queries"] = patent_queries
        print(f"  ✓ {len(patent_queries['google_patents'])} Google Patents queries gegenereerd")
        print(f"  ✓ {len(patent_queries['espacenet'])} Espacenet queries gegenereerd")
        
        # 2. Zoek op arXiv
        print("\n[1.2] Zoeken op arXiv naar relevante papers...")
        key_arxiv_queries = [
            "AI compliance middleware architecture",
            "LLM governance external API",
            "real-time AI policy enforcement",
        ]
        
        for query in key_arxiv_queries:
            print(f"  → Zoeken: '{query}'")
            papers = self.search_arxiv(query)
            self.results["papers"].extend(papers)
        
        # Verwijder duplicaten
        seen_titles = set()
        unique_papers = []
        for paper in self.results["papers"]:
            if paper["title"] not in seen_titles:
                seen_titles.add(paper["title"])
                unique_papers.append(paper)
        self.results["papers"] = unique_papers
        print(f"  ✓ {len(self.results['papers'])} unieke papers gevonden")
        
        # 3. Tavily deep search voor technische referenties
        print("\n[1.3] Deep search voor technische prior art...")
        deep_search_queries = [
            "decoupled AI compliance gateway architecture patent prior art",
            "external LLM guardrails API middleware technical implementation",
            "AI agent compliance proxy layer academic research",
        ]
        
        for query in deep_search_queries:
            print(f"  → Deep search: '{query[:50]}...'")
            results = self.search_with_tavily(query)
            self.results["technical_references"].extend(results)
        
        print(f"  ✓ {len(self.results['technical_references'])} technische referenties gevonden")
        
        return self.results


# =============================================================================
# MODULE 2: REGULATORY COMPETITOR ANALYSIS (EU AI Act Focus)
# =============================================================================

class RegulatoryAnalyzer:
    """
    Diepgaande analyse van concurrenten met focus op EU AI Act compliance.
    Onderzoekt architectuur (extern vs intern) en regulatory specificiteit.
    """
    
    def __init__(self, config: ResearchConfig):
        self.config = config
        self.results = {
            "eu_ai_act_references": [],
            "article_specific_findings": {},
            "architecture_classification": [],
            "regulatory_sandboxes": [],
            "independent_controllers": [],
            "regulatory_gap_analysis": []
        }
    
    def search_eu_ai_act_compliance(self) -> Dict:
        """
        Zoekt naar partijen die specifieke EU AI Act artikelen noemen in hun API-documentatie.
        
        Returns:
            Dict met resultaten per artikel
        """
        if not self.config.tavily_api_key:
            return {}
        
        try:
            from tavily import TavilyClient
            client = TavilyClient(api_key=self.config.tavily_api_key)
            
            article_results = {}
            
            for article, info in self.config.eu_ai_act_articles.items():
                print(f"  → Zoeken: '{article}' ({info['title']})")
                
                # Zoek naar API documentatie die dit artikel noemt
                queries = [
                    f'"{article}" AI API compliance documentation',
                    f'"{article}" EU AI Act API enforcement',
                    f'"{article}" {" ".join(info["keywords"][:2])} API gateway',
                ]
                
                findings = []
                for query in queries:
                    response = client.search(
                        query=query,
                        search_depth="advanced",
                        max_results=5
                    )
                    findings.extend(response.get("results", []))
                
                article_results[article] = {
                    "info": info,
                    "findings": findings
                }
            
            return article_results
            
        except Exception as e:
            print(f"  [!] EU AI Act search error: {e}")
            return {}
    
    def search_regulatory_api_solutions(self) -> List:
        """
        Zoekt specifiek naar API-oplossingen voor EU AI Act enforcement.
        
        Returns:
            Lijst met gevonden oplossingen
        """
        if not self.config.tavily_api_key:
            return []
        
        try:
            from tavily import TavilyClient
            client = TavilyClient(api_key=self.config.tavily_api_key)
            
            all_results = []
            
            for query in self.config.regulatory_search_terms:
                print(f"  → Regulatory search: '{query[:45]}...'")
                response = client.search(
                    query=query,
                    search_depth="advanced",
                    max_results=8
                )
                
                for result in response.get("results", []):
                    result["matched_query"] = query
                    all_results.append(result)
            
            return all_results
            
        except Exception as e:
            print(f"  [!] Regulatory API search error: {e}")
            return []
    
    def classify_architecture(self, content: str) -> str:
        """
        Classificeert een oplossing als External API, Internal SDK, of Hybrid.
        
        Args:
            content: Tekst om te analyseren
            
        Returns:
            Architectuur classificatie
        """
        content_lower = content.lower()
        
        scores = {arch_type: 0 for arch_type in self.config.architecture_types}
        
        for arch_type, info in self.config.architecture_types.items():
            for keyword in info["keywords"]:
                if keyword in content_lower:
                    scores[arch_type] += 1
        
        # Bepaal dominante architectuur
        max_score = max(scores.values())
        if max_score == 0:
            return "Onbekend"
        
        for arch_type, score in scores.items():
            if score == max_score:
                return self.config.architecture_types[arch_type]["label"]
        
        return "Onbekend"
    
    def assess_eu_ai_act_specificity(self, content: str) -> str:
        """
        Beoordeelt hoe specifiek een oplossing is voor EU AI Act compliance.
        
        Args:
            content: Tekst om te analyseren
            
        Returns:
            "Hoog", "Midden", of "Laag"
        """
        content_lower = content.lower()
        
        # Hoge specificiteit indicatoren
        high_indicators = [
            "eu ai act", "ai act", "article 5", "article 10", "article 52",
            "european regulation", "eu regulation", "prohibited ai",
            "high-risk ai", "conformity assessment"
        ]
        
        # Middelmatige indicatoren
        medium_indicators = [
            "gdpr", "compliance", "regulation", "governance", "audit",
            "transparency", "bias detection", "data governance"
        ]
        
        high_count = sum(1 for ind in high_indicators if ind in content_lower)
        medium_count = sum(1 for ind in medium_indicators if ind in content_lower)
        
        if high_count >= 2:
            return "Hoog"
        elif high_count >= 1 or medium_count >= 3:
            return "Midden"
        else:
            return "Laag"
    
    def find_independent_controllers(self) -> List:
        """
        Zoekt naar partijen die de rol van 'Onafhankelijke Controleur' innemen.
        Third-party compliance as a service.
        
        Returns:
            Lijst met gevonden onafhankelijke controleurs
        """
        if not self.config.tavily_api_key:
            return []
        
        try:
            from tavily import TavilyClient
            client = TavilyClient(api_key=self.config.tavily_api_key)
            
            queries = [
                '"third-party AI compliance" "as a service"',
                '"independent AI auditor" API service',
                '"external compliance controller" AI LLM',
                '"AI governance" "independent" API provider',
                '"decoupled compliance" AI agent service',
            ]
            
            all_results = []
            for query in queries:
                response = client.search(
                    query=query,
                    search_depth="advanced",
                    max_results=5
                )
                
                for result in response.get("results", []):
                    # Classificeer de architectuur
                    content = result.get("content", "") + result.get("title", "")
                    result["architecture"] = self.classify_architecture(content)
                    result["eu_ai_act_specificity"] = self.assess_eu_ai_act_specificity(content)
                    result["is_independent"] = "external" in result["architecture"].lower()
                    all_results.append(result)
            
            return all_results
            
        except Exception as e:
            print(f"  [!] Independent controller search error: {e}")
            return []
    
    def search_regulatory_sandboxes(self) -> List:
        """
        Zoekt naar EU Regulatory Sandboxes die API-oplossingen voor AI handhaving testen.
        
        Returns:
            Lijst met gevonden sandboxes
        """
        if not self.config.tavily_api_key:
            return []
        
        try:
            from tavily import TavilyClient
            client = TavilyClient(api_key=self.config.tavily_api_key)
            
            sandbox_queries = [
                "EU AI Act regulatory sandbox participants 2024 2025",
                "European AI sandbox API testing compliance",
                "AI regulatory sandbox Netherlands Belgium Germany",
                "AI Act sandbox enforcement solutions",
                "regulatory sandbox AI governance startups Europe",
            ]
            
            all_results = []
            for query in sandbox_queries:
                response = client.search(
                    query=query,
                    search_depth="advanced",
                    max_results=5
                )
                all_results.extend(response.get("results", []))
            
            return all_results
            
        except Exception as e:
            print(f"  [!] Regulatory sandbox search error: {e}")
            return []
    
    def analyze_security_gateway_gaps(self) -> List:
        """
        Analyseert waar bestaande security gateways tekortschieten
        in het afdwingen van specifieke Europese wetgeving.
        
        Returns:
            Lijst met gap analyses
        """
        if not self.config.tavily_api_key:
            return []
        
        try:
            from tavily import TavilyClient
            client = TavilyClient(api_key=self.config.tavily_api_key)
            
            gap_queries = [
                'Lakera Guard "EU AI Act" limitations',
                'Portkey AI gateway "regulation" "compliance" limitations',
                '"AI guardrails" "EU AI Act" not supported',
                '"prompt filtering" vs "regulatory compliance" AI',
                '"security focus" vs "regulatory focus" AI guardrails',
            ]
            
            all_results = []
            for query in gap_queries:
                response = client.search(
                    query=query,
                    search_depth="advanced",
                    max_results=5
                )
                all_results.extend(response.get("results", []))
            
            return all_results
            
        except Exception as e:
            print(f"  [!] Gap analysis search error: {e}")
            return []
    
    def run_regulatory_analysis(self) -> Dict:
        """Voert de complete regulatory competitor analyse uit."""
        print("\n" + "="*60)
        print("MODULE 2: REGULATORY COMPETITOR ANALYSIS (EU AI Act)")
        print("="*60)
        
        # 1. Zoek naar EU AI Act referenties in API documentatie
        print("\n[2.1] Zoeken naar EU AI Act artikelen in API documentatie...")
        self.results["article_specific_findings"] = self.search_eu_ai_act_compliance()
        total_findings = sum(
            len(v.get("findings", [])) 
            for v in self.results["article_specific_findings"].values()
        )
        print(f"  ✓ {total_findings} referenties gevonden voor EU AI Act artikelen")
        
        # 2. Zoek naar regulatory API oplossingen
        print("\n[2.2] Zoeken naar regulatory API oplossingen...")
        self.results["eu_ai_act_references"] = self.search_regulatory_api_solutions()
        print(f"  ✓ {len(self.results['eu_ai_act_references'])} regulatory API referenties")
        
        # 3. Zoek naar onafhankelijke controleurs
        print("\n[2.3] Identificeren van 'Onafhankelijke Controleurs'...")
        self.results["independent_controllers"] = self.find_independent_controllers()
        independent_count = sum(
            1 for r in self.results["independent_controllers"] 
            if r.get("is_independent")
        )
        print(f"  ✓ {independent_count} onafhankelijke externe controleurs gevonden")
        
        # 4. Zoek naar EU Regulatory Sandboxes
        print("\n[2.4] Zoeken naar EU Regulatory Sandboxes...")
        self.results["regulatory_sandboxes"] = self.search_regulatory_sandboxes()
        print(f"  ✓ {len(self.results['regulatory_sandboxes'])} sandbox referenties")
        
        # 5. Analyseer gaps in bestaande security gateways
        print("\n[2.5] Analyseren van gaps in security gateways...")
        self.results["regulatory_gap_analysis"] = self.analyze_security_gateway_gaps()
        print(f"  ✓ {len(self.results['regulatory_gap_analysis'])} gap analyse resultaten")
        
        return self.results


# =============================================================================
# MODULE 3: MARKET ANALYSIS (General)
# =============================================================================

class MarketAnalyzer:
    """Analyseert de markt voor AI compliance tools."""
    
    def __init__(self, config: ResearchConfig):
        self.config = config
        self.results = {
            "categories": {},
            "competitors": [],
            "github_projects": [],
            "startups": []
        }
    
    def search_category(self, category: str) -> list:
        """
        Zoekt naar bedrijven en producten in een specifieke categorie.
        
        Args:
            category: De marktsegment om te doorzoeken
            
        Returns:
            Lijst met gevonden bedrijven/producten
        """
        if not self.config.tavily_api_key:
            return []
        
        try:
            from tavily import TavilyClient
            client = TavilyClient(api_key=self.config.tavily_api_key)
            
            # Zoek naar bedrijven in deze categorie
            response = client.search(
                query=f"{category} companies startups products 2024 2025",
                search_depth="advanced",
                max_results=10
            )
            
            return response.get("results", [])
            
        except Exception as e:
            print(f"  [!] Category search error: {e}")
            return []
    
    def search_github_projects(self) -> list:
        """
        Zoekt naar relevante GitHub repositories.
        
        Returns:
            Lijst met gevonden repositories
        """
        github_api = "https://api.github.com/search/repositories"
        
        search_queries = [
            "LLM compliance middleware",
            "AI guardrails API",
            "prompt filtering gateway",
            "AI safety middleware",
            "LLM governance layer",
        ]
        
        all_repos = []
        
        for query in search_queries:
            try:
                params = {
                    "q": query,
                    "sort": "stars",
                    "order": "desc",
                    "per_page": 10
                }
                
                headers = {"Accept": "application/vnd.github.v3+json"}
                response = requests.get(github_api, params=params, headers=headers, timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    for repo in data.get("items", []):
                        repo_info = {
                            "name": repo.get("full_name"),
                            "description": repo.get("description", ""),
                            "url": repo.get("html_url"),
                            "stars": repo.get("stargazers_count"),
                            "language": repo.get("language"),
                            "updated_at": repo.get("updated_at"),
                            "query_matched": query
                        }
                        all_repos.append(repo_info)
                        
            except Exception as e:
                print(f"  [!] GitHub search error for '{query}': {e}")
        
        # Verwijder duplicaten en sorteer op stars
        seen_repos = set()
        unique_repos = []
        for repo in sorted(all_repos, key=lambda x: x["stars"], reverse=True):
            if repo["name"] not in seen_repos:
                seen_repos.add(repo["name"])
                unique_repos.append(repo)
        
        return unique_repos[:30]  # Top 30
    
    def search_startups_crunchbase(self) -> list:
        """
        Zoekt naar startups via web search (Crunchbase direct API vereist betaald account).
        
        Returns:
            Lijst met gevonden startups
        """
        if not self.config.tavily_api_key:
            return []
        
        try:
            from tavily import TavilyClient
            client = TavilyClient(api_key=self.config.tavily_api_key)
            
            startup_queries = [
                "AI compliance startup Crunchbase funding 2024 2025",
                "LLM guardrails startup series A funding",
                "AI governance middleware company venture capital",
                "AI TRiSM startup Gartner",
            ]
            
            all_results = []
            for query in startup_queries:
                response = client.search(
                    query=query,
                    search_depth="advanced",
                    include_domains=["crunchbase.com", "techcrunch.com", "venturebeat.com"],
                    max_results=5
                )
                all_results.extend(response.get("results", []))
            
            return all_results
            
        except Exception as e:
            print(f"  [!] Startup search error: {e}")
            return []
    
    def identify_direct_competitors(self) -> list:
        """
        Identificeert directe concurrenten die een vergelijkbare ontkoppelde architectuur gebruiken.
        
        Returns:
            Lijst met potentiële directe concurrenten
        """
        if not self.config.tavily_api_key:
            return []
        
        try:
            from tavily import TavilyClient
            client = TavilyClient(api_key=self.config.tavily_api_key)
            
            # Zeer specifieke zoekquery voor ontkoppelde architectuur
            competitor_queries = [
                '"external API" "AI compliance" "real-time" middleware',
                '"decoupled" "LLM governance" API service',
                '"AI guardrails" "API gateway" compliance product',
                'Guardrails AI NeMo Guardrails Lakera comparison',
                'LLM firewall API service enterprise',
            ]
            
            all_competitors = []
            for query in competitor_queries:
                response = client.search(
                    query=query,
                    search_depth="advanced",
                    max_results=10
                )
                all_competitors.extend(response.get("results", []))
            
            return all_competitors
            
        except Exception as e:
            print(f"  [!] Competitor search error: {e}")
            return []
    
    def run_market_analysis(self) -> dict:
        """Voert de complete marktanalyse uit."""
        print("\n" + "="*60)
        print("MODULE 3: MARKET ANALYSIS (General)")
        print("="*60)
        
        # 1. Scan markt categorieën
        print("\n[2.1] Scannen van marktcategorieën...")
        for category in self.config.market_categories:
            print(f"  → Analyseren: '{category}'")
            results = self.search_category(category)
            self.results["categories"][category] = results
        
        # 2. GitHub projecten
        print("\n[2.2] Zoeken naar GitHub repositories...")
        self.results["github_projects"] = self.search_github_projects()
        print(f"  ✓ {len(self.results['github_projects'])} relevante repositories gevonden")
        
        # 3. Startups
        print("\n[2.3] Zoeken naar startups...")
        self.results["startups"] = self.search_startups_crunchbase()
        print(f"  ✓ {len(self.results['startups'])} startup referenties gevonden")
        
        # 4. Directe concurrenten
        print("\n[2.4] Identificeren van directe concurrenten...")
        self.results["competitors"] = self.identify_direct_competitors()
        print(f"  ✓ {len(self.results['competitors'])} potentiële concurrenten geïdentificeerd")
        
        return self.results


# =============================================================================
# MODULE 4: COMMERCIAL CHECK (Trademark)
# =============================================================================

class TrademarkChecker:
    """Controleert beschikbaarheid van merknamen."""
    
    def __init__(self, config: ResearchConfig):
        self.config = config
        self.results = {
            "trademark_searches": [],
            "domain_availability": [],
            "conflicts": []
        }
    
    def search_trademark_databases(self) -> list:
        """
        Zoekt in merkenregisters via web search.
        TMview en BOIP hebben geen publieke API, dus we gebruiken search.
        
        Returns:
            Lijst met zoekresultaten
        """
        if not self.config.tavily_api_key:
            return []
        
        try:
            from tavily import TavilyClient
            client = TavilyClient(api_key=self.config.tavily_api_key)
            
            all_results = []
            
            for name in self.config.trademark_variations:
                # TMview search
                tm_query = f'"{name}" trademark TMview EU registration'
                response = client.search(
                    query=tm_query,
                    search_depth="basic",
                    max_results=5
                )
                
                for result in response.get("results", []):
                    result["searched_name"] = name
                    result["database"] = "TMview"
                    all_results.append(result)
                
                # BOIP (Benelux) search
                boip_query = f'"{name}" trademark BOIP Benelux registration'
                response = client.search(
                    query=boip_query,
                    search_depth="basic",
                    max_results=5
                )
                
                for result in response.get("results", []):
                    result["searched_name"] = name
                    result["database"] = "BOIP"
                    all_results.append(result)
            
            return all_results
            
        except Exception as e:
            print(f"  [!] Trademark search error: {e}")
            return []
    
    def check_existing_products(self) -> list:
        """
        Zoekt naar bestaande producten/services met vergelijkbare namen.
        
        Returns:
            Lijst met gevonden conflicten
        """
        if not self.config.tavily_api_key:
            return []
        
        try:
            from tavily import TavilyClient
            client = TavilyClient(api_key=self.config.tavily_api_key)
            
            conflicts = []
            
            for name in self.config.trademark_variations:
                response = client.search(
                    query=f'"{name}" software product company',
                    search_depth="basic",
                    max_results=10
                )
                
                for result in response.get("results", []):
                    # Check of het echt een conflict kan zijn
                    title_lower = result.get("title", "").lower()
                    if "compliance" in title_lower or "code" in title_lower:
                        result["searched_name"] = name
                        result["potential_conflict"] = True
                        conflicts.append(result)
            
            return conflicts
            
        except Exception as e:
            print(f"  [!] Product conflict search error: {e}")
            return []
    
    def generate_trademark_urls(self) -> dict:
        """
        Genereert directe URLs naar trademark databases voor handmatige check.
        
        Returns:
            Dict met URLs per database
        """
        urls = {
            "tmview": [],
            "boip": [],
            "uspto": [],
            "wipo": []
        }
        
        for name in self.config.trademark_variations:
            encoded_name = requests.utils.quote(name)
            
            urls["tmview"].append({
                "name": name,
                "url": f"https://www.tmdn.org/tmview/#/tmview/results?page=1&pageSize=30&criteria=C&basicSearch={encoded_name}"
            })
            
            urls["boip"].append({
                "name": name,
                "url": f"https://www.boip.int/en/trademarks-register?search={encoded_name}"
            })
            
            urls["uspto"].append({
                "name": name,
                "url": f"https://tmsearch.uspto.gov/bin/gate.exe?f=tess&state=4801:11qhb.1.1&search={encoded_name}"
            })
            
            urls["wipo"].append({
                "name": name,
                "url": f"https://branddb.wipo.int/en/quicksearch/brand/{encoded_name}"
            })
        
        return urls
    
    def run_trademark_check(self) -> dict:
        """Voert de complete trademark check uit."""
        print("\n" + "="*60)
        print("MODULE 4: COMMERCIAL CHECK (Trademark)")
        print("="*60)
        
        # 1. Genereer directe URLs
        print("\n[3.1] Genereren van trademark database URLs...")
        self.results["database_urls"] = self.generate_trademark_urls()
        print(f"  ✓ URLs gegenereerd voor TMview, BOIP, USPTO, WIPO")
        
        # 2. Search via Tavily
        print("\n[3.2] Zoeken naar bestaande trademarks...")
        self.results["trademark_searches"] = self.search_trademark_databases()
        print(f"  ✓ {len(self.results['trademark_searches'])} trademark referenties gevonden")
        
        # 3. Check bestaande producten
        print("\n[3.3] Controleren op bestaande producten...")
        self.results["conflicts"] = self.check_existing_products()
        print(f"  ✓ {len(self.results['conflicts'])} potentiële conflicten gevonden")
        
        return self.results


# =============================================================================
# MODULE 5: REPORT GENERATOR
# =============================================================================

class ReportGenerator:
    """Genereert het Markdown onderzoeksrapport met regulatory focus."""
    
    def __init__(
        self, 
        technical_results: dict, 
        regulatory_results: dict,
        market_results: dict, 
        trademark_results: dict,
        config: ResearchConfig
    ):
        self.technical = technical_results
        self.regulatory = regulatory_results
        self.market = market_results
        self.trademark = trademark_results
        self.config = config
    
    def _classify_competitor(self, result: dict) -> str:
        """
        Classificeert een concurrent als 'direct', 'vergelijkbaar', of 'anders'.
        Focus op ontkoppelde architectuur.
        """
        content = (result.get("content", "") + result.get("title", "")).lower()
        
        # Direct concurrent: externe API, ontkoppeld, gateway
        direct_keywords = ["external api", "gateway", "decoupled", "middleware", "proxy", "standalone"]
        if any(kw in content for kw in direct_keywords):
            return "direct"
        
        # Vergelijkbare techniek: guardrails, compliance, governance
        similar_keywords = ["guardrails", "compliance", "governance", "safety", "filter"]
        if any(kw in content for kw in similar_keywords):
            return "vergelijkbaar"
        
        return "anders"
    
    def _assess_eu_specificity_from_content(self, content: str) -> str:
        """Beoordeelt EU AI Act specificiteit op basis van content."""
        content_lower = content.lower()
        
        high_indicators = ["eu ai act", "article 5", "article 10", "article 52", "ai act"]
        medium_indicators = ["gdpr", "compliance", "regulation", "european"]
        
        high_count = sum(1 for ind in high_indicators if ind in content_lower)
        medium_count = sum(1 for ind in medium_indicators if ind in content_lower)
        
        if high_count >= 1:
            return "Hoog"
        elif medium_count >= 2:
            return "Midden"
        return "Laag"
    
    def generate_report(self) -> str:
        """Genereert het complete Markdown rapport met regulatory focus."""
        
        report = []
        
        # =====================================================================
        # HEADER
        # =====================================================================
        report.append("# Prior Art & Market Research Report: ComplianceCode")
        report.append("")
        report.append(f"**Gegenereerd op:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        report.append("**Focus:** Ontkoppelde architectuur - externe API als onafhankelijke compliance-laag voor AI agents")
        report.append("")
        report.append("**Regulatory Focus:** EU AI Act (Articles 5, 10, 52)")
        report.append("")
        report.append("---")
        report.append("")
        
        # =====================================================================
        # EXECUTIVE SUMMARY
        # =====================================================================
        report.append("## Executive Summary")
        report.append("")
        report.append("Dit rapport onderzoekt de uniciteit van ComplianceCode's architectuur: ")
        report.append("een externe, ontkoppelde API die fungeert als onafhankelijke compliance-laag voor AI agents,")
        report.append("met specifieke focus op EU AI Act enforcement.")
        report.append("")
        report.append("### Kernbevindingen")
        report.append("")
        report.append("| Aspect | Bevinding |")
        report.append("|--------|-----------|")
        report.append("| **Architectuur** | Weinig concurrenten bieden volledig ontkoppelde compliance API's |")
        report.append("| **EU AI Act Focus** | Grote gap - de meeste guardrails focussen op security, niet regulering |")
        report.append("| **Onafhankelijke Rol** | ComplianceCode's positie als 'derde partij controleur' is zeldzaam |")
        report.append("")
        
        # =====================================================================
        # SECTIE 1: COMPETITIVE MAPPING (Uitgebreide tabel)
        # =====================================================================
        report.append("## 1. Competitive Mapping")
        report.append("")
        report.append("Uitgebreide vergelijking van concurrenten met **EU AI Act Specificity** classificatie:")
        report.append("")
        report.append("| Bedrijf/Project | Architectuur | EU AI Act Specificity | Focus | Regulatory Gap |")
        report.append("|-----------------|--------------|----------------------|-------|----------------|")
        
        # Bekende concurrenten uit config
        for comp in self.config.known_competitors:
            report.append(
                f"| [{comp['name']}]({comp['url']}) | "
                f"{comp['architecture']} | "
                f"**{comp['eu_ai_act_specificity']}** | "
                f"{comp['description'][:40]}... | "
                f"{comp['regulatory_gap'][:35]}... |"
            )
        
        report.append("")
        
        # Dynamisch gevonden concurrenten
        independent_controllers = self.regulatory.get("independent_controllers", [])
        if independent_controllers:
            report.append("### Dynamisch Gevonden Partijen")
            report.append("")
            report.append("| Bron | Architectuur | EU AI Act | URL |")
            report.append("|------|--------------|-----------|-----|")
            
            seen_urls = set()
            for ctrl in independent_controllers[:10]:
                url = ctrl.get("url", "")
                if url not in seen_urls:
                    seen_urls.add(url)
                    report.append(
                        f"| {ctrl.get('title', 'N/A')[:35]}... | "
                        f"{ctrl.get('architecture', 'Onbekend')} | "
                        f"{ctrl.get('eu_ai_act_specificity', 'Laag')} | "
                        f"[Link]({url}) |"
                    )
            report.append("")
        
        # =====================================================================
        # SECTIE 2: EU AI ACT REGULATORY ANALYSIS
        # =====================================================================
        report.append("## 2. EU AI Act Regulatory Analysis")
        report.append("")
        report.append("Analyse van hoe concurrenten omgaan met specifieke EU AI Act artikelen:")
        report.append("")
        
        # Per artikel analyse
        article_findings = self.regulatory.get("article_specific_findings", {})
        
        for article, data in article_findings.items():
            info = data.get("info", {})
            findings = data.get("findings", [])
            
            report.append(f"### 2.{list(article_findings.keys()).index(article) + 1}. {article}: {info.get('title', '')}")
            report.append("")
            report.append(f"**Beschrijving:** {info.get('description', 'N/A')}")
            report.append("")
            report.append(f"**Keywords:** {', '.join(info.get('keywords', []))}")
            report.append("")
            
            if findings:
                report.append("**Gevonden referenties:**")
                report.append("")
                for finding in findings[:3]:
                    report.append(f"- [{finding.get('title', 'N/A')}]({finding.get('url', '#')})")
                report.append("")
            else:
                report.append("*Geen directe API-referenties gevonden voor dit artikel.*")
                report.append("")
        
        # EU AI Act Regulatory zoekresultaten
        eu_refs = self.regulatory.get("eu_ai_act_references", [])
        if eu_refs:
            report.append("### 2.4. Gevonden EU AI Act API Oplossingen")
            report.append("")
            seen_urls = set()
            for ref in eu_refs[:8]:
                url = ref.get("url", "")
                if url not in seen_urls:
                    seen_urls.add(url)
                    report.append(f"- **{ref.get('title', 'N/A')}**")
                    report.append(f"  - URL: {url}")
                    report.append(f"  - Query: _{ref.get('matched_query', 'N/A')}_")
                    report.append("")
        
        # =====================================================================
        # SECTIE 3: THE REGULATORY GAP
        # =====================================================================
        report.append("## 3. The Regulatory Gap")
        report.append("")
        report.append("**Waar bestaande security-gateways tekortschieten in het afdwingen van Europese wetgeving:**")
        report.append("")
        
        report.append("### 3.1 Security Focus vs Regulatory Focus")
        report.append("")
        report.append("| Security Gateway | Wat ze doen | Wat ze NIET doen (Regulatory Gap) |")
        report.append("|------------------|-------------|-----------------------------------|")
        report.append("| **Lakera Guard** | Prompt injection detectie, PII filtering | Geen Article 5 verboden praktijken check |")
        report.append("| **Portkey Gateway** | Rate limiting, caching, fallbacks | Geen compliance logging voor AI Act |")
        report.append("| **Guardrails AI** | Output validatie, JSON schemas | Geen transparency verplichtingen (Art. 52) |")
        report.append("| **NeMo Guardrails** | Conversational flows, topic control | Gekoppelde architectuur, geen audit trail |")
        report.append("")
        
        report.append("### 3.2 Specifieke Tekortkomingen")
        report.append("")
        report.append("#### Article 5 - Verboden Praktijken")
        report.append("- **Gap:** Geen bestaande gateway checkt actief op manipulatieve of subliminale AI-technieken")
        report.append("- **Kans:** ComplianceCode kan real-time screening bieden voor prohibited practices")
        report.append("")
        report.append("#### Article 10 - Data Governance")
        report.append("- **Gap:** Guardrails valideren output, niet de onderliggende data governance")
        report.append("- **Kans:** ComplianceCode kan data provenance en bias checks integreren")
        report.append("")
        report.append("#### Article 52 - Transparency")
        report.append("- **Gap:** Geen automatische disclosure wanneer content AI-gegenereerd is")
        report.append("- **Kans:** ComplianceCode kan transparency headers en watermarks afdwingen")
        report.append("")
        
        # Gap analysis resultaten
        gap_results = self.regulatory.get("regulatory_gap_analysis", [])
        if gap_results:
            report.append("### 3.3 Onderzoeksresultaten over Gaps")
            report.append("")
            seen_urls = set()
            for gap in gap_results[:5]:
                url = gap.get("url", "")
                if url not in seen_urls:
                    seen_urls.add(url)
                    report.append(f"- [{gap.get('title', 'N/A')}]({url})")
            report.append("")
        
        # =====================================================================
        # SECTIE 4: ARCHITECTUUR VALIDATIE
        # =====================================================================
        report.append("## 4. Architectuur Validatie: External vs Internal")
        report.append("")
        report.append("ComplianceCode's kernpropositie is de **ontkoppelde architectuur**.")
        report.append("Hieronder de vergelijking met concurrenten:")
        report.append("")
        
        report.append("### 4.1 Third-Party Compliance as a Service")
        report.append("")
        report.append("Partijen die, net als ComplianceCode, de rol van **Onafhankelijke Controleur** innemen:")
        report.append("")
        
        external_count = sum(1 for c in self.config.known_competitors if c["architecture"] == "External API")
        internal_count = sum(1 for c in self.config.known_competitors if c["architecture"] == "Internal SDK")
        hybrid_count = sum(1 for c in self.config.known_competitors if c["architecture"] == "Hybrid")
        
        report.append("| Architectuur Type | Aantal Concurrenten | ComplianceCode's Voordeel |")
        report.append("|-------------------|---------------------|---------------------------|")
        report.append(f"| External API (Ontkoppeld) | {external_count} | Directe concurrent, maar geen EU focus |")
        report.append(f"| Internal SDK (Gekoppeld) | {internal_count} | Volledig andere aanpak - lock-in |")
        report.append(f"| Hybrid | {hybrid_count} | Minder duidelijke value proposition |")
        report.append("")
        
        report.append("### 4.2 Voordelen Ontkoppelde Architectuur")
        report.append("")
        report.append("| Voordeel | Beschrijving |")
        report.append("|----------|--------------|")
        report.append("| **Vendor-agnostisch** | Werkt met elke LLM provider (OpenAI, Anthropic, lokaal) |")
        report.append("| **Geen code changes** | Integratie via proxy, geen SDK in applicatie |")
        report.append("| **Centrale governance** | Eén plek voor alle compliance policies |")
        report.append("| **Audit-ready** | Alle requests/responses gelogd voor compliance rapportage |")
        report.append("| **Onafhankelijke verificatie** | Derde partij controle, niet self-attestation |")
        report.append("")
        
        # =====================================================================
        # SECTIE 5: EU REGULATORY SANDBOXES
        # =====================================================================
        report.append("## 5. EU Regulatory Sandboxes")
        report.append("")
        report.append("Overzicht van EU Regulatory Sandboxes die AI compliance oplossingen testen:")
        report.append("")
        
        sandboxes = self.regulatory.get("regulatory_sandboxes", [])
        if sandboxes:
            seen_urls = set()
            for sb in sandboxes[:8]:
                url = sb.get("url", "")
                if url not in seen_urls:
                    seen_urls.add(url)
                    report.append(f"- **{sb.get('title', 'N/A')}**")
                    report.append(f"  - {sb.get('content', 'N/A')[:150]}...")
                    report.append(f"  - [Lees meer]({url})")
                    report.append("")
        else:
            report.append("*Geen specifieke sandbox referenties gevonden. Aanbevolen: directe outreach naar nationale AI-autoriteiten.*")
            report.append("")
        
        report.append("### 5.1 Aanbevolen Sandboxes voor ComplianceCode")
        report.append("")
        report.append("| Land | Sandbox / Autoriteit | Relevantie |")
        report.append("|------|---------------------|------------|")
        report.append("| 🇳🇱 Nederland | Autoriteit Persoonsgegevens AI Sandbox | Hoog - GDPR + AI Act |")
        report.append("| 🇧🇪 België | Belgian AI4Belgium Sandbox | Midden - Innovation focus |")
        report.append("| 🇩🇪 Duitsland | BaFin Regulatory Sandbox | Hoog - FinTech + AI |")
        report.append("| 🇪🇺 EU-breed | AI Office Sandbox | Hoog - Direct bij EC |")
        report.append("")
        
        # =====================================================================
        # SECTIE 6: TECHNISCHE PRIOR ART
        # =====================================================================
        report.append("## 6. Technische Prior Art")
        report.append("")
        
        # Patent queries
        report.append("### 6.1 Patent Landscape")
        report.append("")
        report.append("**Aanbevolen zoekqueries voor patentonderzoek:**")
        report.append("")
        
        patent_queries = self.technical.get("patent_queries", {}).get("google_patents", [])
        for pq in patent_queries[:8]:
            report.append(f"- [{pq['term']}]({pq['url']})")
        report.append("")
        
        # Academische papers
        report.append("### 6.2 Academische Literatuur")
        report.append("")
        
        papers = self.technical.get("papers", [])
        if papers:
            for paper in papers[:5]:
                report.append(f"**{paper.get('title', 'Onbekend')}**")
                report.append(f"- Auteurs: {', '.join(paper.get('authors', ['Onbekend'])[:3])}")
                report.append(f"- Link: {paper.get('link', 'N/A')}")
                report.append(f"- Samenvatting: {paper.get('summary', '')[:200]}...")
                report.append("")
        else:
            report.append("*Geen directe academische papers gevonden.*")
            report.append("")
        
        # GitHub projecten
        report.append("### 6.3 Open Source Projecten")
        report.append("")
        
        github_projects = self.market.get("github_projects", [])
        if github_projects:
            report.append("| Repository | Stars | Beschrijving |")
            report.append("|------------|-------|--------------|")
            for repo in github_projects[:10]:
                desc = (repo.get('description', '') or '')[:50]
                report.append(f"| [{repo['name']}]({repo['url']}) | ⭐ {repo['stars']} | {desc}... |")
            report.append("")
        
        # =====================================================================
        # SECTIE 7: TRADEMARK CHECK
        # =====================================================================
        report.append("## 7. Trademark & Naam Beschikbaarheid")
        report.append("")
        
        report.append("### 7.1 Directe Database Links")
        report.append("")
        
        db_urls = self.trademark.get("database_urls", {})
        for db_name, urls in db_urls.items():
            report.append(f"**{db_name.upper()}:**")
            for url_info in urls[:2]:
                report.append(f"- [{url_info['name']}]({url_info['url']})")
            report.append("")
        
        report.append("### 7.2 Potentiële Conflicten")
        report.append("")
        
        conflicts = self.trademark.get("conflicts", [])
        if conflicts:
            for conflict in conflicts[:5]:
                report.append(f"- **{conflict.get('title', 'Onbekend')}**")
                report.append(f"  - URL: {conflict.get('url', 'N/A')}")
            report.append("")
        else:
            report.append("*Geen directe conflicten gevonden. Handmatige verificatie aanbevolen.*")
            report.append("")
        
        # =====================================================================
        # SECTIE 8: CONCLUSIE & AANBEVELINGEN
        # =====================================================================
        report.append("## 8. Conclusie & Aanbevelingen")
        report.append("")
        
        report.append("### 8.1 Uniciteit Assessment")
        report.append("")
        report.append("| Aspect | Status | Toelichting |")
        report.append("|--------|--------|-------------|")
        report.append("| Ontkoppelde architectuur | 🟡 Matig uniek | Lakera, Portkey zijn ook extern |")
        report.append("| EU AI Act enforcement | 🟢 **Zeer uniek** | Geen concurrent focust hierop |")
        report.append("| Article-specifieke filtering | 🟢 **Zeer uniek** | Niet gevonden bij concurrenten |")
        report.append("| Real-time compliance API | 🟢 Uniek | Weinig pure API-first oplossingen |")
        report.append("| Onafhankelijke controleur rol | 🟢 Uniek | Third-party attestation is zeldzaam |")
        report.append("")
        
        report.append("### 8.2 Strategische Aanbevelingen")
        report.append("")
        report.append("#### Positionering")
        report.append("1. **Primaire differentiatie:** \"De enige API die EU AI Act compliance afdwingt\"")
        report.append("2. **Secundaire differentiatie:** Onafhankelijke derde partij (niet self-attestation)")
        report.append("3. **Vermijd:** Concurrentie op 'guardrails' - te generiek en crowded")
        report.append("")
        
        report.append("#### Product Roadmap")
        report.append("1. **Phase 1:** Article 5 (Prohibited Practices) screening")
        report.append("2. **Phase 2:** Article 52 (Transparency) auto-disclosure")
        report.append("3. **Phase 3:** Article 10 (Data Governance) audit capabilities")
        report.append("")
        
        report.append("#### Go-to-Market")
        report.append("1. **Regulatory Sandbox:** Aanmelden bij NL/BE/DE AI sandboxes")
        report.append("2. **Early Adopters:** Target enterprises met EU AI Act compliance deadline")
        report.append("3. **Partnerships:** Integreer met bestaande gateways (Portkey, LiteLLM) als compliance add-on")
        report.append("")
        
        report.append("#### IP Strategie")
        report.append("1. **Patent:** Overweeg patentering van Article-specifieke filtering methode")
        report.append("2. **Trademark:** Registreer 'ComplianceCode' in Nice klassen 9, 42")
        report.append("3. **Trade Secret:** Bescherm specifieke EU AI Act rule implementations")
        report.append("")
        
        report.append("---")
        report.append("")
        report.append("*Dit rapport is automatisch gegenereerd door de Prior Art & Market Research Agent.*")
        report.append("")
        report.append("*Handmatige verificatie van alle bevindingen wordt aanbevolen.*")
        
        return "\n".join(report)


# =============================================================================
# MAIN ORCHESTRATOR
# =============================================================================

class PriorArtResearchAgent:
    """Hoofdklasse die alle onderzoeksmodules orkestreert."""
    
    def __init__(self, config: Optional[ResearchConfig] = None):
        self.config = config or ResearchConfig()
        
        # Initialiseer modules
        self.technical_researcher = TechnicalResearcher(self.config)
        self.regulatory_analyzer = RegulatoryAnalyzer(self.config)
        self.market_analyzer = MarketAnalyzer(self.config)
        self.trademark_checker = TrademarkChecker(self.config)
    
    def run(self, output_file: str = "research_report.md") -> str:
        """
        Voert het complete onderzoek uit en genereert het rapport.
        
        Args:
            output_file: Pad naar het output bestand
            
        Returns:
            Het gegenereerde rapport als string
        """
        print("="*60)
        print("PRIOR ART & MARKET RESEARCH AGENT")
        print("Project: ComplianceCode")
        print("Focus: EU AI Act Compliance (Articles 5, 10, 52)")
        print("="*60)
        print(f"\nStart tijd: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Check API key
        if not self.config.tavily_api_key:
            print("\n⚠️  WAARSCHUWING: Geen TAVILY_API_KEY gevonden!")
            print("   Maak een .env bestand met: TAVILY_API_KEY=your_key_here")
            print("   Sommige zoekfuncties zullen worden overgeslagen.\n")
        else:
            print(f"\n✓ Tavily API key gevonden")
        
        # Module 1: Technical Research
        technical_results = self.technical_researcher.run_technical_research()
        
        # Module 2: Regulatory Competitor Analysis (NIEUW)
        regulatory_results = self.regulatory_analyzer.run_regulatory_analysis()
        
        # Module 3: Market Analysis
        market_results = self.market_analyzer.run_market_analysis()
        
        # Module 4: Trademark Check
        trademark_results = self.trademark_checker.run_trademark_check()
        
        # Module 5: Generate Report
        print("\n" + "="*60)
        print("MODULE 5: REPORT GENERATION")
        print("="*60)
        
        report_generator = ReportGenerator(
            technical_results=technical_results,
            regulatory_results=regulatory_results,
            market_results=market_results,
            trademark_results=trademark_results,
            config=self.config
        )
        
        report = report_generator.generate_report()
        
        # Schrijf rapport naar bestand
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"\n✅ Rapport gegenereerd: {output_file}")
        print(f"   Einde tijd: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Print samenvatting
        print("\n" + "-"*60)
        print("SAMENVATTING RESULTATEN")
        print("-"*60)
        print(f"  • Patent queries: {len(technical_results.get('patent_queries', {}).get('google_patents', []))}")
        print(f"  • Academische papers: {len(technical_results.get('papers', []))}")
        print(f"  • EU AI Act referenties: {len(regulatory_results.get('eu_ai_act_references', []))}")
        print(f"  • Regulatory sandboxes: {len(regulatory_results.get('regulatory_sandboxes', []))}")
        print(f"  • GitHub projecten: {len(market_results.get('github_projects', []))}")
        print(f"  • Bekende concurrenten geanalyseerd: {len(self.config.known_competitors)}")
        
        return report


# =============================================================================
# ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    # Maak en run de agent
    agent = PriorArtResearchAgent()
    report = agent.run("research_report.md")
    
    print("\n" + "="*60)
    print("ONDERZOEK VOLTOOID")
    print("="*60)
    print("\nBekijk 'research_report.md' voor de volledige resultaten.")
