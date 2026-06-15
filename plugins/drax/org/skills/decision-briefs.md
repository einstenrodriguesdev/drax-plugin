# Decision Brief Protocol

Decision briefs convert ambiguous operational or financial choices into inspectable recommendations.

## When To Load

Load for finance, operations, procurement, process changes, vendor choices, hiring sequence, budget allocation, and cross-functional tradeoffs.

## Required Inputs

- Decision topic
- Decision owner
- Deadline
- Options
- Constraints
- Evidence
- Risks
- Reversibility

## Method

1. State the decision in one sentence.
2. Name the owner and required approver.
3. List 2-3 options only.
4. For each option, document:
   - approach
   - upside
   - cost
   - risk
   - reversibility
   - downstream impact
5. Recommend one option.
6. State what evidence would change the decision.
7. Record final decision and date.

## Decision Gates

- No owner: decision is not ready.
- No deadline: decision can drift.
- Irreversible high-impact decision without alternatives: escalate.
- Financial decision without runway/budget impact: incomplete.

## Output Format

```markdown
# Decision Brief - [topic]

Owner:
Approver:
Deadline:

## Options
## Recommendation
## Risks
## Evidence That Would Change This
## Final Decision
```

## Failure Modes

- Analysis Fog: collecting context without forcing a choice.
- Hidden Approver: work proceeds before authority is clear.
- One-Option Theater: recommendation pretends to be analysis.
- Reversibility Blindness: treating reversible and irreversible choices the same.
