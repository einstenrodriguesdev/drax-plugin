#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  ".agents/plugins/marketplace.json",
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
  "templates/EXECUTION_STATE.json",
  "templates/workers/analytics-attribution-specialist.md",
  "templates/workers/content-strategist.md",
  "templates/workers/copywriter-performance.md",
  "templates/workers/marketing-automation-specialist.md",
  "templates/workers/motion-designer.md",
  "templates/workers/seo-manager.md",
  "templates/workers/social-media-designer.md",
  "templates/workers/video-editor.md",
  "templates/blog-surface/README.md",
  "templates/blog-surface/package.json",
  "templates/blog-surface/astro.config.mjs",
  "templates/blog-surface/tsconfig.json",
  "templates/blog-surface/public/robots.txt",
  "templates/blog-surface/src/site.config.ts",
  "templates/blog-surface/src/content.config.ts",
  "templates/blog-surface/src/content/posts/.gitkeep",
  "templates/blog-surface/src/lib/posts.ts",
  "templates/blog-surface/src/pages/index.astro",
  "templates/blog-surface/src/pages/[...slug].astro",
  "templates/blog-surface/src/pages/rss.xml.ts",
  "templates/blog-surface/src/styles/global.css",
  "schemas/asset-manifest.schema.json",
  "schemas/publish-record.schema.json",
  "schemas/access-token.schema.json",
  "schemas/conversion-record.schema.json",
  "schemas/tier-limits.schema.json",
  "schemas/deploy-config.schema.json",
  "schemas/execution-state.schema.json",
  "schemas/run-manifest.schema.json",
  "docs/SETUP.md",
  "docs/BLOG_AUTOMATION.md",
  "docs/ACCESS_GATE.md",
  "docs/TRIGGER_ENGINE.md",
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
console.log("Drax Plugin package validation passed.");
