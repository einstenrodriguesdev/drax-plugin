# Backend Security Implementation
> Status: stub | Created: 2026-04-25 | Applies to: Senior Backend Engineer, Full Stack Developer, CTO, CISO
> Load trigger: REQUIRED — load before implementing any authentication flow, authorization check, data storage decision, or external API integration

---

## Scope of this document

This document covers backend security implementation patterns. It is not a policy document (that is SECURITY.md, owned by CISO) — it is an implementation reference: how to apply OWASP API Security Top 10, how to implement JWT/OAuth2 correctly, how to validate input, how to configure rate limiting, and how to manage secrets. The Senior Backend Engineer loads this document before implementing any API endpoint.

---

## 1. OWASP API Security Top 10 (2023) — Merge Gate Checklist

Run this checklist for every new API endpoint before merge. A failing check blocks merge.

### A1: Broken Object Level Authorization (BOLA / IDOR)
**What it is**: Endpoint returns or modifies data based on an ID in the request without verifying the authenticated user has permission to access that specific object.

**Check**: For every endpoint that takes an object ID as a parameter, confirm:
```typescript
// BAD — checks authentication but not object ownership
app.get('/orders/:id', authenticate, async (req, res) => {
  const order = await Order.findById(req.params.id); // returns ANY order
  return res.json(order);
});

// GOOD — checks object-level authorization
app.get('/orders/:id', authenticate, async (req, res) => {
  const order = await Order.findOne({
    id: req.params.id,
    userId: req.user.id  // must belong to authenticated user
  });
  if (!order) return res.status(404).json({ error: 'Not found' }); // 404 not 403 to avoid enumeration
  return res.json(order);
});
```

**Checklist item**: Every `GET /resource/:id`, `PUT /resource/:id`, `DELETE /resource/:id` endpoint has an explicit ownership or permission check at the query level — not just at the route level.

---

### A2: Broken Authentication
**What it is**: Authentication implementation flaws — weak tokens, missing validation, token not verified on every request.

**JWT implementation requirements**:
- Signing algorithm: RS256 or ES256 (asymmetric). Never HS256 in production (symmetric key shared with all verifying services).
- Access token TTL: ≤ 15 minutes.
- Refresh token: long TTL (7–30 days), stored as httpOnly cookie, rotated on use.
- Refresh token rotation: invalidate old refresh token on every use; issue a new one.
- Token revocation for critical paths: maintain a JTI (JWT ID) blocklist for logout and password change.
- Never put sensitive data in JWT payload — it is signed, not encrypted.

```typescript
// JWT verification — every protected route
const verifyToken = async (req: Request): Promise<User> => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw new AuthError('Missing token');

  const payload = jwt.verify(token, publicKey, {
    algorithms: ['RS256'],
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE
  });

  // Check JTI blocklist for revoked tokens
  if (await tokenBlocklist.has(payload.jti)) {
    throw new AuthError('Token revoked');
  }

  return payload;
};
```

---

### A3: Broken Object Property Level Authorization
**What it is**: API returns or accepts more properties than the user should see or modify — mass assignment or over-exposure.

**Response filtering**:
```typescript
// BAD — returns all fields including admin-only fields
return res.json(user);

// GOOD — explicit DTO mapping per role
const publicUserDTO = {
  id: user.id,
  name: user.name,
  email: user.email,
  // does NOT include: passwordHash, stripeCustomerId, adminFlags, internalNotes
};
return res.json(publicUserDTO);
```

**Mass assignment prevention** (input side):
```typescript
// BAD — spreads all body fields into update
await User.update(req.params.id, req.body);

// GOOD — explicit allowlist
const allowedFields = ['name', 'bio', 'avatarUrl'];
const sanitizedUpdate = pick(req.body, allowedFields);
await User.update(req.params.id, sanitizedUpdate);
```

---

### A4: Unrestricted Resource Consumption
**What it is**: No rate limiting, allowing brute force, enumeration, or resource exhaustion.

**Rate limiting configuration**:
```typescript
import rateLimit from 'express-rate-limit';

// Auth endpoints — strict limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip + req.body?.email, // per-IP + per-email
});
app.post('/auth/login', authLimiter, loginHandler);

// General API — per-user limit
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,            // 100 requests per minute per user
  keyGenerator: (req) => req.user?.id ?? req.ip,
});
app.use('/api/', apiLimiter);
```

For expensive operations (search, report generation): add explicit cost limits (max items per query, max page size, timeout).

---

### A5: Broken Function Level Authorization
**What it is**: Admin or privileged endpoints accessible to regular users.

**Check**: Every admin, internal, or elevated-privilege endpoint has an explicit role check — not just authentication.
```typescript
// BAD — authenticated but not role-checked
app.delete('/admin/users/:id', authenticate, deleteUserHandler);

// GOOD — explicit role authorization
app.delete('/admin/users/:id', authenticate, requireRole('admin'), deleteUserHandler);

const requireRole = (role: string) => (req, res, next) => {
  if (!req.user.roles.includes(role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
```

