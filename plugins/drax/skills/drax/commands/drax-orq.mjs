#!/usr/bin/env node
// Deterministic command. Introspects the real Drax cycle pipeline and current workspace state.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const commandFile = fileURLToPath(import.meta.url);
const commandDir = path.dirname(commandFile);
const pluginRoot = path.resolve(commandDir, "../../..");
const packageRoot = path.resolve(pluginRoot, "../..");
const FALLBACK_VERSION = "1.1.32";
const PAGE_LINES = 46;
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

const PIPELINE = [
  {
    evidenceStage: "content-strategist",
    envStage: "content-strategist",
    role: "content-strategist",
    roleFile: "content-strategist.md",
    reads: "founder-artifacts",
    creates: ["sector/01-content-brief.md"],
    gate: "artifact-exists (non-empty, else run aborts)",
  },
  {
    evidenceStage: "seo-manager",
    envStage: "seo-manager",
    role: "seo-manager",
    roleFile: "seo-manager.md",
    reads: "founder artifacts + sector/01-content-brief.md",
    creates: ["sector/02-seo-brief.md"],
    gate: "artifact-exists (non-empty, else run aborts)",
  },
  {
    evidenceStage: "copywriter-performance",
    envStage: "copywriter",
    role: "copywriter-performance",
    roleFile: "copywriter-performance.md",
    reads: "sector/01-content-brief.md + sector/02-seo-brief.md",
    creates: ["article.md", "content-package.json"],
    gate: "article + content-package non-empty",
  },
  {
    evidenceStage: "claims/quality-review",
    envStage: "review",
    role: "claims/quality-review",
    roleFile: "claims-quality-reviewer.md",
    reads: "article.md + sector/01-content-brief.md + sector/02-seo-brief.md",
    creates: ["sector/04-review.md"],
    gate: "VERDICT: PASS regex (else run aborts)",
  },
];

function parseArgs(args) {
  let workspace = null;
  let page = 1;
  for (const arg of args) {
    if (arg.startsWith("--")) continue;
    if (/^[0-9]+$/.test(arg)) {
      page = Number(arg);
      continue;
    }
    if (!workspace) workspace = arg;
  }
  return { workspace: resolveWorkspace(path.resolve(workspace || process.cwd())), page };
}

function readVersion() {
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(pluginRoot, ".codex-plugin", "plugin.json"), "utf8"));
    return manifest.version || FALLBACK_VERSION;
  } catch {
    return FALLBACK_VERSION;
  }
}

function firstExistingDirectory(candidates) {
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) || null;
}

function firstExistingFile(candidates) {
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || null;
}

function resolveWorkspacePath(workspace, value) {
  return path.isAbsolute(value) ? path.resolve(value) : path.resolve(workspace, value);
}

function roots(workspace) {
  return [...new Set([packageRoot, pluginRoot, workspace, process.cwd()])];
}

function locateTemplates(workspace) {
  return firstExistingDirectory(
    roots(workspace).flatMap((root) => [path.join(root, "templates"), path.join(root, "plugins/drax/templates")]),
  );
}

function resolveRoleFile(workspace, roleFile) {
  const candidates = [
    path.join(pluginRoot, "org", "agents", roleFile),
    ...roots(workspace).flatMap((root) => [
      path.join(root, "org", "agents", roleFile),
      path.join(root, "plugins/drax/org/agents", roleFile),
    ]),
  ];
  const templatesRoot = locateTemplates(workspace);
  if (templatesRoot) candidates.push(path.join(templatesRoot, "workers", roleFile));
  return firstExistingFile(candidates);
}

function roleFileStatus(workspace, roleFile) {
  return resolveRoleFile(workspace, roleFile) ? "found" : "MISSING";
}

function isWorkspace(workspace) {
  if (fs.existsSync(path.join(workspace, ".drax"))) return true;
  if (fs.existsSync(path.join(workspace, "EXECUTION_STATE.json"))) return true;
  return BASELINE_ARTIFACTS.some((file) => fs.existsSync(path.join(workspace, file)));
}

function resolveWorkspace(base) {
  if (isWorkspace(base)) return base;
  for (const child of ["drax-workspace", "workspace"]) {
    const candidate = path.join(base, child);
    if (isWorkspace(candidate)) return candidate;
  }
  return base;
}

function readJson(file) {
  try {
    return { ok: true, value: JSON.parse(fs.readFileSync(file, "utf8")) };
  } catch {
    return { ok: false, value: null };
  }
}

function arrayCount(value) {
  return Array.isArray(value) ? value.length : 0;
}

