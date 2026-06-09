# Architecture

## Product Boundary

Drax Plugin is an open-core organic automation runtime. It ships a fixed V1 marketing team, founder workspace templates, a blog generator, a trigger engine, and client-side access-token checks.

The plugin does not ship the internal Conclave HR protocol, the full `conclave-cc` agent corpus, payment-provider keys, signing keys, browser sessions, or founder-specific facts.

## Runtime Layers

1. Access gate.
2. Founder intake and qualification.
3. Baseline workspace artifacts.
4. Language strategy.
5. Stack and security decision.
6. Blog surface generator.
7. Content package generation through `codex exec`.
8. Trigger engine with lock, clone, gates, manifests, and publish records.
9. Blog publisher for the isolated clone.
10. Measurement and next-decision loop.

## State Model

State is split by purpose:

| State | Source of truth | Purpose |
|---|---|---|
| Founder decisions | Markdown artifacts | Human-readable decisions and unresolved `NEEDS_DECISION` values. |
| Execution state | `EXECUTION_STATE.json` | Trigger memory, next post index, paths, and schedule config. |
| Run history | `.drax/runs/*/*.json` | One manifest per run with status and failure reason. |
| Publication evidence | `.drax/publish-records/*.json` | Authoritative record used for verification and duplicate refusal. |
| Asset integrity | asset manifests and hashes | Reproducibility and fail-closed checks. |

`EXECUTION_STATE.md` is a readable view rendered from JSON after successful publish runs. It is not the trigger engine's parser target.

## Headless Execution

Manual and scheduled triggers use the same wrapper:

```bash
drax cycle --dry-run
drax cycle --publish
```

The wrapper:

1. Acquires a `flock` lock.
2. Reads `EXECUTION_STATE.json`.
3. Clones the product workspace into `.drax/worktrees/current`.
4. Runs `codex exec --sandbox workspace-write` inside the clone.
5. Verifies generated files, hashes, proof note, duplicate records, and forbidden claims.
6. Writes a publish record.
7. Advances state only after a publish succeeds.

Cron calls the same wrapper. Codex Automations are not the scheduler for the VPS path.

## Blog Surface

The plugin generates a self-contained Astro blog surface from founder docs. The generator does not embed product identity at package build time. Missing identity fields remain `NEEDS_DECISION`.

The current publisher writes generated posts only into the isolated clone's blog surface. Live local server deploy remains a separate approval-gated, backup-first path.

## Access Boundary

The plugin validates token shape and dates locally, then calls the server validation seam. Signature verification, revocation, provider webhooks, and billing state belong to `drax-api`, not the plugin.

## Environment Boundary

Secrets are read from ignored files or environment variables only. They must never be written to prompts, Markdown artifacts, package output, run manifests, publish records, or generated media.
