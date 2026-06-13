import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createPublicKey, verify as edVerify } from "node:crypto";

export type AccessTier = "Startup" | "Centaur" | "Unicorn";
export type BillingInterval = "monthly" | "annual";

export type TierLimits = {
  dailyRunCadence: string;
  maxProjects: number | "unlimited";
  dailyBlogPostCap: number;
  maxRuntimeHoursPerDay: number;
  maxRunsPerDay?: number;
};

export type AccessToken = {
  schemaVersion: "1.0.0";
  tokenId: string;
  tier: AccessTier;
  billingInterval: BillingInterval;
  issuedAt: string;
  expiresAt: string;
  signature: string;
  limits?: TierLimits;
};

export type AccessGrant = {
  token: AccessToken;
  limits: TierLimits;
};

export type AccessResult = { ok: true; grant: AccessGrant } | { ok: false; errors: string[] };

const tiers = new Set<AccessTier>(["Startup", "Centaur", "Unicorn"]);
const billingIntervals = new Set<BillingInterval>(["monthly", "annual"]);
// Production Ed25519 public key. The matching private key lives only on the drax-api licensing server.
const DRAX_PRODUCTION_PUBLIC_KEY = "bqpUTfuMJBHnIbSXZX16jyj9ug7njEFVaQBw4iTGbWE=";
// Licensing server that confirms revocation / live state. Overridable for self-hosters and tests.
const DRAX_VALIDATION_URL = "https://api.draxbusiness.cloud/v1/access/validate";
const DRAX_VALIDATION_TIMEOUT_MS = 8000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseDateField(record: Record<string, unknown>, field: string, errors: string[]): Date | null {
  const value = record[field];
  if (!isNonEmptyString(value)) {
    errors.push(`Access token ${field} is required.`);
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    errors.push(`Access token ${field} must be a valid date-time.`);
    return null;
  }
  return parsed;
}

function parseLimits(value: unknown): { ok: true; limits: TierLimits | null } | { ok: false; errors: string[] } {
  if (value === undefined) return { ok: true, limits: null };
  if (!isRecord(value)) return { ok: false, errors: ["Access token limits must be an object when present."] };

  const errors: string[] = [];
  const dailyRunCadence = value.dailyRunCadence;
  const maxProjects = value.maxProjects;
  const dailyBlogPostCap = value.dailyBlogPostCap;
  const maxRuntimeHoursPerDay = value.maxRuntimeHoursPerDay;
  const maxRunsPerDay = value.maxRunsPerDay;

  if (!isNonEmptyString(dailyRunCadence)) errors.push("Access token limits.dailyRunCadence is required.");
  if (
    maxProjects !== "unlimited" &&
    (typeof maxProjects !== "number" || !Number.isInteger(maxProjects) || maxProjects <= 0)
  ) {
    errors.push("Access token limits.maxProjects must be a positive integer or unlimited.");
  }
  if (typeof dailyBlogPostCap !== "number" || !Number.isInteger(dailyBlogPostCap) || dailyBlogPostCap <= 0) {
    errors.push("Access token limits.dailyBlogPostCap must be a positive integer.");
  }
  if (typeof maxRuntimeHoursPerDay !== "number" || maxRuntimeHoursPerDay <= 0) {
    errors.push("Access token limits.maxRuntimeHoursPerDay must be a positive number.");
  }
  if (maxRunsPerDay !== undefined && (typeof maxRunsPerDay !== "number" || maxRunsPerDay <= 0)) {
    errors.push("Access token limits.maxRunsPerDay must be a positive number when present.");
  }

  if (errors.length) return { ok: false, errors };

  const limits: TierLimits = {
    dailyRunCadence: dailyRunCadence as string,
    maxProjects: maxProjects as number | "unlimited",
    dailyBlogPostCap: dailyBlogPostCap as number,
    maxRuntimeHoursPerDay: maxRuntimeHoursPerDay as number,
  };
  if (typeof maxRunsPerDay === "number") limits.maxRunsPerDay = maxRunsPerDay;
  return { ok: true, limits };
}

