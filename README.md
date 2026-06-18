# Drax Plugin

Drax Plugin is the open-core Codex plugin for founders who already have a product and want to run a measurable organic blog automation loop on their own VPS.

The public product and Codex marketplace source is `drax-plugin`. Pre-release work happens in private `drax-dev` and is promoted only after local, clean-container, and package checks pass.

## Current Scope

Version `1.0.0` is intentionally narrow:

1. Qualify the founder, product, buyer, offer, proof, constraints, and publishing risk.
2. Generate the baseline founder workspace artifacts.
3. Generate a self-contained Astro editorial blog surface.
4. Run the headless trigger engine in dry-run or publish mode.
5. Write JSON run manifests, asset hashes, publish records, and readable state.
6. Keep live server deploy approval-gated and backup-first.

It does not ship broad enterprise automation, live social posting, paid spend, browser-account automation, or payment-provider secrets.

## Baseline Workspace Files

`drax init` creates the 12 founder artifacts plus the machine state file:

- `FOUNDER_PROFILE.md`
- `PRODUCT_CONTEXT.md`
- `LANGUAGE_STRATEGY.md`
- `STACK_DECISION.md`
- `ORGANIC_GROWTH_STRATEGY.md`
- `CONTENT_STRATEGY.md`
- `EDITORIAL_CALENDAR.md`
- `DISTRIBUTION_PLAN.md`
- `TRIGGER_PLAN.md`
- `WORKER_ROUTING.md`
- `MEASUREMENT_PLAN.md`
- `EXECUTION_STATE.md`
- `EXECUTION_STATE.json`

Markdown files are the founder-readable record. `EXECUTION_STATE.json`, run manifests, and publish records are the trigger engine's source of truth.

## Install Paths

Public Codex marketplace install:

```bash
codex plugin marketplace add einstenrodriguesdev/drax-plugin --ref main
codex plugin add drax@drax
```

Package test from this factory repo:

```bash
npm install
npm run verify
npm pack
npm exec --yes --package ./drax-plugin-1.0.0.tgz -- drax-plugin install --target all
```

The launcher lives in `~/.local/bin`. Add it to `PATH` and authenticate Codex before the first session:

```bash
export PATH="$HOME/.local/bin:$PATH"
codex login
```

If Codex is not on `PATH`, set:

```bash
export DRAX_CODEX_BIN="/absolute/path/to/codex"
```

## Runtime Commands

Initialize a founder workspace:

```bash
drax init
```

Start the Chairman interview:

```bash
drax
```

Generate the stack-independent Astro blog surface:

```bash
drax blog init --target drax-blog
```

Run the trigger engine without publishing:

```bash
drax cycle --dry-run
```

Run the trigger engine against the isolated clone's blog surface:

```bash
drax cycle --publish
```

Print the system cron entry:

```bash
drax cycle cron
```

The trigger uses `flock`, `codex exec --sandbox workspace-write`, JSON state, run manifests, and publish records under `.drax/`. Dry-run writes what would publish and does not advance `nextPostIndex`.

## Access Gate

Runtime commands fail closed without a valid Drax access token. The plugin validates token shape locally, then calls the server-side validation seam. Until `drax-api` exists, tests use `DRAX_ACCESS_VALIDATION_STUB=allow`; production must validate through the Drax server.

No payment-provider key, signing key, browser session, or customer secret belongs in this repository, a package tarball, a prompt, a log, or a generated artifact.

## Repository Boundary

- `drax-plugin`: public production product and Codex marketplace source.
- `drax-dev`: private pre-release factory where unfinished paths are built and tested.
- `drax-recursive`: DRAX's own private founder workspace and dogfooding customer state.
- `conclave`: internal operator machine and role-creation source. HR and new-agent creation never ship to customers.

The full `conclave-cc` agent corpus remains internal. The plugin ships only the vendored V1 marketing worker roles.

## Documentation

Start here: [Drax Docs Index](docs/README.md).

Core docs:

- [Current State](docs/CURRENT_STATE.md)
- [Repository Topology](docs/REPOSITORY_TOPOLOGY.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Installation](docs/INSTALLATION.md)
- [Blog Automation](docs/BLOG_AUTOMATION.md)
- [Trigger Engine](docs/TRIGGER_ENGINE.md)
- [Access Gate](docs/ACCESS_GATE.md)
- [Release Gates](docs/RELEASE_GATES.md)
