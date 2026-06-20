#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const MAX_FILES = 5000;
const MAX_CONTENT_BYTES = 512_000;
const BURST_WINDOW_MS = 60_000;
const BURST_THRESHOLD = 5;

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

// Directories we never descend into for quarantine decisions (their contents are
// either DRAX-owned, the resolved artifact workspace handled separately, dependency
// trees, or documented secret stores).
const ALLOWED_DIRS = new Set([
  ".drax", ".git", "node_modules", "sector", "scripts", "docs", ".agents",
  "workspace", "drax-workspace", "codex-cred", "media", "assets", "output", "dist", "build", "runs",
]);

// Files that are expected to live in the tree and must never be quarantined.
const ALLOWED_FILES = new Set([
  ...BASELINE_ARTIFACTS,
  "EXECUTION_STATE.json",
  "article.md",
  "content-package.json",
  "Dockerfile",
  "README.md",
  "readme.md",
  "requirements.txt",
  "run-oficial.sh",
  ".gitignore",
  ".draxignore",
  "package.json",
  "package-lock.json",
]);

// Inert content/data/media extensions — never quarantined.
const ALLOWED_EXT = new Set([
  ".md", ".json", ".txt", ".yml", ".yaml",
  ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg",
  ".mp4", ".webm", ".mov", ".mp3", ".wav",
]);

// Extensions that signal code / archives / binaries / build noise — quarantined
// unless allowlisted by exact name or living under an allowed directory.
const FOREIGN_EXT = new Set([
  ".sh", ".bash", ".zsh", ".py", ".js", ".mjs", ".cjs", ".ts", ".rb", ".pl", ".php", ".ps1",
  ".exe", ".bin", ".out", ".so", ".dylib", ".dll", ".jar", ".war",
  ".tgz", ".tar", ".gz", ".zip", ".7z", ".rar", ".bz2", ".xz", ".deb", ".rpm", ".dmg", ".iso",
  ".bak", ".log", ".tmp", ".swp",
]);

// Secret-shaped filename fragments — warned, NEVER quarantined.
const SECRET_PATTERNS = [
  /token/i, /secret/i, /\bcred(ential)?s?\b/i, /\.pem$/i, /\.key$/i, /\.p12$/i, /\.pfx$/i,
  /id_rsa/i, /\.env(\.|$)/i, /access-token/i, /privatekey/i, /\.crt$/i,
];

// Prompt-injection signatures scanned inside the baseline artifacts.
const INJECTION_PATTERNS = [
  /ignore (all |the )?(previous|above|prior|preceding) (instructions|prompts|messages)/i,
  /disregard (your|the|all|previous|above) (instructions|rules|prompt)/i,
  /forget (everything|all previous|your instructions)/i,
  /you are now (a|an|the)?/i,
  /new instructions:/i,
  /system prompt:/i,
  /<\/?system>/i,
  /\bdeveloper message\b/i,
  /override (your|the|all) (instructions|rules|safety)/i,
  /\bexfiltrat/i,
  /curl\s+https?:\/\//i,
  /send (the|all|your) (secrets|tokens|credentials|env)/i,
];

function isSecretName(name) {
  return SECRET_PATTERNS.some((re) => re.test(name));
}

function scopeRefusal(gateRoot) {
  if (!gateRoot) return "no scan root";
  if (gateRoot === path.parse(gateRoot).root) return "refusing to scan filesystem root";
  if (gateRoot === os.homedir()) return "refusing to scan home directory";
  const segments = gateRoot.split(path.sep).filter(Boolean);
  if (segments.length < 2) return "refusing to scan a shallow path";
  return null;
}

function isSafeParent(dir) {
  return !scopeRefusal(dir);
}

// gateRoot = the directory we recursively scan for foreign files. When the resolved
// artifact workspace is a recognized subfolder and its parent is safe, scan the parent
// too (parent + children); otherwise scan the workspace itself.
function resolveGateRoot(workspace) {
  const base = path.basename(workspace);
  if ((base === "workspace" || base === "drax-workspace")) {
    const parent = path.dirname(workspace);
    if (isSafeParent(parent)) return parent;
  }
  return workspace;
}

function readDraxignore(workspace) {
  try {
    const raw = fs.readFileSync(path.join(workspace, ".draxignore"), "utf8");
    return new Set(
      raw.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#")),
    );
  } catch {
    return new Set();
  }
}

function walk(gateRoot) {
  const found = [];
  const stack = [gateRoot];
  let visited = 0;
  while (stack.length) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (visited >= MAX_FILES) return found;
      visited += 1;
      const target = path.join(current, entry.name);
      if (entry.isSymbolicLink()) continue; // never follow or act on symlinks
      if (entry.isDirectory()) {
        if (ALLOWED_DIRS.has(entry.name)) continue;
        stack.push(target);
        continue;
      }
      if (entry.isFile()) found.push(target);
    }
  }
  return found;
}

function classify(name, draxignore) {
  if (draxignore.has(name)) return "allowed";
  if (isSecretName(name)) return "secret";
  if (ALLOWED_FILES.has(name)) return "allowed";
  const ext = path.extname(name).toLowerCase();
  if (FOREIGN_EXT.has(ext)) return "foreign";
  if (ALLOWED_EXT.has(ext)) return "allowed";
  if (ext === "") return "foreign"; // extensionless unknown payloads
  return "foreign"; // anything else unknown
}

function appendAudit(workspace, entries) {
  const auditPath = path.join(workspace, ".drax", "quarantine", "audit.log");
  const body = entries.map((e) => `${e.at}\t${e.from}\t${e.to}\t${e.reason}`).join("\n") + "\n";
  fs.appendFileSync(auditPath, body, "utf8");
}

