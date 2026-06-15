# Engineering: Testing Strategy
> Status: stub | Created: 2026-04-25 | Applies to: Full Stack Developer, CTO
> Load trigger: when writing test suites, setting up CI/CD test stages, or deciding between unit, integration, and E2E test coverage.

---

## Purpose

This document contains canonical testing strategy frameworks for a pre-seed/seed-stage full-stack product. Covers the Testing Trophy model, unit vs. integration vs. E2E tradeoffs, coverage thresholds, and CI/CD test stage design. Content to be expanded on first agent activation.

---

## 1. Testing Trophy Model (Kent C. Dodds)

The Testing Trophy is the recommended model for modern web applications — not the Test Pyramid. It prioritizes integration tests because they give the highest confidence per unit of implementation cost.

```
        /\
       /E2E\          ← Small: 10–15% of tests — expensive, slow, brittle
      /------\
     /Integr- \       ← Large: 50–60% of tests — high confidence, moderate cost
    / ation    \
   /------------\
  /   Unit       \    ← Medium: 20–30% of tests — fast, cheap, low confidence alone
 /----------------\
/    Static (Types)\  ← Foundation: TypeScript/linting — free confidence
\__________________/
```

### Layer Definitions

**Static**: TypeScript type checking, ESLint, Prettier. Catches type errors and style violations before test execution. Zero runtime cost.

**Unit**: Tests a single function or class in isolation with mocked dependencies. Fast (< 1ms per test). Best for: pure functions, utility logic, complex business rules with many edge cases. NOT best for: testing that components render correctly or that API calls work.

**Integration**: Tests a real slice of the system (component + state, or API endpoint + database). Uses real implementations, not mocks. Best for: API routes, React component user interactions, database queries. This is the highest-confidence/cost ratio layer.

**E2E**: Tests a complete user journey through the deployed application. Uses a browser (Playwright, Cypress). Best for: critical paths (signup, payment, aha moment). Expensive — run on CI only, not on every commit.

---

## 2. What to Test at Each Layer

### Unit tests — write when:
- A function has 4+ conditional branches
- A pure calculation has business consequences (pricing, discount, expiry)
- A utility runs across 10+ call sites and a regression would be hard to catch

### Unit tests — do NOT write when:
- The test only verifies that a mock was called (testing implementation, not behavior)
- The test would be identical to the function itself
- The function has 1 branch and is trivial

### Integration tests — write for:
- Every API endpoint (request → response, including error cases)
- Every database query that is called in production
- React components where user interactions trigger state changes
- Authentication flows

### E2E tests — write for:
- User signup + email verification
- First aha moment completion (the core user journey)
- Payment flow (if the product has one)
- Any user journey that, if broken in production, would cause immediate churn

---

## 3. Coverage Thresholds

Coverage percentage is a lagging indicator, not a quality target. Using 80% coverage as a goal produces shallow tests that cover lines without exercising behavior.

Instead, coverage is used to detect untested critical paths:

| Coverage use | Rule |
|---|---|
| API endpoints | 100% of endpoints have at least one integration test |
| Critical user paths | 100% coverage via E2E test |
| Business logic functions | 100% branch coverage for functions with revenue or auth consequences |
| UI components | Integration test per component; unit test only for complex logic |
| Utility functions | Unit test when > 3 branches |

---

## 4. Test Data Strategy

### Pre-seed/seed standard: factory functions
- Define factory functions for each domain entity (`createUser()`, `createSubscription()`)
- Factory returns a valid default object; caller overrides only the fields relevant to the test
- Never copy-paste test objects — factories enforce consistency

### Database in tests
- Integration tests use a real PostgreSQL database (not SQLite) in CI
- Each test suite runs in a transaction that is rolled back after the suite completes
- Never use production data in tests

---

## 5. CI/CD Test Stage Design

### Recommended pipeline order (Trunk-Based Development)

| Stage | Tests | Max duration | Fail behavior |
|---|---|---|---|
| `lint` | TypeScript, ESLint | < 30s | Block merge |
| `unit` | Unit tests | < 2 min | Block merge |
| `integration` | API + DB integration tests | < 5 min | Block merge |
| `build` | Production build | < 3 min | Block merge |
| `e2e` | Critical path E2E | < 10 min | Block production deploy (not staging) |

### Red pipeline rule
A red pipeline at any stage is a P0 blocker. Feature work stops until the pipeline is green. Every fix commit includes a root cause note in the commit message.

---

## 6. Testing Anti-Patterns

| Anti-pattern | Description | Correction |
|---|---|---|
| Mock-heavy unit tests | Tests verify mocks were called, not that behavior is correct | Replace with integration tests using real dependencies |
| Snapshot tests for everything | React snapshot tests break on every UI change, consuming maintenance time without confidence gain | Use snapshot tests only for documented stable UI components |
| Testing implementation details | Tests break when code is refactored, even if behavior is unchanged | Test user-facing behavior, not internal state or function calls |
| E2E for everything | Slow, brittle suite that fails on non-critical paths, blocking deploys | Reserve E2E for critical user journeys only |
| No tests in "move fast" phase | Technical debt accumulates; regressions ship silently | Minimum: integration test for every API endpoint before any feature ships |

---

## 7. Testing the Aha Moment

The aha moment completion is instrumented as an event and also tested as a critical path E2E test:

1. E2E test signs up a new user
2. E2E test completes the onboarding flow
3. E2E test verifies the aha moment event fires (check monitoring/analytics event log or response payload)
4. This test runs on every production deploy as a smoke test

If the aha moment E2E test fails on staging, the production deploy is blocked.

---

## Sources

- Kent C. Dodds — Testing Trophy model (kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- Google Testing Blog — unit test anti-patterns
- Stripe Engineering Blog — CI/CD pipeline design at scale
- Martin Fowler — integration test vs. unit test tradeoffs (martinfowler.com/bliki/IntegrationTest.html)
- Playwright documentation — E2E testing for modern web applications
