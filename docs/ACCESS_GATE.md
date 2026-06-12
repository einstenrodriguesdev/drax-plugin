# Access Gate

## Purpose

The commercial conversion event for V1 is a time-bound access token issued after payment. That token is the billing record, anti-piracy gate, and conversion record used by measurement.

The plugin never contains payment provider keys.

## Access Token

The token schema is `schemas/access-token.schema.json`.

Required fields:

- `schemaVersion`
- `tokenId`
- `tier`: `Startup`, `Centaur`, or `Unicorn`
- `billingInterval`: `monthly` or `annual`
- `issuedAt`
- `expiresAt`
- `signature`

The token can also carry tier limits returned by the Drax server. Hours per day is a tier rate limit, not a price unit.

## Tier Limit Model

The tier model lives in `src/tiers.ts` and `schemas/tier-limits.schema.json`.

Current confirmed limits:

| Tier | Project cap | Daily blog cadence cap | Runtime hours/day | Runs/day |
|---|---:|---|---|---|
| Startup | 1 | 1 post/day | 2 | 1 |
| Centaur | 5 | 3 posts/day | 6 | 3 |
| Unicorn | unlimited | effectively unlimited (999999 sentinel) | 24 | 999999 |

Issued access tokens carry concrete effective limits from the Drax server. These ratified limits also mirror `drax-api` `LimitsForTier`.

## Conversion Record

The conversion record schema is `schemas/conversion-record.schema.json`.

The canonical event is `access-token-issued`. One issued token equals one sale record.

## Runtime Check

At runtime, Drax reads a token from either:

- `DRAX_ACCESS_TOKEN_FILE`
- `.drax/access-token.json` in the founder workspace
- `DRAX_ACCESS_TOKEN_JSON` for controlled tests

Drax validates local token shape and dates, then verifies the Ed25519 signature offline against a DRAX public key. This offline signature check is the anti-piracy gate. It does not need network access.

The server call to `drax-api` `POST /v1/access/validate` is the second layer: revocation and live-state. It is not the primary security gate. A token with an invalid signature never reaches the live-state layer.

`DRAX_ACCESS_VALIDATION_STUB=allow` skips only the network revocation/live-state call for offline development, tests, and controlled dry runs. It does not bypass local shape, date, tier-limit, public-key, or Ed25519 signature verification.

Production fails closed when the token is absent, expired, structurally invalid, missing limits, signed by the wrong key, forged, or when the public key is not configured. Once `drax-api` is deployed, production can also fail closed on revocation or inactive billing state according to the founder's revocation strictness decision.

## Backend Boundary

The webhook endpoint belongs in `drax-api`, the first real Drax backend. It does not belong in `drax-plugin`, `drax-dev`, or the customer workspace.

Smallest required backend surface:

- `POST /webhooks/payments`: receive Stripe and Pagar.me payment events, verify provider signature using server-only secrets, map the paid product to tier and billing interval, issue the signed access token, and write the conversion record.
- `POST /v1/access/validate`: receive a token from the plugin, verify signature, expiry, revocation, billing state, and tier limits, then return the effective tier and rate limits.

Payment provider product mapping is deferred:

| Provider | Product or price reference | Tier | Billing interval |
|---|---|---|---|
| Stripe | NEEDS_DECISION | NEEDS_DECISION | NEEDS_DECISION |
| Pagar.me | NEEDS_DECISION | NEEDS_DECISION | NEEDS_DECISION |

Payment provider secrets live only in `drax-api` runtime environment. They must never be copied into a repository, package, prompt, log, generated file, or customer workspace.
