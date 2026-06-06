# Organic Automation Runtime

## Product Boundary

Drax v1.0.0 turns an existing product into a daily organic publishing operation. The founder may have a SaaS, software product, mobile app, online store, infoproduct, or service. If there is no product, no buyer hypothesis, and no conversion path, v1 does not proceed as an automation system.

The first commercial promise is not broad enterprise automation. It is this loop:

```text
founder interview
  -> product and stack context
  -> language strategy
  -> 90-post/class plan
  -> article draft
  -> SVG/carousel asset
  -> short video asset
  -> approved queue
  -> daily clock/manual trigger
  -> publishing record
  -> metrics review
  -> next content decision
```

## Phase 1: Interview And Context

The runtime starts after install when the founder runs `drax`. The first interaction is founder intake, not code generation.

The intake captures:

- product type, stage, offer, and conversion path
- current stack, deployment, database/state, analytics, payments, auth, and repository
- founder voice, proof, banned claims, and confidential areas
- audience, geography, language, buyer pain, and purchase behavior
- available devices, VPS access, budget, and risk tolerance

Missing facts are written as `NEEDS_DECISION`. They are not guessed.

## Phase 2: Language First

Language is chosen before the content calendar. A founder selling to Brazil and the United States is not running one content system. They are running at least two market surfaces with different examples, CTAs, and metrics.

The default decision pattern:

- Option A: one primary language
- Option B: primary language plus one translated derivative
- Option C: multilingual from day one

The chosen posture is recorded in `LANGUAGE_STRATEGY.md`.

## Phase 3: Stack And Security Decision

The automation environment is decided before publishing starts.

Default options:

- Option A: current stack plus manual/export publishing
- Option B: isolated VPS automation node
- Option C: production API-first publishing system

Option B is the normal v1 target when the founder can operate SSH and wants 24/7 execution: a separated Linux environment with its own env reference, queue, logs, timers, and backups. It is suitable for a founder-managed VPS without coupling the automation node to the product repository.

Security baseline:

- dry-run default
- secrets from environment or secret manager only
- least-privilege tokens
- isolated test accounts before production accounts
- package validation and lockfiles
- asset hashes and publish records
- kill switches for platform automation
- OWASP ASVS Level 1 intent for hosted surfaces
- NIST SSDF-style software delivery controls

## Phase 4: Ninety-Post Plan

The runtime generates exactly 90 posts/classes before the daily publishing calendar begins. This prevents the system from becoming a one-off content prompt.

Default mix:

- 30 problem and buyer education posts
- 30 product/use-case and proof posts
- 20 operational/tutorial posts
- 10 conversion and objection-handling posts

The 90-post plan is a source document. `EDITORIAL_CALENDAR.md` schedules it; it does not replace it.

## Phase 5: Production Pipeline

Each approved class becomes:

- long-form article or post draft
- SVG/carousel visual asset
- short-video script
- rendered video through `python-ffmpeg`, `remotion`, or `ffmpeg-template`
- metadata and CTA package
- publish manifest with asset hashes

The default renderer is `python-ffmpeg` because it runs deterministically on low-resource Linux and ARM64. Remotion is optional when richer TypeScript motion is worth the additional runtime cost. `ffmpeg-template` is the fallback for simple caption, audio, and image assembly.

## Phase 6: Publishing Adapters

Adapter priority:

1. `official-api` for production where the platform supports it and the adapter has passed gates.
2. `export-manual` as the universal contingency.
3. `playwright-experimental` for isolated tests only.

Playwright can be useful for proving workflows, but it carries UI-change, anti-automation, credential, and account-policy risk. It does not become the default production path just because a small test passed.

## Phase 7: Triggers

Daily posting has two triggers:

- `clock`: scheduled job for the approved cadence
- `manual`: operator command for the next approved package

Both read the same approved queue, verify hashes, prevent duplicate posts, write publish records, and fail closed when state is inconsistent.

## Phase 8: Worker Routing

Every job has one accountable worker, allowed tools, forbidden actions, output artifacts, and approval gates. Customer installs use the vendored worker definitions in `templates/workers/`. Existing `conclave-cc` roles are internal source patterns only. New roles must pass the internal HR protocol before they are vendored into a later plugin release.

The system is allowed to be autonomous only where the approval gate allows autonomy. Public publishing, paid spend, credential changes, and destructive actions stay human-approved in v1.0.0.
