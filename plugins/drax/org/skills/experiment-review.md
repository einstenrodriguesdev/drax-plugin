# Experiment Review Protocol

Experiment review determines whether a test produced learning, signal, or noise.

## When To Load

Load after product experiments, growth tests, pricing tests, onboarding tests, paid traffic tests, email tests, and analytics investigations.

## Required Inputs

- Hypothesis
- Variant or intervention
- Success metric
- Guardrail metric
- Start/end date
- Sample size
- Data source
- Decision owner

## Method

1. Restate the hypothesis before looking at results.
2. Validate instrumentation.
3. Check sample size and exposure quality.
4. Compare result against success threshold.
5. Check guardrails.
6. Classify result:
   - Validated
   - Invalidated
   - Inconclusive
   - Invalid test
7. Decide next action:
   - scale
   - repeat
   - modify
   - stop
8. Record learning in a durable log.

## Decision Gates

- Broken tracking: invalid test.
- No pre-declared hypothesis: weak evidence.
- Guardrail violated: do not scale even if primary metric improved.
- Paid traffic with negative economics: stop or redesign.

## Output Format

```markdown
# Experiment Review - [test]

Hypothesis:
Metric:
Result:
Classification:
Learning:
Decision:
Next test:
```

## Failure Modes

- Winner Hunting: searching dashboards until something looks good.
- Metric Substitution: changing success metric after results.
- False Scale: increasing spend on weak sample size.
- Learning Loss: result discussed but not recorded.
