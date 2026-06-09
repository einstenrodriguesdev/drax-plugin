# DRAX Portfolio Roadmap

Status: versioned operating plan
Current release target: `v1.0.0`
Primary user: a founder with an existing product who wants a measurable organic automation system

## Product Thesis

DRAX earns expansion by proving one narrow capability first:

> Convert a founder's real expertise and product evidence into a source-backed, reviewable organic blog loop that improves from measured results.

The broader enterprise thesis remains a later gate, not the current release contract.

## Product Surfaces

| Surface | Role |
|---|---|
| `drax-plugin` | Public plugin source and customer install surface. |
| `drax-dev` | Private pre-release factory. |
| `drax-recursive` | DRAX's own customer workspace. |
| `conclave` | Internal operator and role factory. |

## Non-Negotiable Controls

- Dry-run is the default.
- Blog automation is the V1 distribution surface.
- Social APIs are future adapters.
- Playwright remains outside the customer V1 runtime.
- Secrets stay in environment files or secret managers.
- Runtime state under `.drax/` is not committed.
- Payment and signing secrets live only in `drax-api`.
- Every public claim must map to a passed gate.

## Phase Plan

### Phase 0: Foundation

Deliver:

- public plugin source
- private factory repo
- vendored marketing worker roles
- package allowlist
- trust and setup docs

Exit:

- package validation, tests, build, and secret scan pass

### Phase 1: Founder Intelligence

Deliver:

- free-text recognition
- repo-read confirmation
- one-purpose questions
- strategic three-option decisions
- baseline artifacts

Exit:

- representative founder interviews produce coherent artifacts without invented facts

### Phase 2: Blog Automation

Deliver:

- Astro blog generator
- identity from founder docs
- content collection, listing, post pages, RSS, metadata

Exit:

- generated blog builds in a clean workspace

### Phase 3: Trigger Engine

Deliver:

- `flock` lock
- isolated clone
- `codex exec` headless cycle
- dry-run and publish modes
- run manifests and publish records
- executable gates

Exit:

- real `codex exec` dry-run passes from zero

### Phase 4: Access And Commercial Gate

Deliver:

- access-token schema
- conversion-record schema
- runtime fail-closed check
- `drax-api` validation endpoint
- payment webhook token issuance

Exit:

- a paid token can be issued, validated, revoked, and measured as a sale

### Phase 5: DRAX Dogfooding

Deliver:

- complete DRAX baseline in `drax-recursive`
- DRAX blog loop running through Drax
- publish records and measurement review

Exit:

- DRAX produces paid subscriptions from its own organic loop

## Business Gates

| Gate | Required evidence |
|---|---|
| Problem | Founders repeatedly need the same organic automation setup. |
| Product | Users reach first dry-run content cycle with materially less effort. |
| Distribution | DRAX's own loop creates qualified traffic and buyer signal. |
| Commercial | Paid access tokens are issued and validated. |
| Expansion | Existing customers request and adopt the next distribution surface. |

## Known Risks

- Codex headless behavior can change across CLI versions.
- Content volume can damage authority if source and proof gates are weak.
- Local deploy can break a working site without backup and rollback.
- Support load can erase margin if install and recovery paths are unclear.
- Conversion claims remain hypotheses until paid tokens are issued.

## Decision Rule

Build the smallest path that can pass the next evidence gate. Do not sell or document broader capability as shipped until it works.
