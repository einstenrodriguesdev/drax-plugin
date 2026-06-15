# Backend Engineering Patterns
> Status: stub | Created: 2026-04-25 | Applies to: Senior Backend Engineer, Full Stack Developer, CTO
> Load trigger: REQUIRED — load before writing any API endpoint, database schema, or business logic layer

---

## Scope of this document

This document covers backend-specific implementation patterns that are distinct from the general system design principles in `engineering-system-design.md`. It focuses on the implementation layer: how to structure business logic, how to design and version API contracts, how to handle database migrations safely, how to integrate external services reliably, and how to detect and fix the most common backend performance failures.

---

## 1. API Contract-First Design Protocol

### Principle
The API contract (OpenAPI 3.x YAML for REST, or GraphQL schema) is the deliverable. Implementation is proof of the contract.

### Protocol
1. Write the OpenAPI/GraphQL contract before writing any implementation code.
2. Get contract reviewed by downstream consumer (Senior Frontend Engineer) before implementation begins.
3. Classify every change as breaking or non-breaking before merging.
4. Breaking changes require: version bump in URI (`/v2/...`) or `Accept` header, migration guide for consumers, grace period in parallel with old version (minimum 30 days for external APIs).
5. Non-breaking changes (additive only — new fields, new optional parameters): no version bump required, but contract document updated before merge.

### Breaking vs. Non-Breaking Classification
Breaking (requires version bump):
- Remove or rename a field
- Change field type
- Make an optional field required
- Change HTTP status code semantics
- Remove an endpoint

Non-Breaking (additive only):
- Add a new optional field to response
- Add a new optional query parameter
- Add a new endpoint
- Add a new enum value (caution: consumers may not handle unknown values)

### OpenAPI contract template structure
```yaml
openapi: 3.1.0
info:
  title: [Service Name] API
  version: "1.0"
paths:
  /resource/{id}:
    get:
      summary: Get resource by ID
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        "200":
          description: Resource found
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ResourceResponse"
        "403":
          description: Forbidden — authenticated but not authorized for this object
        "404":
          description: Not found
```

---

## 2. Domain-Driven Design (DDD) Tactical Patterns

### When to apply
Any service where business rules govern what operations are valid — pricing, eligibility, workflow state machines, access control beyond simple CRUD.

### Building blocks

**Entity**: has identity (an ID that persists across state changes). Business behavior lives on the entity as methods.
```typescript
class Order {
  private id: OrderId;
  private status: OrderStatus;
  private lineItems: LineItem[];

  confirm(): void {
    if (this.status !== OrderStatus.Pending) {
      throw new DomainError('Order can only be confirmed from Pending state');
    }
    this.status = OrderStatus.Confirmed;
    this.addEvent(new OrderConfirmed(this.id, this.lineItems));
  }
}
```

**Value Object**: immutable, no identity, defined by its attributes. Two Value Objects with the same attributes are equal.
```typescript
class Money {
  constructor(
    readonly amount: number,
    readonly currency: Currency
  ) {
    if (amount < 0) throw new DomainError('Amount cannot be negative');
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) throw new DomainError('Cannot add different currencies');
    return new Money(this.amount + other.amount, this.currency);
  }
}
```

**Aggregate**: a cluster of Entities and Value Objects with a single root Entity that enforces invariants. External code may only reference the Aggregate Root — never internal entities directly.

**Domain Event**: signals that something meaningful happened in the domain. Consumed by other parts of the system asynchronously.
```typescript
class OrderConfirmed implements DomainEvent {
  constructor(
    readonly orderId: OrderId,
    readonly lineItems: ReadonlyArray<LineItem>,
    readonly occurredAt: Date = new Date()
  ) {}
}
```

**Domain Service**: operations that don't naturally belong to a single Entity or Value Object (e.g., transfer between two accounts).

### Layer separation rule
- Controllers: validate HTTP input, call application service, return HTTP response. No business logic.
- Application Services: orchestrate use cases, call domain objects, emit events. Thin.
- Domain Layer: Entities, Value Objects, Domain Services, Domain Events. No infrastructure dependencies.
- Infrastructure Layer: repositories (database), message buses, email services. Implements domain interfaces.

---

## 3. CQRS (Command Query Responsibility Segregation)

### When to apply
- Read patterns and write patterns have significantly different performance requirements
- Read volume is 10×+ higher than write volume
- Read models need to be denormalized for query performance (e.g., materialized views)
- Event sourcing is in scope (advanced — requires significant investment)

### When NOT to apply
- Simple CRUD applications with no complex business rules
- Early-stage products where domain boundaries are not yet clear
- Systems where read/write performance is equivalent

### Basic CQRS pattern
```typescript
// Command side — writes, enforces business rules
class ConfirmOrderCommand {
  constructor(readonly orderId: string, readonly userId: string) {}
}

class ConfirmOrderHandler {
  async execute(command: ConfirmOrderCommand): Promise<void> {
    const order = await this.orderRepository.findById(command.orderId);
    order.confirm(); // domain logic
    await this.orderRepository.save(order);
    // publish domain events
  }
}

// Query side — reads, optimized for display
class GetOrderSummaryQuery {
  constructor(readonly orderId: string, readonly userId: string) {}
}

class GetOrderSummaryHandler {
  async execute(query: GetOrderSummaryQuery): Promise<OrderSummaryDTO> {
    // read from denormalized read model or materialized view
    return this.orderReadModel.findSummaryById(query.orderId);
  }
}
```

