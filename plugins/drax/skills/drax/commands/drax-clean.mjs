#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runIntegrityGate, renderSecurityReport } from "../../../hooks/integrity.mjs";

const commandFile = fileURLToPath(import.meta.url);

const BASELINE_ARTIFACTS = [
  "FOUNDER_BRAND_BRIEF.md", "BOARD_MANDATE.md", "VISION_AND_STRATEGY.md", "POSITIONING_STATEMENT.md",
  "MARKET_LOCALIZATION_STRATEGY.md", "TECH_DECISION_RECORD.md", "GTM_STRATEGY.md", "CONTENT_STRATEGY.md",
  "EDITORIAL_CALENDAR.md", "CHANNEL_PLAN.md", "AUTOMATION_RUNBOOK.md", "RESPONSIBILITY_MATRIX.md",
  "MEASUREMENT_FRAMEWORK.md", "EXECUTION_STATE.md",
];

function isWorkspace(dir) {
  if (fs.existsSync(path.join(dir, ".drax"))) return true;
  if (fs.existsSync(path.join(dir, "EXECUTION_STATE.json"))) return true;
  return BASELINE_ARTIFACTS.some((f) => fs.existsSync(path.join(dir, f)));
}

function resolveWorkspace(base) {
  if (isWorkspace(base)) return base;
  for (const child of ["drax-workspace", "workspace"]) {
    const candidate = path.join(base, child);
    if (isWorkspace(candidate)) return candidate;
  }
  return base;
}

function listQuarantine(workspace) {
  const root = path.join(workspace, ".drax", "quarantine");
  const out = [];
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(target);
      else if (entry.isFile() && entry.name !== "audit.log") out.push(path.relative(root, target));
    }
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  const confirm = args.includes("--confirm");
  const positional = args.filter((a) => !a.startsWith("--"));
  const workspace = resolveWorkspace(path.resolve(positional[0] || process.cwd()));
  const lines = [];
  lines.push("DRAX workspace integrity — $drax clean");
  lines.push(`workspace: ${workspace}`);
  lines.push("");

  if (confirm) {
    const quarantineRoot = path.join(workspace, ".drax", "quarantine");
    let purged = 0;
    try {
      purged = listQuarantine(workspace).length;
      fs.rmSync(quarantineRoot, { recursive: true, force: true });
    } catch {
      // best effort
    }
    lines.push(`PURGED quarantine: permanently deleted ${purged} quarantined file(s) and the quarantine directory.`);
    process.stdout.write("```\n" + lines.join("\n").trimEnd() + "\n```\n");
    return;
  }

  const report = runIntegrityGate(workspace, { enforce: false });
  const rendered = renderSecurityReport(report);
  lines.push(rendered || "No integrity issues detected (no foreign files, secrets, or injected artifacts).");
  lines.push("");
  const existing = listQuarantine(workspace);
  if (existing.length) {
    lines.push(`Currently quarantined (${existing.length}) under .drax/quarantine/ — purge with $drax clean --confirm:`);
    for (const q of existing.slice(0, 50)) lines.push(`  - ${q}`);
  } else {
    lines.push("Quarantine is empty.");
  }
  process.stdout.write("```\n" + lines.join("\n").trimEnd() + "\n```\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === commandFile) main();
