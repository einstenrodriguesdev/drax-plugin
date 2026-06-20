#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { runIntegrityGate, renderSecurityReport } from "./integrity.mjs";
import {
  ARTIFACT_SEQUENCE,
  auditArtifacts,
  isDraxWorkspaceDir,
  renderReadinessForPrompt,
  resolveWorkspace,
} from "./readiness.mjs";

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

function main() {
  const raw = fs.readFileSync(0, "utf8").trim();
  const event = raw ? JSON.parse(raw) : {};
  const cwd = path.resolve(event.cwd || process.cwd());
  const workspace = resolveWorkspace(cwd);

  // Scoped activation: outside a real Drax workspace the hook is a no-op, so
  // unrelated Codex sessions are never injected with Drax context.
  if (!isDraxWorkspaceDir(workspace)) {
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
  let readiness = null;
  try {
    readiness = auditArtifacts(workspace);
  } catch {
    readiness = null;
  }
  const securityReport = security ? renderSecurityReport(security) : "";
  const readinessContext = readiness ? renderReadinessForPrompt(readiness) : "";
  const prefixParts = [securityReport, readinessContext].filter(Boolean);
  const assembleFinalContext = (body) => [...prefixParts, body].join("\n\n");

  const artifacts = ARTIFACT_SEQUENCE.flatMap((name) => {
    if (tainted.has(name)) return [];
    const content = safeRead(workspace, name);
    return content ? [{ name, content }] : [];
  });
  const staticContextLines = [
    "Drax v1.1.32 organic automation runtime is active.",
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
    const remainingBudget = TOTAL_BUDGET - assembleFinalContext(staticContext).length;
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
    while (assembleFinalContext(context).length > TOTAL_BUDGET && included.length) {
      omitted.push(included.pop().name);
      context = assembleContext();
    }
  }

  const finalContext = assembleFinalContext(context);

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: finalContext },
  }));
}

try {
  main();
} catch (error) {
  process.stdout.write(JSON.stringify({ systemMessage: `Drax context skipped: ${error.message}` }));
}
