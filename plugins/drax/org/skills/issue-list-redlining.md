# Issue List Redlining Protocol

Issue list redlining turns legal, commercial, compliance, and contract concerns into actionable negotiation items.

## When To Load

Load for contracts, vendor terms, customer agreements, employment documents, compliance gaps, data-processing terms, and legal review handoffs.

## Required Inputs

- Document or issue summary
- Counterparty
- Business objective
- Risk tolerance
- Non-negotiables
- Desired fallback positions

## Method

1. Identify the document and business context.
2. Separate issues into:
   - legal risk
   - commercial risk
   - operational burden
   - compliance requirement
   - unclear language
3. Classify severity:
   - P0: cannot sign / cannot proceed
   - P1: must negotiate
   - P2: acceptable with mitigation
   - P3: note only
4. Write preferred language or business fallback.
5. Assign owner for each issue.
6. Record final position.

## Decision Gates

- P0 issue unresolved: do not sign or proceed.
- Data/security clause without CISO review: hold.
- Payment/liability term without CFO/CRO awareness: hold.
- Employment/contractor issue without jurisdiction clarity: hold.

## Output Format

```markdown
# Issue List - [document]

| Clause / Issue | Severity | Risk | Preferred Position | Fallback | Owner |
Decision: CLEAR | NEGOTIATE | BLOCKED
```

## Failure Modes

- Redline Without Business Context: legally precise but commercially useless.
- Hidden Non-Negotiable: deal progresses until late-stage block.
- Risk Dumping: legal notes risks but no owner decides.
- Clause Tunnel Vision: missing operational burden created by terms.
