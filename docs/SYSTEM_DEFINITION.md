# Drax System Definition

Date: 2026-06-09
Status: canonical planning document
Current release target: `v1.0.0`

## Core Principle

Drax starts as an organic automation system, not as a broad enterprise operating system. V1 proves one loop:

```text
founder truth
  -> baseline artifacts
  -> blog surface
  -> headless dry-run
  -> publish record
  -> measurement decision
```

Later paid traffic, documentation, product-building, and capital-readiness layers are separate major-version gates.

## Surfaces

| Surface | Definition |
|---|---|
| `drax-plugin` | Public production plugin source and Codex marketplace source. |
| `drax-dev` | Private pre-release factory where the next plugin version is built and tested. |
| `drax-recursive` | DRAX's private founder workspace and dogfooding customer state. |
| `conclave` | Internal operator machine, role source, and HR protocol. |

No founder workspace, secret, access token, browser session, or internal HR path ships to customers.

## Version Meaning

| Version level | Meaning |
|---|---|
| Major | Business capability changes. |
| Minor | One complete distribution surface runs end to end. |
| Patch | Compatible correction or testable path improvement. |

V1 is the organic automation business capability. The first distribution surface is the local blog surface.

## V1 Scope

In scope:

- access-token gate with server-side validation seam
- Chairman interview and baseline artifacts
- vendored marketing worker roles
- self-contained Astro blog surface
- JSON execution state
- headless trigger engine
- dry-run and isolated-clone publish paths
- publish records and run manifests
- local deploy contract shape

Out of scope:

- live local server deploy implementation
- social platform API posting
- Playwright account automation as a customer path
- paid spend
- payment backend implementation
- signing or validation secrets in the plugin
- broad enterprise agent catalog

## Fundamental Definitions

| Term | Definition |
|---|---|
| Founder workspace | The customer's product git repository plus Drax artifacts. |
| Baseline artifacts | The 12 Markdown files created by `drax init` and filled by the interview. |
| Execution state | `EXECUTION_STATE.json`, the trigger engine's authoritative state. |
| Human state view | `EXECUTION_STATE.md`, rendered for people from JSON after successful publishes. |
| Run manifest | One JSON record per cycle under `.drax/runs/`. |
| Publish record | The authoritative disk record used to verify semantic success and duplicate refusal. |
| Dry run | Full cycle execution that stops before writing into the blog surface. |
| Publish | Cycle execution that writes into the isolated clone's blog surface, not the live server. |
| Local deploy | Future approval-gated operation that copies built static output to the approved server path with backup and rollback. |
| Promotion | Moving a validated path from `drax-dev` to `drax-plugin`. |

## Path Map

| Path | Status in `drax-dev` | Gate before promotion |
|---|---|---|
| P1 - Package verification | Built | `npm test`, `validate-package`, `npm pack`, forbidden-file audit. |
| P2 - Founder workspace init | Built | Clean workspace creates all artifacts and `EXECUTION_STATE.json`. |
| P3 - Interview contract | Built in prompts and skill | Live interactive intake must confirm behavior. |
| P4 - Worker routing | Built | Package ships only vendored V1 marketing roles. |
| P5 - Blog surface generator | Built | Clean workspace generates Astro surface from founder docs. |
| P6 - Access gate | Stubbed fail-closed | Server validation remains in `drax-api`; no secret ships. |
| P7 - Trigger engine | Built | Real `codex exec` dry-run in clean workspace. |
| P8 - Local deploy | Contract only | Deploy config shape exists; live deploy implementation is deferred. |
| P9 - Measurement | Partial | Publish records exist; metrics review runtime still needs implementation. |
| P10 - Promotion | Pending | Clean install and real dry-run must pass first. |

## Baseline Artifacts

| Artifact | Definition |
|---|---|
| `FOUNDER_PROFILE.md` | Founder identity, constraints, voice, goals, risk tolerance, and brand safety. |
| `PRODUCT_CONTEXT.md` | Product, offer, buyer, proof, conversion path, current evidence, and qualification. |
| `LANGUAGE_STRATEGY.md` | Market-language posture before content planning. |
| `STACK_DECISION.md` | Current stack, automation posture, environment references, logs, backups, and future stack triggers. |
| `ORGANIC_GROWTH_STRATEGY.md` | Organic channel and content strategy connected to buyer behavior. |
| `NINETY_POST_PLAN.md` | Source plan for 90 content classes before calendar execution. |
| `EDITORIAL_CALENDAR.md` | Scheduled execution plan derived from the 90-post/class source plan. |
| `DISTRIBUTION_PLAN.md` | Blog surface identity, adapter posture, metadata, and approval posture. |
| `TRIGGER_PLAN.md` | Manual and cron trigger behavior against JSON state and publish records. |
| `WORKER_ROUTING.md` | Accountable worker, permissions, forbidden actions, outputs, and gates per job. |
| `MEASUREMENT_PLAN.md` | Metrics, review cadence, evidence thresholds, and decision logic. |
| `EXECUTION_STATE.md` | Human-readable execution state view. |
| `EXECUTION_STATE.json` | Machine-readable execution state source. |

## Promotion Criterion

A path is ready for `drax-plugin` only when all conditions are true:

1. It runs in `drax-dev`.
2. It passes package validation and tests.
3. It installs from a package artifact in a clean environment.
4. It runs once from zero in a founder workspace.
5. It produces the expected disk records.
6. It ships no forbidden files or founder-specific assumptions.

If any condition fails, the path returns to `drax-dev`.
