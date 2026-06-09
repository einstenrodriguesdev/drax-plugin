# Release Gates

## Version Rule

Semantic versions describe shipped capability:

- Patch: compatible correction or testable path improvement.
- Minor: new compatible distribution surface that passed its gate.
- Major: changed product contract or business capability.

## Package Gate

Required before any promotion into `drax-plugin`:

- TypeScript build passes.
- Unit tests pass.
- `scripts/validate-package.mjs` passes.
- `npm pack` ships no `.env`, secret, browser session, storage state, internal path, or founder-specific customer artifact.
- The package ships only the vendored V1 marketing worker roles.
- Public docs do not claim unpassed capabilities.

## Interview Gate

- First response is free-text founder recognition.
- No secret value is requested.
- Repo facts are read and confirmed after the first answer.
- Founder-only facts are asked one purpose at a time.
- Strategic choices use the three-option pattern only after recognition.
- Non-interactive runs never depend on AskUserQuestion.

## Blog Surface Gate

- `drax blog init` reads identity from founder docs.
- Missing identity values remain `NEEDS_DECISION`.
- Generated Astro surface builds in a clean workspace.
- Listing, post route, RSS, metadata, canonical URL, and base path render correctly.

## Trigger Engine Gate

- `flock` lock is acquired before reading state.
- `EXECUTION_STATE.json` is authoritative.
- The engine acts on `.drax/worktrees/current`, not the live workspace.
- `codex exec --sandbox workspace-write` runs in the clone.
- Dry-run writes run manifest and publish record without advancing `nextPostIndex`.
- Publish writes only into the isolated clone's blog surface.
- Gates fail closed on missing files, unresolved `NEEDS_DECISION`, missing proof note, forbidden claims, hash mismatch, or duplicate publish record.
- Cron prints a system cron entry that calls the same wrapper.

## Access Gate

- Runtime commands fail closed without a valid token.
- The plugin validates token shape and dates locally.
- Signature verification, revocation, billing state, and tier enforcement belong to `drax-api`.
- No signing key or payment-provider key ships in plugin source, package output, prompt, log, or founder workspace.

## Local Deploy Gate

Live local deploy is not implemented yet. Before it can ship:

- deploy config path fields are decided
- approval owner and timestamp are recorded
- target path is backed up before write
- rollback command is present
- reload command is explicit
- dry-run and rollback tests pass

## Publishing Adapter Gate

Future social or platform adapters require:

- official API first
- isolated test account
- least-privilege connection
- private or unlisted test before public test
- idempotency and duplicate prevention
- rate-limit and retry behavior
- audit evidence and remote identifier
- rollback or deletion behavior
- kill switch and revocation tested

## Commercial Gate

- Clean install succeeds from zero.
- A real founder workspace passes baseline validation.
- A real `codex exec` dry-run produces valid disk records.
- DRAX dogfoods the loop and records buyer signal.
- Three external founders complete an approved first cycle before broader claims.
