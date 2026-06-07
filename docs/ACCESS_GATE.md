# Access Gate

## Purpose

The commercial conversion event for V1 is a time-bound access token issued after payment. That token is the billing record, anti-piracy gate, and conversion record used by measurement.

The plugin never contains payment provider keys.

## Access Token

The token schema is `schemas/access-token.schema.json`.

Required fields:

- `schemaVersion`
- `tokenId`
- `tier`: `Solo`, `Studio`, or `Scale`
- `billingInterval`: `monthly` or `annual`
- `issuedAt`
- `expiresAt`
- `signature`

The token can also carry tier limits returned by the Drax server. Hours per day is a tier rate limit, not a price unit.

## Conversion Record

The conversion record schema is `schemas/conversion-record.schema.json`.

The canonical event is `access-token-issued`. One issued token equals one sale record.

## Runtime Check

At runtime, Drax reads a token from either:

- `DRAX_ACCESS_TOKEN_FILE`
- `.drax/access-token.json` in the founder workspace
- `DRAX_ACCESS_TOKEN_JSON` for controlled tests

Drax validates local token shape and dates, then must validate the token against the Drax server. The runtime fails closed when the token is absent, expired, structurally invalid, revoked, or not validated by the server.

The current implementation includes a stub where the server call belongs. It fails closed by default until `drax-api` exists.

## Backend Boundary

The webhook endpoint belongs in `drax-api`, the first real Drax backend. It does not belong in `drax-plugin`, `drax-dev`, or the customer workspace.

Smallest required backend surface:

- `POST /webhooks/payments`: receive Stripe and Pagar.me payment events, verify provider signature using server-only secrets, map the paid product to tier and billing interval, issue the signed access token, and write the conversion record.
- `POST /v1/access/validate`: receive a token from the plugin, verify signature, expiry, revocation, billing state, and tier limits, then return the effective tier and rate limits.

Payment provider secrets live only in `drax-api` runtime environment. They must never be copied into a repository, package, prompt, log, generated file, or customer workspace.
