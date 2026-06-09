# Organic Automation Runtime

## Product Boundary

Drax V1 turns an existing product into a reviewable organic blog operation. If there is no product, buyer hypothesis, and conversion path, V1 records the gap and does not pretend automation is ready.

The first commercial loop is:

```text
chairman interview
  -> baseline artifacts
  -> language and stack decisions
  -> 90-post plan
  -> editorial calendar
  -> blog surface
  -> headless dry-run
  -> publish record
  -> measurement review
```

## Phase 1: Recognition

The first interaction is free text. The founder explains who they are and what they are building. The system classifies product type, state, objective, and constraints behind the scenes.

After the first answer, Drax reads repo evidence and asks for confirmation instead of asking the founder to list facts the repo already contains.

Missing facts are written as `NEEDS_DECISION`.

## Phase 2: Strategic Definition

Strategic choices use three options plus a custom answer in interactive sessions. The rich option analysis is printed as text first; the selector uses short labels.

Headless runs never depend on AskUserQuestion or any human prompt.

## Blog Surface

The plugin generates a self-contained Astro blog surface:

```bash
drax blog init --target drax-blog
```

Identity comes from founder docs at runtime. Missing site name, canonical URL, description, or base path remains `NEEDS_DECISION`.

## Trigger Engine

The manual and scheduled triggers use the same command wrapper:

```bash
drax cycle --dry-run
drax cycle --publish
```

The wrapper:

1. Acquires `flock`.
2. Reads `EXECUTION_STATE.json`.
3. Clones the workspace into `.drax/worktrees/current`.
4. Runs `codex exec --sandbox workspace-write`.
5. Verifies generated files, proof note, forbidden claims, duplicate records, and hashes.
6. Writes the publish record.
7. Advances state only after a publish succeeds.

The scheduled trigger is system cron. It is not Codex Automations.

## Local Deploy

Local deploy is central to the founder VPS use case, but live deploy implementation is still gated. The current trigger writes into the isolated clone's blog surface. A later deploy path must back up before write and require rollback fields before touching a live server directory.

Remote access and a Drax API backend are not required for local blog deploy.

## Worker Routing

Customer installs use the vendored V1 marketing worker definitions in `templates/workers/`. Existing `conclave-cc` roles are internal source patterns only. New roles must pass the internal HR protocol before they are vendored into a later plugin release.

## Safety Baseline

- dry-run default
- access token fails closed
- no secret values in prompts or artifacts
- local runtime state under `.drax/`
- isolated clone before action
- publish records as source of truth
- no live server deploy without approval, backup, and rollback
- no social posting in V1 customer runtime
