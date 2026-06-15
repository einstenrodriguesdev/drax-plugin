# Email Lifecycle Automation
> Status: stub | Created: 2026-04-27 | Applies to: Email Marketing Manager
> Content to be filled on first lifecycle sequence build or 90-day review

---

## What this doc covers

The 5-stage lifecycle automation DAG (Welcome → Onboarding → Activation → Retention → Win-back) for B2B SaaS email programs. Includes: canonical entry triggers per stage, email count ranges, delay interval patterns, behavioral branch logic examples, exit condition taxonomy, sequence priority conflict resolution, and global suppression list rules.

---

## Stub schema (to be populated)

### 1. Lifecycle Stage Map

| Stage | Purpose | Entry trigger type | Typical email count | Typical duration |
|---|---|---|---|---|
| Welcome | Set context, establish sender; low commitment ask | Form submission / signup event | 2–4 | 5–10 days |
| Onboarding | Guide to first use; reduce time-to-aha | Account created / trial started | 4–7 | 10–21 days |
| Activation | Recover non-activated trials; escalate toward aha moment | Inactivity signal (no aha event in N days after trial start) | 3–5 | 7–14 days |
| Retention | Reinforce value; expand usage; reduce churn risk | Paid subscription active; milestone events | Ongoing / triggered | Monthly |
| Win-back | Recover cold and lapsing subscribers before suppression | Cold tier (no click in 90–180 days) OR churn event | 2–4 | 10–21 days |

### 2. Sequence Priority Resolution

When a subscriber qualifies for multiple sequences simultaneously, apply this priority order:

Priority 1 (highest urgency): Win-back
Priority 2: Activation
Priority 3: Onboarding
Priority 4: Welcome
Priority 5 (lowest urgency): Retention
Broadcasts: sent to all eligible subscribers across sequences (unless suppressed by sequence-specific exclusion logic)

Global suppression always overrides all sequence logic: unsubscribed subscribers and hard-bounced addresses exit all sequences permanently.

### 3. Entry Trigger Types

[To be populated with: product event names, form IDs, inactivity threshold definitions, behavioral signal examples — specific to the startup's product event taxonomy from the Analytics tracking plan]

### 4. Exit Condition Taxonomy

Every sequence must define all of these exit conditions explicitly:

- **Success exit**: subscriber completes the target behavior (e.g., aha moment event fires, paid conversion, engagement action)
- **Unsubscribe exit**: subscriber opts out — global suppression, immediate exit from all sequences
- **Hard bounce exit**: delivery permanently failed — permanent suppression
- **Max-emails-reached exit**: subscriber exhausted the sequence without taking the success action — route to next stage or win-back
- **Age-out exit**: subscriber has been in the sequence longer than the maximum duration without any engagement — route to win-back or cold tier

### 5. Behavioral Branch Logic Patterns

[To be populated with: specific branch logic examples from high-performing B2B SaaS lifecycle programs — e.g., "if subscriber clicks CTA in email 2, skip email 3 (redundant) and advance to email 4 (next-step prompt)"]

### 6. Delay Interval Patterns

[To be populated with: evidence-based delay interval guidelines per stage — research from ESP benchmark reports (Klaviyo, Customer.io, HubSpot) on optimal timing for B2B SaaS onboarding, activation, and win-back sequences]

### 7. Sequence Anti-patterns

[To be populated with: documented failure patterns from ESP platform post-mortems and practitioner case studies — e.g., missing exit conditions causing subscriber traps, overlapping sequences without priority rules, onboarding sequences that continue after aha moment]

---

## Sources to consult when populating

- Klaviyo B2B SaaS lifecycle automation documentation (2025)
- Customer.io lifecycle design guide
- Lenny's Newsletter — documented onboarding sequence structures from high-growth SaaS
- Samuel Hulick — "User Onboarding" framework (aha moment exit condition design)
- First Round Capital — startup lifecycle email case studies
