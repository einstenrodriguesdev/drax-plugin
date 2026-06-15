# Content — Measurement & Attribution
> Status: stub | Created: 2026-04-27 | Owner: Content Strategist
> Applies to: Content Strategist, CMO, Analytics Attribution Specialist

---

## Purpose

This document defines the pipeline-attributed measurement methodology, metric classification framework, UTM governance protocol, and monthly reporting structure used by the Content Strategist to connect content activity to MQL creation and pipeline influence in a B2B SaaS context.

---

## 1. Metric Classification: Pipeline vs. Vanity

### Pipeline Metrics (Primary — required in all reports)
These are the only metrics that demonstrate content ROI to CMO and founder:

| Metric | Definition | How measured |
|---|---|---|
| Content-sourced MQL | A marketing-qualified lead whose first touch was a piece of content (blog post, white paper download, newsletter sign-up via content CTA) | HubSpot / CRM first-touch attribution; UTM source=organic + UTM content=[piece-slug] appears as first session in contact record |
| Content-influenced MQL | An MQL who interacted with a content piece at any point in their journey before converting | HubSpot multi-touch attribution; contact timeline includes page view or email click of a content asset |
| Content-influenced pipeline ($) | Total pipeline value of opportunities where at least one contact interacted with a content piece before or during the deal | CRM opportunity report filtered by "contact has content touchpoint" |
| Content-attributed opportunity | An opportunity created directly from a content conversion (e.g., lead magnet download → sales qualification → opportunity created) | First-touch opportunity attribution in CRM |

### Engagement Metrics (Secondary — reported but not primary KPI)
| Metric | Benchmark (B2B SaaS) | When it matters |
|---|---|---|
| Avg. time-on-page (long-form) | ≥ 3:30 minutes | Indicates article is read, not bounced |
| Scroll depth (long-form) | ≥ 60% | Indicates content quality; low scroll = wrong audience or weak content |
| Email newsletter click rate | 2–5% | Benchmark: 2.1% median; < 1% = content-audience mismatch |
| LinkedIn post reach | 500–2,000 per post (< 10K followers) | Indicates amplification health |
| Organic sessions (blog) | Monthly trend | Input metric — not outcome metric |

### Vanity Metrics (Explicitly excluded from primary KPI reporting)
- Pageviews without pipeline attribution
- Social media impressions
- Newsletter subscriber count (without click/conversion data)
- Domain authority score
- Content-to-pageview ratio

These appear in the secondary section of monthly reports only — never in the executive summary.

---

## 2. UTM Governance Protocol for Content Attribution

### UTM Parameter Schema for Content

| Parameter | Value pattern | Example |
|---|---|---|
| utm_source | Traffic source | `organic`, `linkedin`, `newsletter`, `partner` |
| utm_medium | Channel type | `social`, `email`, `referral`, `cpc` (if boosted) |
| utm_campaign | Pillar or campaign name | `pillar-revops`, `pillar-churn`, `q2-campaign` |
| utm_content | Specific piece identifier | `blog-churn-prediction-guide`, `case-study-acme` |
| utm_term | Keyword (organic search) | Not required for content; used by Traffic Manager for paid |

### UTM Naming Conventions
- All lowercase, hyphen-separated, no spaces
- utm_content must match the content brief slug exactly: `content-brief-[slug]-[YYYY-MM-DD].md` → `utm_content=[slug]`
- Every CTA inside a content piece must have a UTM-tagged URL before publication
- Every COPE derivative (LinkedIn post, newsletter link) must have a unique utm_medium value so platform-level attribution is separated from organic

### CRM Tagging Protocol
- Every content piece that has a conversion CTA must have a corresponding HubSpot/CRM campaign created with the same slug
- Contact records created through content CTAs are automatically tagged with the content campaign
- Monthly attribution pull: filter CRM contacts by campaign tag → count MQLs, trace to opportunity stage

---

## 3. Attribution Model Selection

### First-Touch Attribution
- **When to use:** measuring content-sourced MQLs — credit goes to the first content piece the lead encountered
- **Limitation:** undervalues content used in mid-funnel (MOFU) that converts existing leads; overvalues TOFU blog content

### Last-Touch Attribution
- **When to use:** measuring conversion-driving content (case studies, comparison guides, white papers with gated CTAs)
- **Limitation:** undervalues top-of-funnel awareness content that started the journey