function valueOrNeedsDecision(value) {
  return typeof value === "string" && value.trim() ? value : "NEEDS_DECISION";
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
  if (!latest) return { status: "none", manifest: null };

  const parsed = readJson(latest.path);
  if (!parsed.ok || !parsed.value || typeof parsed.value !== "object") return { status: "unreadable", manifest: null };
  return { status: "ok", manifest: parsed.value };
}

function latestEvidenceStages(latest) {
  const sector = latest?.manifest && Array.isArray(latest.manifest.sector) ? latest.manifest.sector : [];
  return new Set(
    sector
      .filter((entry) => entry && typeof entry === "object" && typeof entry.stage === "string" && typeof entry.sha256 === "string")
      .map((entry) => entry.stage),
  );
}

function renderHeader(lines, version) {
  lines.push(`DRAX v${version} — orchestration introspection ($drax-orq)`);
  lines.push("Read from the real cycle engine and this workspace's live state.");
  lines.push("Generated by code; no aspirational orchestration is narrated here.");
  lines.push("");
}

function renderPipeline(lines, workspace, latest) {
  const evidenceStages = latestEvidenceStages(latest);

  lines.push("== PIPELINE (what actually runs) ==");
  lines.push("Founder Official Run · sector: organic-content");
  lines.push("Each stage is one codex exec subprocess with the role .md pasted into the prompt.");
  lines.push("Real code gates run between stages.");
  for (const [index, stage] of PIPELINE.entries()) {
    const connector = index === PIPELINE.length - 1 ? "└─ " : "├─ ";
    const prefix = index === PIPELINE.length - 1 ? "   " : "│  ";
    const reads = stage.reads === "founder-artifacts" ? `${BASELINE_ARTIFACTS.length} founder artifacts` : stage.reads;
    const live = evidenceStages.has(stage.evidenceStage) ? "DONE (sha256 recorded)" : "—";
    lines.push(`${connector}[${index + 1}] ${stage.evidenceStage}`);
    lines.push(`${prefix}owner: ${stage.roleFile} (role file: ${roleFileStatus(workspace, stage.roleFile)})`);
    lines.push(`${prefix}reads: ${reads}`);
    lines.push(`${prefix}creates: ${stage.creates.join(" + ")}`);
    lines.push(`${prefix}gate: ${stage.gate}`);
    lines.push(`${prefix}live: ${live}`);
  }
  lines.push("After the sector, a SHA-256 evidence chain is written into content-package.json.");
  lines.push("A run manifest is recorded, then publish runs (gated, dry-run by default).");
  lines.push("");
}

function renderLiveState(lines, workspace, detected, state, latest) {
  lines.push("== LIVE STATE (this workspace) ==");
  if (!detected) {
    lines.push(`workspace: ${workspace} (not a Drax workspace — no live run to introspect)`);
    lines.push("");
    return;
  }

  lines.push(`workspace: ${workspace} (Drax workspace)`);
  if (state.status === "ok") {
    const value = state.value ?? {};
    lines.push("EXECUTION_STATE.json: readable");
    lines.push(`current phase: ${valueOrNeedsDecision(value.currentPhase)}`);
    lines.push(`publishing mode: ${valueOrNeedsDecision(value.publishingMode)}`);
    lines.push(`video engine: ${valueOrNeedsDecision(value.videoEngine)}`);
    lines.push(`active version: ${valueOrNeedsDecision(value.activeVersion)}`);
    lines.push(`next post index: ${Number.isInteger(value.nextPostIndex) ? value.nextPostIndex : "NEEDS_DECISION"}`);
    lines.push(`last run id: ${value.lastRunId || "none"}`);
    lines.push(`last published at: ${value.lastPublishedAt || "none"}`);
    lines.push(`next gate: ${valueOrNeedsDecision(value.nextGate)}`);
    lines.push(`completed: ${arrayCount(value.completed)}`);
    lines.push(`in progress: ${arrayCount(value.inProgress)}`);
    lines.push(`blocked: ${arrayCount(value.blocked) || "none"}`);
  } else if (state.status === "unreadable") {
    lines.push("EXECUTION_STATE.json: present but unreadable");
    lines.push("current phase: NEEDS_DECISION");
    lines.push("publishing mode: NEEDS_DECISION");
    lines.push("video engine: NEEDS_DECISION");
    lines.push("active version: NEEDS_DECISION");
    lines.push("next post index: NEEDS_DECISION");
    lines.push("last run id: NEEDS_DECISION");
    lines.push("last published at: NEEDS_DECISION");
    lines.push("next gate: NEEDS_DECISION");
    lines.push("completed: 0");
    lines.push("in progress: 0");
    lines.push("blocked: none");
  } else {
    if (state.mdPresent) {
      lines.push("EXECUTION_STATE.json: absent — EXECUTION_STATE.md present (markdown-only); run a cycle to emit machine-readable state");
    } else {
      lines.push("EXECUTION_STATE.json: absent — no execution state yet; run a cycle to emit it");
    }
  }

  if (latest.status === "ok") {
    const sector = Array.isArray(latest.manifest.sector) ? latest.manifest.sector : [];
    const runId = valueOrNeedsDecision(latest.manifest.runId);
    const status = valueOrNeedsDecision(latest.manifest.status);
    lines.push(`latest run: ${runId} · status ${status} · ${sector.length}/4 stages with sha256 evidence`);
    const authority = latest.manifest.authority;
    if (authority && typeof authority === "object" && Array.isArray(authority.decisions)) {
      lines.push(
        `latest run authority: contained=${Boolean(authority.contained)} · decisions=${authority.decisions.length} · halts=${authority.decisions.filter((d) => d && d.verdict === "halt").length}`,
      );
    }
  } else if (latest.status === "unreadable") {
    lines.push("latest run: present but unreadable");
  } else {
    lines.push("latest run: none recorded");
  }
  lines.push("");
}

