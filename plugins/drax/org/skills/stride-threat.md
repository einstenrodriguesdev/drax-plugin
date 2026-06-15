# STRIDE Threat Modeling

Apply to every surface that handles user data, authentication, or external input. Score each threat: HIGH / MEDIUM / LOW. Address HIGH before launch.

**S — Spoofing identity**
Can an attacker impersonate a legitimate user or system?
Check: authentication mechanism, session tokens, API key handling, webhook verification.

**T — Tampering with data**
Can data be modified in transit or at rest without detection?
Check: HTTPS enforcement, input validation, database write permissions, signed payloads.

**R — Repudiation**
Can a user or system deny having performed an action?
Check: audit logging, transaction receipts, non-repudiation mechanisms.

**I — Information disclosure**
Can sensitive data be exposed to unauthorized parties?
Check: error messages (stack traces in prod), logging PII, API response verbosity, storage encryption.

**D — Denial of service**
Can an attacker make the system unavailable?
Check: rate limiting, resource caps, unauthenticated endpoints, third-party dependency uptime.

**E — Elevation of privilege**
Can a user gain permissions beyond what was granted?
Check: role enforcement on every route, horizontal access control (user A accessing user B's data), admin panel exposure.

**Minimum Viable Security (classify each control):**
- BLOCK: must be in place before any user data is handled
- MILESTONE: required before charging users or handling PII at scale
- ROADMAP: hardening for post-PMF
