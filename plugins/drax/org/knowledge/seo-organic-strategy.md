# SEO Organic Strategy
> Status: stub | Created: 2026-04-26 | Owner: SEO Manager
> Applies to: SEO Manager, CMO
> Source: HR research — Stripe SEO job postings, Lenny's Newsletter SEO strategy, Search Engine Land Pillar-Cluster guide, GEO/AEO industry documentation (2025)

---

## Purpose

This doc covers the strategic frameworks the SEO Manager applies when building or revising the organic acquisition architecture. It is loaded REQUIRED before any keyword roadmap work or content brief development.

---

## 1. Pillar-Cluster / Topical Authority Architecture

### Model

A topic cluster is a group of content pages organized around a central pillar page:
- **Pillar page**: 3,000–5,000 words; targets a broad, high-volume keyword; covers the full topic at a high level; links to every cluster page; serves as the canonical authority for the subject.
- **Cluster pages**: 1,200–2,500 words; each targets a specific subtopic keyword; covers one aspect of the pillar topic in depth; links back to the pillar using the pillar's target keyword as anchor text.

### Why it works

Google's ranking system rewards topical depth and internal coherence. A site that covers one topic comprehensively (pillar + all major subtopics) signals to the ranking system that it is the authoritative source for that subject. HireGrowth (2025) analysis: content in clusters drives ~30% more organic traffic and holds rankings 2.5x longer than standalone pages.

### Internal linking rules

- Every cluster page links to its pillar page (anchor text = pillar target keyword)
- The pillar page links to every cluster page (anchor text = cluster target keyword)
- Cluster pages may link to adjacent cluster pages when topically related
- Cross-cluster links are acceptable; do not create cross-cluster pillar-to-pillar links (confuses topical authority)

### Pillar page specification

- Word count: 3,000–5,000 words
- H1: includes primary broad keyword
- H2 structure: one H2 per major subtopic (each subtopic = one cluster page)
- Each H2 section: 200–400 words; links to the corresponding cluster page
- Meta description: includes primary keyword + "complete guide" or "everything you need to know"
- Schema: Article + BreadcrumbList

### Cluster page specification

- Word count: 1,200–2,500 words
- H1: includes specific cluster keyword
- Mandatory backlink to pillar: in the first paragraph or in a "Related: [Pillar Topic] Guide" callout
- Schema: Article + FAQPage (if FAQ section present)

---

## 2. Intent-Layer Keyword Segmentation (TOFU/MOFU/BOFU)

### Intent classification

| Layer | Search intent | Query type | Content format | Conversion path |
|---|---|---|---|---|
| TOFU (Top of Funnel) | Informational | "how to X", "what is X", "X explained" | Blog post, guide, tutorial | Internal link to MOFU page or content upgrade |
| MOFU (Middle of Funnel) | Commercial / comparative | "best X for Y", "X vs Y", "X alternatives", "X for [ICP role]" | Comparison page, use case page, solution page | CTA to demo, trial, or free tier |
| BOFU (Bottom of Funnel) | Transactional | "X pricing", "buy X", "X software", "X tool" | Pricing page, landing page, product page | Direct conversion CTA (sign up, start free trial, contact sales) |

### Priority scoring model

Every keyword in the roadmap receives a priority score:

```
Priority Score = (Monthly Search Volume × Intent Weight) / Keyword Difficulty
```

Intent weights:
- BOFU: 3.0
- MOFU: 2.0
- TOFU: 1.0

This model ensures BOFU and MOFU keywords with moderate search volume rank above high-volume TOFU keywords in the production queue, because they produce measurable pipeline, not just traffic.

### Conversion path requirement

No keyword enters the roadmap without a conversion path:
- TOFU keywords: must have a specified internal link target (the MOFU page the reader goes to next) and a content upgrade or email capture offer.
- MOFU keywords: must have a CTA (demo request, free trial, case study download) visible in the page structure without scrolling below the first H2.
- BOFU keywords: must link directly to a conversion action. No informational padding before the CTA.

---

## 3. E-E-A-T Signal Architecture

### Components

Google's quality evaluator framework (Experience, Expertise, Authoritativeness, Trustworthiness) applies to content quality assessment. In the Conclave context (no human author), E-E-A-T signals must be explicitly constructed:

**Experience**: First-hand evidence that the content comes from direct involvement with the subject:
- Include proprietary data, original examples, or real case outcomes — not only curated secondary sources.
- Avoid "according to industry reports" constructions without attribution — cite specific named sources.

**Expertise**: Author or entity credentials visible on the page:
- Author byline with clear credential signal (role, company, years of experience, domain-specific credential)
- Author bio page that establishes the entity in the knowledge graph (LinkedIn, industry citations, third-party references)
- In the Conclave no-human context: establish the company entity in Google's Knowledge Graph via Organization schema, consistent NAP (Name, Address, Phone), and About page

