# Release Gates

## Version Rule

Semantic versions describe shipped capability:

- PATCH: compatible correction or maintenance
- MINOR: new compatible capability that passed its release gate
- MAJOR: changed product contract or business capability

## v1.0.0 Gate

- founder qualification and canonical artifacts work on representative cases
- package and plugin validators pass
- install, upgrade, doctor, and rollback behavior are tested
- dry-run is the default
- manual export works without a platform credential
- public documentation does not claim unpassed live integrations

## Renderer Gate

- deterministic or fully recorded inputs
- preview and final-output validation
- output hash and manifest
- font, codec, license, accessibility, and failure checks

## Publishing Adapter Gate

- isolated test account
- least-privilege credential
- private or unlisted test before public test
- idempotency and duplicate prevention
- rate-limit and retry behavior
- audit evidence and remote identifier
- rollback or deletion behavior
- kill switch and token revocation tested

## Commercial Gate

- three external founders complete one approved cycle
- time-to-value, edits, failures, support load, and retention intent are measured
- known limitations are visible before purchase
- incident and refund paths are operational
