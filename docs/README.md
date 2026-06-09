# Drax Docs

This folder documents the current Drax plugin runtime, release gates, and promotion rules.

## Repository Context

| Surface | Path | Role |
|---|---|---|
| `drax-plugin` | `/home/conclave/drax/drax-plugin` | Public production product and Codex marketplace source. |
| `drax-dev` | `/home/conclave/drax/drax-dev` | Private pre-release factory for the next plugin version. |
| `drax-recursive` | `/home/conclave/drax/drax-recursive` | Private DRAX founder workspace and dogfooding customer state. |
| `conclave` | `/home/conclave` | Internal operator machine and role-creation environment. |

Docs are updated in `drax-dev` first, then promoted into `drax-plugin` only after the path passes its gates.

## Reading Order

1. [Current State](CURRENT_STATE.md) - current implementation state, gates, blockers, and next test path.
2. [System Definition](SYSTEM_DEFINITION.md) - canonical scope, version meaning, surfaces, and path map.
3. [Repository Topology](REPOSITORY_TOPOLOGY.md) - four surfaces, promotion flow, and isolation rules.
4. [Architecture](ARCHITECTURE.md) - runtime layers, state model, and environment boundary.
5. [Operating Model](OPERATING_MODEL.md) - capability loop, state discipline, decision rights, and worker boundary.
6. [Installation](INSTALLATION.md) - marketplace, package, non-root setup, and workspace commands.
7. [Setup](SETUP.md) - PATH, Codex login, access token, and first workspace run.
8. [Blog Automation](BLOG_AUTOMATION.md) - Astro blog generation and local deploy contract.
9. [Trigger Engine](TRIGGER_ENGINE.md) - manual trigger, cron trigger, JSON state, run manifests, and executable gates.
10. [Access Gate](ACCESS_GATE.md) - token validation, conversion record, tier limits, and backend boundary.
11. [Release Gates](RELEASE_GATES.md) - required proof before capability claims.
12. [Publishing Safety](PUBLISHING_SAFETY.md) - adapter priority, publish records, kill switches, and trigger safety.
13. [Video Pipeline](VIDEO_PIPELINE.md) - render modes, audio policy, and failure behavior.
14. [Roadmap](ROADMAP.md) - remaining phase gates before promotion.
15. [Portfolio Roadmap](PORTFOLIO_ROADMAP.md) - expansion sequence after the organic loop.
16. [ADR 0001](adr/0001-lean-capability-runtime.md) - why V1 ships a lean marketing runtime.

## Documentation Rule

Every public claim must map to a passed gate. If a capability has not passed its gate, document it as planned, experimental, stubbed, or blocked.

## Current Semantic Tags

- `open-core-plugin`
- `founder-intake-first`
- `marketing-team-only`
- `blog-surface-v1`
- `headless-trigger-engine`
- `json-state-source`
- `dry-run-default`
- `server-side-token-validation`
- `promotion-from-drax-dev`
