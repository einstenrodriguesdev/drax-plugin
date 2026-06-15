# Product Discovery Frameworks
> Status: stub | Applies to: Product Manager
> Created: 2026-04-25 | Next review: 2026-07-25

---

## Scope

This document covers the core decision frameworks the Product Manager uses during discovery and prioritization:
1. Teresa Torres — Opportunity Solution Tree
2. RICE Prioritization (Intercom) — worked protocol
3. OKR Alignment Gate — backlog governance rule

---

## 1. Opportunity Solution Tree (Teresa Torres)

**Purpose**: Prevent the single-option trap — jumping from problem statement directly to the first viable solution without mapping the opportunity space.

**Structure:**
```
Desired Outcome (North Star metric improvement)
  └── Opportunity Node 1 (customer need / pain / desire)
        └── Solution Candidate A
              └── Assumption Test 1a
              └── Assumption Test 1b
        └── Solution Candidate B
              └── Assumption Test 2a
  └── Opportunity Node 2
        └── Solution Candidate C
  └── Opportunity Node 3
        └── Solution Candidate D
        └── Solution Candidate E
```

**Rules:**
- Desired outcome must be a business metric — not a feature ("increase 30-day retention from 38% to 50%", not "add notifications").
- Opportunities are customer needs extracted from JTBD interviews — not solutions. "Users want a notification system" is a solution. "Users lose context when they close the tab" is an opportunity.
- Every branch requires at minimum 2 solution candidates — one solution per branch is the single-option trap.
- Assumption tests are small, fast experiments (prototype + 5 users, or analytics query, or 30-min interview) — not sprints.
- Move to PRD only after at least one assumption test validates the solution candidate.

**Output**: A visual (or structured text) tree embedded in PRODUCT.md under "Opportunity Solution Tree" section. Updated whenever discovery round adds a new opportunity or invalidates a branch.

**References**: Torres, T. (2021). *Continuous Discovery Habits*. Product Talk LLC. ISBN 9781736633304.

---

## 2. RICE Prioritization Protocol (Intercom)

**Purpose**: Replace instinct and stakeholder pressure with a scored, defensible prioritization method for the sprint backlog.

**Formula**: RICE = (Reach × Impact × Confidence) ÷ Effort

**Input definitions:**

| Factor | Definition | Scale | Source |
|---|---|---|---|
| Reach | How many users does this affect per sprint cycle (2 weeks)? | Raw number (users/period) | Analytics data or founder estimate |
| Impact | How much does this move the North Star metric per user who receives it? | 3 = massive, 2 = high, 1 = medium, 0.5 = low, 0.25 = minimal | PM calibration against North Star |
| Confidence | How confident are we in the Reach and Impact estimates? | 100% = high evidence, 80% = medium, 50% = low, 20% = gut feel | PM assessment of evidence quality |
| Effort | How many person-weeks does this require? | Raw number (person-weeks) | CTO or engineering agent estimate |

**RICE score interpretation:**
- > 500: Priority 1 — schedule next available sprint
- 200–499: Priority 2 — schedule within current quarter
- 50–199: Priority 3 — backlog, revisit at next OKR cycle
- < 50: Opportunity Backlog — only if OKR-aligned

**Discipline rules:**
- PM does not estimate Effort alone. Effort must come from CTO or engineering agent.
- Confidence below 50% = run an assumption test before scheduling, not instead of.
- RICE score is recalculated monthly — market conditions and user base size change.
- Confidence score of 100% requires: JTBD interviews confirming the struggling moment AND analytics confirming Reach.

**References**: Intercom RICE article — https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/

---

## 3. OKR Alignment Gate

**Purpose**: Prevent roadmap drift from ad hoc stakeholder requests and sales pressure commitments.

**Protocol:**

Before any item enters the sprint backlog, PM verifies it maps to a Key Result in EXECUTION_PLAN.md.

```
Item submitted → Does it map to a current cycle KR? 
  YES → Score with RICE → add to sprint backlog with OKR link
  NO  → Is there a KR that should cover this but doesn't?
          YES → Flag OKR gap to CEO (not a roadmap addition)
          NO  → Move item to Opportunity Backlog with note: 
                "Unaligned — evaluate in next OKR cycle"
```

**No exceptions** for:
- Sales pressure ("we need this to close the deal")
- Founder preference ("this would be cool")
- Competitive pressure ("competitor just shipped this")

Each of these is a valid signal for OKR addition in the next cycle — but not a bypass of the current gate.

**When to escalate vs. gate:**
- Feature with strong JTBD evidence + no current OKR → propose OKR addition to CEO before sprint
- Feature with weak evidence + no OKR → Opportunity Backlog, gather more evidence first
- Feature with sales commitment attached → CLO review for contract implications + CEO decision on OKR adjustment

---

## Status Legend

| Status | Meaning |
|---|---|
| stub | Schema present, content not yet fully researched — use as structural reference |
| draft | Research done, HR review pending |
| approved | HR-approved, production-ready |
| stale | Older than 90 days, scheduled for review |