### Multi-Touch / Content-Influenced
- **When to use:** reporting content-influenced pipeline — any content touchpoint in the contact's journey before MQL or opportunity stage
- **Limitation:** inflates influence numbers; every blog post with > 1 view appears as "influential"
- **How to apply:** require minimum 2 content touchpoints for "influenced" classification (deduplicates accidental visits)

### Decision Table
| Reporting goal | Attribution model to use |
|---|---|
| "Which blog posts generate leads?" | First-touch, filter by utm_source=organic |
| "Which content closes deals?" | Last-touch before opportunity created |
| "What is the total content pipeline footprint?" | Multi-touch, minimum 2 content touchpoints |
| "Content ROI vs. paid channel?" | First-touch CAC comparison: content-sourced MQL cost vs. paid MQL cost |

---

## 4. Content Performance Report Structure

### Monthly Report Section Order (non-negotiable — pipeline first)

**Section 1: Executive Summary (3 bullets max)**
- Content-sourced MQLs this month vs. last month vs. target
- Content-influenced pipeline ($) this month vs. last month
- Top-performing piece (pipeline contribution)

**Section 2: Pipeline Metrics Detail**
Full pipeline metrics table (sourced MQLs, influenced MQLs, influenced pipeline, attributed opportunities) with MoM and QTD comparison.

**Section 3: Top Performing Pieces**
Table: piece title, funnel stage, MQLs sourced, MQLs influenced, pipeline influenced ($), avg. time-on-page, scroll depth.

**Section 4: Underperforming Pieces (Traffic Without Pipeline)**
Pieces with > 200 organic visits but 0 MQLs. Action recommendation per piece: CTA update / angle revision / paid boost / archive.

**Section 5: Engagement Metrics (Secondary)**
Organic traffic trend, email newsletter stats (opens, clicks, unsubscribes), LinkedIn top posts by reach and engagement, scroll depth by content type.

**Section 6: SEO Movement**
Rank position changes for tracked keywords across active pillars. MoM delta. Pieces that dropped > 5 positions flagged for update.

**Section 7: Production Velocity**
Planned vs. delivered per sprint. Cause of any delays. Sprint carry-overs.

**Section 8: Next Month Priorities**
3–5 specific actions: which gaps to address, which underperformers to fix, which pieces to brief, which pillar to advance toward threshold.

---

## 5. Content ROI Calculation

### Content-Sourced MQL Cost (vs. Paid Channels)
```
Content-sourced MQL cost = Total content production cost (period) / Content-sourced MQLs (period)

Where:
- Total content production cost = executor time (hours × hourly rate) + tool costs (Semrush subscription, CMS, etc.)
- Content-sourced MQLs = CRM count of MQLs with first-touch = content UTM
```

Compare monthly against:
- Paid search MQL cost (Traffic Manager report)
- Paid social MQL cost (Traffic Manager report)
- Target blended MQL cost from CMO GTM.md

### Content-Influenced Pipeline Multiplier
```
Content-influenced pipeline multiplier = Content-influenced pipeline ($) / Total pipeline created (period)
```
Target: ≥ 30% of total pipeline influenced by content in mature content programs (Series A+). At pre-seed/seed, target ≥ 10% as baseline.

---

## 6. Monthly Review Cadence

| Review | Cadence | Participants | Output |
|---|---|---|---|
| Content performance review | Monthly (first week of following month) | Content Strategist + CMO | Performance report approved / actions assigned |
| Pipeline attribution reconciliation | Quarterly | Content Strategist + Analytics Attribution Specialist | UTM accuracy check, attribution model consistency confirmed |
| SEO-content alignment review | Quarterly | Content Strategist + SEO Manager | Keyword rank movements vs. content published, pillar coverage gaps updated |

---

## Sources

- Animalz — B2B SaaS Content Strategy (pipeline-first measurement principle): https://www.animalz.co/blog/content-marketing-strategy
- HubSpot — Content Attribution in HubSpot (first-touch vs. multi-touch attribution models)
- Pulp Strategy — Building a Modern Content Stack 2025: https://www.pulpstrategy.com/building-a-modern-content-stack-creative-data-distribution-for-scalable-growth
- Orbit Media Studios — Annual Content Marketing Study (engagement benchmarks)
- Quantum Metric Content Strategy Lead job posting: https://jobs.lever.co/quantummetric/8249c3ae-e253-4330-95bd-6e405036a61f
