#!/usr/bin/env node
// Deterministic command. Prints the founder-to-published journey with live workspace markers.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const commandFile = fileURLToPath(import.meta.url);
const commandDir = path.dirname(commandFile);
const pluginRoot = path.resolve(commandDir, "../../..");
const FALLBACK_VERSION = "1.1.23";
const DEFAULT_RUN_DIRECTORY = ".drax/runs";

const BASELINE_ARTIFACTS = [
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

function parseArgs(args) {
  const workspace = args.find((arg) => !arg.startsWith("--")) || process.cwd();
  return { workspace: path.resolve(workspace) };
}

function readVersion() {
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(pluginRoot, ".codex-plugin", "plugin.json"), "utf8"));
    return manifest.version || FALLBACK_VERSION;
  } catch {
    return FALLBACK_VERSION;
  }
}

function isWorkspace(workspace) {
  if (fs.existsSync(path.join(workspace, ".drax"))) return true;
  if (fs.existsSync(path.join(workspace, "EXECUTION_STATE.json"))) return true;
  return BASELINE_ARTIFACTS.some((file) => fs.existsSync(path.join(workspace, file)));
}

function readJson(file) {
  try {
    return { ok: true, value: JSON.parse(fs.readFileSync(file, "utf8")) };
  } catch {
    return { ok: false, value: null };
  }
}

function resolveWorkspacePath(workspace, value) {
  return path.isAbsolute(value) ? path.resolve(value) : path.resolve(workspace, value);
}

function collectJsonFiles(directory) {
  const files = [];
  function visit(current) {
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) visit(target);
      if (entry.isFile() && entry.name.endsWith(".json")) {
        try {
          files.push({ path: target, mtimeMs: fs.statSync(target).mtimeMs });
        } catch {
          // Ignore files that disappear during inspection.
        }
      }
    }
  }
  visit(directory);
  return files.sort((left, right) => right.mtimeMs - left.mtimeMs || right.path.localeCompare(left.path));
}

function latestRunManifest(workspace, state) {
  const runDirectory =
    state?.ok && state.value?.config && typeof state.value.config.runDirectory === "string"
      ? state.value.config.runDirectory
      : DEFAULT_RUN_DIRECTORY;
  const runRoot = resolveWorkspacePath(workspace, runDirectory);
  const [latest] = collectJsonFiles(runRoot);
  if (!latest) return null;

  const parsed = readJson(latest.path);
  return parsed.ok && parsed.value && typeof parsed.value === "object" ? parsed.value : null;
}

function statusOf(workspace, file) {
  const target = path.join(workspace, file);
  if (!fs.existsSync(target)) return "missing";
  try {
    const match = fs.readFileSync(target, "utf8").match(/^[-*\s]*status:\s*([a-z]+)/im);
    return match ? match[1].toLowerCase() : "present";
  } catch {
    return "present";
  }
}

function valueOrNeedsDecision(value) {
  return typeof value === "string" && value.trim() ? value : "NEEDS_DECISION";
}

function qualityStatus(manifest) {
  const sector = Array.isArray(manifest?.sector) ? manifest.sector : [];
  const hasReview = sector.some(
    (entry) => entry && entry.stage === "claims/quality-review" && typeof entry.sha256 === "string" && entry.sha256.length > 0,
  );
  const hasEvidenceChain =
    sector.length === 4 && sector.every((entry) => entry && typeof entry.stage === "string" && typeof entry.sha256 === "string");
  return hasReview && hasEvidenceChain ? "passed this run" : "pending";
}

function main() {
  const { workspace } = parseArgs(process.argv.slice(2));
  const version = readVersion();
  const detected = isWorkspace(workspace);
  const state = detected && fs.existsSync(path.join(workspace, "EXECUTION_STATE.json"))
    ? readJson(path.join(workspace, "EXECUTION_STATE.json"))
    : { ok: false, value: null };
  const latest = detected ? latestRunManifest(workspace, state) : null;
  const artifactCount = BASELINE_ARTIFACTS.filter((file) => fs.existsSync(path.join(workspace, file))).length;
  const founderReady = statusOf(workspace, "FOUNDER_BRAND_BRIEF.md") === "ready";
  const contentReady = statusOf(workspace, "CONTENT_STRATEGY.md") === "ready";
  const readiness = founderReady && contentReady ? "CLEARED" : "NOT CLEARED";
  const stateValue = state.ok ? state.value ?? {} : {};
  const lines = [
    `DRAX v${version} — journey overview ($drax-orq-overview)`,
    "the complete path from founder to published content, no agent-level detail",
    `workspace: ${workspace} (${detected ? "Drax workspace" : "not a Drax workspace — no live run to introspect"})`,
    "",
    `1. Interview — Chairman interview -> 14 baseline artifacts — status: ${artifactCount}/14 artifacts present`,
    `2. Readiness gate — FOUNDER_BRAND_BRIEF + CONTENT_STRATEGY = ready — ${readiness}`,
    `3. Daily cycle — 4-stage content sector produces 1 post — phase: ${valueOrNeedsDecision(stateValue.currentPhase)}`,
    `4. Quality gates — review PASS + SHA-256 evidence chain — ${qualityStatus(latest)}`,
    `5. Publish — dry-run / local-blog-deploy (approval-gated) — mode: ${valueOrNeedsDecision(stateValue.publishingMode)}`,
    `6. Measurement — capture results -> continue/change/scale/stop — next gate: ${valueOrNeedsDecision(stateValue.nextGate)}`,
    "",
    "For stage-level detail and the authority model, run $drax-orq.",
  ];

  process.stdout.write(`\`\`\`\n${lines.join("\n")}\n\`\`\`\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === commandFile) main();
