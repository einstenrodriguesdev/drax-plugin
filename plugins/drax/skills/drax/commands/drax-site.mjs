#!/usr/bin/env node
// Deterministic command. Prints the site fabrication plan and real CLI commands without running the engine.

import path from "node:path";
import { auditArtifacts, resolveWorkspace } from "../../../hooks/readiness.mjs";
import { renderBuildPlan } from "../../../hooks/roles.mjs";

const cwd = path.resolve(process.argv[2] || process.cwd());
const workspace = resolveWorkspace(cwd);
const projectName = path.basename(cwd) || "workspace";
const siteTarget = path.join(cwd, `${projectName}-site-drax`);
const cronLog = path.join(cwd, ".drax", "logs", "site-cron.log");
const readiness = auditArtifacts(workspace);

const out = [
  "drax site fabricates the official marketing site after the 14 baseline artifacts are ready.",
  "",
  renderBuildPlan(readiness),
  "",
  "The site is authored bespoke by the accountable ICs from the 14 artifacts. There is no template and this command does not author the site itself.",
  `Target project: ${siteTarget}`,
  "",
  "Run it in your engine shell (not in this Codex session):",
  "  drax site deploy",
  "",
  "Schedule it (clean cron):",
  "  drax site cron",
  "  CRON_TZ=America/Sao_Paulo",
  `  30 7 * * * cd "${cwd}" && drax site deploy >> "${cronLog}" 2>&1`,
  "",
  "Note: the site engine runs in the standalone `drax` CLI. The ICs author the Astro project first; deploy and cron only operate on that cwd-relative project.",
].join("\n");

process.stdout.write(out + "\n");
