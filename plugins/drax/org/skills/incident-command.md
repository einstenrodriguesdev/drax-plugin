# Incident Command Protocol

Incident command gives one accountable operating shape to urgent production, security, customer, or revenue failures.

## When To Load

Load when a customer-visible outage, data exposure, payment failure, account compromise, broken release, high-severity bug, or support escalation needs coordinated action.

## Required Inputs

- Incident summary
- Start time
- Detection source
- Affected users/systems
- Current severity
- Known facts
- Unknowns
- Current owner

## Method

1. Name an Incident Commander.
2. Declare severity:
   - SEV-1: business-critical, security, data, billing, widespread outage
   - SEV-2: major function degraded or many users affected
   - SEV-3: limited impact, workaround exists
3. Separate roles:
   - Commander: decisions and coordination
   - Operations: technical investigation
   - Communications: customer/internal updates
   - Scribe: timeline and facts
4. Build a fact log. Do not speculate in the timeline.
5. Stabilize first, root-cause second.
6. Define update cadence.
7. Close only after recovery, customer communication, and follow-up owners are documented.

## Decision Gates

- Potential customer data exposure: notify CISO/CLO immediately.
- Payment/revenue impact: notify CFO/CRO.
- Customer SLA impact: notify Support/Customer Success.
- No commander assigned: incident is unmanaged.

## Output Format

```markdown
# Incident Record - [title]

Severity: SEV-1 | SEV-2 | SEV-3
Commander:
Started:
Status:

## Impact
## Timeline
## Actions
## Communications
## Recovery Decision
## Follow-Up Owners
```

## Failure Modes

- Many Drivers: multiple people making conflicting decisions.
- Root-Cause Trap: debugging while users remain impacted.
- Silent Incident: customers notice before the company communicates.
- Memory Timeline: no written record until after facts are lost.
