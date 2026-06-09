# Operating Model

## Primary User

Drax V1 is for a founder who already has a product, a buyer hypothesis, and a real path to purchase or contact. The plugin qualifies those facts before constructing an organic automation system.

## Capability Loop

1. Intake captures founder, product, buyer, proof, voice, constraints, current stack, and current evidence.
2. Recognition uses free text. The system classifies behind the scenes.
3. Strategic definition uses three options plus custom answer in interactive sessions.
4. Language strategy selects the primary market before content planning.
5. Stack decision records server, state, scheduler, environment references, logging, security, and paid-tool upgrade triggers.
6. Strategy defines falsifiable content and channel hypotheses.
7. Editorial creates a 90-post/class plan and dependency-aware calendar.
8. Blog generation creates the Astro surface beside the existing customer site.
9. Triggering runs dry-run or publish through the same headless wrapper.
10. Measurement reads publish records and recommends continue, change, scale, or stop.

## State Discipline

Facts belong in one canonical artifact and are linked elsewhere.

Human-readable decisions live in Markdown. Machine execution state lives in JSON:

- `EXECUTION_STATE.json`
- `.drax/runs/*/*.json`
- `.drax/publish-records/*.json`
- asset manifests

If the system lacks a founder fact, it writes `NEEDS_DECISION`. It does not invent the value.

## Decision Rights

The system may research, draft, render previews, run dry-runs, compare results, and recommend changes autonomously.

These actions require accountable approval:

- live server deploy
- public publishing outside the isolated clone
- paid spend
- secret rotation or connection changes
- destructive operations
- strategic commitments that change product or market direction

## Trigger Discipline

The decision to run `drax cycle --dry-run` is a test action. The decision to run `drax cycle --publish` publishes only into the isolated clone's blog surface. Live local deploy remains a separate approval gate.

Scheduled execution uses system cron and the same wrapper as manual execution. Cron must not depend on AskUserQuestion or any prompt that requires a human response.

## Internal Capability Reuse

`conclave-cc` is a source library, not a customer runtime dependency. Customer installs use the vendored worker definitions in `templates/workers/`.

If a new worker role is needed, creation happens through the internal Conclave HR protocol first. Only reviewed, versioned roles are vendored into a later plugin release.
