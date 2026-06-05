# Installation

## 1. Repository Marketplace

For private testing:

```bash
codex plugin marketplace add /home/conclave/drax/drax-corp
codex plugin add drax@drax-corp
```

## 2. Package Installer

```bash
npm pack
npm exec --yes --package ./drax-corp-1.0.0.tgz -- drax-corp install --target all
```

Supported targets: `codex`, `claude`, and `all`.

After installation, test in an isolated workspace:

```bash
mkdir -p ~/drax-tests/example-product
cd ~/drax-tests/example-product
drax
```

The first real run should create the v1 baseline artifacts for founder/product context, language strategy, stack/security decision, 90-post planning, worker routing, triggers, distribution, measurement, and execution state.

## 3. Source Development

```bash
npm install
npm run verify
npm link
npx drax-corp install --target all
drax doctor
```

## Rollback

The installer preserves unrelated personal marketplace entries and backs up user-owned files before replacement. It installs a persistent runtime under `~/.local/share/drax-corp` so the launcher remains usable after a temporary package command exits. Remove installer-owned `~/plugins/drax`, the Drax marketplace entry, the generated Claude command, `~/.local/share/drax-corp`, and `~/.local/bin/drax` to roll back.

## Antigravity

Antigravity support is a compatibility target, not a v1.0.0 production claim. Add an adapter only after its plugin, command, permission, and isolated-install behavior are documented and tested.
