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

## Container & Sandbox Requirements

Each cycle stage runs `codex exec --sandbox workspace-write`. Codex's `workspace-write` sandbox uses bubblewrap (`bwrap`), which needs user namespaces and mount-propagation permissions. On bare metal and standard Linux hosts this works out of the box.

Inside containers it is a silent-failure trap. The default Docker seccomp profile blocks `unshare`/user-namespace creation and the default AppArmor profile blocks mount propagation inside a user namespace. When that happens, `codex exec` can exit `0` while writing zero files, and the cycle then fails downstream with an "artifact was not written" error that looks like a generation bug but is actually a sandbox-permission problem.

If you run DRAX in a container, the Codex sandbox needs elevated permissions. Minimum working set:

```bash
docker run \
  --security-opt seccomp=unconfined \
  --security-opt apparmor=unconfined \
  ...
```

`bwrap` may additionally require `CAP_SYS_ADMIN`; if the two `unconfined` flags are not enough, add `--cap-add SYS_ADMIN`, or as a last resort run the container `--privileged` (broadest, least recommended for production). Verify the sandbox can write before trusting a run:

```bash
codex exec --sandbox workspace-write --cd /tmp 'write the text SANDBOX_WRITE_OK to proof.txt'
test -s /tmp/proof.txt && echo "sandbox OK" || echo "sandbox BROKEN: fix container perms"
```

Bare-metal and most managed-VM hosts do not need any of this. Only containerized self-hosting does.

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

Drax fails closed when the token is missing, expired, structurally invalid, or carries an invalid Ed25519 signature. The plugin verifies every token offline against the embedded production public key, then asks the live licensing server (`https://api.conclave-company.com/v1/access/validate`) whether the token has been revoked.

Revocation posture is fail-open within token expiry: if the licensing server is unreachable (network failure, timeout, or 5xx), a cryptographically valid, unexpired token keeps working until it naturally expires — an API outage never blocks a paying customer. Only an explicit negative verdict from the server (HTTP 401 / `ok:false`, e.g. a refund or chargeback revocation) blocks access before expiry.

Air-gapped/CI runs may set `DRAX_ACCESS_VALIDATION_STUB=allow` to skip the live call after the offline signature check passes. `DRAX_ACCESS_VALIDATION_URL` overrides the endpoint for testing.

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

## Optional Social Assets

Published blog posts can also generate local social assets after the post is already written. These assets are best-effort and never block the publish run.

Social images need Python 3 and Pillow:

```bash
python3 -m pip install -r requirements.txt
```

Social video reels additionally need the FFmpeg system binary on `PATH`:

```bash
sudo apt-get install -y ffmpeg
```

SVG carousel, story, and highlight assets need no extra dependency beyond Python 3. To also emit PNG rasterizations next to the hand-editable SVGs, install a rasterizer:

```bash
sudo apt-get install -y librsvg2-bin
```

`librsvg2-bin` provides `rsvg-convert`; alternatively set `DRAX_RSVG_BIN` to a compatible binary. The assets are copied into `src/assets/social/` of the published blog surface.

Fonts are optional; the renderer falls back to system defaults.

## Social Posting (Optional)

Social posting is a separate paid runtime command. It is never run by `drax cycle`, and Playwright is not installed by default.

Install the browser automation runtime only in workspaces where you want live posting:

```bash
npm i playwright
npx playwright install chromium
```

Log in once and let DRAX persist the authenticated browser session:

```bash
drax distribute login --platform instagram
```

DRAX saves Playwright `storageState` cookies and localStorage under `.drax/sessions/instagram.json`. It does not require, store, or write raw Instagram passwords. Optional `DRAX_IG_USERNAME` and `DRAX_IG_PASSWORD` environment variables are only an explicit login fallback and are never written to disk by DRAX.

By default, distribution is draft-and-queue only:

```bash
drax distribute --platform instagram
```

That reads the latest succeeded non-dry-run publish record, selects the generated square PNG for Instagram, builds a deterministic caption, and writes `.drax/post-queue/{utcstamp}-instagram.json` with status `queued`. To actually post, rerun with an explicit confirmation:

```bash
drax distribute --platform instagram --confirm
```

Confirmed posting reuses `.drax/sessions/instagram.json`, updates the queue entry to `posted` when successful, and writes a small log under `.drax/logs/`.

### Vertical-video reel cross-posting

Three additional platforms consume the `#30` reel (`{slug}-reel.mp4`) produced by the publish cycle:

| Platform | `--platform` value | Session file | Reel source |
|---|---|---|---|
| TikTok | `tiktok` | `.drax/sessions/tiktok.json` | `video.reel` in publish record |
| YouTube Shorts | `youtube` | `.drax/sessions/youtube.json` | `video.reel` in publish record |
| Instagram Reels | `instagram-reels` | `.drax/sessions/instagram.json` | `video.reel` in publish record |

Instagram Reels reuses the existing Instagram session — no extra login needed if you already ran `drax distribute login --platform instagram`.

One-time login for TikTok and YouTube:

```bash
drax distribute login --platform tiktok
drax distribute login --platform youtube
```

Queue a draft (default, no browser launched):

```bash
drax distribute --platform tiktok
drax distribute --platform youtube
drax distribute --platform instagram-reels
```

Post live:

```bash
drax distribute --platform tiktok --confirm
drax distribute --platform youtube --confirm
drax distribute --platform instagram-reels --confirm
```

The reel must exist with `video.status === "generated"` in the publish record. If it is absent, DRAX surfaces a clear error and writes no queue entry. Run a publish cycle with ffmpeg installed to produce the reel first.

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

## Licensing Server (drax-api)

The licensing backend is deployed and live at `https://api.conclave-company.com`:

- `POST /webhooks/payments` — receives Stripe `checkout.session.completed` events and issues a signed access token.
- `POST /v1/access/validate` — offline-verifiable token revocation check used by the plugin.

To wire payments, register the Stripe webhook endpoint in the Stripe Dashboard pointing at `https://api.conclave-company.com/webhooks/payments` and store the resulting signing secret as `STRIPE_WEBHOOK_SECRET` in the server's `.env.production`. The Stripe Checkout / Payment Link **must attach the price ID as session metadata** (`price_id`); the webhook reads the tier from metadata, not from line items, so a checkout without it returns "missing price_id metadata".

## Not Included

- social platform API posting
