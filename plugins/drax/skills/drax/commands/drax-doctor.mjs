#!/usr/bin/env node
// Deterministic command. Reports Drax artifact readiness and security status for the current workspace.

import path from "node:path";
import { runIntegrityGate, renderSecurityReport } from "../../../hooks/integrity.mjs";
import { auditArtifacts, isDraxWorkspaceDir, renderReadinessReport, resolveWorkspace } from "../../../hooks/readiness.mjs";

function renderSecurityStatus(report) {
  if (report.scopeError) {
    return `SKIPPED Workspace security scan (${report.scopeError})`;
  }
  const secretCount = report.secrets.length;
  const injectionCount = report.injections.length;
  const foreignCount = report.wouldQuarantine.length;
  const lines = [
    `${secretCount ? "FAIL" : "OK"} Workspace free of leaked secrets (${secretCount} found)`,
    `${injectionCount ? "FAIL" : "OK"} Workspace artifacts injection-free (${injectionCount} tainted)`,
    `${foreignCount ? "WARN" : "OK"} Workspace foreign files (${foreignCount} would be quarantined at session start)`,
  ];
  const rendered = renderSecurityReport(report);
  if (rendered) lines.push(rendered);
  return lines.join("\n");
}

const cwd = path.resolve(process.argv[2] || process.cwd());
const workspace = resolveWorkspace(cwd);
const readiness = auditArtifacts(workspace);
const sections = [];

if (isDraxWorkspaceDir(workspace)) {
  try {
    sections.push(renderSecurityStatus(runIntegrityGate(workspace, { enforce: false })));
  } catch {
    sections.push("OPTIONAL-MISSING Workspace security scan (integrity module unavailable)");
  }
}

sections.push(renderReadinessReport(readiness));

process.stdout.write(sections.join("\n") + "\n");
