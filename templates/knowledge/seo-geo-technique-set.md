# SEO/GEO Technique Set

Bundled reference for the DRAX V1.1.0 `seo-manager` worker. The worker role embeds the operative essentials directly, so this file is supplementary depth and not a hard runtime dependency for a customer clone.

GEO means Generative Engine Optimization: optimizing owned content so ChatGPT, Perplexity, Claude, Google AI Overviews, and other answer engines can cite, quote, and summarize it accurately.

The Princeton GEO study, published at ACM KDD 2024, is the anchor reference. Across a large query set, it found that GEO tactics can lift visibility in generative answers by up to 40 percent. The top five citation-lifting tactics were:

1. Cite Sources
2. Quotation Addition
3. Statistics Addition
4. Fluency Optimization
5. Authoritative Voice

For DRAX V1.1.0, quotable statistics are the highest-leverage tactic because they give answer engines crisp, attributable claims to quote.

## Technical SEO

### Schema.org JSON-LD

What: Emit structured data per page.

Why: Schema gives crawlers and answer engines a machine-readable map of the page entity, author, date, breadcrumb, and Q&A structure.

How DRAX implements it:

- Blog post: `Article` with headline, author `Person`, `datePublished`, `dateModified`, publisher `Organization`, and `BreadcrumbList`.
- FAQ section: add `FAQPage` when Q&A content exists.
- Procedural post: add `HowTo` only when the article actually teaches ordered steps.
- Site-wide: use `Organization` and `WebSite` where the blog surface has the needed identity.

Brief field: `schema_types: []`.

### Sitemap, robots.txt, and canonical

What: Make the blog surface crawlable and unambiguous.

Why: Only canonical, indexable, 200-status URLs should compound. Citation engines cannot cite blocked pages.

How DRAX implements it:

- Generate a sitemap for the blog surface.
- Reference the sitemap from `robots.txt`.
- Allow AI crawlers when the founder has approved public indexing: GPTBot, ClaudeBot, PerplexityBot, and Google-Extended.
- Emit one canonical URL per page using the founder-approved canonical base URL.

Brief fields: `pillar_url`, `internal_links`, `schema_types`, and technical notes in `citation_points` when page-level changes are needed.

### Core Web Vitals for static Astro

What: Keep article HTML fast, stable, and crawler-readable.

Why: Static HTML exposes the body content to crawlers without requiring client-side JavaScript execution.

How DRAX implements it:

- Prefer static article HTML.
- Keep client islands minimal.
- Use explicit image dimensions to prevent layout shift.
- Preserve text in the rendered HTML, not only in client-side scripts.

### Internal linking architecture

What: Build a pillar and cluster system.

Why: Topic coverage and internal links help search engines and LLMs understand the site as a coherent authority on one subject.

How DRAX implements it:

- Assign every post to `cluster_id`.
- Link cluster articles up to a `pillar_url`.
- Link to at least 3 relevant internal targets when they exist.
- Use descriptive anchors that include entity or intent language.

Brief field: `internal_links: [{url, anchor}]`.

### llms.txt

What: A proposed markdown index for LLM-oriented discovery.

Why: Current evidence is weaker than schema, crawlability, internal links, and extractable answers. It can help coding agents and some retrieval flows, but it is not a V1.1.0 blocking feature.

How DRAX implements it: later. Do not block V1.1.0 blog generation on `llms.txt`.

## On-Page SEO

### Search-intent mapping

What: Map each query to one dominant intent.

Why: Intent determines whether the post should be a guide, comparison, how-to, listicle, or sales-oriented page.

How DRAX implements it:

- `informational`: guides, definitions, tutorials, FAQs.
- `commercial`: comparisons, alternatives, best-tools, evaluation pages.
- `transactional`: buy, pricing, deploy, install, service intent.
- `navigational`: brand or product lookup.

Brief fields: `search_intent` and `serp_format`.

### Keyword and entity coverage

What: Pair one primary keyword with secondary queries and named entities.

Why: Answer engines cite pages that are semantically complete and clear about entities.

How DRAX implements it:

- Choose exactly one primary keyword.
- Choose 3 to 6 secondary or long-tail keywords when enough evidence exists.
- Define each important entity on first use.
- Keep product, category, buyer, workflow, standard, and platform names consistent.

Brief fields: `target_keywords` and `entity_blocks`.

### Topical authority and clusters

What: Organize posts around pillars and subtopics.

Why: A cluster compounds authority better than isolated posts.

How DRAX implements it:

- Assign `cluster_id`, `subtopic`, and `pillar_url`.
- Prefer completing a cluster before opening unrelated topics.
- Avoid keyword cannibalization by assigning one primary keyword to one page.

Brief fields: `cluster_id`, `subtopic`, `pillar_url`, and `internal_links`.

### E-E-A-T signals

What: Show experience, expertise, authoritativeness, and trustworthiness.

Why: Named authors, visible dates, source quality, and consistent organization identity help search and answer engines assess trust.

How DRAX implements it:

- Include `author`.
- Include `dateModified`.
- Require primary or authoritative sources for factual claims.
- Keep founder-approved claims and safety boundaries intact.

Brief fields: `author`, `dateModified`, and `citation_points`.

### Heading structure and meta

What: Use question-formatted H2s and concise metadata.

Why: Question H2s map directly to conversational search and answer-engine retrieval.

How DRAX implements it:

- Every `question_h2s` item is a real user question.
- The copywriter answers first in 40 to 60 words under each question H2.
- Meta title is 60 characters or fewer.
- Meta description is 155 characters or fewer.

Brief fields: `question_h2s`, `meta_title`, and `meta_description`.

### Freshness

What: Stamp and refresh time-sensitive content.

