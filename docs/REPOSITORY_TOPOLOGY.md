# Repository Topology

Date: 2026-06-05
Owner: Drax technical operations
Status: aligned with [System Definition](SYSTEM_DEFINITION.md)

This document defines the repository layout for Drax. The canonical rule is now four physical repositories with path-level promotion from development to production.

## Current Local Map

| Local path | Git repo? | Remote | Current role | Notes |
|---|---:|---|---|---|
| `/home/conclave/drax` | No | none | Workspace only | Local Drax workspace index. Do not commit product code here. |
| `/home/conclave/drax/drax-corp` | Yes | `git@github.com:einstenrodriguesdev/drax-corp.git` | Production runtime/package source | Official private runtime repository. Receives only promoted paths. |
| `/home/conclave/drax/drax-site` | Yes | `git@github.com:einstenrodriguesdev/drax-site.git` | Production site source | Public/commercial site repository. Receives only promoted paths. |
| `/home/conclave/conclave-cc` | Yes | `git@github.com:einstenrodriguesdev/conclave.git` | Internal source library | Reuse by review; do not ship wholesale. |

The dev repositories required by the final topology are not yet present locally:

- `drax-corp-dev`
- `drax-site-dev`

## Final Four-Repo Model

| Repo | Type | Responsibility | URL |
|---|---|---|---|
| `drax-corp` | Production | Installable runtime, package, templates, docs, release gates, and production tags. | No public URL. |
| `drax-site` | Production | Public sales page, blog, install page, docs surface, pricing/trust pages, and production deployment. | `drax.seudominio.com` or final production domain. |
| `drax-corp-dev` | Development | Runtime implementation, installer/package tests, isolated founder runs, package validation, and zero-user simulation. | No public URL. |
| `drax-site-dev` | Development | Site implementation, blog/content tests, docs rendering, SEO/GEO checks, and dev deployment validation. | `drax-dev.seudominio.com` or final dev domain. |

## Non-Negotiable Rule

No path enters `drax-corp` or `drax-site` unless it has already run completely in `drax-corp-dev` or `drax-site-dev`.

Promotion is by validated path, not by loose commit.

## Development Repositories

Development repos are the only place where experiments and tests happen.

Allowed in dev:

- broken intermediate work;
- branch experiments;
- staging deploys;
- package dry runs;
- clean install simulations;
- generated test assets;
- adapter experiments with isolated test accounts;
- full rebuilds when a path fails.

Required in dev:

- every path runs complete before promotion;
- every path runs at least once from zero;
- every failure remains contained;
- every promotion records evidence.

## Production Repositories

Production repos represent what the user can install or see.

Rules:

- never push direct;
- never use production as a test environment;
- never store platform credentials, browser sessions, customer artifacts, `.env` files, logs, or generated private media;
- receive only validated paths;
- tag or version only production states.

## Promotion Flow

```text
path selected
  -> implemented in dev repo
  -> local verification
  -> dev environment deploy
  -> complete run without manual intervention
  -> zero-user simulation
  -> evidence recorded
  -> promotion patch into production repo
  -> production version update
  -> production deploy verification
```

If the path fails at any step, it returns to the dev repo.

## Branch Policy

Branches can exist inside dev repos for convenience, but they are not the isolation mechanism.

Production repos use protected release flow. The production `main` branch should be treated as deployable and should only receive reviewed promotion work.

The previous `drax-site` `staging` branch is a legacy convenience from the earlier topology. It can be used temporarily, but the final deployment model is `drax-site-dev` to `drax-dev.seudominio.com`, then promotion into `drax-site`.

## Environment Strategy

| Environment | Repo | Runtime | Purpose |
|---|---|---|---|
| local development | `drax-corp-dev`, `drax-site-dev` | Developer machine | Fast implementation before dev deploy. |
| dev runtime | `drax-corp-dev` | Isolated test workspace | Package, install, doctor, rollback, founder intake, and baseline artifact tests. |
| dev site | `drax-site-dev` | `drax-dev.seudominio.com` | Sales page, blog, docs, and deploy tests. |
| production runtime | `drax-corp` | Installable package/plugin | User-installable runtime. |
| production site | `drax-site` | `drax.seudominio.com` or final production domain | Public user-facing site. |

## Repository Responsibilities

### `drax-corp`

Owns:

- production runtime source;
- package installer;
- Codex/Claude compatibility files;
- Drax runtime docs;
- artifact templates;
- release gates;
- schemas;
- production tags.

Does not own:

- website implementation;
- customer workspace artifacts;
- unsafe adapter experiments;
- development-only generated media.

### `drax-site`

Owns:

- production public site;
- sales page;
- blog;
- install page;
- pricing/trust/security pages;
- public documentation surface;
- static SEO/GEO content.

Does not own:

- runtime source;
- package installer;
- customer artifacts;
- secrets;
- backend code before a real API contract exists.

### `drax-corp-dev`

Owns:

- runtime experiments;
- path implementation;
- package dry runs;
- isolated install tests;
- zero-user simulations;
- adapter spikes before promotion.

### `drax-site-dev`

Owns:

- site experiments;
- blog/content rendering tests;
- docs organization tests;
- dev domain deploys;
- SEO/GEO validation before production promotion.

## Future Backend Repo

Create `drax-api` only when the product layer needs a real backend.

Valid triggers:

- multiple users need durable server-side state;
- publishing jobs need centralized queue or audit records;
- metrics ingestion must run without the founder's local machine;
- auth, billing, accounts, or workspace permissions require a server-owned trust boundary.

Recommended future stack:

- Go for long-running backend service or queue worker;
- PostgreSQL for durable multi-user state;
- Redis only when queue/cache behavior justifies it;
- Astro/TypeScript site remains separate from backend contracts.

## Creation Road

When GitHub authentication and naming are ready:

```bash
gh repo create einstenrodriguesdev/drax-corp-dev --private
gh repo create einstenrodriguesdev/drax-site-dev --private
```

Then clone or connect them into the Drax workspace:

```bash
git clone git@github.com:einstenrodriguesdev/drax-corp-dev.git /home/conclave/drax/drax-corp-dev
git clone git@github.com:einstenrodriguesdev/drax-site-dev.git /home/conclave/drax/drax-site-dev
```

Do not push production repos directly to create the dev state. Seed the dev repos intentionally, then run the first full path in dev before any production promotion.
