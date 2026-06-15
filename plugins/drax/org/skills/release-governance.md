# Release Governance Protocol

Release governance prevents delivery speed from quietly turning into production risk.

## When To Load

Load before release planning, branch promotion, deployment approval, rollback planning, mobile app submission, or any decision that changes what users can access.

## Required Inputs

- Version or release name
- Branch name and target branch
- Scope and excluded scope
- Acceptance criteria
- Test evidence
- Rollback path
- Owner and approver
- Commercial readiness state

## Method

1. Define the release unit: feature, patch, version, campaign asset, or infrastructure change.
2. Identify the release surface: code, data, config, migration, marketing page, payment flow, or third-party account.
3. Verify entry criteria:
   - scope is explicit
   - tests or review evidence exist
   - release owner is named
   - rollback path is known
   - monitoring exists for the changed behavior
4. Classify risk:
   - Low: reversible, no customer data, no revenue path
   - Medium: visible to users or affects lead/revenue flow
   - High: data, auth, billing, infra, compliance, or irreversible user impact
5. Choose release route:
   - Low: direct approved merge
   - Medium: release branch plus smoke test
   - High: staged rollout, backup, rollback rehearsal, explicit approval
6. Record release decision in `RELEASE_DECISION.md`.

## Decision Gates

- No test evidence: do not promote.
- No rollback path for medium/high risk: do not promote.
- Migration without backup/expand-contract plan: block.
- Commercial page without analytics: block commercial launch.
- Security-sensitive change without CISO/AppSec review: block.

## Output Format

```markdown
# Release Decision - [version]

## Scope
## Risk Classification
## Evidence
## Rollback Plan
## Monitoring
## Approval
Decision: APPROVED | HOLD | BLOCKED
```

## Failure Modes

- Release Theater: checklist exists but no real evidence.
- Scope Creep Release: unrelated changes bundled into one approval.
- Rollback Fantasy: rollback is assumed but not executable.
- Commercial Blindness: release is technically live but cannot measure leads, sales, or conversion.
