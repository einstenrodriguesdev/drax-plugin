# ops-process-frameworks.md
> Domain: Operations — Process Design & Standardization
> Status: stub
> Applies to: COO
> Maintained by: HR agent — populate on 90-day review or when COO activates DMAIC protocol

---

## Purpose

Provides the COO with named operational frameworks for diagnosing process failure, standardizing cross-functional workflows, and controlling process regression after improvement.

---

## DMAIC (Lean Six Sigma)

**Source:** Motorola / GE Six Sigma methodology. Documented in ASQ (American Society for Quality) as the canonical improvement cycle.

**Phases:**
- **Define**: Identify the problem, process scope, customer impact, and project charter. Owner: functional team lead.
- **Measure**: Quantify current state — cycle time, defect rate, throughput. Baseline metrics established here.
- **Analyze**: Root cause analysis — fishbone diagram, 5 Whys, Pareto chart. Identify the constraint or failure point.
- **Improve**: Design and implement the fix. COO owns this phase — cross-functional change requires COO authority.
- **Control**: Prevent regression. Establish SLA, monitoring cadence, and escalation trigger. COO owns this phase.

**COO application:** Load this framework when a cross-functional process generates repeated failures (e.g., customer escalation loop, product-to-sales handoff breakdowns, onboarding defect rate > 10%).

**When to invoke:** Process defect rate is measurable AND the same failure recurs in more than 2 consecutive reporting cycles.

---

## RACI Matrix

**Source:** Responsibility Assignment Matrix — documented in PMBOK (Project Management Body of Knowledge) as the standard for decision-ownership clarity.

**Roles:**
- **R (Responsible)**: Does the work.
- **A (Accountable)**: Signs off. One per decision — never shared.
- **C (Consulted)**: Provides input before decision. Two-way communication.
- **I (Informed)**: Receives output after decision. One-way communication.

**COO application:** Build RACI maps for every cross-functional process that touches 2+ departments. The COO does not perform the work (R) on most processes — the COO is typically A (accountable) on process governance, and I (informed) on execution.

**Conflict arbitration rule:** When two department heads claim A on the same decision, COO arbitrates using domain authority rule — technical decisions → CTO is A; legal decisions → CLO is A; GTM decisions → CMO is A. COO is A only on cross-functional operational processes that do not belong to a single domain.

**When to invoke:** Two or more departments are operating with conflicting assumptions about who owns a shared deliverable.

---

## SOP Construction Protocol

**Format standard:** Each SOP contains:
1. Process name and owner (A in RACI)
2. Trigger: what event starts the process
3. Steps: numbered, with responsible role per step
4. Exit criteria: what state signals process completion
5. Exception path: what happens when the normal path fails
6. Metrics: how process health is measured (cycle time, error rate, SLA)
7. Review cadence: how often the SOP is audited

**COO authority:** COO approves all SOPs for processes that touch 2+ departments. Single-department SOPs are approved by the functional lead; COO is informed only.

---

## Stub notice

This document is a schema-level stub. Deep content (case examples, industry benchmarks, tool integrations) will be added when the COO agent is activated and a specific process improvement mandate is in scope.