function renderAuthority(lines) {
  lines.push("== AUTHORITY MODEL (honest) ==");
  lines.push("ENFORCED IN CODE (fail-closed):");
  lines.push("- single concurrent cycle (flock OS lock)");
  lines.push("- artifact-exists gate");
  lines.push("- VERDICT: PASS gate");
  lines.push("- SHA-256 evidence chain");
  lines.push("- Ed25519 access-token gate (runtime refuses without a valid token)");
  lines.push("- per-stage wall-clock timeout (a stalled stage is killed, SIGKILL)");
  lines.push("- per-stage token budget (DRAX_STAGE_TOKEN_BUDGET)");
  lines.push("- per-run token budget (DRAX_RUN_TOKEN_BUDGET)");
  lines.push("- C-level run supervisor: every sector stage passes an authorize/ratify checkpoint that records an");
  lines.push("  ALLOW / CONTAIN / HALT decision into an authority ledger (run manifest + <runId>.authority.json)");
  lines.push("- run wall-clock mandate (DRAX_RUN_TIME_BUDGET_MS): halts a run that overruns as a whole");
  lines.push("- contain / redirect (DRAX_RUN_TOKEN_SOFT): a soft token overrun revokes live-distribution authority");
  lines.push("  (forces queue-only) instead of killing the run");
  lines.push("");
  lines.push("NOT ENFORCED IN CODE (today):");
  lines.push("- dynamic org routing (the 4 stages are hardcoded, not chosen at runtime)");
  lines.push("");
  lines.push("Budgets and thresholds are opt-in: with the *_BUDGET / *_SOFT vars unset, the supervisor records an");
  lines.push("ALLOW decision for every stage and throttles nothing — but each stage is still a governed object with");
  lines.push("an audited authority decision.");
}

function paginate(lines, page) {
  const total = Math.max(1, Math.ceil(lines.length / PAGE_LINES));
  const selected = Math.min(Math.max(1, Number.isInteger(page) && page > 0 ? page : 1), total);
  const start = (selected - 1) * PAGE_LINES;
  const pageLines = [`página ${selected}/${total}`, ...lines.slice(start, start + PAGE_LINES)];
  if (selected < total) pageLines.push(`-- continuar: rode  $drax-orq ${selected + 1}  --`);
  return pageLines.join("\n").trimEnd();
}

function main() {
  const { workspace, page } = parseArgs(process.argv.slice(2));
  const version = readVersion();
  const detected = isWorkspace(workspace);
  const jsonPath = path.join(workspace, "EXECUTION_STATE.json");
  const mdPath = path.join(workspace, "EXECUTION_STATE.md");
  let state;
  if (detected && fs.existsSync(jsonPath)) {
    const parsed = readJson(jsonPath);
    state = parsed.ok
      ? { status: "ok", ok: true, value: parsed.value, mdPresent: fs.existsSync(mdPath) }
      : { status: "unreadable", ok: false, value: null, mdPresent: fs.existsSync(mdPath) };
  } else {
    state = { status: "absent", ok: false, value: null, mdPresent: detected && fs.existsSync(mdPath) };
  }
  const latest = detected ? latestRunManifest(workspace, state) : { status: "none", manifest: null };
  const lines = [];

  renderHeader(lines, version);
  renderPipeline(lines, workspace, latest);
  renderLiveState(lines, workspace, detected, state, latest);
  renderAuthority(lines);

  const report = paginate(lines, page);
  process.stdout.write(`\`\`\`\n${report}\n\`\`\`\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === commandFile) main();
