import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const HOOK = path.resolve("plugins/drax/hooks/session-start.mjs");
const ARTIFACTS = [
  "FOUNDER_BRAND_BRIEF.md",
  "BOARD_MANDATE.md",
  "VISION_AND_STRATEGY.md",
  "POSITIONING_STATEMENT.md",
  "MARKET_LOCALIZATION_STRATEGY.md",
  "TECH_DECISION_RECORD.md",
  "GTM_STRATEGY.md",
  "CONTENT_STRATEGY.md",
  "EDITORIAL_CALENDAR.md",
  "CHANNEL_PLAN.md",
  "AUTOMATION_RUNBOOK.md",
  "RESPONSIBILITY_MATRIX.md",
  "MEASUREMENT_FRAMEWORK.md",
  "EXECUTION_STATE.md",
];

function runHook(cwd) {
  return spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify({ cwd }),
    encoding: "utf8",
  });
}

test("session hook emits only the compact Drax pointer", (t) => {
  const workspace = mkdtempSync(path.join(os.tmpdir(), "drax-session-start-real-"));
  t.after(() => rmSync(workspace, { recursive: true, force: true }));
  writeFileSync(path.join(workspace, "FOUNDER_BRAND_BRIEF.md"), "REAL_FOUNDER_BRAND_BRIEF", "utf8");

  const result = runHook(workspace);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  const context = payload.hookSpecificOutput.additionalContext;
  assert.equal(
    context,
    "Drax workspace detected. Run $drax doctor for readiness + security, and $drax build for the role-routed next step.",
  );
  assert.doesNotMatch(context, /REAL_FOUNDER_BRAND_BRIEF/);
  assert.doesNotMatch(context, /Deterministic Drax artifact readiness/);
});

test("session hook refuses a symlinked founder profile", (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "drax-session-start-symlink-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const workspace = path.join(root, "workspace");
  const secret = path.join(root, "secret.txt");
  mkdirSync(workspace);
  writeFileSync(secret, "TOPSECRET_DO_NOT_LEAK", "utf8");
  symlinkSync(secret, path.join(workspace, "FOUNDER_BRAND_BRIEF.md"));

  const result = runHook(workspace);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.doesNotMatch(result.stdout, /TOPSECRET_DO_NOT_LEAK/);
  assert.doesNotMatch(payload.hookSpecificOutput.additionalContext, /TOPSECRET_DO_NOT_LEAK/);
});

test("session hook reports when a marked workspace has no artifacts", (t) => {
  const workspace = mkdtempSync(path.join(os.tmpdir(), "drax-session-start-empty-"));
  t.after(() => rmSync(workspace, { recursive: true, force: true }));
  mkdirSync(path.join(workspace, ".drax"));

  const result = runHook(workspace);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(
    payload.hookSpecificOutput.additionalContext,
    "Drax workspace detected. Run $drax doctor for readiness + security, and $drax build for the role-routed next step.",
  );
});

test("session hook stays silent outside a Drax workspace", (t) => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-session-start-nonws-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));

  const result = runHook(directory);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "{}");
});

test("session hook never injects artifact excerpts", (t) => {
  const workspace = mkdtempSync(path.join(os.tmpdir(), "drax-session-start-budget-"));
  t.after(() => rmSync(workspace, { recursive: true, force: true }));
  for (const name of ARTIFACTS) {
    writeFileSync(path.join(workspace, name), `${name}_CONTENT\n${"x".repeat(1580)}`, "utf8");
  }

  const result = runHook(workspace);

  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  const context = payload.hookSpecificOutput.additionalContext;
  assert.equal(
    context,
    "Drax workspace detected. Run $drax doctor for readiness + security, and $drax build for the role-routed next step.",
  );
  for (const name of ARTIFACTS) {
    assert.doesNotMatch(context, new RegExp(`${name.replaceAll(".", "\\.")}_CONTENT`));
    assert.doesNotMatch(context, new RegExp(`--- ${name.replaceAll(".", "\\.")} ---`));
  }
});
