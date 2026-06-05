# Security Policy

## Operating Defaults

- Publishing defaults to `dry-run`.
- Live publishing, ad spend, credential changes, and destructive actions require explicit human approval.
- Official platform APIs are the production path. Playwright is experimental, isolated, rate-limited, and protected by a kill switch.
- Secrets are read only from the environment or a secret manager. They are never written to project artifacts, logs, prompts, or generated assets.
- The plugin reads only known Drax artifact filenames during session startup.
- Every publish attempt must record adapter, account, asset hash, approval, timestamp, result, and remote identifier.

## Verification Baseline

The v1 target is OWASP ASVS Level 1-aligned controls for any hosted surface and NIST SSDF-style software delivery discipline:

- dependency inventory and lockfile
- package allowlist
- secret scanning
- least-privilege tokens
- isolated test accounts
- dry-run and manual export defaults
- explicit trust boundaries
- reproducible asset hashes
- trigger idempotency
- incident and rollback procedures

CI/CD and automation controls must treat credential hygiene, dependency chain abuse, poisoned pipeline execution, insecure configuration, and insufficient logging as first-order risks.

## Reporting

Report vulnerabilities to `einstenrodrigues.dev@gmail.com`. Do not include active credentials or personal data in the report.
