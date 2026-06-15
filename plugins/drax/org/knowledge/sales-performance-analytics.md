# Sales Performance Analytics
> Applies to: Outbound Performance Analyst, RevOps Manager, VP Sales, Sales Manager, CRO
> Status: stub
> Created: 2026-05-01 by HR agent

---

## Scope

This document covers how outbound and sales-funnel performance should be measured and diagnosed in a Conclave revenue system. It defines KPI taxonomy, segment and cohort analysis, funnel leakage logic, velocity decomposition, meeting-quality analysis, and the governance rules that keep metrics trustworthy.

---

## KPI Taxonomy

When populated, this doc should separate metrics into categories such as:

- activity
- engagement
- meeting quality
- funnel conversion
- revenue efficiency
- forecasting / velocity

Core rule:
- Activity metrics are inputs, not final proof of performance.

---

## Segmentation and Cohorts

This section should define how to split analysis by:

- segment
- source
- rep
- sequence
- list cohort
- channel mix

Blended averages are often misleading if the underlying cohorts behave differently.

---

## Funnel Leakage Logic

When populated, define how to inspect:

- touch -> reply
- reply -> meeting
- booked -> attended
- attended -> qualified
- qualified -> opportunity
- opportunity -> closed outcome

The point is to identify where loss happens, not just that loss happened.

---

## Meeting Quality Analysis

This doc should define:

- booked vs attended distinction
- no-show rate
- low-fit rejection rate
- meeting-to-opportunity conversion
- response-time effects on show rate

Booked volume without meeting quality can create false confidence.

---

## Velocity Decomposition

When populated, define how to break velocity into:

- opportunity count
- average deal value
- win rate
- cycle length

If velocity is used without this decomposition, it becomes a vague summary metric instead of a diagnostic tool.

---

## Benchmark Governance

This section should define:

- which benchmarks are internal vs market reference
- sample-size minimums
- what counts as statistical caution
- how metric definitions are documented

Metrics are only useful if the team agrees what they mean.
