#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { runIntegrityGate } from "./integrity.mjs";
import { isDraxWorkspaceDir, resolveWorkspace } from "./readiness.mjs";

const POINTER_CONTEXT = "Drax workspace detected. Run $drax doctor for readiness + security, and $drax build for the role-routed next step.";

function countSecurityIssues(report) {
  if (!report) return 0;
  let count = 0;
  count += Array.isArray(report.quarantined) ? report.quarantined.length : 0;
  count += Array.isArray(report.secrets) ? report.secrets.length : 0;
  count += Array.isArray(report.injections) ? report.injections.length : 0;
  count += Array.isArray(report.wouldQuarantine) ? report.wouldQuarantine.length : 0;
  if (report.scopeError) count += 1;
  if (report.burst) count += 1;
  return count;
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

  const contextLines = [POINTER_CONTEXT];
  try {
    const security = runIntegrityGate(workspace, { enforce: true });
    const issues = countSecurityIssues(security);
    if (issues > 0) {
      contextLines.push(`Drax security: ${issues} issue(s) found — run $drax doctor.`);
    }
  } catch {
    contextLines.push("Drax security: integrity scan failed closed — run $drax doctor.");
  }

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: contextLines.join("\n") },
  }));
}

try {
  main();
} catch (error) {
  process.stdout.write(JSON.stringify({ systemMessage: `Drax context skipped: ${error.message}` }));
}
