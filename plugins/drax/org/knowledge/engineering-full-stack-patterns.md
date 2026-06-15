# Engineering: Full Stack Patterns
> Status: stub | Created: 2026-04-25 | Applies to: Full Stack Developer, CTO
> Load trigger: before writing API endpoints, database schemas, or frontend state management code.

---

## Purpose

This document contains canonical implementation patterns for full-stack development in a pre-seed/seed-stage product context. It covers REST/GraphQL contract patterns, ORM query patterns, and frontend state management patterns. Content to be filled on first agent activation.

---

## 1. REST API Contract Patterns (Richardson Maturity Model)

### Level 2 Resource Design (target minimum)
- Resource naming: plural nouns, no verbs in URLs (`/users`, `/sessions`, `/payments`)
- HTTP verb semantics:
  - `GET` — idempotent read, no side effects
  - `POST` — create or non-idempotent action
  - `PUT` — full replacement (idempotent)
  - `PATCH` — partial update (idempotent)
  - `DELETE` — idempotent removal
- Status code contract:
  - `200 OK` — success with body
  - `201 Created` — resource created, Location header present
  - `204 No Content` — success, no response body (DELETE, PATCH with no return)
  - `400 Bad Request` — client error, validation failure
  - `401 Unauthorized` — unauthenticated
  - `403 Forbidden` — authenticated but not authorized
  - `404 Not Found` — resource does not exist
  - `409 Conflict` — duplicate resource or optimistic lock failure
  - `422 Unprocessable Entity` — semantic validation failure
  - `500 Internal Server Error` — server-side fault

### OpenAPI-First Contract Design
- Write `openapi.yaml` before writing implementation
- Every endpoint documents: `operationId`, `parameters`, `requestBody` schema, all `responses`
- Breaking changes require a version bump: `/v1/` → `/v2/`
- Non-breaking additions (new optional fields, new endpoints) do not require versioning

### Idempotency Pattern
- Mutation endpoints accept `Idempotency-Key` header
- Server stores key + response for 24 hours
- On duplicate key: return stored response without re-executing

---

## 2. GraphQL Contract Patterns

### When to use GraphQL vs REST
- REST: when consumer set is known, payloads are stable, caching is important
- GraphQL: when multiple consumers (web, mobile, third-party) need different data shapes, or when N+1 query problems dominate development time

### Schema Design Rules
- Types: PascalCase (`UserProfile`, `PaymentIntent`)
- Fields: camelCase (`createdAt`, `billingEmail`)
- Mutations: verb-first (`createUser`, `updateSubscription`, `cancelPayment`)
- Queries: noun-first (`user`, `users`, `paymentsByUser`)
- Pagination: Relay-style cursor pagination (`edges`, `node`, `pageInfo`)

### N+1 Prevention
- Use DataLoader pattern for all relationship fields
- Never resolve nested relations in a resolver loop without batching

---

## 3. Database Schema Patterns

### Migration Protocol
1. Write migration file: `YYYYMMDDHHMMSS_description.sql`
2. Write rollback: `YYYYMMDDHHMMSS_description_rollback.sql`
3. Test rollback on staging before merging to main
4. Never alter a column type or drop a column in a single migration — use expand/contract pattern:
   - Phase 1: add new column, keep old column, dual-write
   - Phase 2: backfill old column data to new column
   - Phase 3: remove old column after all read traffic migrated

### Query Optimization Rules
- Add index on every foreign key on creation
- Add composite index when query filters on 2+ columns together
- Use `EXPLAIN ANALYZE` on all queries returning > 1000 rows before going to production
- N+1 detection: if a query count scales with row count, use JOIN or batch load

### Cross-Service Schema Rule
- Schema changes that affect more than one service require CTO review before migration
- Changes to shared auth tables, billing tables, and user identity tables are always CTO-reviewed

---

## 4. Frontend State Management Patterns

### State Classification (before choosing solution)
- Server state: data that lives on the server and is fetched (user profile, orders, products) → use React Query / SWR / Apollo
- Client state: UI state with no server representation (modal open/closed, form steps) → use React useState / useReducer
- Global state: shared across multiple components without prop drilling (auth session, feature flags) → use Context + useReducer or Zustand
- URL state: state that should survive a page refresh and be shareable (filters, pagination, search) → encode in URL query params

### When NOT to use Redux / global state managers
- Pre-PMF products with < 10 screens: React Query + useState covers nearly all needs
- Redux adds boilerplate without leverage at this scale — apply MVA Q2 test (one developer understands it in one day)

### Component Boundaries
- Container component: owns data fetching, state, and business logic
- Presentational component: receives props, renders UI, no side effects
- One container per feature domain; multiple presentational children

### Acceptance Criteria for Frontend Features
- [ ] Component renders without error in isolation (unit test)
- [ ] User flow completes end-to-end in E2E test
- [ ] Error state handled: empty state, loading state, error state each have a visible UI
- [ ] Observability event fires on aha moment interaction

---

## 5. Authentication Patterns

### Decision Matrix: JWT vs Session Cookies

| Factor | JWT (stateless) | Session Cookies (stateful) |
|---|---|---|
| Server state required | No | Yes (session table or Redis) |
| Revocation | Hard (must blacklist or wait for expiry) | Easy (delete session row) |
| Pre-PMF suitability | Medium | High (simpler revocation) |
| Mobile/API client | High (Authorization header) | Medium (cookie handling) |
| Multi-service | High (stateless verification) | Low (requires shared session store) |

Recommendation for pre-PMF monolith: HTTP-only session cookies + PostgreSQL sessions table. Migrate to JWT + refresh tokens when: (a) mobile client is required, or (b) second service needs to verify identity.

---

## 6. CI/CD Pipeline Minimum Standard

### Pipeline Stages (Trunk-Based Development)
1. `lint` — ESLint / Prettier / type check (< 30 seconds)
2. `unit-test` — jest / pytest / vitest (< 2 minutes)
3. `integration-test` — test against real database (staging schema) (< 5 minutes)
4. `build` — production build artifact
5. `deploy-staging` — automatic on merge to main
6. `smoke-test` — 3–5 critical user paths verified on staging
7. `deploy-production` — manual trigger (one-step, one-command)

### Red Pipeline Protocol
- A red pipeline is a P0 blocker: no feature work continues until pipeline is green
- Root cause must be documented in the commit that fixes it

---

## Sources

- Stripe Engineering Blog — API versioning and contract design principles
- Richardson, Leonard (2008) — Richardson Maturity Model for REST
- Fowler, Martin — Expand/Contract pattern for database schema changes
- Google SRE handbook — observability and deployment pipeline standards
- Vercel / Next.js documentation — frontend state management patterns
- roadmap.sh/full-stack — full stack skills roadmap
