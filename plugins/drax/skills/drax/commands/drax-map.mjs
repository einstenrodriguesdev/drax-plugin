#!/usr/bin/env node
// Deterministic command. Prints the Drax system map for the current workspace.
// Invoked by the `drax` skill when the user runs `$drax map`. No external deps.

import fs from "node:fs";
import path from "node:path";

const VERSION = "1.0.0";

const ARTIFACTS = [
  "FOUNDER_PROFILE.md",
  "PRODUCT_CONTEXT.md",
  "LANGUAGE_STRATEGY.md",
  "STACK_DECISION.md",
  "ORGANIC_GROWTH_STRATEGY.md",
  "NINETY_POST_PLAN.md",
  "EDITORIAL_CALENDAR.md",
  "DISTRIBUTION_PLAN.md",
  "TRIGGER_PLAN.md",
  "WORKER_ROUTING.md",
  "MEASUREMENT_PLAN.md",
  "EXECUTION_STATE.md",
];

const SECTORS = [
  ["Intake", "Understand founder, product, buyer, proof, voice, constraints, cadence."],
  ["Language", "Select primary and secondary language markets before planning."],
  ["Stack", "Decide isolated environment, hosting, state, logging, security controls."],
  ["Strategy", "Content pillars, channel hypotheses, conversion paths, falsifiable targets."],
  ["Editorial", "90-post/class plan, source-backed briefs, and a calendar."],
  ["Production", "Article, SVG/carousel, video, audio, metadata, deliverable manifests."],
  ["Distribution", "Queue approved assets for the active version surface."],
  ["Triggering", "Daily clock trigger and a manual trigger, both idempotent."],
  ["Measurement", "Capture results; recommend continue, change, scale, or stop."],
];

const GATE_ARTIFACTS = ["FOUNDER_PROFILE.md", "NINETY_POST_PLAN.md"];

const cwd = path.resolve(process.argv[2] || process.cwd());

function statusOf(file) {
  const target = path.join(cwd, file);
  if (!fs.existsSync(target)) return "missing";
  try {
    const text = fs.readFileSync(target, "utf8");
    const m = text.match(/^[-*\s]*status:\s*([a-z]+)/im);
    return m ? m[1].toLowerCase() : "present";
  } catch {
    return "present";
  }
}

function isWorkspace() {
  if (fs.existsSync(path.join(cwd, ".drax"))) return true;
  if (fs.existsSync(path.join(cwd, "EXECUTION_STATE.json"))) return true;
  return ARTIFACTS.some((f) => fs.existsSync(path.join(cwd, f)));
}

function pad(s, n) {
  return s + " ".repeat(Math.max(0, n - s.length));
}

const detected = isWorkspace();
const statuses = ARTIFACTS.map((f) => [f, statusOf(f)]);
const gateBlocked = GATE_ARTIFACTS.filter((f) => statusOf(f) !== "ready");

const lines = [];
lines.push(`DRAX v${VERSION} - system map`);
lines.push(`workspace: ${cwd}  (${detected ? "DETECTED" : "not a Drax workspace"})`);
lines.push("");

lines.push("Pipeline sectors (capability loop):");
const sw = Math.max(...SECTORS.map(([n]) => n.length));
SECTORS.forEach(([n, d], i) => lines.push(`  ${i + 1}. ${pad(n, sw)}  ${d}`));
lines.push("");

lines.push("Baseline artifacts (status in this workspace):");
const aw = Math.max(...statuses.map(([f]) => f.length));
for (const [f, s] of statuses) lines.push(`  [${pad(s, 7)}] ${pad(f, aw)}`);
lines.push("");

lines.push("Release gates:");
lines.push("  - Artifact Readiness Gate: FOUNDER_PROFILE.md + NINETY_POST_PLAN.md must be `ready` before unattended posting.");
lines.push("  - Claims/quality review must pass before any publish.");
lines.push("  - Fail-closed: triggers refuse on manifest, asset-hash, or connection mismatch.");
lines.push("");

lines.push("Triggers: clock (scheduled daily) + manual (operator command).");
lines.push("Publishing modes: local-blog-deploy, official-api, playwright-experimental, export-manual (live requires approval).");
lines.push("");

if (!detected) {
  lines.push("Unattended daily posting: NOT CLEARED (this folder is not a Drax workspace yet - run `drax init` or `$drax`).");
} else if (gateBlocked.length) {
  lines.push(`Unattended daily posting: NOT CLEARED (gate artifacts not ready: ${gateBlocked.join(", ")}).`);
} else {
  lines.push("Unattended daily posting: CLEARED (gate artifacts ready).");
}

process.stdout.write(lines.join("\n") + "\n");
