# Current State

Date: 2026-06-09
Runtime: Drax Plugin organic automation
State tag: `pre-release-trigger-engine`
Canonical system definition: [Drax System Definition](SYSTEM_DEFINITION.md)

## Summary

Drax Plugin is an open-core Codex plugin for founders who already have a product and want to operate a measurable organic blog automation loop on their own VPS.

The current pre-release factory state in `drax-dev` includes:

- founder intake contract with recognition and strategic definition phases
- 14 baseline founder artifacts
- `EXECUTION_STATE.json` as machine state
- vendored V1 marketing worker roles
- self-contained Astro blog surface generator
- access token schema and fail-closed validation stub
- headless trigger engine using `flock` and `codex exec`
- run manifests, publish records, and asset hash verification

The implementation described here is the current promotion candidate. Until it is promoted, the public `drax-plugin` repository remains the installed production source.

## Product Loop

```text
chairman interview
  -> baseline artifacts
  -> language and stack decisions
  -> 90-post plan and calendar
  -> blog surface generation
  -> dry-run content cycle
  -> publish record and run manifest
  -> measurement review
  -> next content decision
```

## Repository State

| Surface | State |
|---|---|
| `drax-plugin` | Public production product and Codex marketplace source. |
| `drax-dev` | Private pre-release factory for blog generation, access gate, trigger engine, and interview upgrades before promotion. |
| `drax-recursive` | Private DRAX customer workspace. Holds founder interview state when active. |
| `conclave` | Internal operator machine and role factory. Never ships to customers. |

## Ready In `drax-dev`

- `drax init` copies the founder artifacts plus `EXECUTION_STATE.json`.
- `drax` starts the Chairman interview with a free-text recognition first question.
- `drax blog init --target drax-blog` generates the Astro blog surface from founder docs.
- `drax cycle --dry-run` runs the headless content cycle without advancing the post index.
- `drax cycle --publish` writes the generated article into the isolated clone's blog surface.
- `drax cycle cron` prints the system cron wrapper.
- Package validation requires the vendored marketing roles, schemas, templates, and docs.
- Tests cover install, intake prompt, blog generator, trigger dry-run, fail-closed gate, and cron output.

## Workspace Artifacts

Founder-readable artifacts:

- `FOUNDER_BRAND_BRIEF.md`
- `BOARD_MANDATE.md`
- `VISION_AND_STRATEGY.md`
- `POSITIONING_STATEMENT.md`
- `MARKET_LOCALIZATION_STRATEGY.md`
- `TECH_DECISION_RECORD.md`
- `GTM_STRATEGY.md`
- `CONTENT_STRATEGY.md`
- `EDITORIAL_CALENDAR.md`
- `CHANNEL_PLAN.md`
- `AUTOMATION_RUNBOOK.md`
- `RESPONSIBILITY_MATRIX.md`
- `MEASUREMENT_FRAMEWORK.md`
- `EXECUTION_STATE.md`

Machine-readable state:

- `EXECUTION_STATE.json`
- `.drax/runs/pending/*.json`
- `.drax/runs/published/*.json`
- `.drax/runs/failed/*.json`
- `.drax/publish-records/*.json`

## Current Gates

| Gate | State | Notes |
|---|---|---|
| TypeScript build | Passed | `npm test` rebuilds the package. |
| Unit tests | Passed | 11 tests passed after the trigger engine commit. |
| Package validation | Passed | Required templates, workers, docs, and schemas are present. |
| Baseline validation | Expected fail in product root | `validate-baseline` validates founder workspaces, not the package repo. |
| Public plugin repo | Ready for promotion target | `drax-plugin` is public and clean locally. |
| Clean container install | Pending | Needs package artifact from the current `drax-dev` state. |
| Real Codex cycle | Pending | Trigger tests use a fake Codex binary. A real `codex exec` dry-run is still required. |
| Live local deploy | Not implemented | Deploy remains approval-gated and backup-first by contract. |

## Current Blockers

1. Produce a fresh package artifact from `drax-dev`.
2. Run clean install in `drax-clean`.
3. Run a real `codex exec` dry-run cycle in a clean founder workspace.
4. Decide scheduler timezone and clock schedule in `EXECUTION_STATE.json`.
5. Decide real blog surface target path for the clean workspace.
6. Promote only after clean install, dry-run cycle, and package audit pass.

## Promotion Rule

No local `drax-dev` path becomes public until:

1. `npm test` passes.
2. `node scripts/validate-package.mjs` passes.
3. `npm pack` ships no forbidden file.
4. Clean install passes from zero.
5. Real headless dry-run produces a valid run manifest and publish record.
6. The promotion patch into `drax-plugin` is reviewed separately.
