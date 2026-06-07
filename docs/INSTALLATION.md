# Installation

## 1. Repository Marketplace

For private testing:

```bash
codex plugin marketplace add /home/conclave/drax/drax-plugin
codex plugin add drax@drax-plugin
```

## 2. Package Installer

```bash
npm pack
npm exec --yes --package ./drax-plugin-1.0.0.tgz -- drax-plugin install --target all
```

Supported targets: `codex`, `claude`, and `all`.

The installer is non-root. It writes to the current user's home directory. After installation, make sure the launcher path is available:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Codex must be authenticated before the first Drax session:

```bash
codex login
```

Complete the Device Code login flow shown by Codex. If Codex is installed outside `PATH`, set `DRAX_CODEX_BIN` to the full binary path.

Runtime commands require a Drax access token. Place it at `.drax/access-token.json` in the founder workspace or set `DRAX_ACCESS_TOKEN_FILE` to the token path. The runtime fails closed until the token can be validated by the Drax server.

After installation, test in an isolated workspace:

```bash
mkdir -p ~/drax-tests/example-product
cd ~/drax-tests/example-product
drax init
drax
```

`drax init` creates the v1 baseline artifacts for founder/product context, language strategy, stack/security decision, 90-post planning, worker routing, triggers, distribution, measurement, and execution state. It does not overwrite existing files unless `--force` is used.

To generate a self-contained editorial blog surface for an existing customer site:

```bash
drax blog init --target drax-blog
```

The generator reads blog identity and base path from the founder docs. Replace any generated `NEEDS_DECISION` value in those docs before production deployment.

## 3. Source Development

```bash
npm install
npm run verify
npm link
npx drax-plugin install --target all
drax doctor
```

## Rollback

The installer preserves unrelated personal marketplace entries and backs up user-owned files before replacement. It installs a persistent runtime under `~/.local/share/drax-plugin` so the launcher remains usable after a temporary package command exits. Remove installer-owned `~/plugins/drax`, the Drax marketplace entry, the generated Claude command, `~/.local/share/drax-plugin`, and `~/.local/bin/drax` to roll back.

## Antigravity

Antigravity support is a compatibility target, not a v1.0.0 production claim. Add an adapter only after its plugin, command, permission, and isolated-install behavior are documented and tested.
