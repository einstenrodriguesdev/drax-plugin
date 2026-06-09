# Repository Topology

Date: 2026-06-09
Owner: Drax technical operations
Status: current four-surface model

## Four Surfaces

The Drax product is split into four surfaces that must not cross.

| Surface | Local path | Visibility | Role |
|---|---|---|---|
| `drax-plugin` | `/home/conclave/drax/drax-plugin` | Public | Production product source and Codex marketplace source. |
| `drax-dev` | `/home/conclave/drax/drax-dev` | Private | Pre-release factory where the next plugin version is built and tested. |
| `drax-recursive` | `/home/conclave/drax/drax-recursive` | Private | DRAX running on itself as its first customer. |
| `conclave` | `/home/conclave` | Private internal | Operator machine, HR protocol, and role-creation source. |

`drax-site` is a separate public site repository. It is not the customer runtime and is not part of this plugin promotion path.

`drax-lab` is for isolated live-account automation. It is not touched by V1 plugin promotion.

## Surface Rules

### `drax-plugin`

Owns:

- released plugin source
- Codex marketplace metadata
- package templates and schemas
- vendored V1 marketing worker roles
- production tags

Does not own:

- unfinished experiments
- founder workspaces
- `.env` files
- access tokens
- browser sessions
- payment-provider keys
- internal HR role creation

### `drax-dev`

Owns:

- implementation of the next plugin version
- package dry runs
- clean install preparation
- trigger-engine tests
- promotion patches before they enter `drax-plugin`

It is private because unfinished product work can be broken, noisy, or commercially premature. It is not private because source secrecy is the security model.

### `drax-recursive`

Owns:

- DRAX's own founder artifacts
- interview state
- dogfooding execution state
- organic loop outputs for DRAX as the first customer

No customer package file should contain facts from `drax-recursive`.

### `conclave`

Owns:

- internal operator workflows
- `conclave-cc`
- HR protocol for creating new roles
- role source material before vendoring

Customer installs must not depend on `/home/conclave/conclave-cc`.

## Promotion Flow

```text
build in drax-dev
  -> run package validation
  -> run tests
  -> produce npm pack artifact
  -> clean install in drax-clean
  -> run real dry-run cycle
  -> prepare promotion patch
  -> apply to drax-plugin
  -> tag or release only after verification
```

Promotion is by validated path, not by copying a whole working directory.

## Clean Test Flow

The clean test proves:

- non-root install works
- `~/.local/bin` PATH setup is documented
- Codex Device Code login is documented
- access token gate fails closed by default
- `drax init` creates artifacts and `EXECUTION_STATE.json`
- `drax blog init` generates the Astro blog surface
- `drax cycle --dry-run` writes a run manifest and publish record
- no `.env`, secret, browser session, or internal path ships

## Future Backend

`drax-api` is created only when server-owned token validation and payment webhooks are implemented. It will own provider webhooks, signing keys, revocation, billing state, and server-side token validation.

No Stripe, Pagar.me, or signing secret belongs in `drax-plugin`, `drax-dev`, `drax-recursive`, or a package artifact.
