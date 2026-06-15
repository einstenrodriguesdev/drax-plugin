# Creative Brief Framework
> Status: stub | Created: 2026-04-25 | Owner: Creative Director
> Applies to: Creative Director, Art Director, Video Editor
> Source references: Kevin Namaky (Gurulocity, "Top Creative Brief Mistakes"), Happy Monday Creative, Adobe Creative Brief guide, Campaign Live

---

## Purpose

This document defines the 6-field creative brief gate, the stage-gate review protocol (3 checkpoints), the brief quality scoring rubric, and the revision escalation rules that govern all creative production in Conclave.

A creative brief is a contract between the Creative Director and a specialist. It defines exactly what is needed, why it matters, and how success is measured — before a single pixel is placed or a word is written.

---

## The 6-Field Brief Gate

A brief is LOCKED only when all 6 fields are complete. A brief missing any field is returned to the issuer before production begins.

| Field | Description | Failure if absent |
|---|---|---|
| 1. Objective + Success Metric | The business goal this asset serves AND a specific, measurable success metric | Specialist cannot evaluate whether their output worked |
| 2. Audience + Awareness Stage | ICP definition + Schwartz awareness stage (Unaware / Problem-Aware / Solution-Aware / Product-Aware / Most Aware) | Specialist cannot calibrate message complexity, CTA directness, or emotional register |
| 3. Single Important Message (SIMM) | The ONE thing the audience must take away — not a tagline, not a feature list, not a value proposition with three bullets | Asset tries to communicate multiple messages; none land with sufficient force |
| 4. Tone Constraints | Do list (2–3 principles) + Do-not list (2–3 off-brand patterns) + brand voice reference | Specialist applies their own tone interpretation; brand voice diverges over time |
| 5. Executional Scope | Platform, format, dimensions, duration (video), copy status (provided / to be written / see Copywriter output), visual reference or direction | Specialist makes production decisions that belong to the Creative Director |
| 6. Production Timeline | Hard deadline, allowed revision rounds (default: 1), and revision escalation path | Scope of rework is undefined; revision cycles expand without limit |

---

## Brief Quality Scoring Rubric

Score each field 0–2 before locking:

| Score | Meaning |
|---|---|
| 0 | Field absent or unintelligible |
| 1 | Field present but ambiguous — requires interpretation |
| 2 | Field complete, specific, and unambiguous |

**Lock threshold:** all 6 fields must score 2. A single field scoring 0 or 1 = brief returned, not locked.

---

## Stage-Gate Review Protocol

Three mandatory review checkpoints for every production cycle:

### Stage 1 — Concept Gate
Trigger: specialist has returned an initial concept (sketch, wireframe, headline set, storyboard) before full production.
Review questions:
- Does the concept communicate the SIMM to the specified awareness stage?
- Does the concept align with the brand system's tone and visual language?
- Can the concept be traced to a specific audience insight or funnel position?

Decision: APPROVED (proceed to production) or REVISION REQUIRED (return with specific correction criteria).
Rejection criterion: if the concept cannot be mapped to a specific audience insight AND funnel position, it fails the concept gate — regardless of aesthetic quality.

### Stage 2 — Execution Gate
Trigger: specialist has returned a production-ready draft before final polish and export.
Review questions:
- Does the execution match the approved concept from Stage 1?
- Are all brand tokens applied correctly (HEX values, typeface, spacing)?
- Is the format specification correct for the target platform (dimensions, safe zones)?
- Does the copy (if applicable) match the SIMM and awareness stage?

Decision: APPROVED (proceed to final polish and export) or REVISION REQUIRED (specific correction listed).
Rejection criterion: any off-brand token usage, incorrect platform dimensions, or copy deviation from the approved brief message.

### Stage 3 — Pre-Publish Gate
Trigger: specialist has delivered final output with delivery log entry.
Review questions:
- Is the delivery log entry complete (filename, platform, format, brief ref)?
- Are there any open brand conflict flags that have not been resolved?
- Is the filename convention correct?
- Is the asset the exact output specified in the locked brief?

Decision: APPROVED — log entry in `approval_log.md` and forward to Social Media Manager's publishing queue. Or REVISION REQUIRED — specific correction with 24h turnaround expectation.

---

## Revision Escalation Rules

| Situation | Correct action |
|---|---|
| Revision round 1 — brief was followed but Social Media Manager wants a change | Determine: (a) brief gap → update brief before revising; (b) new decision → log the change; (c) brand ambiguity → flag to CMO |
| Revision round 2 required | Flag to Creative Director before specialist begins — a second revision round indicates either brief quality failure or specialist calibration failure, not a normal production event |
| 3+ revision rounds on a single asset | Audit the original brief. Root cause is almost always brief incompleteness. Document in the brief quality log. |

---

## The 58/27 Gap — Evidence

58% of clients (brief-givers) believe they write good creative briefs.
Only 27% of agencies (brief-receivers) agree.
Source: Kevin Namaky, Gurulocity ("Top Creative Brief Mistakes").

Implication: the gap is not a writing problem — it is a completeness and specificity problem. The 6-field gate closes this gap by making brief quality a binary pass/fail, not a subjective judgment.

---

## Brief Archive Convention

File naming: `creative_brief_[campaign-slug]-[YYYY-MM-DD].md`
Storage: project root alongside the corresponding `creative_strategy_[campaign-slug]-[YYYY-MM-DD].md`
Status field values: `draft` / `LOCKED` / `in-production` / `complete`

---

## Stub note
This document contains the framework skeleton. The following content must be added in the 90-day review:
- Annotated brief examples (good vs. incomplete)
- Platform-specific brief variants (video brief format differs from static asset brief)
- Brief template for each specialist type (Social Media Designer / Motion Designer / Performance Copywriter / Video Editor)
