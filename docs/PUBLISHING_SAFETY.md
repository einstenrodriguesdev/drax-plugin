# Publishing Safety

## Active Surface

The active V1 publishing surface is the local blog surface.

`drax cycle --dry-run` fabricates the package, runs gates, writes hashes, writes a run manifest, and writes a dry-run publish record.

`drax cycle --publish` writes the generated article into the isolated clone's blog surface. It does not deploy to the live server path.

## Local Deploy Boundary

Live local deploy is a future approval-gated path. Before it can write to a server path, the deploy config must define:

- target directory
- static output directory
- backup directory
- server or proxy reload command
- rollback command
- approval owner
- approval timestamp

The deploy must back up before write and stop if rollback is not available.

## Future Adapters

Future external platform adapters are gated separately:

1. Official platform API.
2. Export-manual contingency.
3. Playwright experimental adapter for isolated tests only.

Browser automation is not the customer production default. Passing a small test does not remove account-policy, UI-change, connection, or anti-automation risk.

## Required Publish Record

Every attempt records:

- run ID
- content package ID
- post class
- adapter and mode
- content and asset hashes
- approval identity and timestamp
- evidence path
- target path or remote identifier
- result
- rollback or delete result when relevant

The publish record on disk is the source of truth for semantic success. Stdout and exit code are not enough.

## Kill Switches

Stop immediately on unexpected public visibility, duplicate posts, connection anomalies, repeated challenge pages, platform warnings, rate-limit escalation, metadata mismatch, hash mismatch, or missing rollback.

## Trigger Safety

The clock trigger and manual trigger call the same wrapper. They acquire the same `flock` lock before reading `EXECUTION_STATE.json`, verify asset hashes, check publish records for duplicate prevention, and write evidence for every attempt.

A trigger failure never invents a substitute post and never advances state.
