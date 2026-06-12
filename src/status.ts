import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------------------
// Types matching what cycle.ts + distribute.ts write to disk (read-only)
// ---------------------------------------------------------------------------

type PublishResult = "pending" | "succeeded" | "failed" | "rolled-back";

type SocialSubStatus = string; // "generated" | "skipped-*" | "error" etc.

type PublishRecord = {
  schemaVersion?: unknown;
  result?: PublishResult;
  dryRun?: boolean;
  requestedAt?: string;
  publishTarget?: { slug?: string };
  images?: { status?: SocialSubStatus; error?: string };
  video?: { status?: SocialSubStatus; error?: string };
  carousel?: { status?: SocialSubStatus; error?: string };
  // review verdict lives in the run's sector/04-review.md, but some records
  // surface a reviewVerdict field (not always present — optional read)
  reviewVerdict?: string;
};

type QueueEntry = {
  status?: "queued" | "posted" | "error";
  platform?: string;
  slug?: string;
  postedAt?: string;
  permalink?: string;
  error?: string;
  builtAt?: string;
};

type AccessTokenRaw = {
  schemaVersion?: unknown;
  tier?: unknown;
  expiresAt?: unknown;
  issuedAt?: unknown;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tryParseJson(file: string): { ok: true; value: unknown } | { ok: false } {
  try {
    const text = readFileSync(file, "utf8");
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Read all *.json files from a directory, returning parsed records + a count of corrupt files. */
function readJsonDir(dir: string): { records: Record<string, unknown>[]; corrupt: number } {
  if (!existsSync(dir)) return { records: [], corrupt: 0 };
  let files: string[];
  try {
    files = readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .sort(); // stable sort by filename
  } catch {
    return { records: [], corrupt: 0 };
  }
  const records: Record<string, unknown>[] = [];
  let corrupt = 0;
  for (const f of files) {
    const result = tryParseJson(path.join(dir, f));
    if (!result.ok || !isRecord(result.value)) {
      corrupt++;
      continue;
    }
    records.push(result.value);
  }
  return { records, corrupt };
}

function marker(status: "OK" | "ATTENTION" | "NO-DATA"): string {
  return `[${status}]`;
}

// ---------------------------------------------------------------------------
// Generation layer (publish-records)
// ---------------------------------------------------------------------------

type GenerationStatus = {
  total: number;
  succeeded: number;
  failed: number;
  corrupt: number;
  last: {
    result: string;
    dryRun: boolean;
    slug: string;
    requestedAt: string;
    images: string;
    video: string;
    carousel: string;
  } | null;
};

function readGenerationStatus(cwd: string): GenerationStatus {
  // Respect EXECUTION_STATE.json override for publishRecordDirectory
  const defaultDir = path.join(cwd, ".drax", "publish-records");
  let dir = defaultDir;
  const statePath = path.join(cwd, "EXECUTION_STATE.json");
  if (existsSync(statePath)) {
    const parsed = tryParseJson(statePath);
    if (parsed.ok && isRecord(parsed.value)) {
      const config = parsed.value["config"];
      if (isRecord(config)) {
        const custom = config["publishRecordDirectory"];
        if (typeof custom === "string" && custom.trim().length > 0) {
          dir = path.isAbsolute(custom) ? custom : path.join(cwd, custom);
        }
      }
    }
  }

  const { records, corrupt } = readJsonDir(dir);
  let succeeded = 0;
  let failed = 0;
  let last: GenerationStatus["last"] = null;

  for (const rec of records) {
    const result = rec["result"];
    if (result === "succeeded") succeeded++;
    else if (result === "failed" || result === "rolled-back") failed++;
  }

  // Last record = last in stable (filename/lexicographic) sort
  const lastRec = records[records.length - 1];
  if (lastRec !== undefined) {
    const images = lastRec["images"];
    const video = lastRec["video"];
    const carousel = lastRec["carousel"];
    last = {
      result: typeof lastRec["result"] === "string" ? (lastRec["result"] as string) : "unknown",
      dryRun: lastRec["dryRun"] === true,
      slug:
        isRecord(lastRec["publishTarget"]) && typeof lastRec["publishTarget"]["slug"] === "string"
          ? lastRec["publishTarget"]["slug"]
          : "(unknown)",
      requestedAt: typeof lastRec["requestedAt"] === "string" ? lastRec["requestedAt"] : "(unknown)",
      images: isRecord(images) && typeof images["status"] === "string" ? images["status"] : "unknown",
      video: isRecord(video) && typeof video["status"] === "string" ? video["status"] : "unknown",
      carousel: isRecord(carousel) && typeof carousel["status"] === "string" ? carousel["status"] : "unknown",
    };
  }

  return {
    total: records.length,
    succeeded,
    failed,
    corrupt,
    last,
  };
}

// ---------------------------------------------------------------------------
// Distribution layer (post-queue)
// ---------------------------------------------------------------------------

const KNOWN_PLATFORMS = ["instagram", "tiktok", "youtube", "instagram-reels"] as const;
type KnownPlatform = (typeof KNOWN_PLATFORMS)[number];

type PlatformCounts = {
  queued: number;
  posted: number;
  error: number;
  latestPermalink: string | null;
  latestError: string | null;
};

type DistributionStatus = {
  platforms: Record<KnownPlatform, PlatformCounts>;
  other: number;
  corrupt: number;
};

function emptyPlatformCounts(): PlatformCounts {
  return { queued: 0, posted: 0, error: 0, latestPermalink: null, latestError: null };
}

function readDistributionStatus(cwd: string): DistributionStatus {
  const dir = path.join(cwd, ".drax", "post-queue");
  const { records, corrupt } = readJsonDir(dir);

  const platforms: Record<KnownPlatform, PlatformCounts> = {
    instagram: emptyPlatformCounts(),
    tiktok: emptyPlatformCounts(),
    youtube: emptyPlatformCounts(),
    "instagram-reels": emptyPlatformCounts(),
  };
  let other = 0;

  for (const rec of records) {
    const platform = typeof rec["platform"] === "string" ? rec["platform"] : null;
    const status = typeof rec["status"] === "string" ? rec["status"] : null;
    const permalink = typeof rec["permalink"] === "string" ? rec["permalink"] : null;
    const error = typeof rec["error"] === "string" ? rec["error"] : null;

    const isKnown = platform !== null && (KNOWN_PLATFORMS as readonly string[]).includes(platform);
    if (!isKnown) {
      other++;
      continue;
    }
    const counts = platforms[platform as KnownPlatform];
    if (status === "queued") counts.queued++;
    else if (status === "posted") {
      counts.posted++;
      if (permalink) counts.latestPermalink = permalink;
    } else if (status === "error") {
      counts.error++;
      if (error) counts.latestError = error;
    }
  }

  return { platforms, other, corrupt };
}

// ---------------------------------------------------------------------------
// Activation layer (access token — decode only, no network)
// ---------------------------------------------------------------------------

type ActivationStatus =
  | { present: false }
  | { present: true; tier: string; expiresAt: string; expired: boolean; issuedAt: string };

function readActivationStatus(cwd: string): ActivationStatus {
  // Mirror access.ts loadToken() logic (no side effects, no network)
  let rawToken: unknown = undefined;

  if (process.env.DRAX_ACCESS_TOKEN_JSON) {
    try {
      rawToken = JSON.parse(process.env.DRAX_ACCESS_TOKEN_JSON);
    } catch {
      return { present: false };
    }
  } else {
    const tokenFile = process.env.DRAX_ACCESS_TOKEN_FILE || path.join(cwd, ".drax", "access-token.json");
    if (!existsSync(tokenFile)) return { present: false };
    const result = tryParseJson(tokenFile);
    if (!result.ok) return { present: false };
    rawToken = result.value;
  }

  if (!isRecord(rawToken)) return { present: false };
  const tier = typeof rawToken["tier"] === "string" ? rawToken["tier"] : "(unknown)";
  const expiresAt = typeof rawToken["expiresAt"] === "string" ? rawToken["expiresAt"] : "(unknown)";
  const issuedAt = typeof rawToken["issuedAt"] === "string" ? rawToken["issuedAt"] : "(unknown)";
  const expired = expiresAt !== "(unknown)" && new Date(expiresAt) <= new Date();

  return { present: true, tier, expiresAt, issuedAt, expired };
}

// ---------------------------------------------------------------------------
// Human-readable output
// ---------------------------------------------------------------------------

function printHuman(
  cwd: string,
  gen: GenerationStatus,
  dist: DistributionStatus,
  act: ActivationStatus,
): void {
  const lines: string[] = [];

  // --- Generation ---
  lines.push("=== Layer 1-2: Generation + Blog Publish ===");
  if (gen.total === 0 && gen.corrupt === 0) {
    lines.push(`${marker("NO-DATA")} No publish records found in .drax/publish-records/`);
  } else {
    const m = gen.failed > 0 ? "ATTENTION" : "OK";
    lines.push(`${marker(m)} total=${gen.total}  succeeded=${gen.succeeded}  failed=${gen.failed}${gen.corrupt > 0 ? `  corrupt=${gen.corrupt}` : ""}`);
    if (gen.last !== null) {
      lines.push(`  last run: result=${gen.last.result}  dryRun=${gen.last.dryRun}  slug=${gen.last.slug}`);
      lines.push(`  last run: requestedAt=${gen.last.requestedAt}`);
      lines.push(`  last run: images=${gen.last.images}  video=${gen.last.video}  carousel=${gen.last.carousel}`);
    }
  }
  lines.push("");

  // --- Distribution ---
  lines.push("=== Layer 3: Social Distribution ===");
  const totalQueued = KNOWN_PLATFORMS.reduce((sum, p) => sum + dist.platforms[p].queued, 0);
  const totalPosted = KNOWN_PLATFORMS.reduce((sum, p) => sum + dist.platforms[p].posted, 0);
  const totalError = KNOWN_PLATFORMS.reduce((sum, p) => sum + dist.platforms[p].error, 0);
  const totalEntries = totalQueued + totalPosted + totalError + dist.other;
  if (totalEntries === 0 && dist.corrupt === 0) {
    lines.push(`${marker("NO-DATA")} No post-queue entries found in .drax/post-queue/`);
  } else {
    const m = totalError > 0 ? "ATTENTION" : "OK";
    lines.push(`${marker(m)} total entries: queued=${totalQueued}  posted=${totalPosted}  error=${totalError}${dist.corrupt > 0 ? `  corrupt=${dist.corrupt}` : ""}`);
    for (const p of KNOWN_PLATFORMS) {
      const c = dist.platforms[p];
      if (c.queued + c.posted + c.error === 0) continue;
      let line = `  ${p}: queued=${c.queued}  posted=${c.posted}  error=${c.error}`;
      if (c.latestPermalink) line += `  permalink=${c.latestPermalink}`;
      if (c.latestError) line += `  latestError=${c.latestError}`;
      lines.push(line);
    }
  }
  lines.push("");

  // --- Activation ---
  lines.push("=== Layer 7: Activation (Access Token) ===");
  if (!act.present) {
    lines.push(`${marker("NO-DATA")} No access token in this workspace`);
    lines.push("  Place token at .drax/access-token.json or set DRAX_ACCESS_TOKEN_JSON / DRAX_ACCESS_TOKEN_FILE");
  } else {
    const m = act.expired ? "ATTENTION" : "OK";
    lines.push(`${marker(m)} tier=${act.tier}  issuedAt=${act.issuedAt}  expiresAt=${act.expiresAt}  expired=${act.expired}`);
  }
  lines.push("");

  // --- Scope note ---
  lines.push("=== Layers 4-6: Traffic / Checkout / Payment Issuance ===");
  lines.push(`${marker("NO-DATA")} Tracked separately (drax-api conversion records + issue #32 attribution).`);
  lines.push("  This view covers only the engine-owned layers above.");

  console.log(lines.join("\n"));
}

// ---------------------------------------------------------------------------
// JSON output
// ---------------------------------------------------------------------------

type StatusJson = {
  generatedAt: string;
  layers: {
    generation: {
      total: number;
      succeeded: number;
      failed: number;
      corrupt: number;
      last: GenerationStatus["last"];
    };
    distribution: {
      platforms: Record<
        KnownPlatform,
        { queued: number; posted: number; error: number; latestPermalink: string | null; latestError: string | null }
      >;
      otherEntries: number;
      corrupt: number;
    };
    activation: ActivationStatus;
  };
  notes: string[];
};

function buildJson(
  gen: GenerationStatus,
  dist: DistributionStatus,
  act: ActivationStatus,
): StatusJson {
  return {
    generatedAt: new Date().toISOString(),
    layers: {
      generation: {
        total: gen.total,
        succeeded: gen.succeeded,
        failed: gen.failed,
        corrupt: gen.corrupt,
        last: gen.last,
      },
      distribution: {
        platforms: dist.platforms,
        otherEntries: dist.other,
        corrupt: dist.corrupt,
      },
      activation: act,
    },
    notes: [
      "Layers 1-2 (generation + blog publish) and Layer 3 (social distribution) are read from local .drax/ artifacts.",
      "Layer 7 (activation) is decoded offline from the local access token — no network revocation check.",
      "Layers 4-6 (traffic / checkout / payment-issuance) are tracked separately by drax-api conversion records and issue #32 attribution.",
    ],
  };
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export function runStatusCommand(args: string[]): void {
  const jsonMode = args.includes("--json");
  const cwd = process.cwd();

  const gen = readGenerationStatus(cwd);
  const dist = readDistributionStatus(cwd);
  const act = readActivationStatus(cwd);

  if (jsonMode) {
    console.log(JSON.stringify(buildJson(gen, dist, act), null, 2));
  } else {
    printHuman(cwd, gen, dist, act);
  }
}
