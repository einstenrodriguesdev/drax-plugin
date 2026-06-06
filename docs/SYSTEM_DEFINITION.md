# Drax System Definition

Date: 2026-06-05
Status: canonical planning document
Current release target: `v1.0.0`

This document defines the final shape of the Drax system, the correct meaning of its core terms, the version sequence, the complete `v1.0.0` path map, and the deployment topology that governs promotion from development to production.

It is the source of truth when another document is unclear about scope, version meaning, or deployment discipline.

## Core Principle

Drax does not start as a documentation project.

Drax starts as an automation system that helps the founder build online presence, publish useful content, create more chances of selling, and collect evidence from the market. Documentation exists in `v1.0.0` only where it supports installation, trust, sales, content structure, and repeatable operation. Full documentation becomes its own major system layer later.

The order is:

```text
organic traffic automation
  -> organic evidence and ROAS controls
  -> paid traffic amplification
  -> documentation layer
  -> product layer
  -> venture capital and institutional readiness
```

## Final System State

The final Drax system is a founder operating runtime with five visible surfaces:

1. A private runtime package that installs Drax and runs founder/product workflows.
2. A public site with sales page, blog, install page, trust pages, and documentation surface.
3. A content engine that turns founder knowledge into organic traffic assets.
4. A deploy system that validates every path in development before production promotion.
5. A versioned expansion model that adds paid traffic amplification, documentation layer, product layer, and venture capital and institutional readiness only after evidence gates pass.

The system is complete when a founder can:

- install Drax in a clean environment;
- complete founder and product qualification;
- generate the baseline operating artifacts;
- create an organic strategy, 90-post/class plan, editorial calendar, and reviewable assets;
- deploy the site and content surfaces through dev first;
- promote only validated paths to production;
- measure results and decide continue, change, scale, or stop;
- move into later paid traffic amplification, documentation, product, and institutional layers without rewriting the v1 foundation.

## Fundamental Definitions

| Term | Definition |
|---|---|
| System | The complete Drax operating model: runtime package, public site, content engine, deployment topology, artifacts, gates, and versioned expansion layers. |
| Version | A production state defined by validated paths, not by work in progress. A version changes when a path is promoted from development to production. |
| Path | A complete executable workflow with a start condition, required outputs, test environment, success criteria, and promotion gate. A path is larger than a task and smaller than a whole version. |
| Feature | A capability that creates a verified output for the founder, site, content engine, deployment system, or measurement loop. |
| Artifact | A human-readable or machine-readable file produced by the system. Markdown artifacts hold canonical decisions; JSON/manifests hold execution state, asset hashes, and audit evidence. |
| Organic traffic | Unpaid qualified attention created by search, social, community, referral, or content discovery. Organic traffic is not just visits; it must be connected to buyer intent or learning. |
| Organic content | Source-backed, reviewable content created to educate, prove, explain, compare, or convert without paid distribution as the primary force. |
| Sales page | The public conversion surface that explains the product, offer, proof, install path, pricing direction, and call to action. |
| Blog | The organic traffic surface. It publishes content assets that can be indexed, shared, measured, and reused in paid tests later. |
| Documentation organization | The initial `v1.0.0` structure that makes install, trust, security, roadmap, and operating docs discoverable. It is not the full `v3` documentation layer. |
| Documentation layer | The later `v3` layer where Drax generates a structured knowledge base and public docs from the system. |
| Deployment automation | The repeatable process that builds, tests, deploys, and promotes a validated path from development repos to production repos. |
| Development repo | The physically isolated repository where implementation and real-environment tests happen. Failures stay here. |
| Production repo | The repository that represents what users can install or see. It never receives direct pushes. |
| Promotion | The controlled movement of one validated path from development to production. Promotion happens by path, not by random commit. |
| Gate | A required proof before a path can move forward. A gate can require tests, clean install, dry run, manual review, audit record, or measured outcome. |
| Dry run | Execution mode where the system produces artifacts, manifests, and logs without publishing publicly, spending money, or changing external production state. |
| Manual export | The universal fallback distribution mode. The system prepares the package and the founder publishes manually. |
| Official adapter | A production publishing integration that uses an approved platform API and passed adapter gates. |
| Measurement loop | The evidence cycle that records what happened and recommends continue, change, scale, or stop. |
| Product layer | The later `v4` system where Drax builds and ships products from within the system. |
| Venture capital and institutional readiness | The later `v5` layer where Drax supports capital, M&A, legal, and compliance at institutional scale. |

## Version Sequence

| Version | Name | Definition | Path detail in this document |
|---|---|---|---|
| `v1` | Organic Traffic Automation | Founder interview, content system, site, blog, sales page, and autonomous daily publishing on VPS. | Full `v1.0.0` path map below. |
| `v2` | Paid Traffic Amplification | Only after organic evidence and positive ROAS controls exist. | Name only. |
| `v3` | Documentation Layer | Structured knowledge base and public docs generated from the system. | Name only. |
| `v4` | Product Layer | Building and shipping products from within the system. | Name only. |
| `v5` | Venture Capital And Institutional Readiness | Capital, M&A, legal, and compliance at institutional scale. | Name only. |