**Authoritativeness**: Third-party recognition:
- Links from authoritative domain-relevant sites (domain rating 50+, topically relevant)
- Mentions in industry publications
- Structured data that communicates entity relationships (schema.org)

**Trustworthiness**: Factual accuracy and transparency signals:
- Cite primary sources (academic, government, tier-1 industry) — not secondary summaries
- Date-stamp content and include a "last updated" note
- Include a clear editorial policy or "about this content" statement
- HTTPS required; no mixed-content pages

### Schema markup requirements by page type

| Page type | Required schema types |
|---|---|
| Blog post / article | Article, BreadcrumbList, Author |
| FAQ section | FAQPage |
| How-to content | HowTo |
| Product / service page | Product or Service, BreadcrumbList |
| Homepage | Organization, WebSite |
| Comparison / review page | Review or ItemList |

---

## 4. GEO/AEO Content Checklist

### Definitions

**GEO (Generative Engine Optimization)**: Optimizing content to be cited by LLMs (ChatGPT, Perplexity, Gemini, Claude) in their AI-generated responses. LLMs retrieve content from vector-based semantic search — they prioritize content with clear entity definitions, structured data, and authoritative primary source citations.

**AEO (Answer Engine Optimization)**: Optimizing content to appear in AI-powered search answer surfaces (Google AI Overviews, featured snippets, direct answer boxes). Prioritizes question-formatted headings, concise definition blocks, and FAQ schema.

### Context: why this is non-optional in 2026

Ahrefs (2025) measured that Google AI Overviews reduced CTR for top-ranking content by 58% year-over-year. A page that ranks #1 in organic results but is not cited in the AI Overview for that query loses the majority of potential clicks to the zero-click AI answer. GEO/AEO optimization is the layer that captures citations in those AI surfaces — without it, traditional organic rankings produce declining returns.

### GEO/AEO checklist — applied to every content brief

- [ ] **Entity definition block**: First paragraph or first H2 section contains a 2–3 sentence definition of the primary topic entity (the subject of the page). Format: "[Entity] is [definition]. It [does / provides / enables] [core function]. [Specific, concrete example]."
- [ ] **Question-formatted H2 headings**: At least 3 H2 headings formatted as questions that match probable AI search queries ("What is X?", "How does X work?", "What are the benefits of X?")
- [ ] **FAQ schema**: FAQPage schema applied to a section containing 3–8 Q&A pairs. Questions must be exact-match to high-volume "People Also Ask" queries for the primary keyword.
- [ ] **Primary source citations**: At least 2 external links to primary sources (academic paper, government data, original research, or tier-1 industry publication) — not secondary summaries.
- [ ] **Structured data validation**: All schema types validated via Google's Rich Results Test and Schema.org validator before publish.
- [ ] **Concise answer blocks**: For every informational H2, include a 1–2 sentence "direct answer" at the start of the section before elaborating. This is the extractable answer LLMs retrieve.
- [ ] **Content freshness signal**: Include explicit "last updated" date. LLMs and AI Overview systems favor recent content.

---

## 5. Programmatic SEO Build Gate

### When programmatic SEO is appropriate

Programmatic SEO — generating hundreds or thousands of pages from a structured dataset — is appropriate only when all three conditions are met:
1. **Unique value per page**: Each generated page contains a proprietary data point or combination that cannot be found on a competitor's equivalent page. Variable substitution ("Best [location] [service]") without unique data = thin content.
2. **Structured dataset is clean**: The source dataset has been validated for accuracy, completeness, and coverage. Pages generated from incorrect or incomplete data are worse than no pages.
3. **Crawl budget is pre-allocated**: A large programmatic page set must not consume crawl budget needed to index the site's core pages. Crawl budget plan defines: which page types get crawl priority, how the programmatic pages are linked from the site (hub pages, sitemaps), and what the expected crawl frequency is.

### Build gate checklist

- [ ] Unique proprietary data point per page documented
- [ ] Thin-content audit: randomly select 5 generated page variants and evaluate whether each passes Google's Helpful Content standard independently
- [ ] Crawl budget plan: calculated as (total indexed pages × expected crawl rate) — programmatic pages must not exceed 40% of crawl budget without a hub page architecture that controls crawl access
- [ ] Cannibalization check: no programmatic page targets a keyword already owned by a pillar or cluster page
- [ ] Template quality review: confirm the template produces grammatically correct, contextually accurate content at the variable substitution points

---

## Status legend

This is a stub document. The schemas, frameworks, and checklists above are structurally complete but the specific benchmark values (volume thresholds, difficulty ranges, schema validation tools) require population from active keyword research and site audit data when the SEO Manager is first activated. Update this doc after the first quarterly roadmap build.
