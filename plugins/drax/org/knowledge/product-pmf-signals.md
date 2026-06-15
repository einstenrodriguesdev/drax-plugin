# PMF Signals & Measurement Protocol
> Status: stub | Applies to: Product Manager, CEO, CTO
> Created: 2026-04-25 | Next review: 2026-07-25

---

## Scope

This document covers:
1. Sean Ellis PMF signal (40% test) — the survey protocol and binary threshold
2. Cohort retention benchmarks by product category
3. North Star metric selection guide
4. Pivot/Persevere decision framework

---

## 1. Sean Ellis PMF Signal — 40% Test

**Origin**: Sean Ellis, founder of GrowthHackers, documented in Startup Marketing Blog and "Hacking Growth" (2017). Used extensively across Y Combinator portfolio companies.

**Protocol:**

Survey active users (users who have engaged in the last 2 weeks) with exactly this question:

> "How would you feel if you could no longer use [product]?"
> A) Very disappointed
> B) Somewhat disappointed
> C) Not disappointed (it isn't really that useful)
> D) N/A — I no longer use [product]

**Threshold:**
- ≥ 40% "Very disappointed" → PMF signal PRESENT → shift to growth mode
- 25–39% → Partial signal — identify which segment is "very disappointed" and double down on them
- < 25% → No signal — remain in discovery mode, do not scale acquisition

**Minimum sample**: 40 active users. Below 40 responses, the score is directional, not reliable.

**Cadence**: Run monthly pre-PMF. Run quarterly post-PMF.

**Action matrix:**

| Score | Mode | PM action | CEO action |
|---|---|---|---|
| ≥ 40% | Growth mode | Shift roadmap to scalability + acquisition loops | Authorize acquisition spend; activate Traffic Manager |
| 25–39% | Segment focus | Identify "very disappointed" segment, narrow ICP, deepen features for that segment | Hold acquisition spend; re-run discovery for non-disappointed segments |
| < 25% | Discovery mode | Run JTBD interviews, update Opportunity Solution Tree, test new solution candidates | Do not scale; review VISION.md assumptions with Chairman if score < 25% for 90 days |

**Reference**: Ellis, S. & Brown, M. (2017). *Hacking Growth*. Crown Business.

---

## 2. Cohort Retention Benchmarks

Retention is measured as the percentage of a cohort (users who started in week N) still active in week N+7 and week N+30.

**Consumer products (B2C):**
| Retention period | Below average | Average | Strong | Best-in-class |
|---|---|---|---|---|
| Day 1 | < 25% | 25–35% | 35–50% | > 50% |
| Day 7 | < 10% | 10–20% | 20–35% | > 35% |
| Day 30 | < 5% | 5–15% | 15–25% | > 25% |

**B2B SaaS:**
| Retention period | Below average | Average | Strong | Best-in-class |
|---|---|---|---|---|
| Week 1 | < 40% | 40–60% | 60–75% | > 75% |
| Month 1 | < 30% | 30–50% | 50–70% | > 70% |
| Month 3 | < 20% | 20–40% | 40–60% | > 60% |

**Sources**: Andreessen Horowitz (a16z) mobile benchmark report; Lenny Rachitsky retention benchmarks (Lenny's Newsletter); GoPractice metrics database.

**Cohort visualization standard:**
Plot retention curves, not averages. A rising retention curve (new cohorts retaining better than old cohorts) is the strongest PMF signal, independent of absolute levels. A flat curve at 20% is better than a declining curve at 25%.

---

## 3. North Star Metric Selection Guide

**Definition**: The single metric that best captures the core value your product delivers to users AND most reliably predicts long-term business outcomes.

**Selection criteria (apply in order):**
1. It measures value delivered to users, not revenue (revenue is a lagging indicator)
2. It correlates with long-term retention (if users do more of this, they stay longer)
3. It is measurable with current instrumentation
4. It is actionable — the product team can ship features that directly move it
5. It is singular — one metric per product, per stage

**Examples by product type:**

| Product type | North Star metric |
|---|---|
| SaaS productivity | Weekly active users who complete core action |
| Marketplace | Successful transactions per week |
| Social product | Messages sent per active user per week |
| Content platform | Content consumed per active user per week |
| B2B tool | Teams/projects created within first 7 days |
| E-commerce | Repeat purchases per user per 90 days |

**Anti-patterns:**
- Revenue as North Star: revenue is a downstream metric, not a value signal
- DAU/MAU as North Star: measures presence, not value delivery
- "Engagement" as North Star: too vague — engagement with what?
- Multiple North Star metrics: creates conflicting prioritization signals

**North Star ≠ KPI**: KPIs are operational health indicators (uptime, support resolution time). North Star measures product value delivery.

---

## 4. Pivot / Persevere Decision Framework

**Trigger**: Quarterly review, OR Sean Ellis score < 25% for 90 consecutive days, OR 30-day retention flat/declining for 2 consecutive cohorts.

**Decision inputs (required before decision):**

1. Sean Ellis score trend (last 3 surveys)
2. Cohort retention curves (last 4 cohorts overlaid)
3. JTBD interview synthesis (are users articulating a struggling moment that matches the product's solution?)
4. Revenue signal (if any): paying users vs. free users retention comparison
5. Organic growth signal: is any cohort arriving via word-of-mouth or organic search?

**Decision matrix:**

| Retention | Ellis score | Organic signal | Decision |
|---|---|---|---|
| Improving | ≥ 25% | Present | Persevere — accelerate discovery on the retained segment |
| Flat | 25–39% | Partial | Pivot ICP — narrow to "very disappointed" segment |
| Declining | < 25% | Absent | Pivot hypothesis — return to VISION.md with Chairman |
| Any | < 25% for 90d | Absent | Escalate to Chairman — kill/pivot/persevere is a board-level decision |

**PM role in pivot decision**:
PM prepares the evidence package (metrics + interview synthesis + cohort curves). PM does NOT make the pivot/kill decision — that belongs to CEO + Chairman. PM surfaces the signal; the system decides.

---

## Status Legend

| Status | Meaning |
|---|---|
| stub | Schema present, content not yet fully researched — use as structural reference |
| draft | Research done, HR review pending |
| approved | HR-approved, production-ready |
| stale | Older than 90 days, scheduled for review |