## v1.0.0 Contract

`v1.0.0` exists to prove that Drax can create and operate a real organic traffic automation system before it claims broader automation.

In scope:

- private runtime package and installer;
- founder and product qualification;
- language strategy;
- stack and security decision;
- public site with sales page, blog, install page, trust/security surface, and basic docs organization;
- organic growth strategy;
- 90-post/class plan;
- editorial calendar;
- article, SVG/carousel, short video, audio, metadata, and publish manifests;
- worker routing and approval gates;
- manual export and dry-run-first publishing;
- clock and manual triggers against the same approved queue;
- measurement and review loop;
- four-repo deploy topology;
- path-level promotion and versioning.

Out of scope:

- autonomous paid spend;
- production browser automation as the default publishing path;
- full documentation product;
- hosted product/control-plane layer;
- financing, legal paper, equity, data room, or VC claims;
- broad enterprise automation beyond the organic/deploy surface.

## v1.0.0 Paths

Each path must run completely in development before it can be promoted to production.

| Path | Start condition | Required output | Promotion gate |
|---|---|---|---|
| P0 - Repository Topology | Four-repo model accepted. | `drax-plugin`, `drax-site`, `drax-corp-dev`, and `drax-site-dev` defined with responsibilities and URLs. | Dev repos exist or are explicitly scheduled; production repos are protected from direct push. |
| P1 - Clean Runtime Install | Fresh workspace with no Drax artifacts. | Installer writes Drax plugin, command, launcher, persistent runtime, and rollback-safe files. | Install, doctor, and rollback behavior pass from zero. |
| P2 - Package Verification | Runtime source is ready to package. | Build, tests, package allowlist, schema validation, and plugin validation pass. | `npm run verify` passes and no forbidden files ship. |
| P3 - Founder/Product Qualification | Founder starts Drax with or without direct task. | Founder, product, buyer, offer, proof, constraints, and conversion path are captured or marked `NEEDS_DECISION`. | Unsupported cases are rejected or redirected clearly; no missing fact is guessed. |
| P4 - Language Strategy | Product and target markets are known. | `LANGUAGE_STRATEGY.md` defines primary language, derivative languages, examples, CTAs, and metrics by market. | Calendar cannot start until language posture is locked. |
| P5 - Stack And Security Decision | Product stack and automation constraints are known. | `STACK_DECISION.md` records server, state, secrets, logging, backups, adapter posture, and future upgrade triggers. | Dry-run default, least-privilege secrets, and isolated test accounts are documented. |
| P6 - Public Sales Page | Site repo is ready in dev. | Sales page explains Drax, who it is for, install path, trust posture, and conversion action. | Dev domain renders correctly and copy makes only passed or planned claims. |
| P7 - Blog Surface | Site content system is ready in dev. | Blog route, content schema, article template, metadata, canonical URLs, and publishing flow exist. | At least one test article renders on dev with valid metadata and no broken build. |
| P8 - Basic Docs Organization | Initial trust/install docs exist. | Docs index, install page, security/trust page, roadmap, and operating definition are discoverable. | Public docs do not claim unpassed capabilities; LLM-readable pages build on dev. |
| P9 - Organic Growth Strategy | Buyer, offer, language, and site surface are known. | `ORGANIC_GROWTH_STRATEGY.md` defines ICP, channels, content pillars, proof, CTAs, hypotheses, and stop/change/scale logic. | Strategy is falsifiable and connected to measurable buyer behavior. |
| P10 - 90-Post/Class Plan | Organic strategy is locked. | `NINETY_POST_PLAN.md` creates 90 source classes across education, proof/use case, tutorial, and conversion themes. | Calendar cannot replace the source plan; duplicates and unsupported claims are removed. |
| P11 - Editorial Calendar | 90-post/class plan exists. | `EDITORIAL_CALENDAR.md` schedules the first content cycles with dependencies, owner, format, channel, and review state. | First week can run without manual restructuring. |
| P12 - Asset Production Package | Calendar item is approved. | Article draft, SVG/carousel manifest, short-video script or render manifest, audio/metadata, CTA, and asset hashes. | Same inputs reproduce the same preview or produce a recorded diff; assets are reviewable. |
| P13 - Distribution Plan | Approved assets exist. | `DISTRIBUTION_PLAN.md` selects manual export, official API, or isolated experimental adapter per channel. | Manual export works without credentials; live adapters require their own gates. |
| P14 - Trigger Plan | Approved queue exists. | `TRIGGER_PLAN.md` defines manual and clock triggers reading the same queue with duplicate prevention and failure behavior. | Manual trigger runs clean first; clock trigger is disabled until manual path is idempotent. |
| P15 - Worker Routing | Jobs and artifacts are known. | `WORKER_ROUTING.md` assigns one accountable worker, tools, forbidden actions, outputs, and approvals per job. | No job has unclear authority; public publishing, spend, credentials, and destructive actions require approval. |
| P16 - Measurement Plan | Content and distribution paths are defined. | `MEASUREMENT_PLAN.md` records metrics, UTM rules if needed, review cadence, and decision thresholds. | Measurement distinguishes buyer signal from vanity metrics. |
| P17 - Execution State | A path has started. | `EXECUTION_STATE.md` records completed, pending, blocked, evidence, and next action. | A new run can resume without repeating completed steps or losing blocker context. |
| P18 - Dev Deploy | Path works locally. | `drax-corp-dev` and/or `drax-site-dev` runs the path in the real dev environment. | Path runs complete on dev without intervention and produces expected output. |
| P19 - Zero-User Simulation | Dev deploy passed once. | Same path runs from clean state as if a new founder/user arrived. | No hidden local state, manual patch, or private assumption is required. |
| P20 - Production Promotion | Dev path and zero-user simulation passed. | Validated path is promoted into `drax-plugin` or `drax-site`; production version changes. | Production reflects validated paths only; no direct push or untested commit enters production. |

