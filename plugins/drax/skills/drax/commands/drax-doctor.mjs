#!/usr/bin/env node
// Deterministic command. Reports Drax artifact readiness for the current workspace.

import path from "node:path";
import { auditArtifacts, renderReadinessReport, resolveWorkspace } from "../../../hooks/readiness.mjs";

const cwd = path.resolve(process.argv[2] || process.cwd());
const workspace = resolveWorkspace(cwd);
const readiness = auditArtifacts(workspace);

process.stdout.write(renderReadinessReport(readiness) + "\n");
