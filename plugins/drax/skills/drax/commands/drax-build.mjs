#!/usr/bin/env node
// Deterministic command. Prints the role-routed build plan for the next artifact gaps.

import path from "node:path";
import { auditArtifacts, resolveWorkspace } from "../../../hooks/readiness.mjs";
import { renderBuildPlan } from "../../../hooks/roles.mjs";

const cwd = path.resolve(process.argv[2] || process.cwd());
const workspace = resolveWorkspace(cwd);
const readiness = auditArtifacts(workspace);

process.stdout.write(renderBuildPlan(readiness) + "\n");
