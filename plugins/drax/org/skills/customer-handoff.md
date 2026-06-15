# Customer Handoff Protocol

Customer handoff keeps sales, onboarding, success, support, and product from losing context after a customer says yes or asks for help.

## When To Load

Load for sales-to-CS handoff, onboarding kickoff, support escalation, training requests, renewal risk, technical support, and customer feedback transfer to product.

## Required Inputs

- Customer/account
- Owner sending handoff
- Owner receiving handoff
- Customer goal
- Current state
- Commitments made
- Risks
- Next action

## Method

1. Identify the handoff type:
   - sales to onboarding
   - onboarding to success
   - support to engineering
   - success to product
   - support to customer
2. Capture customer context:
   - buyer/user
   - desired outcome
   - promised timeline
   - important objections
   - success metric
3. Capture operational state:
   - access
   - environment
   - open issues
   - blockers
   - next meeting or deadline
4. Confirm receiving owner.
5. Confirm customer-facing next step.

## Decision Gates

- No receiving owner: handoff is invalid.
- No customer goal: handoff is low quality.
- Commitment without owner/date: escalate.
- Technical issue without reproduction/logs: support handoff incomplete.

## Output Format

```markdown
# Customer Handoff - [account]

From:
To:
Customer goal:
Current state:
Commitments:
Risks:
Next action:
Due:
```

## Failure Modes

- Context Loss: customer repeats themselves after handoff.
- Promise Drift: sales promise becomes delivery surprise.
- Owner Gap: everyone knows, nobody owns.
- Support Loop: issue circulates without reproduction evidence.
