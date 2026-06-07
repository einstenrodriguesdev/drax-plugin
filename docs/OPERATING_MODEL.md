# Operating Model

## Primary User

Drax v1.0.0 is for a founder who already has a product, a buyer hypothesis, and a real path to purchase or contact. The plugin qualifies those facts before constructing an organic automation system.

## Capability Loop

1. Intake captures founder, product, buyer, proof, voice, constraints, and current evidence.
2. Language strategy selects the primary market before content planning.
3. Stack decision records server, database/state, scheduler, secrets, logging, security, and paid-tool upgrade triggers.
4. Strategy defines falsifiable content and channel hypotheses.
5. Editorial creates a 90-post/class plan and a dependency-aware calendar.
6. Production creates reviewable article, SVG, video, audio, and metadata manifests.
7. Worker routing assigns each job to one accountable worker with permissions and gates.
8. Distribution queues approved assets through a controlled adapter.
9. Triggering runs the daily clock and manual fallback against the same approved queue.
10. Measurement records results and recommends continue, change, scale, or stop.

## Canonical State

Human-readable Markdown files hold the operating decisions. Facts belong in one canonical file and are linked elsewhere. Execution records and asset manifests may use JSON, but they cannot silently overwrite the human decision record.

The baseline artifacts are:

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

## Decision Rights

The system may research, draft, render previews, compare results, and recommend changes autonomously. Public publishing, credential changes, paid spend, destructive actions, and strategic commitments require accountable approval.

Strategic choices use a three-option decision pattern: lowest-risk, balanced professional, and scale/future. Each option records advantage, disadvantage, cost/complexity, when to choose, and when not to choose. The founder can always type a custom answer.

## Internal Capability Reuse

`conclave-cc` is a source library, not a customer runtime dependency. A capability is promoted into Drax only when it is necessary for the current outcome, has a clear owner, passes security review, and does not duplicate an existing capability.

If a new worker role is needed, role creation happens through the internal Conclave HR protocol. That HR path is internal-only and is not part of the customer V1 runtime. Customer installs use the vendored worker definitions in `templates/workers/`.
