# Engineering: QA Strategy
> Status: stub | Created: 2026-04-25 | Applies to: QA Engineer, Full Stack Developer, CTO, Product Manager
> Load trigger: before authoring any test case document, configuring any CI gate, classifying defects, or producing any Pre-Release Sign-Off.

---

## Purpose

This document contains canonical QA frameworks for a seed-stage product engineering team. Covers BDD/Gherkin test case authoring, Risk-Based Testing prioritization, defect taxonomy, Defect Escape Rate (DER) calculation and thresholds, shift-left testing protocol, and Pre-Release Sign-Off criteria. Content to be expanded on first agent activation.

---

## 1. Shift-Left Testing Protocol

Shift-left means testing activities begin at the requirements phase — not after implementation.

### Sequence

| Phase | QA Activity | Output |
|---|---|---|
| PRD authored by PM | QA Engineer reviews for testability gaps | Annotated PRD with ambiguity flags — returned to PM before dev starts |
| Acceptance criteria finalized | QA Engineer authors Test Case Document (Given-When-Then) | Test Case Document — attached to PRD before implementation |
| Implementation begins | Developer references test cases as specification | Test cases serve as acceptance specification, not just verification |
| Implementation complete | QA runs automated suite; files defects | Defect reports filed against PRD criteria |
| Merge gate | CI pipeline runs test stages | PASS = merge allowed; FAIL = merge blocked |
| Pre-deploy | QA Engineer signs off | PASS or BLOCK based on P0/P1 status |

### Why shift-left matters (evidence basis)

IBM Systems Sciences Institute documented that defects found during requirements cost 1× to fix. Defects found during design: 5–10×. Defects found during coding: 10×. Defects found during testing: 20–50×. Defects found in production: 100×. Source: IBM Systems Sciences Institute, "Relative Costs of Fixing Defects."

---

## 2. BDD / Gherkin Given-When-Then Test Case Format

Behavior-Driven Development (BDD) uses the Gherkin language to write acceptance criteria that are both human-readable and machine-executable.

### Syntax

```gherkin
Feature: [Feature name — matches PRD section]

  Background: (optional shared context)
    Given [shared precondition]

  Scenario: [TC-ID] — [Scenario name]
    Given [initial context / system state]
    When [action taken by user or system]
    Then [observable outcome — what the user sees or what the system does]
    And [additional outcome, if needed]
```

### Rules for good Given-When-Then

- **Given**: describe system state, not user actions. "Given the user has an active account" — not "Given the user signed up."
- **When**: one action only. Multiple actions = multiple scenarios.
- **Then**: observable, verifiable outcome. "Then the dashboard loads with the user's name in the header" — not "Then the user is logged in."
- **No negatives in Given**: "Given the user is NOT logged in" is acceptable. "Given the feature does NOT exist" is not testable.
- **One scenario per behavior**: do not combine multiple behaviors in one scenario.

### Example

```gherkin
Scenario: TC-001 — Valid credentials login
  Given the user has an active account with email "user@example.com"
  And the user is on the login page
  When the user enters correct credentials and submits the form
  Then the user is redirected to the dashboard
  And the dashboard displays the user's first name in the navigation header

Scenario: TC-002 — Invalid password — error message does not reveal user existence
  Given the user is on the login page
  When the user enters email "user@example.com" with an incorrect password
  Then an error message "Invalid email or password" is displayed
  And the error message does NOT indicate whether the email address exists in the system
```

### Tool mapping

- Cucumber.js / Playwright BDD plugin: executes Gherkin `.feature` files directly
- Playwright without Gherkin: scenarios mapped manually to `.spec.ts` describe/it blocks
- Jest: integration and unit scenarios do not require Gherkin — use describe/it with scenario names matching TC-IDs

---

## 3. Risk-Based Testing (RBT) — Priority Classification

Risk = likelihood of failure × business impact. Test coverage allocation follows risk level.

### Priority matrix

| Priority | Likelihood | Business Impact | Required Coverage |
|---|---|---|---|
| P0 | Any | Feature failure = zero users achieve core product value | E2E (critical path) + Integration (all endpoints) + Unit (business logic) |
| P1 | Medium–High | Significant user impact; workaround exists but experience is degraded | E2E (happy path) + Integration (main scenarios) |
| P2 | Low–Medium | Moderate user impact; edge case or non-critical path | Integration (happy path + 1 failure case) |
| P3 | Low | Cosmetic; rare occurrence; low user visibility | Manual exploratory only — document coverage gap |

### P0 examples (seed-stage product)

- Authentication flow (login, signup, password reset)
- Aha moment journey (the core action that delivers product value)
- Payment flow (if product has paid tier)
- Data persistence (user data saved and retrievable)
- API authentication and authorization (BOLA — unauthorized access)

### P3 examples

- Sorting order of non-critical list views
- Tooltip text accuracy
- Non-primary error message copy

---

## 4. Defect Taxonomy

Classifying defects by phase of introduction and escape point identifies where the QA process has gaps.

### Phase of introduction

| Phase | Description | Example |
|---|---|---|
| Requirement | Defect exists in the acceptance criteria or user story | Ambiguous requirement → two valid implementations, one breaks UX |
| Design | Defect in architecture or component interaction design | Race condition in async flow not identified in design review |
| Code | Implementation error against a correct specification | Off-by-one error in validation logic |
| Test | Defect introduced by a test environment or test data issue | Test passes because test database uses permissive constraints not present in production |