Why: Answer engines prefer recent sources for topics that change.

How DRAX implements it:

- Set `dateModified`.
- Prefer recent source dates for statistics and citations.
- Mark stale or missing date evidence as `NEEDS_DECISION`.

## GEO Techniques

### Quotable statistics and data

What: Add crisp, sourced statistics.

Why: Princeton GEO identifies Statistics Addition as a top citation-lifting tactic, and DRAX treats quotable statistics as the highest-leverage V1.1.0 GEO move.

How DRAX implements it:

- Minimum 3 `quotable_stats` per brief.
- Each item has `claim`, `value`, `source`, and `date`.
- The copywriter places one cited statistic roughly every 150 to 200 words when article length allows.
- The statistic should name the source inline.

Brief field: `quotable_stats: [{claim, value, source, date}]`.

### Structured extractable answers

What: Put a direct answer under each question heading before the expansion.

Why: Retrieval systems prefer self-contained passages.

How DRAX implements it:

- Each question H2 gets a 40 to 60 word answer-first chunk.
- Avoid pronouns that depend on earlier context.
- Use tables for comparisons and ordered lists for steps when the topic calls for it.

Brief field: `question_h2s`.

### FAQ and FAQPage

What: End with 3 to 6 self-contained Q&A items.

Why: Q&A pairs are explicit citation candidates and map to conversational queries.

How DRAX implements it:

- Include 3 to 6 FAQ items.
- Include `FAQPage` in `schema_types` when FAQ is present.
- Keep answers 40 to 80 words when possible.

Brief field: `faq: [{q, a}]`.

### Authoritative citations and voice

What: Cite primary or authoritative sources and use clear expert prose.

Why: Princeton GEO names Cite Sources, Quotation Addition, and Authoritative Voice among the top tactics.

How DRAX implements it:

- List citation-worthy claims in `citation_points`.
- Prefer primary studies, official docs, standards bodies, reputable datasets, and named expert sources.
- Write in declarative prose.
- Avoid hype, vague superlatives, fake urgency, invented customer stories, and unsupported commercial claims.

Brief field: `citation_points`.

### Entity clarity

What: Make named concepts unambiguous.

Why: LLMs cite content they can map to a known entity with confidence.

How DRAX implements it:

- Define important entities in `entity_blocks`.
- Normalize acronyms.
- Use consistent product, category, and buyer names from founder artifacts.

Brief field: `entity_blocks`.

### Off-site seeding

What: Build repeated mentions across trusted third-party surfaces.

Why: AI answer engines weight repeated cross-source entity evidence.

How DRAX implements it: later. V1.1.0 controls the owned blog surface only.

## V1.1.0 Brief Template

```yaml
target_keywords:
  primary: ""
  secondary: []
search_intent: informational|commercial|transactional|navigational
serp_format: guide|comparison|how-to|listicle
cluster_id: ""
subtopic: ""
pillar_url: ""
schema_types: []
question_h2s:
  - h2: ""
    answer_first_40_60_words: ""
entity_blocks:
  - entity: ""
    definition: ""
    attributes: []
quotable_stats:
  - claim: ""
    value: ""
    source: ""
    date: ""
citation_points: []
faq:
  - q: ""
    a: ""
internal_links:
  - url: ""
    anchor: ""
meta_title: ""
meta_description: ""
author: ""
dateModified: ""
```

Minimums:

- `quotable_stats`: at least 3.
- `faq`: 3 to 6.
- `internal_links`: at least 3.
- `meta_title`: 60 characters or fewer.
- `meta_description`: 155 characters or fewer.
- `question_h2s`: each answered first in 40 to 60 words.
- `schema_types`: include `Article`; include `FAQPage` when FAQ exists; include `BreadcrumbList` unless forbidden by founder artifacts.

## Sources

- Princeton GEO study, ACM KDD 2024: https://collaborate.princeton.edu/en/publications/geo-generative-engine-optimization/
- GEO paper on arXiv: https://arxiv.org/pdf/2509.08919
- Semrush most-cited domains study: https://www.semrush.com/blog/most-cited-domains-ai/
- Semrush content optimization for AI search: https://www.semrush.com/blog/content-optimization-ai-search-study/
- Semrush LLM seeding: https://www.semrush.com/blog/llm-seeding/
- Ahrefs AI Overview citation discussion: https://news.designrush.com/ai-overview-citations-drop-ahrefs
- Surfer AI Citation Report: https://surferseo.com/blog/ai-citation-report/
- Wellows AI Overview ranking factors: https://wellows.com/blog/google-ai-overviews-ranking-factors/
- Topical authority clusters for AI search citations: https://www.getpassionfruit.com/blog/topical-authority-clusters-for-ai-search-citations
- SE Ranking search intent and E-E-A-T data: https://seranking.com/blog/search-intent/
- Schema markup for AI visibility: https://ailabsaudit.com/blog/en/schema-markup-ai-visibility-guide
- FAQ rich-result removal and schema discussion: https://www.searchenginejournal.com/serp-faq-removal-new-data-challenge-schemas-ai-search-value/574993/
- Google structured data retirement discussion: https://www.engagecoders.com/google-retires-7-structured-data-features-to-streamline-search-results/
- llms.txt crawler audit: https://www.longato.ch/llms-recommendation-2025-august/
- llms.txt effectiveness discussion: https://www.indexlab.ai/blog/llms-txt-does-it-actually-work-october-2025-updated
- Astro SEO guide: https://eastondev.com/blog/en/posts/dev/20251202-astro-seo-complete-guide/
- Content chunking and AI extractability: https://www.lumar.io/blog/best-practice/content-chunking-ai-extractability-geo-aeo-explainer/
