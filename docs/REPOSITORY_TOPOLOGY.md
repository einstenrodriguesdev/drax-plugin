# Repository Topology

Date: 2026-06-05
Owner: Drax technical operations

This document defines which folders are repositories, which folders are only workspaces, and how Drax should split production, development, site, and future backend work.

## Current Local Map

| Local path | Git repo? | Remote | Remote status | Responsibility |
|---|---:|---|---|---|
| `/home/conclave/drax` | No | none | workspace only | Local Drax workspace index. Do not commit product code here. |
| `/home/conclave/drax/drax-corp` | Yes | `git@github.com:einstenrodriguesdev/drax-corp.git` | Blocked: `Repository not found` | Official private Drax plugin/runtime source, docs, templates, release gates, package validation. |
| `/home/conclave/drax/drax-site` | Yes | `git@github.com:einstenrodriguesdev/drax-site.git` | Blocked: `Repository not found` | Public/commercial Astro site, documentation surface, pricing, knowledge base, trust pages. |
| `/home/conclave/conclave-cc` | Yes | `git@github.com:einstenrodriguesdev/conclave.git` | Reachable | Internal source library for agents, roles, and enterprise operating patterns. Reuse by review; do not ship wholesale. |

## Recommended Repository Model

Drax should use two repositories now and introduce a third only when experimental adapter work becomes risky enough to justify isolation.

### 1. `drax-corp` - official private plugin/runtime repository

Purpose:

- production plugin source
- package installer
- Codex/Claude compatibility files
- Drax runtime docs
- artifact templates
- release gates
- publishing and rendering adapter contracts

Rules:

- Private repository.
- `main` is release-candidate quality.
- Tags describe release states, for example `v1.0.0-organic-automation-docs`.
- No platform credentials, browser session files, `.env` files, or generated customer artifacts.
- Experimental Playwright/API adapters can be designed here, but live tests should run from an isolated workspace or a lab repo.

### 2. `drax-site` - public site and docs surface repository

Purpose:

- Astro + TypeScript site
- public knowledge base
- pricing and access pages
- public-facing documentation
- static content and SEO/GEO surface

Rules:

- Static-first.
- No customer secrets or founder operating artifacts.
- Production branch deploys the public site.
- Staging and development use branch deploys or a separate staging host.
- Backend work does not enter this repo until there is a real API contract.

### 3. `drax-lab` - optional private development sandbox

Create this only when the experiments become dangerous or noisy for `drax-corp`.

Purpose:

- test plugin named `drax-dev`
- Playwright posting experiments
- API adapter spikes
- video-engine experiments
- isolated account/session tests
- destructive prototypes that should not live in the official plugin repository

Rules:

- Private repository.
- No release promises.
- No production tags.
- No customer artifacts.
- Uses dedicated test accounts only.
- Successful work is promoted into `drax-corp` through a reviewed patch, not copied blindly.

## Future Repository

### `drax-api` - Go backend repository

Create only when v1 needs a real backend.

Purpose:

- API service
- queue service
- metrics ingestion
- account/workspace service
- publishing job audit records

Recommended stack:

- Go for the backend when a long-running service, queue worker, or API is required.
- PostgreSQL when durable multi-user state is required.
- Redis only when short-lived queue/cache behavior justifies it.
- Keep TypeScript/Astro frontend separate from Go backend contracts.

Do not create `drax-api` just to look complete. Create it when the plugin cannot safely remain a local/runtime package.

## Environment Strategy

Use environments instead of duplicating repositories prematurely.

| Environment | Repo | Branch/tag | Runtime | Purpose |
|---|---|---|---|---|
| local | `drax-corp`, `drax-site` | working branch | developer machine | fast development and verification |
| dev | `drax-lab` or feature branch | `dev/*` | isolated test accounts | unsafe experiments and adapter tests |
| staging | `drax-site` | `staging` branch | branch deploy or staging host | public-site review before production |
| production | `drax-corp`, `drax-site` | `main` + tag | official package/site | released plugin and public site |

## Site Development URL Strategy

Preferred professional options:

1. Branch deploy URL from Netlify or equivalent preview infrastructure.
2. Staging subdomain, for example `drax-dev.conclave-company.com` or `staging.drax.co`.
3. Temporary protected path, for example `conclave-company.com/drax-dev/`, only if Nginx/static routing is explicitly configured and access is restricted.

Use a subdomain or branch deploy for real staging. A path like `/drax-dev/` is acceptable for a temporary preview page, but it is easier to leak into production navigation and can create routing/base-path issues in static apps.

## GitHub Fix Road

The local Git state is not the blocker. The remote repositories are missing or inaccessible.

Run after GitHub authentication is available:

```bash
gh auth login

gh repo create einstenrodriguesdev/drax-corp \
  --private \
  --source /home/conclave/drax/drax-corp \
  --remote origin \
  --push

gh repo create einstenrodriguesdev/drax-site \
  --private \
  --source /home/conclave/drax/drax-site \
  --remote origin \
  --push
```

If the repositories already exist under a different owner or name, fix the remotes instead:

```bash
git remote set-url origin git@github.com:OWNER/REPO.git
git push origin main --tags
```

## Branch And Release Policy

- `main`: release-candidate quality.
- `dev/*`: implementation branches.
- `lab/*`: unsafe experiments if kept inside a repo.
- `staging`: site staging branch, only for `drax-site`.
- Annotated tags: release or state snapshots.
- Protected `main`: require passing tests before merge once GitHub is available.
- GitHub environments: separate `development`, `staging`, and `production` secrets/variables.

## Stack Policy

Current preferred stack:

- TypeScript for plugin CLI and site logic.
- Astro for the static public site.
- Python + FFmpeg for deterministic low-resource video rendering.
- Go only when a real backend or worker service is required.

Do not introduce a backend because the roadmap mentions one. Introduce Go when one of these gates is true:

- multiple users need durable server-side state
- publishing jobs need centralized queue/audit records
- metrics ingestion must run without the founder's local machine
- customer auth/billing needs a server-owned trust boundary

## Research Basis

This topology follows current platform guidance:

- GitHub repositories are the base unit for code, files, revision history, collaborators, and private/public visibility: <https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories>
- GitHub environments support separated deployment targets and environment-specific controls: <https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments>
- GitHub branch protection supports protected `main` release discipline: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches>
- `gh repo create --private --source ... --push` can create and push a remote from an existing local repository: <https://cli.github.com/manual/gh_repo_create>
- Netlify branch deploys and deploy contexts support staging/preview behavior without creating separate site repos: <https://docs.netlify.com/deploy/deploy-types/branch-deploys/> and <https://docs.netlify.com/deploy/deploy-overview/>
- Astro documents static deployment as the normal deployment path for Astro sites: <https://docs.astro.build/en/guides/deploy/>
- Go modules keep backend dependency boundaries explicit when a Go service becomes necessary: <https://go.dev/doc/modules/managing-dependencies>
