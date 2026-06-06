# Setup

## Non-Root Install

Drax installs into the current user's home directory. It does not require root.

Installer-owned paths:

- `~/plugins/drax`
- `~/.agents/plugins/marketplace.json`
- `~/.claude/commands/drax.md`
- `~/.local/share/drax-plugin`
- `~/.local/bin/drax`

## PATH Setup

Make sure `~/.local/bin` is on `PATH` before running `drax`.

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Persist it in the user's shell profile when needed.

## Codex Device Code Login

Drax launches Codex for the founder interview. Before the first Drax session, Codex must be installed and authenticated.

```bash
codex login
```

Complete the Device Code login flow shown by Codex. If Codex is not on `PATH`, set `DRAX_CODEX_BIN` to the full binary path.

```bash
export DRAX_CODEX_BIN="/absolute/path/to/codex"
```

## First Workspace Run

From a customer project workspace:

```bash
drax init
drax
```

`drax init` copies the 12 baseline artifacts into the current workspace without overwriting existing files unless `--force` is used.