---

## 4. N+1 Query Detection and Elimination

### The problem
ORM default lazy loading fetches related data on access, not at query time. A list endpoint that returns 100 orders, each with N line items, executes 1 + 100 = 101 queries instead of 1–2.

### Detection protocol
1. Enable ORM query logging in development environment.
2. Execute the endpoint request.
3. Count logged queries.
4. Acceptable: ≤ 2 queries for any list endpoint.
5. Unacceptable: query count grows with result set size.

### ORM-specific fixes

**Prisma (Node.js)**:
```typescript
// BAD — lazy: fetches lineItems in a loop
const orders = await prisma.order.findMany();
for (const order of orders) {
  const items = await prisma.lineItem.findMany({ where: { orderId: order.id } }); // N+1
}

// GOOD — eager loading
const orders = await prisma.order.findMany({
  include: { lineItems: true } // single JOIN query
});
```

**Django ORM (Python)**:
```python
# BAD
orders = Order.objects.all()
for order in orders:
    items = order.lineitem_set.all()  # N+1

# GOOD
orders = Order.objects.prefetch_related('lineitem_set').all()
```

**ActiveRecord (Ruby)**:
```ruby
# BAD
Order.all.each { |o| o.line_items }  # N+1

# GOOD
Order.includes(:line_items).all
```

### Verification
After fix: run EXPLAIN ANALYZE. Confirm query plan uses JOIN or equivalent. Confirm P50 latency reduced.

---

## 5. Expand/Contract Migration Protocol

### Why single-step destructive migrations fail
When you rename or drop a column in a single deployment, there is a window where the running application code references the old column name but the database already has the new schema — causing errors for in-flight requests.

### Three-phase protocol

**Phase 1 — Expand** (add new structure, keep old):
```sql
-- Migration: add_new_email_column_expand.sql
ALTER TABLE users ADD COLUMN email_v2 VARCHAR(255);
-- Application code: write to BOTH email and email_v2
```
Deploy. Application reads from email, writes to both.

**Phase 2 — Backfill + Cutover**:
```sql
-- Migration: backfill_email_v2.sql
UPDATE users SET email_v2 = email WHERE email_v2 IS NULL;
```
Deploy updated application code: reads from email_v2, writes to email_v2 only.

**Phase 3 — Contract** (remove old structure):
```sql
-- Migration: drop_old_email_column_contract.sql
ALTER TABLE users DROP COLUMN email;
ALTER TABLE users RENAME COLUMN email_v2 TO email;
```
Deploy. Application reads and writes from email (now pointing to the new column's data).

### Rollback files
Every migration file has a paired rollback file. Format:
```
migrations/
  20260425_001_expand_add_email_v2.sql
  20260425_001_expand_add_email_v2_rollback.sql
  20260425_002_backfill_email_v2.sql
  20260425_002_backfill_email_v2_rollback.sql
  20260425_003_contract_drop_email.sql
  20260425_003_contract_drop_email_rollback.sql
```

---

## 6. External Service Integration Patterns

### Idempotency keys
Any write operation to an external service (payment, email, SMS) must use an idempotency key — a client-generated unique identifier that prevents duplicate operations on retry.
```typescript
await stripe.charges.create({
  amount: 2000,
  currency: 'usd',
  source: paymentMethodId,
}, {
  idempotencyKey: `charge-${orderId}-${userId}` // deterministic, unique per operation
});
```

### Circuit breaker pattern
Prevents a failing external service from cascading into application failures.
```typescript
// Using opossum (Node.js) or equivalent
const breaker = new CircuitBreaker(callExternalService, {
  timeout: 3000,      // 3s timeout per call
  errorThresholdPercentage: 50,  // open circuit at 50% errors
  resetTimeout: 30000 // try again after 30s
});
```
States: CLOSED (normal) → OPEN (fast-fail, no calls) → HALF-OPEN (test one call) → CLOSED.

### Retry with exponential backoff
```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 100; // jitter
      await sleep(delay);
    }
  }
}
```

### Secrets management
- Never hardcode credentials in source code.
- Never log secrets, tokens, or PII.
- Development: `.env` file (gitignored).
- Production: environment variables injected at runtime from a secrets manager (AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager).
- Rotate secrets on a schedule; rotate immediately on any suspected exposure.

---

## Sources
- Eric Evans, *Domain-Driven Design* (2003) — DDD tactical patterns
- Martin Fowler, "Parallel Change" pattern (martinfowler.com) — expand/contract protocol
- Martin Fowler, "StranglerFigApplication" and "CQRS" (martinfowler.com)
- Linear engineering blog — database performance and connection pooling
- Stripe engineering / Stripe API Docs — contract-first and versioning
- PingCap: "The N+1 Query Problem: The Silent Performance Killer" (dev.to)
- opossum library docs (Node.js circuit breaker) — https://nodeshift.dev/opossum/