function parseToken(value: unknown, now: Date): { ok: true; token: AccessToken } | { ok: false; errors: string[] } {
  if (!isRecord(value)) return { ok: false, errors: ["Access token must be a JSON object."] };

  const errors: string[] = [];
  const schemaVersion = value.schemaVersion;
  const tokenId = value.tokenId;
  const tier = value.tier;
  const billingInterval = value.billingInterval;
  const signature = value.signature;
  const issuedAt = parseDateField(value, "issuedAt", errors);
  const expiresAt = parseDateField(value, "expiresAt", errors);
  const limitsResult = parseLimits(value.limits);
  let limits: TierLimits | null = null;

  if (schemaVersion !== "1.0.0") errors.push("Access token schemaVersion must be 1.0.0.");
  if (!isNonEmptyString(tokenId)) errors.push("Access token tokenId is required.");
  if (!isNonEmptyString(tier) || !tiers.has(tier as AccessTier)) {
    errors.push("Access token tier must be Startup, Centaur, or Unicorn.");
  }
  if (!isNonEmptyString(billingInterval) || !billingIntervals.has(billingInterval as BillingInterval)) {
    errors.push("Access token billingInterval must be monthly or annual.");
  }
  if (!isNonEmptyString(signature)) errors.push("Access token signature is required.");
  if (issuedAt && issuedAt > now) errors.push("Access token issuedAt cannot be in the future.");
  if (expiresAt && expiresAt <= now) errors.push("Access token is expired.");
  if (!limitsResult.ok) {
    errors.push(...limitsResult.errors);
  } else {
    limits = limitsResult.limits;
  }

  if (errors.length) return { ok: false, errors };

  const token: AccessToken = {
    schemaVersion: "1.0.0",
    tokenId: tokenId as string,
    tier: tier as AccessTier,
    billingInterval: billingInterval as BillingInterval,
    issuedAt: value.issuedAt as string,
    expiresAt: value.expiresAt as string,
    signature: signature as string,
  };
  if (limits) token.limits = limits;
  return { ok: true, token };
}

function loadToken(cwd: string): { ok: true; token: unknown } | { ok: false; errors: string[] } {
  if (process.env.DRAX_ACCESS_TOKEN_JSON) {
    try {
      return { ok: true, token: JSON.parse(process.env.DRAX_ACCESS_TOKEN_JSON) };
    } catch {
      return { ok: false, errors: ["DRAX_ACCESS_TOKEN_JSON is not valid JSON."] };
    }
  }

  const tokenFile = process.env.DRAX_ACCESS_TOKEN_FILE || path.join(cwd, ".drax", "access-token.json");
  if (!existsSync(tokenFile)) {
    return {
      ok: false,
      errors: [
        "A valid Drax access token is required.",
        "Set DRAX_ACCESS_TOKEN_FILE or place the token at .drax/access-token.json.",
      ],
    };
  }

  try {
    return { ok: true, token: JSON.parse(readFileSync(tokenFile, "utf8")) };
  } catch {
    return { ok: false, errors: ["Drax access token file is not valid JSON."] };
  }
}

