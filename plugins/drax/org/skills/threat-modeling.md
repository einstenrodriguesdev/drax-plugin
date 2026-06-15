# Threat Modeling Protocol

Threat modeling identifies how a system can fail under adversarial pressure before those failures become incidents.

## When To Load

Load for security-sensitive products, auth, payments, user data, admin tools, integrations, browser automation, SSH/tmux runtime, credential storage, and public endpoints.

## Required Inputs

- System boundary
- Data types
- Actors and trust levels
- Entry points
- External services
- Secrets and credentials
- Existing controls
- Business impact if compromised

## Method

1. Draw the system boundary in text.
2. List assets:
   - identities
   - credentials
   - customer data
   - payment data
   - deployment rights
   - logs and analytics
3. List trust boundaries.
4. Apply STRIDE:
   - Spoofing
   - Tampering
   - Repudiation
   - Information disclosure
   - Denial of service
   - Elevation of privilege
5. Score each threat:
   - likelihood: low / medium / high
   - impact: low / medium / high
   - control: existing / planned / missing
6. Convert missing controls into requirements.

## Decision Gates

- Any high-impact missing control blocks production launch.
- Secrets in source control block release.
- Host-key verification disabled blocks enterprise SSH runtime.
- Public write endpoint without auth/CSRF/rate limiting blocks release.
- Payment/webhook endpoint without signature verification blocks release.

## Output Format

```markdown
# Threat Model - [system]

## Boundary
## Assets
## Trust Boundaries
## STRIDE Findings
| Threat | Asset | Likelihood | Impact | Control | Action |
## Launch Decision
```

## Failure Modes

- Asset Blindness: modeling endpoints but not the data.
- Control Assumption: assuming framework defaults cover business risk.
- Test-only Exception Leak: unsafe test behavior reaches production.
- Compliance Confusion: treating compliance evidence as security control.