function recentBurst(workspace, justAdded) {
  const auditPath = path.join(workspace, ".drax", "quarantine", "audit.log");
  let lines = [];
  try {
    lines = fs.readFileSync(auditPath, "utf8").split(/\r?\n/).filter(Boolean);
  } catch {
    lines = [];
  }
  const now = Date.now();
  const recent = lines.filter((line) => {
    const stamp = Date.parse(line.split("\t")[0] || "");
    return Number.isFinite(stamp) && now - stamp <= BURST_WINDOW_MS;
  });
  return recent.length >= BURST_THRESHOLD || justAdded >= BURST_THRESHOLD;
}

function quarantineFile(workspace, gateRoot, file, stampDir) {
  const destDir = path.join(workspace, ".drax", "quarantine", stampDir);
  fs.mkdirSync(destDir, { recursive: true });
  let dest = path.join(destDir, path.basename(file));
  let counter = 1;
  while (fs.existsSync(dest)) {
    const ext = path.extname(file);
    dest = path.join(destDir, `${path.basename(file, ext)}.${counter}${ext}`);
    counter += 1;
  }
  fs.renameSync(file, dest);
  return dest;
}

function scanInjections(workspace) {
  const tainted = new Set();
  const flags = [];
  for (const name of BASELINE_ARTIFACTS) {
    const target = path.join(workspace, name);
    let content;
    try {
      const stat = fs.lstatSync(target);
      if (stat.isSymbolicLink() || !stat.isFile() || stat.size > MAX_CONTENT_BYTES) continue;
      content = fs.readFileSync(target, "utf8");
    } catch {
      continue;
    }
    const hit = INJECTION_PATTERNS.find((re) => re.test(content));
    if (hit) {
      tainted.add(name);
      flags.push({ artifact: name, pattern: hit.source });
    }
  }
  return { tainted, flags };
}

export function runIntegrityGate(workspace, options = {}) {
  const enforce = options.enforce !== false; // default: enforce (auto-quarantine)
  const report = {
    workspace,
    gateRoot: null,
    scopeError: null,
    secrets: [],
    quarantined: [],
    wouldQuarantine: [],
    injections: [],
    taintedArtifacts: new Set(),
    burst: false,
  };

  // Injection scan always runs (read-only) so the hook can drop tainted artifacts.
  try {
    const { tainted, flags } = scanInjections(workspace);
    report.taintedArtifacts = tainted;
    report.injections = flags;
  } catch {
    // fail-closed per artifact: scanInjections already swallows per-file errors.
  }

  const gateRoot = resolveGateRoot(workspace);
  report.gateRoot = gateRoot;
  const refusal = scopeRefusal(gateRoot);
  if (refusal) {
    report.scopeError = refusal;
    return report;
  }

  const draxignore = readDraxignore(workspace);
  let files = [];
  try {
    files = walk(gateRoot);
  } catch {
    return report;
  }

  const stampDir = new Date().toISOString().replace(/[:.]/g, "-");
  const audited = [];
  for (const file of files) {
    const name = path.basename(file);
    const kind = classify(name, draxignore);
    if (kind === "secret") {
      report.secrets.push(path.relative(gateRoot, file));
      continue;
    }
    if (kind !== "foreign") continue;
    if (!enforce) {
      report.wouldQuarantine.push(path.relative(gateRoot, file));
      continue;
    }
    try {
      const dest = quarantineFile(workspace, gateRoot, file, stampDir);
      const at = new Date().toISOString();
      report.quarantined.push({ from: path.relative(gateRoot, file), to: dest });
      audited.push({ at, from: path.relative(gateRoot, file), to: dest, reason: `foreign:${path.extname(name) || "noext"}` });
    } catch {
      // fail-closed: a file we cannot move is left in place, never crashes the gate.
    }
  }

  if (enforce && audited.length) {
    try {
      appendAudit(workspace, audited);
    } catch {
      // audit best-effort
    }
  }
  report.burst = enforce && recentBurst(workspace, audited.length);
  return report;
}

export function renderSecurityReport(report) {
  const lines = [];
  if (report.scopeError) {
    lines.push(`DRAX integrity gate: scan skipped (${report.scopeError}).`);
    return lines.join("\n");
  }
  if (report.burst) {
    lines.push("DRAX SECURITY ALERT: burst quarantine detected — an abnormal volume of files was quarantined in a short window. Possible active attack; review .drax/quarantine/audit.log.");
  }
  if (report.quarantined.length) {
    lines.push(`DRAX integrity gate: auto-quarantined ${report.quarantined.length} foreign file(s) to .drax/quarantine/ (reversible; purge with $drax clean --confirm):`);
    for (const q of report.quarantined.slice(0, 20)) lines.push(`  - ${q.from}`);
  }
  if (report.wouldQuarantine.length) {
    lines.push(`DRAX integrity gate: ${report.wouldQuarantine.length} foreign file(s) would be quarantined (report mode):`);
    for (const q of report.wouldQuarantine.slice(0, 20)) lines.push(`  - ${q}`);
  }
  if (report.secrets.length) {
    lines.push(`DRAX integrity gate: ${report.secrets.length} secret-shaped file(s) detected. These are NOT moved. Relocate them to a secure store (not the workspace) via a secure install:`);
    for (const s of report.secrets.slice(0, 20)) lines.push(`  - ${s}`);
  }
  if (report.injections.length) {
    lines.push(`DRAX integrity gate: ${report.injections.length} artifact(s) contain prompt-injection text and were DROPPED from context (files left untouched):`);
    for (const f of report.injections) lines.push(`  - ${f.artifact}`);
  }
  return lines.join("\n");
}
