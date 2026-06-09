# Setup

## Non-Root Install

Drax installs into the current user's home directory. It does not require root.

Installer-owned paths:

- `~/plugins/drax`
- `~/.agents/plugins/marketplace.json`
- `~/.claude/commands/drax.md`
- `~/.local/share/drax-plugin`
- `~/.local/bin/drax`

## PATH

Make sure `~/.local/bin` is on `PATH` before running `drax`.

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Persist it in the user's shell profile when needed.

## Codex Login

Drax uses Codex for the founder interview and for the headless content cycle. Before the first run:

```bash
codex login
```

Complete the Device Code login flow shown by Codex. If Codex is not on `PATH`, set:

```bash
export DRAX_CODEX_BIN="/absolute/path/to/codex"
```

## Founder Workspace

Run Drax from the customer's product git repository.

```bash
cd /path/to/product-repo
drax init
drax
```

`drax init` creates the 12 baseline artifacts plus `EXECUTION_STATE.json`. Existing artifacts are preserved unless `--force` is used.

The trigger engine writes local runtime state under `.drax/`. That directory should stay ignored by git.

## Access Token

Runtime commands require a Drax access token.

Supported locations:

- `.drax/access-token.json`
- `DRAX_ACCESS_TOKEN_FILE`
- `DRAX_ACCESS_TOKEN_JSON` for controlled tests

The token is validated by the server-side access boundary. The plugin must not contain signing keys or payment-provider keys.

## First Safe Cycle

After the baseline passes:

```bash
drax blog init --target drax-blog
drax cycle --dry-run
```

Do not use `drax cycle --publish` until the blog surface path and founder content boundaries are decided.
