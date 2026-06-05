#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "plugins/drax/.codex-plugin/plugin.json",
  "plugins/drax/skills/drax/SKILL.md",
  "plugins/drax/hooks/hooks.json",
  "plugins/drax/hooks/session-start.mjs",
  "templates/FOUNDER_PROFILE.md",
  "templates/PRODUCT_CONTEXT.md",
  "templates/LANGUAGE_STRATEGY.md",
  "templates/STACK_DECISION.md",
  "templates/ORGANIC_GROWTH_STRATEGY.md",
  "templates/NINETY_POST_PLAN.md",
  "templates/EDITORIAL_CALENDAR.md",
  "templates/DISTRIBUTION_PLAN.md",
  "templates/TRIGGER_PLAN.md",
  "templates/WORKER_ROUTING.md",
  "templates/MEASUREMENT_PLAN.md",
  "templates/EXECUTION_STATE.md",
  "schemas/asset-manifest.schema.json",
  "schemas/publish-record.schema.json",
  "SECURITY.md",
];
const forbidden = [/(^|\/)\.env($|\.)/, /credential/i, /(^|\/)node_modules\//, /\.pem$/, /\.key$/];
const errors = [];

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Missing required file: ${file}`);
}

const pack = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { encoding: "utf8" }));
for (const entry of pack[0]?.files ?? []) {
  if (forbidden.some((pattern) => pattern.test(entry.path))) errors.push(`Forbidden package file: ${entry.path}`);
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(root, "plugins/drax/.codex-plugin/plugin.json"), "utf8"));
if (pkg.version !== manifest.version) errors.push("Package and plugin versions differ.");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Drax Corp package validation passed.");
