# Sales CRM Data Hygiene
> Applies to: Data Enrichment Specialist, RevOps Manager, Sales Automation Specialist, SDR
> Status: stub
> Created: 2026-05-01 by HR agent

---

## Scope

This document covers the controls that keep CRM data usable after enrichment. It defines deduplication rules, field ownership, write-governance, stale-data handling, exception logging, and the operational boundaries between auto-fill, overwrite, and manual review.

---

## Deduplication and Entity Resolution

When populated, define:

- duplicate detection rules
- contact merge logic
- account merge logic
- parent / child company handling
- conflict resolution process

Deduplication matters because duplicated records split history, ownership, and routing behavior.

---

## Field Ownership

This doc should define which fields are:

- protected
- auto-fill eligible
- overwrite eligible
- manual-review only

Apollo's mapping guidance makes the underlying point clear: field updates need ownership logic, not just source availability.

---

## Write-Governance Rules

When populated, define:

- when overwrite is allowed
- when only empty fields may be filled
- when recency can justify replacement
- when manual approval is required

Silently replacing data can do more harm than leaving the field blank.

---

## Stale-Data Management

This section should define:

- stale thresholds by field type
- refresh triggers
- bounce or failure feedback loops
- records that should be quarantined

Bad data should not remain invisible once live workflows start failing on it.

---

## Exception Logging

When populated, define the standard exception classes, for example:

- duplicate unresolved
- title conflict
- domain mismatch
- low-confidence email only
- routing field missing
- overwrite blocked

The goal is to make data-quality problems inspectable instead of anecdotal.
