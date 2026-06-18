# Automation Runbook

Status: draft
Owner: distribution
Last reviewed:

Daily posting needs both a clock trigger and a manual trigger reading the same approved queue; machine state lives in `EXECUTION_STATE.json` and `EXECUTION_STATE.md` is the readable view rendered from it.

## Trigger Options

| Option | Trigger posture | Advantage | Disadvantage | Cost/complexity | Choose when | Do not choose when |
|---|---|---|---|---|---|---|
| A | Manual trigger only | Safest first test; founder approves every run. | Does not prove autonomous daily operation. | Low | Testing the first content packages. | Daily execution must happen without founder presence. |
| B | Clock trigger plus manual fallback | Proves daily operation while preserving operator override. | Requires idempotency, logs, and failure handling. | Medium | VPS or always-on machine is available. | Queue, connection readiness, or approvals are unstable. |
| C | Full scheduled queue with API adapters | Best scale path for multiple channels and accounts. | Requires platform gates, app reviews, and stronger monitoring. | High | API adapters are approved and tested. | Playwright is the only available adapter. |

Custom answer:

## Decision

- Selected option:
- Clock schedule:
- Manual command: drax cycle --dry-run
- Queue file/location: EXECUTION_STATE.json
- Publish record location: .drax/publish-records
- Failure notification:
- Kill switch:
- Revisit trigger:

## Runbook — Trigger Engine

- Lock: `.drax/locks/cycle.lock` through `flock`, acquired before state read.
- Manual dry run: `drax cycle --dry-run`.
- Manual publish: `drax cycle --publish`.
- Scheduled trigger: system cron calling the same `drax cycle` wrapper.
- Cron helper: `drax cycle cron`.
- Runtime state: `EXECUTION_STATE.json`.
- Human view: `EXECUTION_STATE.md`, rendered from JSON.
- Run manifests: `.drax/runs/pending`, `.drax/runs/published`, and `.drax/runs/failed`.
- Logs: `.drax/logs`.
- Isolated clone: `.drax/worktrees/current`.
- Content engine: `codex exec --sandbox workspace-write` inside the isolated clone.
- Publisher implemented in v1: local blog surface only.
- Live server deploy: approval-gated and backup-first, outside the first trigger write.

## Idempotency Rules

- Each content package has a stable ID.
- A trigger refuses to publish an ID that already has a successful publish record for the same platform/account.
- A trigger verifies asset hashes against the manifest before attempting upload.
- A failed run records failure evidence and does not retry infinitely.
- Future external adapters fall back to export-manual when their own gates are blocked.
- A trigger that fails a gate does not advance `EXECUTION_STATE.json`.

## Failure Handling And Escalation

- Failed runs record failure evidence and do not advance state.
- Failed runs do not retry infinitely.
- Logs and evidence live under `.drax/logs`, `.drax/runs/failed`, and `.drax/publish-records`.
- The kill switch stops scheduled and live publishing paths.
- Failure notification owner:

## Run Log

| Date/time | Trigger | Package ID | Platform | Result | Evidence | Next action |
|---|---|---|---|---|---|---|
