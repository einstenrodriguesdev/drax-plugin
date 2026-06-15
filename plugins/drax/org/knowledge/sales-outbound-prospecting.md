# Sales Outbound Prospecting
> Applies to: BDR, VP Sales, CRO
> Status: stub
> Created: 2026-04-28 by HR agent

---

## Scope

This document covers the operational mechanics of B2B outbound prospecting for a BDR operating in a Conclave context. It defines: ICP-tiered account classification, multi-channel cadence architecture, buyer intent signal taxonomy, personalization formula, sequence exit criteria, and A/B test design for outreach variants.

---

## ICP-Tiered Account Classification

**Tier 1 — Ideal Fit (60% of BDR time)**
All three signal types present simultaneously:
- Firmographic match: industry, company size (headcount + revenue range), geography — all match ICP criteria defined in GTM.md
- Technographic match: tech stack includes prerequisite tools or excludes disqualifying competitors — verified via G2, BuiltWith, LinkedIn job postings
- Behavioral intent signal: account shows active research behavior — defined below in Intent Signal Taxonomy

Outreach approach: hyper-personalized. One custom first line referencing a specific trigger event. 15-20 minutes of research per account. Never use templated openers for Tier 1.

**Tier 2 — Partial Fit (30% of BDR time)**
Two of three signal types present. Missing one firmographic, technographic, or intent dimension.

Outreach approach: semi-personalized. Industry-specific template with account-level customization on at least one dimension (trigger event or pain hypothesis). 5-8 minutes of research per account.

**Tier 3 — Exploratory (10% of BDR time)**
One signal type present or account included for volume. Low prior evidence of fit.

Outreach approach: automated volume sequence. Generic ICP-level messaging. No account-specific research. Not suitable for senior buyers or enterprise accounts — Tier 3 outreach sent to senior decision-makers permanently burns the account.

---

## Buyer Intent Signal Taxonomy

**Tier 1 intent signals (high-conviction):**
- G2 Buyer Intent: account actively browsing your category on G2 in the last 30 days
- Bombora surge score: account showing above-threshold research activity on topic clusters matching your product category
- Pricing page visit via tracked UTM in existing content (if CRM has visitor identification)
- LinkedIn signal: decision-maker in the account viewed your company page or engaged with your posts in the last 14 days

**Tier 2 intent signals (moderate-conviction):**
- Job posting signal: company is hiring a role that indicates they are building the capability your product addresses (e.g., hiring "Head of Revenue Operations" = RevOps platform intent)
- Funding event in last 90 days (Series A/B = investment in tooling phase)
- Company news: new product launch, expansion announcement, or press release signaling a relevant business change
- Technographic gap: company uses a competitor's adjacent tool but not the specific category your product addresses

**Tier 3 intent signals (low-conviction):**
- Company fits firmographic criteria but no behavioral signal detected
- Company is in target industry but no technographic or news signal
- Cold account with no recent engagement data

---

## Multi-Channel Cadence Architecture

**Standard cadence structure (8-step, 21-day sequence):**

| Step | Day | Channel | Purpose | Personalization level |
|---|---|---|---|---|
| 1 | Day 1 | Email | First touch — pain hypothesis + value prop | Tier 1: custom. Tier 2: semi-custom. Tier 3: template |
| 2 | Day 3 | LinkedIn | Connection request with note — social proof | Short note referencing shared context or trigger event |
| 3 | Day 5 | Phone | Live objection handling + qualification probe | Prepared with BANT hypothesis from email research |
| 4 | Day 7 | Email | Follow-up — reference signal or content asset | Reference trigger event or relevant case study |
| 5 | Day 10 | LinkedIn | Engage with prospect's post (if active) OR DM | Genuine engagement — not a pitch |
| 6 | Day 13 | Phone | Second call attempt — different time of day | |
| 7 | Day 17 | Email | The "break-up" style — low-pressure CTA | |
| 8 | Day 21 | Email | Final touch — future-dated re-engagement offer | |

**Delay rules:**
- Days 1-7: 2-3 day intervals (prospect attention is highest when signal is fresh)
- Days 7-21: 4-5 day intervals (respect prospect's pace, avoid harassment perception)

**Exit criteria (before Step 8):**
- Reply received (positive or negative) → exit sequence, log reply, proceed to call or disqualification
- Hard bounce → remove from sequence, update contact data
- Unsubscribe → remove permanently, log in CRM suppression list
- Meeting booked → exit sequence, create discovery call note

---

## Personalization Formula (Tier 1)

Every Tier 1 email opening line must contain at least two of four elements:

1. **Trigger event reference**: a specific, recent, verifiable event about the account or contact (funding round date + amount, job posting that signals intent, product launch, earnings report, press mention)
2. **Pain hypothesis**: a specific problem framed as a cost or risk — not a generic benefit statement. "Companies in [industry] at [headcount range] typically spend X hours/week on [problem] before they find a scalable solution" — not "we help companies improve efficiency"
3. **Social proof**: a named customer in the same industry or segment who experienced the pain and resolved it with your product — not a generic "our customers love us"
4. **Constrained CTA**: a specific, low-commitment ask — "15-minute call on [specific date]" — not "let me know if you're interested" and not "schedule a demo" (demo = high commitment for first touch)

**What disqualifies a Tier 1 email:**
- Opening with "I hope this finds you well" or any generic greeting
- Referencing your product before referencing the prospect's situation
- Listing features before establishing pain
- CTA that asks for more than 20 minutes on a first touch

---

## A/B Test Design for Outreach

**Test discipline:**
- One variable per test. Never test subject line AND opening line simultaneously.
- Minimum 50 touches per variant before drawing a conclusion.
- Hypothesis required before starting: "[Variable A] will produce a higher [reply rate / meeting rate] than [Variable B] for [ICP segment] because [reasoning]."
- Result documentation: actual rates, statistical confidence if measurable, conclusion (scale A / scale B / inconclusive), date of conclusion.

**Testable variables (in order of highest expected impact):**
1. Subject line (open rate impact)
2. Opening line (reply rate impact — highest leverage variable)
3. Call-to-action framing (meeting booked rate)
4. Social proof reference (reply rate when prospect recognizes the reference company)
5. Sequence step count (meeting rate at shorter vs. longer cadence)
6. Day/time of first touch (open rate by day of week and time of day)

**What not to test simultaneously:**
Do not run more than 2 active A/B tests on the same ICP segment at once. Signal pollutes — sequence performance cannot be attributed to a single variable when multiple are changing.

---

## Sequence Exit and Recycle Protocol

**Hard disqualification (remove from all sequences):**
- Unsubscribe request
- Explicit "not interested and please remove me"
- Out of business / acquired / major restructuring that removes them from ICP

**Soft disqualification (recycle in 90 days):**
- "Not the right time" — log with date, re-enroll in 90-day recycled sequence
- "Already have a solution" — log current vendor, add to competitive displacement watch list, re-enroll in 180 days
- No reply after all 8 steps — add to low-touch nurture list, route contact data to Marketing Automation Specialist for email nurture enrollment

**ICP drift detection:**
When 30%+ of disqualifications in a given week share the same specific reason (e.g., "revenue too small," "wrong tech stack"), log this as an ICP drift signal in the pipeline report. Flag for CRO and CMO review — the ICP criteria in GTM.md/REVENUE.md may need refinement.
