# Automation — Lead Scoring Architecture
> Status: stub | Created: 2026-04-28 | Applies to: Marketing Automation Specialist
> Content to be populated on first use by Marketing Automation Specialist agent.

---

## Schema

This document covers the following domains when populated:

### 1. Dual-Track Scoring Architecture
- Explicit score (firmographic fit): definition and role in MQL qualification
- Implicit score (behavioral engagement): definition and role in MQL qualification
- Why both scores must cross their respective thresholds simultaneously (the AND rule — not OR)
- How to set initial threshold values before closed-won data is available (estimation method)
- How to recalibrate thresholds from closed-won deal audit

### 2. Explicit Scoring Criteria Taxonomy
- Job title scoring bands: decision-maker, influencer, end user, disqualifier
- Company size tiers: ideal, acceptable, stretch, exclude
- Industry match scoring: primary ICP industry, adjacent industry, out-of-ICP penalty
- Geography scoring: target region, secondary region, out-of-scope penalty
- Technographic signals: target technology stack match (if product has integration value)
- Hard exclude rules: criteria that set score to 0 or flag as DQ regardless of behavioral score

### 3. Behavioral Scoring Table (Conversion-Proximity Weighted)
- Standard conversion-proximity weight scale: pricing page (+15), demo abandonment (+12), ROI calculator (+10), product tour (+8), webinar attended (+6), feature comparison (+5), case study download (+4), blog download (+3), email click (+2), email open (+1)
- How to adjust weights for different sales cycle lengths (short cycle = weight recency more heavily)
- Actions that should NOT be scored (homepage visit — too generic, social media like — no purchase intent)
- Negative scoring: unsubscribe (exit + reset), spam complaint (permanent suppress), competitor job title (flag, reduce score)

### 4. Score Decay Protocol
- Signal decay: mechanism, rate selection (points subtracted per N days of inactivity), MAP implementation method for HubSpot and Marketo
- Strategy-change decay: trigger conditions (ICP revision, product pivot, pricing change), recalibration checklist
- Half-life principle: behavioral actions lose relevance over time relative to sales cycle length — if average sales cycle is 90 days, a 90-day-old pricing page visit should carry minimal weight
- How to implement decay in HubSpot (scoring rule with inactivity condition) vs. Marketo (decay campaign with weekly cadence)

### 5. Predictive Scoring Decision Gate
- When to move from manual rule-based scoring to ML-based predictive scoring: minimum data requirements (typically 500+ closed-won deals), platform requirements (HubSpot Predictive Lead Scoring — Enterprise tier; Marketo Predictive Content — Advanced)
- Risk of premature ML adoption: insufficient data produces random scoring; overrides human-validated criteria; black-box model cannot be explained to sales
- Hybrid approach: manual explicit scoring (firmographic) + ML implicit scoring (behavioral) — available in HubSpot Enterprise

### 6. Scoring Model Recalibration Protocol
- Trigger conditions: semi-annual mandatory, SAL rejection rate >30% for 2 months, ICP change, major product change
- Recalibration method: pull closed-won deals (last 6 months) → audit lead score at MQL trigger → identify which scoring criteria correlated with closed-won vs. closed-lost → adjust weights → get sales sign-off → document in scoring model file
- Adobe/Marketo 2025 recommendation: treat scoring model as a living document reviewed monthly (lightweight) and recalibrated every 6 months (full)
- Sales alignment sign-off requirement: every threshold change must be documented with the name and date of the sales-side approver

### 7. MQL Threshold Definition Method
- How to set the initial MQL threshold without historical data: start with a threshold that produces ~10-20 MQLs per month (adjust up or down based on SAL rejection feedback in months 1-2)
- MQL volume vs. quality tradeoff: lower threshold = more MQLs, lower quality; higher threshold = fewer MQLs, higher quality. Early-stage B2B SaaS: favor quality over volume (SDRs have limited capacity)
- The target MQL-to-SQL conversion rate range: 20-35% for early-stage B2B SaaS. Below 15% = model too permissive. Above 40% = model too restrictive (pipeline starved).
- How to document the MQL definition for sales: plain-language description + numeric threshold + example lead profiles at MQL boundary

### 8. Lead Routing Rules
- Minimum routing segmentation: enterprise tier (large company size, high-seniority title) vs. SMB tier (small company size, IC-level title)
- SLA definition by routing queue: enterprise leads require faster follow-up (4-hour target) than SMB leads (24-hour target)
- SAL rejection handling: rejected MQL must be recycled to a specific nurture stream — not dropped. Define which stream receives recycled MQLs (typically Re-engagement or Consideration).
- Routing to territory: if the company has geographic sales territories, routing rules must route by lead geography, not just by company size
