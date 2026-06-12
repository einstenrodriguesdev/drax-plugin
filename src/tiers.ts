export const NEEDS_DECISION = "NEEDS_DECISION" as const;

export type TierName = "Startup" | "Centaur" | "Unicorn";
export type TierDecisionValue = number | "unlimited" | typeof NEEDS_DECISION;

export type TierLimitDefinition = {
  tier: TierName;
  maxProjects: TierDecisionValue;
  dailyBlogPostCap: TierDecisionValue;
  maxRuntimeHoursPerDay: TierDecisionValue;
  maxRunsPerDay: TierDecisionValue;
  notes: string;
};

export const TIER_LIMITS: Record<TierName, TierLimitDefinition> = {
  Startup: {
    tier: "Startup",
    maxProjects: 1,
    dailyBlogPostCap: 1,
    maxRuntimeHoursPerDay: 2,
    maxRunsPerDay: 1,
    notes: "1 post/day, 2h runtime, 1 run/day. Matches drax-api LimitsForTier(Startup).",
  },
  Centaur: {
    tier: "Centaur",
    maxProjects: 5,
    dailyBlogPostCap: 3,
    maxRuntimeHoursPerDay: 6,
    maxRunsPerDay: 3,
    notes: "3 posts/day, 6h runtime, 3 runs/day. Matches drax-api LimitsForTier(Centaur).",
  },
  Unicorn: {
    tier: "Unicorn",
    maxProjects: "unlimited",
    dailyBlogPostCap: 999999,
    maxRuntimeHoursPerDay: 24,
    maxRunsPerDay: 999999,
    notes: "Effectively unlimited posts, 24h runtime. Matches drax-api LimitsForTier(Unicorn) sentinel.",
  },
};
