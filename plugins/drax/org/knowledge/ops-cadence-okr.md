# ops-cadence-okr.md
> Domain: Operations — OKR Cascade & Operating Cadence
> Status: stub
> Applies to: COO
> Maintained by: HR agent — populate on 90-day review or when COO activates OKR cascade protocol

---

## Purpose

Provides the COO with the structural protocol for translating CEO-level objectives into department-level OKRs, running the operating cadence, and enforcing accountability through a structured review cycle.

---

## OKR Cascade (Grove/Doerr)

**Source:** Andy Grove (Intel, "High Output Management") → John Doerr ("Measure What Matters"). The canonical enterprise OKR framework.

**Cascade structure:**
```
Company North Star (CEO owns)
    └── Department Objective (functional lead owns)
            └── Key Results (2–4 per objective, measurable, time-bound)
                    └── Initiatives (what we will do to move the KR)
```

**Rules:**
- Each department objective must be traceable to the company North Star — if it isn't, it should not exist.
- Key Results are outcomes, not outputs. "Ship 3 features" is an output. "API response time < 200ms P95" is an outcome.
- Each KR has a single owner. Shared ownership = no ownership.
- OKRs are set quarterly. CEO approves before quarter begins. COO facilitates the alignment session.
- Progress scored 0.0–1.0. Score of 0.6–0.7 at quarter end = healthy stretch. Score of 1.0 consistently = objectives set too low.

**COO role in cascade:**
1. Receives CEO North Star objectives from VISION.md and EXECUTION_PLAN.md.
2. Facilitates department heads in writing their OKRs (does not write them unilaterally).
3. Identifies cross-department conflicts before quarter begins — escalates to CEO for resolution.
4. Owns the weekly check-in cadence on key result progress.
5. Flags departments off-track at 6-week mark — proposes corrective action.

---

## Operating Cadence Model (David Sacks)

**Source:** David Sacks (COO Yammer, founder Craft Ventures) documented operating cadence in widely-cited startup operations post.

**Three-layer cadence:**

| Cadence | Frequency | Purpose | Owner | Format |
|---|---|---|---|---|
| Weekly metrics review | Weekly | Data-driven — surface operational blockers before they compound | COO chairs | KPI dashboard + blocker log |
| Monthly cross-functional alignment | Monthly | Project status + dependency mapping + resource re-allocation | COO chairs | Status per department + decision log |
| Quarterly OKR reset + retrospective | Quarterly | OKR scoring + learnings + new quarter alignment | COO facilitates, CEO approves | Retrospective doc + new OKR set |

**Weekly review rules:**
- Meeting must have a pre-distributed dashboard. No real-time data pulls during the meeting.
- Agenda is fixed: blockers first, then metrics delta, then decisions needed.
- Decisions made in the meeting are logged with owner and due date.
- Meeting ends with a "what changed" summary — not a recap of what was discussed.

---

## Balanced Scorecard (Kaplan/Norton) — Operational Layer

**Source:** Robert Kaplan and David Norton, Harvard Business School, 1992. Documented in "The Balanced Scorecard: Translating Strategy into Action."

**Four perspectives:**

| Perspective | COO-owned metrics | Why it matters |
|---|---|---|
| Financial | Revenue per employee, EBITDA margin, burn rate | Operational efficiency signal — not just revenue growth |
| Customer | NPS, churn rate, support ticket resolution time | Operational quality as seen by the customer |
| Internal Process | Cycle time, on-time delivery, process defect rate | Health of the operating system itself |
| Learning & Growth | Headcount ramp time, internal promotion rate | Org capability building |

**COO application:** Use the 4-perspective structure to build the KPI dashboard presented at weekly metrics review. Prevents CEO from reviewing only financial lagging indicators while operational leading indicators degrade.

---

## Stub notice

This document is a schema-level stub. Deep content (OKR templates, retrospective formats, Notion database structures) will be added when the COO agent is activated and a specific OKR cascade mandate is in scope.
