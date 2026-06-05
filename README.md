# Drax Corp

Drax Corp is the private testing and release repository for the lean Drax plugin.

Version `1.0.0` is intentionally narrow: it serves founders who already have a product and want to turn their expertise into a measurable organic automation system.

## What v1.0.0 Does

1. Qualifies the founder, product, buyer, offer, proof, constraints, and publishing risk.
2. Defines the language strategy before content planning.
3. Records the current stack and chooses a secure automation posture.
4. Creates a source-backed organic strategy, 90-post/class plan, and editorial calendar.
5. Produces briefs for articles, SVG posts, short videos, audio, and distribution metadata.
6. Routes each job to an accountable worker with permissions and approval gates.
7. Runs a reviewable queue with clock/manual triggers, audit records, and measurement checkpoints.
8. Recommends the next content and channel action from observed evidence.

It does not silently publish, spend money, or claim support for an unverified platform.

## Baseline Artifacts

The first complete Drax run should produce or update:

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

## Install And Test

Repository marketplace:

```bash
codex plugin marketplace add /home/conclave/drax/drax-corp
codex plugin add drax@drax-corp
```

Package test:

```bash
npm install
npm run verify
npm pack
npm exec --yes --package ./drax-corp-1.0.0.tgz -- drax-corp install --target all
```

Source development:

```bash
npm install
npm run build
npm link
drax doctor
drax
```

The displayed shell notation `$ drax` means run the command `drax`; the dollar sign is not part of the command.

## Repository Boundary

The full `conclave-cc` agent corpus remains an internal source library. This repository ships only the capability and context needed for organic automation v1.0.0. Later modules must pass their own product, security, and commercial gates before inclusion.

## Docs Folder

- Local docs path: `/home/conclave/drax/drax-corp/docs`
- GitHub docs path, after repository access is fixed: `https://github.com/einstenrodriguesdev/drax-corp/tree/main/docs`
- Start here: [Drax Docs Index](docs/README.md)
- Current state: [Current State](docs/CURRENT_STATE.md)

See [Architecture](docs/ARCHITECTURE.md), [Operating Model](docs/OPERATING_MODEL.md), [Organic Automation Runtime](docs/ORGANIC_AUTOMATION_RUNTIME.md), [Portfolio Roadmap](docs/PORTFOLIO_ROADMAP.md), [Release Roadmap](docs/ROADMAP.md), [Release Gates](docs/RELEASE_GATES.md), [Installation](docs/INSTALLATION.md), [Video Pipeline](docs/VIDEO_PIPELINE.md), and [Publishing Safety](docs/PUBLISHING_SAFETY.md).
