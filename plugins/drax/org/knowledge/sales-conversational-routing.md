# Sales Conversational Routing
> Applies to: Automation Receptionist, Appointment Setter, SDR, Support Specialist
> Status: stub
> Created: 2026-05-01 by HR agent

---

## Scope

This document covers the operational mechanics of inbound conversational routing in a Conclave revenue motion. It defines intake-tree design, contact capture rules, qualification outcomes, support-vs-sales separation, human fallback, and the metrics that prove whether the first-touch automation is helping or harming pipeline.

---

## Intake Tree Design

When populated, this doc should define:

- channel-specific entry triggers
- first-turn question rules
- support vs sales split
- existing-customer vs net-new split
- what information is required before routing

Core principle:
- Ask the smallest number of questions required to reach a correct next step.

---

## Contact Capture Minimums

This role must not route anonymous conversations blindly.

When populated, define:

- minimum contact fields by channel
- when email is required
- when phone is required
- what happens if the contact refuses capture

Intercom's lead-generation guidance explicitly supports automatic contact capture plus qualification data collection before routing or CRM sync.

---

## Qualification Outcomes

This doc should define a standard outcome taxonomy for inbound automation, for example:

- Book sales call
- Route to sales inbox
- Existing customer to support
- Provide education
- Start trial
- Disqualified
- Disengaged
- Unresolved / escalate

Intercom's Fin for Sales reporting model uses a similar outcome view so teams can inspect what the automation is actually doing.

---

## Human Fallback Rules

When populated, include:

- what happens when intent is unclear
- what happens when the bot cannot qualify
- what happens when no owner or calendar matches
- what happens when the user asks for a human

Intercom explicitly recommends defining what happens if Fin is unable to qualify a lead. A routing flow without a fallback is incomplete.

---

## Calendar and Owner Routing

This section should define:

- intent-to-owner mapping
- intent-to-calendar mapping
- fallback calendar rules
- route-to-inbox rules
- multi-department split rules

HighLevel's multi-calendar booking documentation is a good example of why this matters: if multiple teams or services exist, one default calendar is often wrong.

---

## Channel-Specific Behavior

Chat, email, SMS, and voice should not share one identical logic tree.

When populated, define:

- abandonment expectations by channel
- pacing and question-count by channel
- when to use synchronous booking vs asynchronous follow-up
- which channel requires human handoff fastest

Intercom explicitly notes chat and email should be deployed separately because behavior differs by channel.

---

## Performance Metrics

When populated, track:

- conversation volume
- contact capture rate
- routing completion rate
- qualification funnel
- booked-call volume
- support transfer volume
- unresolved escalation count
- disqualification rate

If those metrics are absent, the system may appear productive while silently leaking value.