## Baseline v1 Artifacts

| Artifact | Definition |
|---|---|
| `FOUNDER_PROFILE.md` | Founder identity, constraints, voice, goals, risk tolerance, and operating context. |
| `PRODUCT_CONTEXT.md` | Product, offer, buyer, proof, conversion path, current evidence, and unsupported assumptions. |
| `LANGUAGE_STRATEGY.md` | Market-language posture before content planning. |
| `STACK_DECISION.md` | Current stack, automation posture, secrets/logs/backups, and future stack triggers. |
| `ORGANIC_GROWTH_STRATEGY.md` | Organic channel and content strategy connected to buyer behavior. |
| `NINETY_POST_PLAN.md` | Source plan for 90 content classes before calendar execution. |
| `EDITORIAL_CALENDAR.md` | Scheduled execution plan derived from the 90-post/class source plan. |
| `DISTRIBUTION_PLAN.md` | Channel, adapter, manual export, metadata, and approval posture. |
| `TRIGGER_PLAN.md` | Manual and clock trigger behavior against the approved queue. |
| `WORKER_ROUTING.md` | Accountable worker, permissions, forbidden actions, outputs, and gates per job. |
| `MEASUREMENT_PLAN.md` | Metrics, review cadence, evidence thresholds, and decision logic. |
| `EXECUTION_STATE.md` | Resume state, blockers, completed paths, pending paths, and evidence. |

## Deploy Topology

Principle:

No path enters the production repositories unless it has already run completely in the development repositories.

The four repositories:

| Repo | Type | URL |
|---|---|---|
| `drax-plugin` | Production runtime/package | No public URL. It produces the installable runtime. |
| `drax-site` | Production site | `drax.seudominio.com` or the final production domain. |
| `drax-corp-dev` | Development runtime/package | No public URL. It is the testable runtime source. |
| `drax-site-dev` | Development site | `drax-dev.seudominio.com` or the final dev domain. |

Production rules:

- Production repos never receive direct push.
- Production represents what the user can install or see.
- Production versions reflect validated paths, never work in progress.

Development rules:

- All development starts in dev repos.
- Tests happen in the real dev environment, including `drax-dev.seudominio.com` for the site.
- Failures stay contained in dev repos.
- Dev repos allow experimentation, rebuilds, broken paths, and zero-user simulations.

Promotion flow:

```text
path selected
  -> implemented in dev repo
  -> verified locally
  -> deployed to dev environment
  -> run complete without manual intervention
  -> run once from zero as a new user simulation
  -> evidence recorded
  -> promoted to production repo
  -> production version updated
  -> production deployment verified
```

Why four repos instead of branches:

- Branches in the same repo still create accidental production-push risk.
- Separate repos make isolation physical and visible.
- Dev repos can break without putting the production source of truth at risk.
- Production repos stay clean and small enough to audit.
- The promotion criterion prevents the four repos from becoming two undisciplined copies.

Promotion criterion:

A path is ready for production only when all three conditions are true:

1. It ran complete in the dev environment without manual intervention.
2. The result is identical to the expected result.
3. It ran at least once from zero, simulating a new user.

If any condition fails, the path returns to development.

Versioning rule:

Promotion from development to production defines the version increase.

```text
version = set of paths validated in dev and promoted to production
```

Production never represents experimentation. Production represents validated paths.

## Next Test Deploy Flow

After this document is accepted, the next operational work is:

1. Create or connect `drax-corp-dev`.
2. Create or connect `drax-site-dev`.
3. Connect `drax-site-dev` to `drax-dev.seudominio.com` or the chosen dev domain.
4. Run the first complete `v1.0.0` path in dev.
5. Run the same path from zero.
6. Promote only that validated path into production.

This keeps the system aligned with the main rule: development proves paths; production receives only proof.
