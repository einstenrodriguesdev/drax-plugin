# Call Review Scorecards Protocol

Call review scorecards turn sales and success calls into coaching evidence instead of subjective feedback.

## When To Load

Load for sales enablement, discovery call review, demo review, onboarding call review, renewal call review, and rep coaching.

## Required Inputs

- Call type
- Call recording/transcript or notes
- Stage
- Rep/owner
- Customer persona
- Desired outcome
- Scorecard version

## Method

1. Identify call objective.
2. Score only behaviors visible in evidence.
3. Use a 1-5 scale:
   - 1 absent or harmful
   - 2 weak
   - 3 acceptable
   - 4 strong
   - 5 excellent
4. Score core dimensions:
   - agenda and control
   - discovery depth
   - pain quantification
   - business impact
   - stakeholder mapping
   - objection handling
   - next-step clarity
5. Identify one coaching priority, not ten.
6. Convert coaching into practice action.

## Decision Gates

- No buyer-owned next step: call outcome is weak.
- No quantified pain in discovery: opportunity quality is uncertain.
- Demo before pain: flag enablement issue.
- Coaching without evidence: do not record as performance fact.

## Output Format

```markdown
# Call Review - [rep/account/date]

Call objective:
Outcome:
Scores:
Coaching priority:
Practice action:
Manager follow-up:
```

## Failure Modes

- Personality Review: judging style over buyer progress.
- Everything Feedback: too many notes, no behavior change.
- Outcome Bias: closed-won call assumed to be good.
- No Practice Loop: feedback given without a drill or next review.
