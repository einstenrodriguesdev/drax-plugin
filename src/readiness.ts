import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const ARTIFACT_SEQUENCE = [
  "FOUNDER_BRAND_BRIEF.md",
  "BOARD_MANDATE.md",
  "VISION_AND_STRATEGY.md",
  "POSITIONING_STATEMENT.md",
  "MARKET_LOCALIZATION_STRATEGY.md",
  "TECH_DECISION_RECORD.md",
  "GTM_STRATEGY.md",
  "CONTENT_STRATEGY.md",
  "EDITORIAL_CALENDAR.md",
  "CHANNEL_PLAN.md",
  "AUTOMATION_RUNBOOK.md",
  "RESPONSIBILITY_MATRIX.md",
  "MEASUREMENT_FRAMEWORK.md",
  "EXECUTION_STATE.md",
] as const;

export type ArtifactStatus = "missing" | "stub" | "incomplete" | "ready";

export type ArtifactReadiness = {
  artifacts: Array<{ name: string; status: ArtifactStatus; needsDecisionCount: number }>;
  missing: string[];
  stub: string[];
  incomplete: string[];
  ready: string[];
  nextGap: string | null;
  outOfOrder: string[];
  total: number;
  readyCount: number;
  complete: boolean;
  executionStateJsonPresent: boolean;
};

export function isDraxWorkspaceDir(dir: string): boolean {
  if (existsSync(path.join(dir, ".drax"))) return true;
  if (existsSync(path.join(dir, "EXECUTION_STATE.json"))) return true;
  return ARTIFACT_SEQUENCE.some((artifact) => existsSync(path.join(dir, artifact)));
}

export function resolveWorkspace(cwd: string): string {
  if (isDraxWorkspaceDir(cwd)) return cwd;
  for (const child of ["drax-workspace", "workspace"]) {
    const candidate = path.join(cwd, child);
    if (isDraxWorkspaceDir(candidate)) return candidate;
  }
  return cwd;
}

function templateMatchesArtifact(artifactPath: string, templatePath: string): boolean {
  if (!existsSync(templatePath)) return false;
  try {
    return readFileSync(artifactPath).equals(readFileSync(templatePath));
  } catch {
    return false;
  }
}

function needsDecisionCount(content: string): number {
  return content.match(/NEEDS_DECISION/g)?.length ?? 0;
}

export function auditArtifacts(workspaceDir: string, templatesDir: string): ArtifactReadiness {
  const artifacts: ArtifactReadiness["artifacts"] = ARTIFACT_SEQUENCE.map((name) => {
    const artifactPath = path.join(workspaceDir, name);
    if (!existsSync(artifactPath)) {
      return { name, status: "missing", needsDecisionCount: 0 };
    }

    const content = readFileSync(artifactPath, "utf8");
    const count = needsDecisionCount(content);
    if (templateMatchesArtifact(artifactPath, path.join(templatesDir, name))) {
      return { name, status: "stub", needsDecisionCount: count };
    }
    if (count > 0) {
      return { name, status: "incomplete", needsDecisionCount: count };
    }
    return { name, status: "ready", needsDecisionCount: count };
  });

  const missing = artifacts.filter((artifact) => artifact.status === "missing").map((artifact) => artifact.name);
  const stub = artifacts.filter((artifact) => artifact.status === "stub").map((artifact) => artifact.name);
  const incomplete = artifacts.filter((artifact) => artifact.status === "incomplete").map((artifact) => artifact.name);
  const ready = artifacts.filter((artifact) => artifact.status === "ready").map((artifact) => artifact.name);
  const outOfOrder = artifacts
    .filter((artifact, index) => {
      const previous = index > 0 ? artifacts[index - 1] : null;
      return (
        Boolean(previous) &&
        (artifact.status === "ready" || artifact.status === "incomplete") &&
        (previous?.status === "missing" || previous?.status === "stub")
      );
    })
    .map((artifact) => artifact.name);

  return {
    artifacts,
    missing,
    stub,
    incomplete,
    ready,
    nextGap: artifacts.find((artifact) => artifact.status !== "ready")?.name ?? null,
    outOfOrder,
    total: artifacts.length,
    readyCount: ready.length,
    complete: ready.length === artifacts.length,
    executionStateJsonPresent: existsSync(path.join(workspaceDir, "EXECUTION_STATE.json")),
  };
}

function artifactByName(readiness: ArtifactReadiness, name: string): ArtifactReadiness["artifacts"][number] | undefined {
  return readiness.artifacts.find((artifact) => artifact.name === name);
}

function prerequisiteFor(readiness: ArtifactReadiness, name: string): string {
  const index = readiness.artifacts.findIndex((artifact) => artifact.name === name);
  return index > 0 ? readiness.artifacts[index - 1]?.name ?? "unknown" : "unknown";
}

export function renderReadinessReport(readiness: ArtifactReadiness): string {
  const lines = [`OK Artifact readiness: ${readiness.readyCount}/${readiness.total} ready`];

  for (const artifact of readiness.artifacts) {
    if (artifact.status === "ready") continue;
    if (artifact.status === "missing") {
      lines.push(`MISSING ${artifact.name} (missing)`);
    } else if (artifact.status === "stub") {
      lines.push(`WARN ${artifact.name} (untouched stub)`);
    } else {
      lines.push(`WARN ${artifact.name} (incomplete, NEEDS_DECISION: ${artifact.needsDecisionCount})`);
    }
  }

  lines.push(readiness.nextGap ? `WARN Next gap: ${readiness.nextGap}` : "OK Next gap: none — baseline complete");

  for (const name of readiness.outOfOrder) {
    lines.push(`WARN Out-of-order artifact: ${name} is ahead of prerequisite ${prerequisiteFor(readiness, name)}`);
  }

  lines.push(
    readiness.executionStateJsonPresent ? "OK EXECUTION_STATE.json present" : "WARN EXECUTION_STATE.json absent",
  );

  return lines.join("\n");
}

export function renderReadinessForPrompt(readiness: ArtifactReadiness): string {
  const lines = [
    "Deterministic Drax artifact readiness: this block was computed by the runtime; trust it as authoritative and do not re-derive readiness from prose.",
    `Ready artifacts: ${readiness.readyCount}/${readiness.total}`,
  ];

  if (readiness.complete) {
    lines.push("Baseline status: complete; no gaps remain.");
  } else {
    lines.push("Not-ready artifacts in canonical order:");
    for (const artifact of readiness.artifacts) {
      if (artifact.status === "ready") continue;
      const count = artifact.status === "incomplete" ? ` (NEEDS_DECISION: ${artifact.needsDecisionCount})` : "";
      lines.push(`- ${artifact.name}: ${artifact.status}${count}`);
    }
    lines.push(`Next gap: ${readiness.nextGap ?? "none"}`);
  }

  if (readiness.outOfOrder.length) {
    lines.push(
      `Out-of-order artifacts: ${readiness.outOfOrder
        .map((name) => `${name} before ${prerequisiteFor(readiness, name)}`)
        .join(", ")}`,
    );
  } else {
    lines.push("Out-of-order artifacts: none");
  }

  lines.push(`EXECUTION_STATE.json: ${readiness.executionStateJsonPresent ? "present" : "absent"}`);

  return lines.join("\n");
}
