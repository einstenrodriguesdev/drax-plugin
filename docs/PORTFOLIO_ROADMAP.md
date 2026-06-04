# DRAX Portfolio Roadmap

Status: versioned operating plan  
Current release target: `v1.0.0`  
Primary user: a founder with an existing product who wants a measurable organic acquisition system

## Product Thesis

DRAX should prove one narrow capability before presenting itself as an enterprise operating system:

> Convert a founder's real expertise and product evidence into a source-backed, reviewable, multi-format organic publishing loop that improves from measured results.

The long-term enterprise thesis remains valid, but the commercial product earns the right to expand through passed release gates, not roadmap language.

## Repository Model

### `drax-corp`

Owns the private plugin runtime, canonical founder and product artifacts, asset manifests, renderer and publishing adapter contracts, audit records, tests, and versioned releases.

### `drax-site`

Owns the public knowledge base and commercial trust surface. It demonstrates the publishing system while remaining a static, independently deployable application.

### `conclave-cc`

Remains an internal source library. A useful capability moves into `drax-corp` only after a review confirms that it is required, coherent, supportable, and safe for the current release.

## Non-Negotiable Controls

- Dry-run is the default.
- Official platform APIs are the production publishing path.
- Playwright is an isolated experimental adapter with a dedicated account, rate limits, screenshots, and a kill switch.
- Manual export is always available.
- Secrets stay in an environment file or secret manager and are never copied into prompts, Markdown artifacts, logs, or assets.
- A strategic recommendation may be automated. A strategic commitment, public post, credential change, or spend decision requires accountable approval.
- Every claim in public product documentation must be backed by a passed release gate.

## Phase Plan

### Phase 0: Foundation

Deliver:

- independent repositories and ownership boundaries
- package allowlists and lockfiles
- canonical documentation and architecture decisions
- static public site with trust pages
- dry-run and approval defaults

Exit gate:

- package, plugin, type, and static production builds pass
- no secret material is committed
- rollback and incident paths are documented

### Phase 1: Founder Intelligence

Deliver:

- one-question-at-a-time founder interview
- product, buyer, offer, proof, voice, constraints, and conversion-path qualification
- seven canonical operating artifacts
- explicit v1 fit or gap decision

Exit gate:

- three representative founder interviews produce coherent artifacts without factual duplication
- unsupported products are rejected or redirected clearly
- time-to-first-plan is measured

### Phase 2: Editorial Production

Deliver:

- source-backed article briefs
- editorial calendar and channel hypotheses
- SVG/carousel asset manifests
- video and audio manifests
- deterministic preview renders

Rendering modes:

1. `python-ffmpeg`: default deterministic path for Linux and ARM64.
2. `remotion`: optional richer TypeScript motion path.
3. `ffmpeg-template`: low-complexity contingency for captions, images, music, and effects.

Exit gate:

- the same manifest creates reproducible output
- accessibility, source, metadata, and visual-quality checks pass
- every asset can be exported manually

### Phase 3: DRAX Dogfooding

Deliver:

- publish the DRAX knowledge base on a defined calendar
- produce article, SVG, and video variants from the same approved brief
- record cycle time, edits, engagement, and conversion signals

Exit gate:

- two complete weeks run with zero secret leakage, no duplicate publishing, and complete audit records
- failed steps recover without losing the content package
- measured evidence identifies what should continue, change, or stop

### Phase 4: Publishing Integrations

Deliver:

- YouTube official API adapter
- TikTok Content Posting API adapter
- platform-specific metadata and privacy controls
- retry, idempotency, rollback, and audit records
- Playwright test adapter and manual-export contingency

Exit gate:

- private or unlisted tests pass before any public test
- duplicate prevention, token revocation, rate-limit behavior, and rollback are verified
- platform terms and account permissions are documented

### Phase 5: Commercial v1.0.0

Deliver:

- signed package and documented installation paths
- upgrade and rollback process
- onboarding and support boundaries
- first external founder cohort

Exit gate:

- three external founders complete an approved content cycle
- support load, time-to-value, output quality, and retention signals are measured
- no capability is sold before its production gate passes

### Phase 6: Observability and Content Intelligence

Deliver:

- normalized platform metrics
- purchase-intent signal model
- content reuse and cadence recommendations
- documented decision provenance

Exit gate:

- recommendations are traceable to evidence
- false-positive and low-data behavior is understood
- the founder can override and audit every recommendation

### Deferred Major Versions

- `v2`: paid amplification only after organic evidence and positive ROAS controls exist
- `v3`: broader enterprise operations only after institutional buyers validate the need
- `v4`: capital and M&A readiness only with qualified legal, financial, and compliance review

## Business Gates

| Gate | Required evidence |
|---|---|
| Problem | Founders repeatedly spend meaningful time assembling the same organic system |
| Product | Users reach an approved first content cycle with materially less effort |
| Distribution | DRAX's own publishing loop creates qualified traffic and buyer signals |
| Commercial | Customers pay, use the system, and complete another cycle |
| Expansion | Existing customers request and adopt the next capability |

## Known Risks

- Platform policies and interfaces can invalidate browser automation.
- Content volume can damage authority if source and editorial standards weaken.
- An agent hierarchy can create complexity without improving outcomes.
- Near-zero infrastructure cost does not imply near-100% gross margin after support, payment fees, compliance, and sales costs.
- Conversion and market-size claims remain hypotheses until measured against a defined cohort.

## Decision Rule

Build the smallest capability that can pass the next evidence gate. Preserve the broader thesis in documentation, but do not make it part of the release contract until it works.
