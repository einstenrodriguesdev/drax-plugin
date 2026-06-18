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

const TOTAL_BUDGET = 9000;
const PER_ARTIFACT_FLOOR = 500;
const PER_ARTIFACT_CAP = 1600;

function safeRead(cwd, name) {
  let fd;
  let content = null;
  try {
    const target = path.resolve(cwd, name);
    if (path.dirname(target) !== cwd) return null;
    const stat = fs.lstatSync(target);
    if (stat.isSymbolicLink() || !stat.isFile() || stat.size > 512_000) return null;
    fd = fs.openSync(target, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
    content = fs.readFileSync(fd, "utf8").slice(0, 1600).trim();
  } catch {
    return null;
  } finally {
    if (fd !== undefined) {
      try {
        fs.closeSync(fd);
      } catch {
        content = null;
      }
    }
  }
  return content;
}

function isDraxWorkspace(cwd) {
  try {
    if (fs.existsSync(path.join(cwd, ".drax"))) return true;
    if (fs.existsSync(path.join(cwd, "EXECUTION_STATE.json"))) return true;
    for (const name of ARTIFACTS) {
      if (fs.existsSync(path.join(cwd, name))) return true;
    }
  } catch {
    return false;
  }
  return false;
}

function main() {
  const raw = fs.readFileSync(0, "utf8").trim();
  const event = raw ? JSON.parse(raw) : {};
  const cwd = path.resolve(event.cwd || process.cwd());

  // Scoped activation: outside a real Drax workspace the hook is a no-op, so
  // unrelated Codex sessions are never injected with Drax context.
  if (!isDraxWorkspace(cwd)) {
    process.stdout.write(JSON.stringify({}));
    return;
  }

  const artifacts = ARTIFACTS.flatMap((name) => {
    const content = safeRead(cwd, name);
    return content ? [{ name, content }] : [];
  });
  const staticContext = [
    "Drax v1.1.11 organic automation runtime is active.",
    "Target user: a founder with an existing product who wants a measured organic traffic system.",
    "Required baseline: founder/product context, language strategy, stack/security decision, 90-post plan, trigger plan, worker routing, distribution, measurement, and execution state.",
    "Publishing defaults to dry-run. Live posting, paid spend, and browser automation require explicit approval.",
  ].join("\n\n");
  let context = [staticContext, "No Drax organic-growth artifacts were found in this workspace."].join("\n\n");

  if (artifacts.length) {
    const prioritized = [
      ...artifacts.filter(({ name }) => name === "EXECUTION_STATE.md"),
      ...artifacts.filter(({ name }) => name !== "EXECUTION_STATE.md"),
    ];
    const remainingBudget = TOTAL_BUDGET - staticContext.length;
    const perArtifactBudget = Math.min(
      PER_ARTIFACT_CAP,
      Math.max(PER_ARTIFACT_FLOOR, Math.floor(remainingBudget / prioritized.length)),
    );
    const included = prioritized.map(({ name, content }) => ({
      name,
      section: `--- ${name} ---\n${content.slice(0, perArtifactBudget).trim()}`,
    }));
    const omitted = [];

    const assembleContext = () => [
      staticContext,
      ...included.map(({ section }) => section),
      ...(omitted.length ? [`[Context truncated: omitted ${omitted.join(", ")}]`] : []),
    ].join("\n\n");

    context = assembleContext();
    while (context.length > TOTAL_BUDGET && included.length) {
      omitted.push(included.pop().name);
      context = assembleContext();
    }
  }

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: context },
  }));
}

try {
  main();
} catch (error) {
  process.stdout.write(JSON.stringify({ systemMessage: `Drax context skipped: ${error.message}` }));
}
