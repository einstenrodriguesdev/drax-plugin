# Drax Corp

Drax Corp is the private testing and release repository for the lean Drax plugin.

Version `1.0.0` is intentionally narrow: it serves founders who already have a product and want to turn their expertise into a measurable organic-growth operating system.

## What v1.0.0 Does

1. Qualifies the founder, product, buyer, offer, proof, constraints, and publishing risk.
2. Creates a source-backed organic growth strategy and editorial calendar.
3. Produces briefs for articles, SVG posts, short videos, and distribution metadata.
4. Runs a reviewable queue with approvals, audit records, and measurement checkpoints.
5. Recommends the next content and channel action from observed evidence.

It does not silently publish, spend money, or claim support for an unverified platform.

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

The full `conclave-cc` agent corpus remains an internal source library. This repository ships only the capability and context needed for organic growth v1.0.0. Later modules must pass their own product, security, and commercial gates before inclusion.

See [Architecture](docs/ARCHITECTURE.md), [Operating Model](docs/OPERATING_MODEL.md), [Roadmap](docs/ROADMAP.md), [Release Gates](docs/RELEASE_GATES.md), [Installation](docs/INSTALLATION.md), [Video Pipeline](docs/VIDEO_PIPELINE.md), and [Publishing Safety](docs/PUBLISHING_SAFETY.md).
