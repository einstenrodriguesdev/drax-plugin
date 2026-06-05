# Trigger Plan

Status: draft
Owner: distribution
Last reviewed:

Daily posting requires both a clock trigger and a manual trigger. Both read the same approved queue and write the same publish record format.

## Trigger Options

| Option | Trigger posture | Advantage | Disadvantage | Cost/complexity | Choose when | Do not choose when |
|---|---|---|---|---|---|---|
| A | Manual trigger only | Safest first test; founder approves every run. | Does not prove autonomous daily operation. | Low | Testing the first content packages. | Daily execution must happen without founder presence. |
| B | Clock trigger plus manual fallback | Proves daily operation while preserving operator override. | Requires idempotency, logs, and failure handling. | Medium | VPS or always-on machine is available. | Queue, credentials, or approvals are unstable. |
| C | Full scheduled queue with API adapters | Best scale path for multiple channels and accounts. | Requires platform gates, app reviews, and stronger monitoring. | High | API adapters are approved and tested. | Playwright is the only available adapter. |

Custom answer:

## Decision

- Selected option:
- Clock schedule:
- Manual command:
- Queue file/location:
- Publish record location:
- Failure notification:
- Kill switch:
- Revisit trigger:

## Idempotency Rules

- Each content package has a stable ID.
- A trigger refuses to publish an ID that already has a successful publish record for the same platform/account.
- A trigger verifies asset hashes against the manifest before attempting upload.
- A failed run records failure evidence and does not retry infinitely.
- If official API and Playwright are unavailable, export-manual is generated.

## Trigger Log

| Date/time | Trigger | Package ID | Platform | Result | Evidence | Next action |
|---|---|---|---|---|---|---|
