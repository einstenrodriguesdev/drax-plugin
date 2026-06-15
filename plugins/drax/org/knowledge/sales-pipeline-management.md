# Sales Pipeline Management
> Applies to: CRO, RevOps Manager, BDR, Account Executive, Appointment Setter, Outbound Performance Analyst
> Status: stub
> Created: 2026-04-30 by HR agent

---

## Scope

This document covers the operational mechanics of managing active opportunities in a Conclave sales motion. It defines stage hygiene, entry / exit criteria, pipeline inspection cadence, stage-aging rules, risk flags, buyer-engagement indicators, and how pipeline posture should map to forecast posture.

---

## Opportunity Stage Hygiene

When populated, this doc should define:

- Canonical opportunity stages from SQL / discovery through closed-won / closed-lost
- Entry criteria per stage
- Exit criteria per stage
- Evidence required to move a deal forward
- Which artifacts must exist at each stage (`discovery-summary`, `deal-strategy`, `mutual-action-plan`, `negotiation-brief`, etc.)

Key rule:
- A stage is not a description of seller effort. It is a description of verified buyer progress.

---

## Stage Aging Rules

This doc should include:

- Maximum recommended days in each stage by segment (SMB / mid-market / enterprise)
- Rules for when an "aged" deal becomes a risk review item
- Slippage taxonomy:
  - Buyer-side slippage
  - Seller-side slippage
  - Dependency slippage (security / legal / procurement)
  - Qualification slippage (missing buyer access, missing champion, weak pain)

Default principle:
- Stage age without a buyer-confirmed next step is a warning, not a neutral condition.

---

## Pipeline Inspection Cadence

This doc should define inspection rhythm:

- Weekly AE self-inspection
- Weekly manager / founder review
- Criteria for escalating a deal into "deal strategy session" mode
- Required inspection questions:
  - Do we have decision-maker access?
  - Is the deal multi-threaded?
  - Is there a buyer-owned next step?
  - Is there a current MAP?
  - Has the paper process been identified?
  - Is the business case quantified?

---

## Buyer Engagement Indicators

When populated, include:

- Meeting reciprocity signals
- Email reciprocity signals
- Stakeholder growth signals
- Champion behavior signals
- Buyer-side milestone ownership signals

The goal is to distinguish:

- Seller activity
- Buyer engagement
- Real deal momentum

Those are not the same thing.

---

## Pipeline Risk Flags

This doc should eventually define a standard flag set, such as:

- No decision-maker engaged
- Single-threaded opportunity
- No definitive next step
- MAP absent or stale
- Security / legal / procurement unknown
- High activity but low buyer reciprocity
- Discount request before business case
- Champion weak or unproven

Each flag should include:

- What it means
- Why it matters
- Default corrective action

---

## Pipeline vs Forecast

This doc should explicitly separate:

- Pipeline inclusion
- Forecast categorization

An opportunity can be real and still not belong in `commit`.

When populated, define how:

- Pipeline
- Best Case
- Commit
- Closed

are assigned from evidence, not optimism.
