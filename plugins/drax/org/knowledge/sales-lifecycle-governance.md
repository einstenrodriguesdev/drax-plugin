# Sales Lifecycle Governance
> Applies to: RevOps Manager, Marketing Automation Specialist, SDR, BDR, CRO, VP Sales, Sales Manager
> Status: stub
> Created: 2026-05-01 by HR agent

---

## Scope

This document covers how lifecycle stages should be designed and governed across contacts, companies, and opportunities in a Conclave revenue system. It defines the canonical stage map, entry / exit evidence, forward-only movement rules, cross-object sync logic, handoff SLAs, and exception handling for stage regressions or invalid transitions.

---

## Canonical Stage Map

When populated, this doc should define:

- the approved lifecycle stages by object type
- where lifecycle stages end and opportunity stages begin
- when custom stages are justified
- how pre-sales and post-sales states connect

Core rule:
- Stage names are only useful if every downstream team interprets them the same way.

---

## Entry / Exit Criteria

This section should define:

- objective evidence required to enter each stage
- objective evidence required to exit each stage
- fields or artifacts that must exist first
- who is allowed to advance a stage

A stage should represent verified customer or buyer progress, not seller effort.

---

## Forward-Only Movement Rules

When populated, define:

- which tools can move stages automatically
- which users can move stages manually
- what must happen before a backward move is allowed
- how legacy stage timestamps are handled

Default principle:
- backward movement is an exception to be explained, not normal workflow noise.

---

## Cross-Object Sync and Associations

This doc should define:

- when a company stage can update a contact stage
- when a deal stage should update associated contact / company stages
- which object is the system of record for each transition
- how multi-company and multi-contact associations are handled

Cross-object automation without precedence rules creates silent data corruption.

---

## Handoff SLAs and Owner Rules

When populated, define:

- owner field required at each stage
- response SLA by handoff type
- escalation path when SLA is breached
- what counts as accepted, rejected, or recycled handoff

Lifecycle governance is incomplete if ownership and time-to-action are undefined.

---

## Exception Handling

This section should define:

- invalid stage transition classes
- required logging for manual overrides
- reconciliation rules after integration conflicts
- alert thresholds for recurring stage-sync failures

The goal is to make lifecycle drift visible before it poisons conversion reporting.
