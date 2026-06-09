# Installation

## Public Codex Marketplace

Clean Codex users install the public plugin from the GitHub marketplace source:

```bash
codex plugin marketplace add einstenrodriguesdev/drax-plugin --ref main
codex plugin add drax@drax
```

After installation, complete the non-root setup:

```bash
export PATH="$HOME/.local/bin:$PATH"
codex login
```

Complete the Device Code login flow shown by Codex. If Codex is installed outside `PATH`, set:

```bash
export DRAX_CODEX_BIN="/absolute/path/to/codex"
```

## Package Artifact Test

From `drax-dev`:

```bash
npm install
npm run verify
npm pack
npm exec --yes --package ./drax-plugin-1.0.0.tgz -- drax-plugin install --target all
```

Supported install targets are `codex`, `claude`, and `all`.

The installer is non-root. It writes to:

- `~/plugins/drax`
- `~/.agents/plugins/marketplace.json`
- `~/.claude/commands/drax.md`
- `~/.local/share/drax-plugin`
- `~/.local/bin/drax`

## Access Token

Runtime commands require a Drax access token. Store it outside tracked source files.

Supported locations:

- `.drax/access-token.json` inside the founder workspace
- `DRAX_ACCESS_TOKEN_FILE` pointing to an absolute token path
- `DRAX_ACCESS_TOKEN_JSON` for controlled tests

Drax fails closed when the token is missing, expired, structurally invalid, revoked, or not validated by the Drax server. Until `drax-api` exists, production validation is a TODO and test runs use the explicit validation stub.

## First Workspace Run

Use a git repository workspace. The trigger engine clones that repo into `.drax/worktrees/current` before taking action.

```bash
mkdir -p ~/drax-tests/example-product
cd ~/drax-tests/example-product
git init
drax init
drax
```

`drax init` creates the baseline Markdown artifacts and `EXECUTION_STATE.json`. It does not overwrite existing files unless `--force` is used.

## Blog Surface

Generate the self-contained Astro blog surface:

```bash
drax blog init --target drax-blog
```

The generator reads identity and base path from the founder docs. Missing values stay `NEEDS_DECISION`.

## Trigger Engine

Dry run:

```bash
drax cycle --dry-run
```

Publish into the isolated clone's blog surface:

```bash
drax cycle --publish
```

Print the cron entry:

```bash
drax cycle cron
```

The scheduled trigger uses system cron, not Codex Automations. It calls the same `drax cycle` wrapper as the manual trigger.

## Rollback

The installer preserves unrelated personal marketplace entries and backs up user-owned files before replacement. To roll back, remove installer-owned `~/plugins/drax`, the Drax marketplace entry, the generated Claude command, `~/.local/share/drax-plugin`, and `~/.local/bin/drax`.

## Not Included

- live local server deploy
- social platform API posting
- browser account automation
- payment backend
- signing or validation secrets
