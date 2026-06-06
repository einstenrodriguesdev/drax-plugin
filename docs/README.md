# Drax Docs

This folder is the documentation source of truth for the Drax v1.0.0 organic automation runtime.

## Repository

- Local repository: `/home/conclave/drax/drax-plugin`
- Docs folder: `/home/conclave/drax/drax-plugin/docs`
- Git remote: `git@github.com:einstenrodriguesdev/drax-plugin.git`
- GitHub docs URL, after the private repository exists: `https://github.com/einstenrodriguesdev/drax-plugin/tree/main/docs`

To open the docs locally:

```bash
cd /home/conclave/drax/drax-plugin/docs
ls
```

## Reading Order

1. [Current State](CURRENT_STATE.md) - exact state of the runtime, repository, gates, and blockers.
2. [System Definition](SYSTEM_DEFINITION.md) - canonical definitions, final system state, version sequence, v1 path map, and four-repo deploy topology.
3. [Repository Topology](REPOSITORY_TOPOLOGY.md) - physical repo model and promotion rules for dev and production.
4. [Organic Automation Runtime](ORGANIC_AUTOMATION_RUNTIME.md) - the v1 product boundary and operating loop.
5. [Operating Model](OPERATING_MODEL.md) - canonical artifacts, decision rights, and capability flow.
6. [Roadmap](ROADMAP.md) - phase gates from foundation to commercial v1.
7. [Release Gates](RELEASE_GATES.md) - what must pass before each capability is claimed.
8. [Installation](INSTALLATION.md) - install, test, isolated workspace, and rollback.
9. [Architecture](ARCHITECTURE.md) - product boundary, runtime layers, state model, and environment reuse.
10. [Publishing Safety](PUBLISHING_SAFETY.md) - adapter priority, publish records, kill switches, and trigger safety.
11. [Video Pipeline](VIDEO_PIPELINE.md) - render modes, audio policy, and failure behavior.
12. [Portfolio Roadmap](PORTFOLIO_ROADMAP.md) - how `drax-plugin`, `drax-site`, and `conclave-cc` relate.
13. [ADR 0001](adr/0001-lean-capability-runtime.md) - why v1 is a lean capability runtime.

## Current Semantic Tags

- `organic-automation-v1`
- `founder-intake-first`
- `language-first`
- `stack-security-decision`
- `ninety-post-plan`
- `clock-and-manual-triggers`
- `worker-routing`
- `dry-run-by-default`
- `security-gated-publishing`
- `four-repo-deploy-topology`
- `path-level-promotion`

## Documentation Rule

Every public claim about Drax must map to a passed gate. If a capability has not passed its gate, document it as planned, experimental, or blocked.
