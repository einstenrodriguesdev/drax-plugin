# Roadmap And Phase Gates

## Phase 0: Open-Core Foundation

Status: passed for `drax-plugin`, pending promotion for `drax-dev` changes.

Exit:

- public plugin source exists
- secret scan passes
- package allowlist passes
- marketplace install path is documented
- no payment, signing, session, or environment secret ships

## Phase 1: Founder Intake Upgrade

Status: built in `drax-dev`.

Exit:

- recognition phase uses free text
- strategic definition uses three options plus custom answer only after recognition
- repo facts are read and confirmed
- no question asks for secret values
- live interactive test confirms the behavior

## Phase 2: Blog Surface

Status: built in `drax-dev`.

Exit:

- `drax blog init` generates the Astro blog surface
- identity comes from founder docs at runtime
- missing values remain `NEEDS_DECISION`
- clean workspace build passes

## Phase 3: Trigger Engine

Status: built with fake-Codex tests in `drax-dev`.

Exit:

- `drax cycle --dry-run` passes with real `codex exec`
- run manifest and publish record are verified from disk
- forbidden-claim gate fails closed
- cron command is correct for the decided timezone and schedule
- no live deploy occurs

## Phase 4: Access Gate

Status: schema and fail-closed stub built.

Exit:

- `drax-api` validates token signature, expiry, revocation, billing state, and tier limits
- payment webhook issues a token and conversion record
- provider to tier mapping is decided
- no provider key enters plugin source or package output

## Phase 5: Clean Install And Promotion

Status: next operational step.

Exit:

- package artifact installs on a clean non-root machine
- Codex PATH and Device Code setup are documented and verified
- `drax init`, `drax blog init`, and `drax cycle --dry-run` pass from zero
- forbidden-pattern audit passes on tarball contents
- promotion patch lands in public `drax-plugin`

## Phase 6: DRAX Dogfooding

Status: pending.

Exit:

- `drax-recursive` baseline is complete
- DRAX qualifies through its own gate
- two weeks of dry-run and approved publish records are produced
- measurement identifies continue, change, scale, or stop decisions

## Phase 7: Local Deploy

Status: contract only.

Exit:

- backup-before-write implemented
- target/output/backup/reload/rollback fields are enforced
- dry-run deploy and rollback tests pass
- live deploy requires approval and stops on missing rollback

## Later Major Versions

- `v2`: paid traffic amplification after organic evidence and ROAS controls
- `v3`: documentation layer
- `v4`: product-building layer
- `v5`: capital and institutional readiness

No later capability enters V1 docs as a shipped claim.
