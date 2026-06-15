# Metric Contracts Protocol

Metric contracts make business, product, engineering, and revenue teams use the same definitions.

## When To Load

Load before dashboards, attribution reports, forecast reviews, paid traffic decisions, product analytics, customer health scoring, and board-grade reporting.

## Required Inputs

- Metric name
- Business question
- Data sources
- Owner
- Consumer
- Decision affected
- Update cadence

## Method

1. Define the metric in business language.
2. Define the exact calculation.
3. Define inclusion and exclusion rules.
4. Define source of truth.
5. Define grain: user, account, session, opportunity, invoice, campaign.
6. Define freshness and latency tolerance.
7. Define quality checks.
8. Define owner and escalation path.
9. Record known limitations.

## Decision Gates

- A metric used for budget, roadmap, hiring, or fundraising must have an owner.
- A metric without source of truth is not decision-grade.
- Platform-reported ad metrics cannot be the sole revenue source of truth.
- If two dashboards disagree, freeze decisions until reconciliation is documented.

## Output Format

```markdown
# Metric Contract - [metric]

Owner:
Decision:
Source of truth:
Calculation:
Grain:
Cadence:
Quality checks:
Limitations:
```

## Failure Modes

- Dashboard Drift: same label, different calculation.
- Vanity Proxy: using an easy metric for a hard business question.
- Attribution Overconfidence: platform credit treated as cash truth.
- Ownerless Metric: everyone uses it, nobody maintains it.
