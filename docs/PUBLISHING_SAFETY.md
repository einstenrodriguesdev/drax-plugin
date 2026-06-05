# Publishing Safety

## Adapter Priority

1. Official platform API.
2. Export-manual contingency.
3. Playwright experimental adapter.

Browser automation is not the production default. Passing a small test does not remove account-policy, UI-change, credential, or anti-automation risk.

Official APIs also have constraints. YouTube uploads require OAuth and application registration. TikTok Content Posting API uploads can require creator completion in-app, have rate limits, and can hit pending-share limits. Treat each platform as a gated adapter, not as a generic "post anywhere" interface.

## Required Publish Record

Every attempt records:

- content and asset hashes
- adapter and adapter version
- target account and environment
- approval identity and timestamp
- requested privacy status
- response or screenshot evidence
- remote post identifier
- rollback or delete result

## Kill Switches

Stop immediately on authentication anomalies, unexpected public visibility, repeated challenge pages, platform warnings, duplicate posts, rate-limit escalation, or metadata mismatch.

## Trigger Safety

The clock trigger and manual trigger read the same approved queue. They must verify asset hashes, check existing publish records for duplicate prevention, and write evidence for every attempt. A trigger failure never invents a substitute post.

## Rendering Options

`python-ffmpeg` is the default because it is deterministic and works on low-resource Linux/ARM64. `remotion` is used when richer TypeScript motion is worth its browser/runtime cost. `ffmpeg-template` provides a minimal caption, image, audio, and sound-effect path when the primary renderer is unavailable.
