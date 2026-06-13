import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const HOOK = path.resolve("plugins/drax/hooks/session-start.mjs");
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

function runHook(cwd) {
  return spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify({ cwd }),
    encoding: "utf8",
  });
}

test("session hook includes a real founder profile", (t) => {
  const workspace = mkdtempSync(path.join(os.tmpdir(), "drax-session-start-real-"));
  t.after(() => rmSync(workspace, { recursive: true, force: true }));
  writeFileSync(path.join(workspace, "FOUNDER_PROFILE.md"), "REAL_FOUNDER_PROFILE", "utf8");

  const result = runHook(workspace);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.match(payload.hookSpecificOutput.additionalContext, /REAL_FOUNDER_PROFILE/);
});

test("session hook refuses a symlinked founder profile", (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "drax-session-start-symlink-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const workspace = path.join(root, "workspace");
  const secret = path.join(root, "secret.txt");
  mkdirSync(workspace);
  writeFileSync(secret, "TOPSECRET_DO_NOT_LEAK", "utf8");
  symlinkSync(secret, path.join(workspace, "FOUNDER_PROFILE.md"));

  const result = runHook(workspace);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.doesNotMatch(result.stdout, /TOPSECRET_DO_NOT_LEAK/);
  assert.doesNotMatch(payload.hookSpecificOutput.additionalContext, /TOPSECRET_DO_NOT_LEAK/);
});

test("session hook reports when no artifacts exist", (t) => {
  const workspace = mkdtempSync(path.join(os.tmpdir(), "drax-session-start-empty-"));
  t.after(() => rmSync(workspace, { recursive: true, force: true }));

  const result = runHook(workspace);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.match(payload.hookSpecificOutput.additionalContext, /No Drax organic-growth artifacts/);
});

test("session hook prioritizes execution state and names omitted artifacts", (t) => {
  const workspace = mkdtempSync(path.join(os.tmpdir(), "drax-session-start-budget-"));
  t.after(() => rmSync(workspace, { recursive: true, force: true }));
  for (const name of ARTIFACTS) {
    writeFileSync(path.join(workspace, name), `${name}_CONTENT\n${"x".repeat(1580)}`, "utf8");
  }

  const result = runHook(workspace);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  const context = payload.hookSpecificOutput.additionalContext;
  assert.ok(context.length <= 9000);
  assert.match(context, /EXECUTION_STATE\.md_CONTENT/);
  assert.ok(context.indexOf("--- EXECUTION_STATE.md ---") < context.indexOf("--- FOUNDER_PROFILE.md ---"));

  const omitted = ARTIFACTS.filter((name) => !context.includes(`--- ${name} ---`));
  assert.ok(omitted.length > 0);
  const note = context.match(/\[Context truncated: omitted ([^\]]+)\]$/);
  assert.ok(note);
  assert.deepEqual(note[1].split(", ").sort(), omitted.sort());
});