function b64url(buffer: Buffer): string {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function resolvedPublicKey(): string {
  return process.env.DRAX_ACCESS_PUBLIC_KEY?.trim() || DRAX_PRODUCTION_PUBLIC_KEY;
}

export function canonicalAccessTokenBytes(token: AccessToken): Buffer {
  if (!token.limits) throw new Error("Access token is missing tier limits.");
  const limits: Record<string, string | number> = {
    dailyRunCadence: token.limits.dailyRunCadence,
    maxProjects: token.limits.maxProjects,
    dailyBlogPostCap: token.limits.dailyBlogPostCap,
    maxRuntimeHoursPerDay: token.limits.maxRuntimeHoursPerDay,
  };
  if (token.limits.maxRunsPerDay !== undefined) limits.maxRunsPerDay = token.limits.maxRunsPerDay;

  const claims = {
    schemaVersion: token.schemaVersion,
    tokenId: token.tokenId,
    tier: token.tier,
    billingInterval: token.billingInterval,
    issuedAt: token.issuedAt,
    expiresAt: token.expiresAt,
    limits,
  };
  return Buffer.from(JSON.stringify(claims), "utf8");
}

export function verifyAccessTokenSignature(token: AccessToken, publicKeyStdB64: string): boolean {
  try {
    const publicKeyRaw = Buffer.from(publicKeyStdB64, "base64");
    const signature = Buffer.from(token.signature, "base64");
    if (publicKeyRaw.length !== 32 || signature.length !== 64) return false;
    const publicKey = createPublicKey({
      key: { kty: "OKP", crv: "Ed25519", x: b64url(publicKeyRaw) },
      format: "jwk",
    });
    return edVerify(null, canonicalAccessTokenBytes(token), publicKey, signature);
  } catch {
    return false;
  }
}

type LiveCheck = { decision: "allow" | "deny" | "unreachable"; errors?: string[] };

// Ask the licensing server for revocation / live state. The offline signature + expiry checks
// have already passed, so this call exists only to catch a still-valid-looking token that the
// server has since revoked (refund, chargeback, abuse). Posture is fail-open within expiry: an
// unreachable server (network/timeout/5xx) does NOT block a cryptographically valid token, but an
// explicit negative verdict (HTTP 401 or ok:false) does.
async function liveRevocationCheck(token: AccessToken): Promise<LiveCheck> {
  const url = process.env.DRAX_ACCESS_VALIDATION_URL?.trim() || DRAX_VALIDATION_URL;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DRAX_VALIDATION_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      signal: controller.signal,
    });
    type ValidateBody = { ok?: unknown; error?: unknown; revoked?: unknown };
    let body: ValidateBody | null = null;
    try {
      body = (await response.json()) as ValidateBody;
    } catch {
      body = null;
    }
    if (response.status === 401 || (body && body.ok === false)) {
      const reason = (body && typeof body.error === "string" && body.error) || `HTTP ${response.status}`;
      return { decision: "deny", errors: [`Drax access denied by the licensing server: ${reason}.`] };
    }
    if (response.ok && body && body.ok === true) {
      return { decision: "allow" };
    }
    // Reachable but inconclusive (5xx, malformed body): fail open within token expiry.
    return { decision: "unreachable" };
  } catch {
    // Network failure, DNS failure, or timeout: fail open within token expiry.
    return { decision: "unreachable" };
  } finally {
    clearTimeout(timer);
  }
}

async function validateSignedAccess(token: AccessToken): Promise<AccessResult> {
  const publicKey = resolvedPublicKey();
  if (!publicKey) {
    return {
      ok: false,
      errors: [
        "DRAX access public key is not configured.",
        "Set DRAX_ACCESS_PUBLIC_KEY or embed the production key before validating tokens.",
      ],
    };
  }

  if (!token.limits) {
    return { ok: false, errors: ["Access token is missing tier limits."] };
  }

  if (!verifyAccessTokenSignature(token, publicKey)) {
    return { ok: false, errors: ["Access token signature is invalid."] };
  }

  // Offline gate passed (signature valid, expiry checked in parseToken).
  // DRAX_ACCESS_VALIDATION_STUB=allow is an offline/CI/air-gapped bypass that skips the live call.
  if (process.env.DRAX_ACCESS_VALIDATION_STUB === "allow") {
    return { ok: true, grant: { token, limits: token.limits } };
  }

  const live = await liveRevocationCheck(token);
  if (live.decision === "deny") {
    return { ok: false, errors: live.errors ?? ["Drax access denied by the licensing server."] };
  }

  // "allow" or "unreachable" -> grant. Unreachable fails open within token expiry by design.
  return { ok: true, grant: { token, limits: token.limits } };
}

export async function validateAccess(cwd: string, now = new Date()): Promise<AccessResult> {
  const loaded = loadToken(cwd);
  if (!loaded.ok) return loaded;

  const parsed = parseToken(loaded.token, now);
  if (!parsed.ok) return parsed;

  return validateSignedAccess(parsed.token);
}