### Escape point

The test phase that should have caught the defect but did not:

| Escape point | Meaning |
|---|---|
| Unit | A unit test with the right assertion would have caught this |
| Integration | An API integration test would have caught this |
| E2E | A critical path E2E would have caught this |
| Manual | Exploratory testing would have caught this |
| None | Defect was genuinely not predictable before production (novel failure mode) |

### Defect severity

| Severity | Definition |
|---|---|
| P0 | Production down or core user journey completely broken — immediate remediation |
| P1 | Significant user impact — remediate within current sprint |
| P2 | Moderate impact — remediate within 2 sprints |
| P3 | Cosmetic or edge case — backlog |

---

## 5. Defect Escape Rate (DER)

DER is the primary quality output metric for the QA Engineer.

### Formula

```
DER (%) = (Defects found in production ÷ Total defects found across all phases) × 100
```

### Thresholds

| DER | Status | Action |
|---|---|---|
| < 5% | Healthy | No action required |
| 5–10% | Warning | Review test coverage for the areas where escapes occurred |
| 10–15% | Degraded | Test strategy review — identify which testing layers are missing |
| > 15% | Crisis | Emergency coverage audit — all development pauses until gap remediation plan is approved by CTO |

### Reporting

DER is reported in:
- Every Test Strategy Document
- Every Pre-Release Sign-Off decision
- Every sprint retrospective quality section

A quality report without DER is not a quality report.

---

## 6. Pre-Release Sign-Off Criteria

The Pre-Release Sign-Off is binary: PASS or BLOCK.

### PASS requires ALL of the following

- [ ] All P0 test cases: green
- [ ] All P1 test cases: green
- [ ] DER for this release ≤ team threshold (default: 10% — adjust based on product maturity)
- [ ] CI pipeline: green on last 3 consecutive commits to main
- [ ] Quarantined flaky tests: 0 (or all quarantined are P2/P3 with documented root cause and investigation status)
- [ ] No P0/P1 open defects without a merge-blocking fix

### BLOCK requires

- At least one P0 or P1 test case: red
- OR DER > threshold
- OR CI pipeline: red on any of the last 3 main commits
- OR quarantined tests include any P0/P1 test without root cause

### BLOCK is not negotiable

A BLOCK with a note to "fix in the next sprint" is not a valid sign-off. BLOCK means the deploy is prevented. The QA Engineer communicates the specific failing criteria and a remediation ETA.

---

## 7. Flaky Test Protocol

A flaky test is any test that fails without a corresponding code change.

### Immediate actions

1. Quarantine: move the flaky test to a separate `quarantine/` suite that does not block CI
2. Tag: mark the test with `@flaky` and the date it was quarantined
3. Investigate: identify root cause within 24 hours
4. Resolve: fix the test or delete it — a flaky test that cannot be made deterministic in 48 hours is deleted

### Quarantine thresholds

| Quarantine count | Action |
|---|---|
| 1–2 tests | Normal investigation — resolve within 48 hours |
| 3 tests | Test health review — QA Engineer reviews entire test suite for systemic flakiness sources |
| > 5 tests | Escalate to CTO — test infrastructure may need remediation |

### Common flaky test causes

- Async timing issues (test doesn't wait for state to settle)
- Test data pollution (tests share state or database records)
- Environment inconsistency (test passes locally, fails in CI due to different environment config)
- External service calls (test hits a real API instead of a mock/stub)

---

## 8. Testing Trophy Allocation Targets

Per Kent C. Dodds' Testing Trophy model — the recommended distribution for modern web applications:

| Layer | Target % of test count | Primary tool | Run frequency |
|---|---|---|---|
| Static (TypeScript + ESLint) | N/A — always on | TypeScript, ESLint | Every file save |
| Unit | 20–30% | Jest / Vitest | Every commit |
| Integration | 50–60% | Jest + supertest / Playwright API | Every PR |
| E2E | ≤ 15% | Playwright | Every main branch commit |

### Ice Cream Cone warning

If E2E test count > Integration test count, the suite is an Ice Cream Cone anti-pattern. Stop adding E2E tests. Convert E2E scenarios into integration tests where possible. E2E tests are reserved for P0 critical paths only.

---

## Sources

- Kent C. Dodds — Testing Trophy model (kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- Kostis Kapelonis — Software Testing Anti-patterns (blog.codepipes.com/testing/software-testing-antipatterns.html)
- IBM Systems Sciences Institute — Relative Costs of Fixing Defects
- Shift-Left Testing (abstracta.us/blog/devops/shift-left-testing/)
- BDD / Gherkin Given-When-Then (testquality.com/how-to-write-effective-gherkin-acceptance-criteria/)
- Defect Escape Rate metrics (em-tools.io/engineering-metrics/escaped-defects)
- 2024 World Quality Report — BDD adoption (Capgemini/Sogeti/Micro Focus)
- Google SRE Book — Beyer, Jones, Petoff, Murphy (alerting and flaky test noise)
- Heartbleed (CVE-2014-0160) — OpenSSL coverage theater case study
