export const NEEDS_DECISION = "NEEDS_DECISION" as const;

export type TierName = "Solo" | "Studio" | "Scale";
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
  Solo: {
    tier: "Solo",
    maxProjects: 1,
    dailyBlogPostCap: NEEDS_DECISION,
    maxRuntimeHoursPerDay: NEEDS_DECISION,
    maxRunsPerDay: NEEDS_DECISION,
    notes: "Founder to confirm daily blog cadence cap. Proposed default for review: 1 post/day.",
  },
  Studio: {
    tier: "Studio",
    maxProjects: 5,
    dailyBlogPostCap: NEEDS_DECISION,
    maxRuntimeHoursPerDay: NEEDS_DECISION,
    maxRunsPerDay: NEEDS_DECISION,
    notes: "Founder to confirm higher cadence than Solo.",
  },
  Scale: {
    tier: "Scale",
    maxProjects: "unlimited",
    dailyBlogPostCap: NEEDS_DECISION,
    maxRuntimeHoursPerDay: NEEDS_DECISION,
    maxRunsPerDay: NEEDS_DECISION,
    notes: "Founder to confirm highest cadence and runtime ceiling.",
  },
};
