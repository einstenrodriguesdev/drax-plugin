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
- GitHub docs path: `https://github.com/einstenrodriguesdev/drax-corp/tree/main/docs`

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
| GitHub push | Passed | `drax-corp` and `drax-site` private repos exist and are pushed. |
| Site staging branch | Passed | `drax-site` has `staging` pushed and tracking `origin/staging`. |

## Current Blockers

1. Install FFmpeg before production video rendering.
2. Run the first isolated founder intake in a clean product workspace.
3. Generate and review the first 12 baseline artifacts before enabling any daily clock trigger.
4. Keep live publishing disabled until at least one adapter passes its release gate.
5. Configure protected branches and GitHub environments after the first repo settings pass.
6. Connect `drax-site` `staging` branch to a staging deploy target, preferably `drax-dev.conclave-company.com`.

## Next Operating Road

1. Create an isolated test workspace for a real product.
2. Run `drax` and complete founder/product intake.
3. Lock language strategy.
4. Lock stack/security decision.
5. Generate the 90-post/class plan.
6. Schedule the first week in `EDITORIAL_CALENDAR.md`.
7. Produce one article, one SVG/carousel, and one short-video package.
8. Run manual export first.
9. Enable clock trigger only after manual runs are clean and idempotent.

## Current Git Tag Meaning

Target annotated tag:

```text
v1.0.0-organic-automation-docs
```

Meaning:

- v1 scope is locked to organic automation.
- docs explain the repo, docs folder path, runtime loop, gates, and blockers.
- first test path is clear: install, isolated workspace, founder intake, artifacts, manual export, then clock trigger.
