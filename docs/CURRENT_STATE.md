# Current State

Date: 2026-06-05
Runtime: Drax v1.0.0 organic automation
State tag: `v1.0.0-organic-automation-docs`

## Summary

Drax v1.0.0 is now documented as a narrow organic automation runtime for founders who already have a product. It is not documented as a broad enterprise automation platform in this release.

The current product loop is:

```text
founder interview
  -> product and stack context
  -> language strategy
  -> stack/security decision
  -> 90-post/class plan
  -> article, SVG/carousel, short video, audio, metadata
  -> approved queue
  -> clock/manual trigger
  -> publish record
  -> metrics review
  -> next content decision
```

## Repository State

- Local repository: `/home/conclave/drax/drax-corp`
- Docs folder: `/home/conclave/drax/drax-corp/docs`
- Remote configured: `git@github.com:einstenrodriguesdev/drax-corp.git`
- Repository topology: [Repository Topology](REPOSITORY_TOPOLOGY.md)
- GitHub web path, after repository creation/access is fixed: `https://github.com/einstenrodriguesdev/drax-corp/tree/main/docs`

## What Is Ready

- Founder intake starts first when `drax` is invoked without a concrete task.
- Direct tasks stay inside v1 organic automation scope.
- Required baseline artifacts are defined.
- Language strategy is a first-class planning document.
- Stack/security decision is a first-class planning document.
- 90-post/class planning is required before daily calendar execution.
- Worker routing maps jobs to accountable workers and permissions.
- Daily automation has both clock and manual trigger plans.
- Publishing defaults to dry-run.
- Manual export remains the universal contingency.
- Playwright remains experimental until adapter gates pass.
- Official APIs remain the production target where available and approved.

## Required Baseline Artifacts

- `FOUNDER_PROFILE.md`
- `PRODUCT_CONTEXT.md`
- `LANGUAGE_STRATEGY.md`
- `STACK_DECISION.md`
- `ORGANIC_GROWTH_STRATEGY.md`
- `NINETY_POST_PLAN.md`
- `EDITORIAL_CALENDAR.md`
- `DISTRIBUTION_PLAN.md`
- `TRIGGER_PLAN.md`
- `WORKER_ROUTING.md`
- `MEASUREMENT_PLAN.md`
- `EXECUTION_STATE.md`

## Current Gates

| Gate | State | Notes |
|---|---|---|
| TypeScript build | Passed | `npm run verify` passed before this docs update. |
| Unit tests | Passed | CLI prompt and installer tests passed before this docs update. |
| Package validation | Passed | Package allowlist validation passed before this docs update. |
| Plugin validation | Passed | Plugin schema validation passed before this docs update. |
| Local install | Passed | Local installer wrote Codex plugin, Claude command, launcher, and persistent runtime. |
| `drax doctor` | Mostly passed | FFmpeg is optional-missing locally; Python is present. |
| GitHub push | Blocked | SSH authenticates, but GitHub reports the repository is not found or inaccessible. |

## Current Blockers

1. Create or grant access to the private GitHub repository at `einstenrodriguesdev/drax-corp`.
2. Create or grant access to the private GitHub repository at `einstenrodriguesdev/drax-site`.
3. Install FFmpeg before production video rendering.
4. Run the first isolated founder intake in a clean product workspace.
5. Generate and review the first 12 baseline artifacts before enabling any daily clock trigger.
6. Keep live publishing disabled until at least one adapter passes its release gate.

## Next Operating Road

1. Fix GitHub repository access and push `main` plus the current state tag.
2. Create an isolated test workspace for a real product.
3. Run `drax` and complete founder/product intake.
4. Lock language strategy.
5. Lock stack/security decision.
6. Generate the 90-post/class plan.
7. Schedule the first week in `EDITORIAL_CALENDAR.md`.
8. Produce one article, one SVG/carousel, and one short-video package.
9. Run manual export first.
10. Enable clock trigger only after manual runs are clean and idempotent.

## Current Git Tag Meaning

Target annotated tag:

```text
v1.0.0-organic-automation-docs
```

Meaning:

- v1 scope is locked to organic automation.
- docs explain the repo, docs folder path, runtime loop, gates, and blockers.
- first test path is clear: install, isolated workspace, founder intake, artifacts, manual export, then clock trigger.
