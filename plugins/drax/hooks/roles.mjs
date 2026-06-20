import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = path.resolve(MODULE_DIR, "..");
const PACKAGE_ROOT = path.resolve(PLUGIN_ROOT, "../..");

export const ARTIFACT_OWNERS = {
  "FOUNDER_BRAND_BRIEF.md": [
    { stage: "Frame", label: "Chairman", roleFile: "chairman.md" },
    { stage: "Draft", label: "Chairman + founder — founder due diligence", roleFile: "chairman.md" },
    { stage: "Gate", label: "founder confirms", roleFile: null },
  ],
  "BOARD_MANDATE.md": [
    { stage: "Frame", label: "Chairman", roleFile: "chairman.md" },
    { stage: "Draft", label: "Chairman + founder — board charter", roleFile: "chairman.md" },
    { stage: "Gate", label: "board / Chairman gate", roleFile: "chairman.md" },
  ],
  "VISION_AND_STRATEGY.md": [
    { stage: "Frame", label: "Chairman / CEO", roleFile: "ceo.md" },
    { stage: "Draft", label: "Chairman + founder — V2MOM", roleFile: "chairman.md" },
    { stage: "Gate", label: "board / Chairman gate", roleFile: "chairman.md" },
  ],
  "POSITIONING_STATEMENT.md": [
    { stage: "Frame", label: "CMO", roleFile: "cmo.md" },
    { stage: "Decompose", label: "Director of Marketing Operations", roleFile: "director-of-marketing-operations.md" },
    { stage: "Draft", label: "Content / brand strategist — positioning", roleFile: "content-strategist.md" },
    { stage: "Gate", label: "CMO review", roleFile: "cmo.md" },
  ],
  "MARKET_LOCALIZATION_STRATEGY.md": [
    { stage: "Frame", label: "CMO", roleFile: "cmo.md" },
    { stage: "Decompose", label: "Director of Marketing Operations", roleFile: "director-of-marketing-operations.md" },
    { stage: "Draft", label: "Content strategist", roleFile: "content-strategist.md" },
    { stage: "Gate", label: "CMO review", roleFile: "cmo.md" },
  ],
  "TECH_DECISION_RECORD.md": [
    { stage: "Frame", label: "CTO / CISO", roleFile: "cto.md" },
    { stage: "Draft", label: "CTO / CISO — decision record", roleFile: "cto.md" },
    { stage: "Gate", label: "founder confirms", roleFile: null },
  ],
  "GTM_STRATEGY.md": [
    { stage: "Frame", label: "CMO", roleFile: "cmo.md" },
    { stage: "Decompose", label: "Director of Marketing Operations", roleFile: "director-of-marketing-operations.md" },
    { stage: "Draft", label: "Content strategist — growth model", roleFile: "content-strategist.md" },
    { stage: "Gate", label: "CMO review", roleFile: "cmo.md" },
  ],
  "CONTENT_STRATEGY.md": [
    { stage: "Frame", label: "CMO", roleFile: "cmo.md" },
    { stage: "Decompose", label: "Director of Marketing Operations", roleFile: "director-of-marketing-operations.md" },
    { stage: "Draft", label: "Content strategist (SME) -> SEO -> claims review", roleFile: "content-strategist.md" },
    { stage: "Gate", label: "claims review + founder", roleFile: "claims-quality-reviewer.md" },
  ],
  "EDITORIAL_CALENDAR.md": [
    { stage: "Frame", label: "CMO", roleFile: "cmo.md" },
    { stage: "Decompose", label: "Director of Marketing Operations", roleFile: "director-of-marketing-operations.md" },
    { stage: "Draft", label: "Social-media manager + content strategist", roleFile: "social-media-manager.md" },
    { stage: "Gate", label: "CMO review", roleFile: "cmo.md" },
  ],
  "CHANNEL_PLAN.md": [
    { stage: "Frame", label: "CMO", roleFile: "cmo.md" },
    { stage: "Decompose", label: "Director of Marketing Operations", roleFile: "director-of-marketing-operations.md" },
    { stage: "Draft", label: "Traffic manager — paid/owned/earned", roleFile: "traffic-manager.md" },
    { stage: "Gate", label: "CMO review", roleFile: "cmo.md" },
  ],
  "AUTOMATION_RUNBOOK.md": [
    { stage: "Frame", label: "COO", roleFile: "coo.md" },
    { stage: "Decompose", label: "Director of Operations", roleFile: "director-of-operations.md" },
    { stage: "Draft", label: "Marketing-automation specialist", roleFile: "marketing-automation-specialist.md" },
    { stage: "Gate", label: "COO review", roleFile: "coo.md" },
  ],
  "RESPONSIBILITY_MATRIX.md": [
    { stage: "Frame", label: "COO", roleFile: "coo.md" },
    { stage: "Decompose", label: "Director of Operations", roleFile: "director-of-operations.md" },
    { stage: "Draft", label: "Operations", roleFile: "operations-manager.md" },
    { stage: "Gate", label: "COO review", roleFile: "coo.md" },
  ],
  "MEASUREMENT_FRAMEWORK.md": [
    { stage: "Frame", label: "CMO", roleFile: "cmo.md" },
    { stage: "Decompose", label: "Director of Marketing Operations", roleFile: "director-of-marketing-operations.md" },
    { stage: "Draft", label: "Analytics-attribution specialist", roleFile: "analytics-attribution-specialist.md" },
    { stage: "Gate", label: "CMO review", roleFile: "cmo.md" },
  ],
  "EXECUTION_STATE.md": [
    { stage: "Frame", label: "CEO / COO", roleFile: "ceo.md" },
    { stage: "Draft", label: "Review cadence (catchball) -> Chairman", roleFile: "chairman.md" },
    { stage: "Gate", label: "Chairman gate", roleFile: "chairman.md" },
  ],
};

export function resolveRoleFile(roleFile) {
  if (!roleFile) return null;
  const candidates = [
    path.join(PLUGIN_ROOT, "org", "agents", roleFile),
    path.join(PACKAGE_ROOT, "plugins", "drax", "org", "agents", roleFile),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

export function renderBuildPlan(readiness) {
  const lines = [
    "DRAX build plan — role-routed artifact generation",
    "Computed by the runtime in canonical org order. Trust it as authoritative: each artifact is produced by its accountable role, not improvised by the Chairman.",
  ];

  if (readiness.complete) {
    lines.push("", `Baseline complete — all ${readiness.total} artifacts ready. No role work pending.`);
    return lines.join("\n");
  }

  lines.push("", `Next gap: ${readiness.nextGap}`, "");
  let index = 1;
  for (const artifact of readiness.artifacts) {
    if (artifact.status === "ready") continue;
    lines.push(`[${index}] ${artifact.name} (${artifact.status})`);
    for (const stage of ARTIFACT_OWNERS[artifact.name] || []) {
      if (stage.roleFile) {
        const mark = resolveRoleFile(stage.roleFile) ? "found" : "MISSING";
        lines.push(`    ${stage.stage}: ${stage.label} (${stage.roleFile}: ${mark})`);
      } else {
        lines.push(`    ${stage.stage}: ${stage.label}`);
      }
    }
    index += 1;
  }

  return lines.join("\n");
}
