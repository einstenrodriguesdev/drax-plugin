import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export type AccessTier = "Solo" | "Studio" | "Scale";
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

const tiers = new Set<AccessTier>(["Solo", "Studio", "Scale"]);
const billingIntervals = new Set<BillingInterval>(["monthly", "annual"]);

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
    errors.push("Access token tier must be Solo, Studio, or Scale.");
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

function validateWithServerStub(token: AccessToken): AccessResult {
  // TODO: POST the token to drax-api /v1/access/validate, then use the returned tier limits.
  // Until that endpoint exists, customer runtime fails closed by default.
  if (process.env.DRAX_ACCESS_VALIDATION_STUB !== "allow") {
    return {
      ok: false,
      errors: [
        "Drax access token server validation is not available yet.",
        "TODO: call drax-api /v1/access/validate and fail closed on network, revocation, expiry, signature, or tier mismatch.",
      ],
    };
  }

  if (!token.limits) {
    return { ok: false, errors: ["Access token validation stub requires tier limits on the token."] };
  }
  return { ok: true, grant: { token, limits: token.limits } };
}

export function validateAccess(cwd: string, now = new Date()): AccessResult {
  const loaded = loadToken(cwd);
  if (!loaded.ok) return loaded;

  const parsed = parseToken(loaded.token, now);
  if (!parsed.ok) return parsed;

  return validateWithServerStub(parsed.token);
}
