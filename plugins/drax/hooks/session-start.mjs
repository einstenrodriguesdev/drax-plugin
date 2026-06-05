#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ARTIFACTS = [
  "FOUNDER_PROFILE.md",
  "PRODUCT_CONTEXT.md",
  "LANGUAGE_STRATEGY.md",
  "STACK_DECISION.md",
  "ORGANIC_GROWTH_STRATEGY.md",
  "NINETY_POST_PLAN.md",
  "EDITORIAL_CALENDAR.md",
  "DISTRIBUTION_PLAN.md",
  "TRIGGER_PLAN.md",
  "WORKER_ROUTING.md",
  "MEASUREMENT_PLAN.md",
  "EXECUTION_STATE.md",
];

function safeRead(cwd, name) {
  const target = path.resolve(cwd, name);
  if (path.dirname(target) !== cwd || !fs.existsSync(target)) return null;
  const stat = fs.statSync(target);
  if (!stat.isFile() || stat.size > 512_000) return null;
  return fs.readFileSync(target, "utf8").slice(0, 1600).trim();
}

function main() {
  const raw = fs.readFileSync(0, "utf8").trim();
  const event = raw ? JSON.parse(raw) : {};
  const cwd = path.resolve(event.cwd || process.cwd());
  const artifacts = ARTIFACTS.flatMap((name) => {
    const content = safeRead(cwd, name);
    return content ? [`--- ${name} ---\n${content}`] : [];
  });
  const context = [
    "Drax v1.0.0 organic automation runtime is active.",
    "Target user: a founder with an existing product who wants a measured organic traffic system.",
    "Required baseline: founder/product context, language strategy, stack/security decision, 90-post plan, trigger plan, worker routing, distribution, measurement, and execution state.",
    "Publishing defaults to dry-run. Live posting, paid spend, and browser automation require explicit approval.",
    artifacts.length ? artifacts.join("\n\n") : "No Drax organic-growth artifacts were found in this workspace.",
  ].join("\n\n").slice(0, 9000);

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: context },
  }));
}

try {
  main();
} catch (error) {
  process.stdout.write(JSON.stringify({ systemMessage: `Drax context skipped: ${error.message}` }));
}