---

### A6: Unrestricted Access to Sensitive Business Flows
**What it is**: Automated abuse of business-critical flows — account creation bots, coupon exhaustion, bulk purchases.

**Mitigations** (apply where business logic is abusable):
- CAPTCHA on high-value registration/purchase flows
- Device fingerprinting for fraud detection
- Velocity checks (max N actions per user per hour for business-critical flows)
- Email verification before access to sensitive features

---

### A7: Server-Side Request Forgery (SSRF)
**What it is**: Attacker controls a URL the server fetches, causing the server to make requests to internal services.

**Check**: Any endpoint that accepts a URL from user input and fetches it.
```typescript
// Validate outbound request URL against allowlist
const allowedDomains = ['api.stripe.com', 'api.sendgrid.com'];
const url = new URL(userProvidedUrl);
if (!allowedDomains.includes(url.hostname)) {
  throw new ValidationError('URL not in allowlist');
}
```

---

### A8: Security Misconfiguration
**Checklist**:
- Debug mode disabled in production (`NODE_ENV=production`, `DEBUG=false`)
- Error responses do not expose stack traces, internal paths, or database errors to clients
- HTTP security headers set: `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`
- CORS configured explicitly — not `Access-Control-Allow-Origin: *` in production
- Default credentials changed for all infrastructure components

---

### A9: Improper Inventory Management
**Check**: Every endpoint exposed to consumers is documented in the OpenAPI contract. No undocumented endpoints in production. Deprecated endpoints have a documented sunset date.

---

### A10: Unsafe Consumption of APIs
**What it is**: Trusting third-party API responses without validation — type mismatch, injection from returned data.

**Check**: All data received from third-party APIs is validated against expected schema before processing.
```typescript
import { z } from 'zod';

const StripeChargeResponseSchema = z.object({
  id: z.string().startsWith('ch_'),
  amount: z.number().int().positive(),
  status: z.enum(['succeeded', 'pending', 'failed']),
});

const rawResponse = await stripe.charges.retrieve(chargeId);
const validatedResponse = StripeChargeResponseSchema.parse(rawResponse); // throws on invalid
```

---

## 2. Input Validation

### Rule: validate at the boundary, never trust client data

Every request body, path parameter, and query parameter is validated before reaching business logic.

```typescript
import { z } from 'zod'; // Zod (Node.js) — type-safe validation

const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(100),
  })).min(1).max(50),
  shippingAddressId: z.string().uuid(),
});

app.post('/orders', authenticate, async (req, res) => {
  const result = CreateOrderSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }
  // result.data is now typed and validated
});
```

**Python equivalent** (Pydantic):
```python
from pydantic import BaseModel, Field
from uuid import UUID

class CreateOrderItem(BaseModel):
    product_id: UUID
    quantity: int = Field(ge=1, le=100)

class CreateOrderRequest(BaseModel):
    items: list[CreateOrderItem] = Field(min_items=1, max_items=50)
    shipping_address_id: UUID
```

---

## 3. Parameterized Queries — No Exceptions

Never concatenate user input into SQL strings.

```typescript
// BAD — SQL injection vector
const users = await db.query(`SELECT * FROM users WHERE email = '${req.body.email}'`);

// GOOD — parameterized
const users = await db.query('SELECT * FROM users WHERE email = $1', [req.body.email]);

// ORM — inherently parameterized (Prisma, TypeORM, Sequelize, ActiveRecord, Django ORM)
const user = await prisma.user.findUnique({ where: { email: req.body.email } });
```

---

## 4. Secrets Management

| Environment | Approach |
|---|---|
| Local development | `.env` file — gitignored. Never commit. |
| CI/CD | Repository secrets (GitHub Actions Secrets, GitLab CI variables) |
| Staging/Production | Environment variables injected at runtime from secrets manager |
| Secrets manager options | AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager, Doppler |

### Rules
- Never log secrets, API keys, tokens, or PII. Scrub log statements before merge.
- Rotate secrets on a defined schedule (annually minimum; immediately on any suspected exposure).
- Application reads secrets from environment variables — never hardcodes them.

```typescript
// BAD
const stripeKey = 'sk_live_...'; // hardcoded — visible in source control

// GOOD
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) throw new Error('STRIPE_SECRET_KEY environment variable required');
```

---

## 5. HTTPS and Transport Security

- All production endpoints served over HTTPS only. HTTP redirects to HTTPS.
- HSTS header: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- TLS 1.2 minimum; TLS 1.3 preferred.
- Certificate renewal automated (Let's Encrypt / ACM).

---

## Sources
- OWASP API Security Top 10 (2023): https://owasp.org/API-Security/
- OWASP REST Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
- OWASP OAuth2 Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html
- JWT Best Practices (Curity): https://curity.io/resources/learn/jwt-best-practices/
- Peloton BOLA incident (2021) — documented in multiple security blog post-mortems
- Zod documentation: https://zod.dev
- Pydantic documentation: https://docs.pydantic.dev
