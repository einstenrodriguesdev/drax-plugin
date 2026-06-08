# Trigger Engine

## Boundary

The trigger engine is fixed product code. The founder interview produces the 12 baseline artifacts and `EXECUTION_STATE.json`; the engine reads those files and runs executable gates. Markdown describes the system, but JSON state, run manifests, asset hashes, and publish records are the source of truth for trigger execution.

## Commands

Manual dry run:

```bash
drax cycle --dry-run
```

Manual publish to the isolated blog surface:

```bash
drax cycle --publish
```

Print the scheduled trigger entry:

```bash
drax cycle cron
```

The cron entry calls the same `drax cycle` wrapper. There is one cycle implementation, with manual and scheduled entry points.

## Execution Lock

The wrapper uses `flock` before reading state. A second invocation exits immediately with no work, so cron and a manual trigger cannot fabricate the same post in parallel.

Order:

1. Acquire `.drax/locks/cycle.lock`.
2. Read `EXECUTION_STATE.json`.
3. Clone the workspace into `.drax/worktrees/current`.
4. Run `codex exec --sandbox workspace-write` inside the clone.
5. Verify generated files, hashes, duplicate state, and forbidden-claim gates.
6. Write the publish record.
7. Advance state only after a publish succeeds.

## State Files

`EXECUTION_STATE.json` is authoritative. `EXECUTION_STATE.md` is the human-readable view that Drax renders from JSON after successful publishes.

Run records live under:

```text
.drax/
  locks/
  logs/
  publish-records/
  runs/
    pending/
    published/
    failed/
  worktrees/
```

`.drax/` is ignored by git because it contains local runtime state and access-token paths.

## Codex Exec

The content engine runs through:

```bash
codex exec --sandbox workspace-write --cd <clone> --output-last-message <log-file> <prompt>
```

The final Codex message and exit code are secondary signals. The source of truth is the package written on disk and the publish record verified after gates pass.

The trigger never invokes AskUserQuestion. In headless execution there is no human prompt path, and unknown facts must remain `NEEDS_DECISION`.

## Dry Run

`--dry-run` fabricates the package, runs the gates, computes hashes, writes a run manifest, and writes a dry-run publish record. It stops before writing the blog post into the isolated blog surface. It does not advance `nextPostIndex`.

## Publish

`--publish` uses the same cycle and then writes the generated article into the isolated clone's blog surface under `src/content/posts/`. It does not deploy to the live server path. Local deploy remains approval-gated and backup-first through the deploy config contract.

After publish succeeds, Drax advances `EXECUTION_STATE.json`, renders `EXECUTION_STATE.md`, and moves the run manifest to `runs/published/`.

## Gates

The first implemented gates are:

- generated article exists
- generated content package exists
- package fields are decided
- proof note is present
- generated content has no `NEEDS_DECISION`
- forbidden claim patterns are absent
- asset hashes match the generated manifest
- duplicate successful publish records are refused

Future publishers plug into the same content package boundary. V1 implements only the blog publisher.
