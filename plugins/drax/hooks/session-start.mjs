#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { runIntegrityGate, renderSecurityReport } from "./integrity.mjs";

const ARTIFACTS = [
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
];

const TOTAL_BUDGET = 9000;
const PER_ARTIFACT_FLOOR = 500;
const PER_ARTIFACT_CAP = 1600;

function safeRead(cwd, name) {
  let fd;
  let content = null;
  try {
    const target = path.resolve(cwd, name);
    if (path.dirname(target) !== cwd) return null;
    const stat = fs.lstatSync(target);
    if (stat.isSymbolicLink() || !stat.isFile() || stat.size > 512_000) return null;
    fd = fs.openSync(target, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
    content = fs.readFileSync(fd, "utf8").slice(0, 1600).trim();
  } catch {
    return null;
  } finally {
    if (fd !== undefined) {
      try {
        fs.closeSync(fd);
      } catch {
        content = null;
      }
    }
  }
  return content;
}

function isDraxWorkspace(cwd) {
  try {
    if (fs.existsSync(path.join(cwd, ".drax"))) return true;
    if (fs.existsSync(path.join(cwd, "EXECUTION_STATE.json"))) return true;
    for (const name of ARTIFACTS) {
      if (fs.existsSync(path.join(cwd, name))) return true;
    }
  } catch {
    return false;
  }
  return false;
}

function resolveWorkspace(cwd) {
  if (isDraxWorkspace(cwd)) return cwd;
  for (const child of ["drax-workspace", "workspace"]) {
    const candidate = path.join(cwd, child);
    if (isDraxWorkspace(candidate)) return candidate;
  }
  return cwd;
}

function main() {
  const raw = fs.readFileSync(0, "utf8").trim();
  const event = raw ? JSON.parse(raw) : {};
  const cwd = path.resolve(event.cwd || process.cwd());
  const workspace = resolveWorkspace(cwd);

  // Scoped activation: outside a real Drax workspace the hook is a no-op, so
  // unrelated Codex sessions are never injected with Drax context.
  if (!isDraxWorkspace(workspace)) {
    process.stdout.write(JSON.stringify({}));
    return;
  }

  let security = null;
  try {
    security = runIntegrityGate(workspace, { enforce: true });
  } catch {
    security = null; // fail-closed: never let the gate crash the session
  }
  const tainted = security && security.taintedArtifacts instanceof Set ? security.taintedArtifacts : new Set();

  const artifacts = ARTIFACTS.flatMap((name) => {
    if (tainted.has(name)) return [];
    const content = safeRead(workspace, name);
    return content ? [{ name, content }] : [];
  });
  const staticContextLines = [
    "Drax v1.1.30 organic automation runtime is active.",
    "Target user: a founder with an existing product who wants a measured organic traffic system.",
    "Required baseline: founder brand brief, board mandate, vision/strategy governance docs, positioning statement, market localization strategy, tech decision record, GTM strategy, content strategy, editorial calendar, channel plan, automation runbook, responsibility matrix, measurement framework, and execution state.",
    "Publishing defaults to dry-run. Live posting, paid spend, and browser automation require explicit approval.",
  ];
  if (workspace !== cwd) {
    staticContextLines.push(
      `This run's Drax workspace is the subfolder ${path.basename(workspace)} (${workspace}). Treat it as the working directory: read and write every artifact there, never in ${cwd}.`,
    );
  }
  const staticContext = staticContextLines.join("\n\n");
  let context = [staticContext, "No Drax organic-growth artifacts were found in this workspace."].join("\n\n");

  if (artifacts.length) {
    const prioritized = [
      ...artifacts.filter(({ name }) => name === "EXECUTION_STATE.md"),
      ...artifacts.filter(({ name }) => name !== "EXECUTION_STATE.md"),
    ];
    const remainingBudget = TOTAL_BUDGET - staticContext.length;
    const perArtifactBudget = Math.min(
      PER_ARTIFACT_CAP,
      Math.max(PER_ARTIFACT_FLOOR, Math.floor(remainingBudget / prioritized.length)),
    );
    const included = prioritized.map(({ name, content }) => ({
      name,
      section: `--- ${name} ---\n${content.slice(0, perArtifactBudget).trim()}`,
    }));
    const omitted = [];

    const assembleContext = () => [
      staticContext,
      ...included.map(({ section }) => section),
      ...(omitted.length ? [`[Context truncated: omitted ${omitted.join(", ")}]`] : []),
    ].join("\n\n");

    context = assembleContext();
    while (context.length > TOTAL_BUDGET && included.length) {
      omitted.push(included.pop().name);
      context = assembleContext();
    }
  }

  const securityReport = security ? renderSecurityReport(security) : "";
  const finalContext = securityReport ? `${securityReport}\n\n${context}` : context;

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: finalContext },
  }));
}

try {
  main();
} catch (error) {
  process.stdout.write(JSON.stringify({ systemMessage: `Drax context skipped: ${error.message}` }));
}
