#!/usr/bin/env node
// Deterministic command. Prints the real CLI posting commands without running the engine.

import path from "node:path";
import { resolveWorkspace } from "../../../hooks/readiness.mjs";

const workspace = resolveWorkspace(path.resolve(process.argv[2] || process.cwd()));
const cronLog = path.join(workspace, ".drax", "logs", "cron.log");

const out = [
  "drax post generates and publishes ONE post to the local blog.",
  "",
  "Run it in your engine shell (not in this Codex session):",
  "  drax post",
  "  drax post --dry-run",
  "",
  "Schedule it (clean cron):",
  "  CRON_TZ=America/Sao_Paulo",
  `  30 7 * * * cd "${workspace}" && drax post >> "${cronLog}" 2>&1`,
  "",
  "Note: the posting engine runs in the standalone `drax` CLI because it needs Codex exec and media libraries; it does not run inside this plugin session. Social distribution is a separate step run with `drax distribute`.",
].join("\n");

process.stdout.write(out + "\n");
