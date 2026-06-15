# Sales Data Enrichment
> Applies to: Data Enrichment Specialist, Sales Automation Specialist, RevOps Manager, BDR, SDR
> Status: stub
> Created: 2026-05-01 by HR agent

---

## Scope

This document covers how lead, contact, and account records should be enriched before they are used in Conclave sales workflows. It defines required field categories, source-order logic, confidence notation, waterfall enrichment structure, pre-handoff readiness rules, and segment-specific enrichment expectations.

---

## Field Taxonomy

When populated, this doc should define the field classes that matter operationally, such as:

- contact identity
- company identity
- role / seniority
- firmographics
- technographics
- geography
- routing / ownership
- verification metadata

Core rule:
- A field is important only if a downstream workflow depends on it.

---

## Waterfall Enrichment Logic

This section should define:

- source order
- stop conditions
- fallback rules
- confidence thresholds
- escalation path when all standard sources fail

Apollo's waterfall concept is the right mental model here: do not query every source equally or indefinitely.

---

## Required Fields by Workflow

When populated, define required field sets for:

- outbound prospecting
- inbound lead routing
- SDR handoff
- ABM account research
- CRM cleanup batch

Different workflows need different minimums. "Has an email" is not a universal definition of readiness.

---

## Confidence and Provenance

This doc should define:

- confidence labels
- verification tiers
- source-date notation
- how rejected fields are logged

Downstream teams must be able to see what they can trust and why.

---

## Pre-Handoff Readiness

When populated, define:

- what makes a record CRM-ready
- what blocks routing
- what blocks sequence enrollment
- what triggers manual review

Apollo's pre-handoff enrichment guidance is useful here: enrich before humans inherit the ambiguity.

---

## Refresh Cadence

This section should define:

- stale thresholds by field type
- refresh frequency by object type
- event-triggered refresh rules

Freshness is part of quality, not a separate concern.
