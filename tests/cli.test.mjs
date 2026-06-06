import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

test("prints the package version", () => {
  const result = spawnSync(process.execPath, ["dist/cli.js", "--version"], { encoding: "utf8" });
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), "1.0.0");
});

test("prints a scoped direct-task prompt", () => {
  const result = spawnSync(process.execPath, ["dist/cli.js", "prompt", "build", "my", "calendar"], { encoding: "utf8" });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /build my calendar/);
  assert.match(result.stdout, /90-post\/class planning/);
  assert.match(result.stdout, /three-option decision pattern/);
  assert.match(result.stdout, /Do not publish live/);
});

test("the bare drax command starts founder intelligence intake", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-intake-"));
  const output = path.join(directory, "prompt.txt");
  const fakeCodex = path.join(directory, "codex");
  try {
    writeFileSync(fakeCodex, '#!/bin/sh\nprintf "%s" "$1" > "$DRAX_TEST_OUTPUT"\n', "utf8");
    chmodSync(fakeCodex, 0o755);
    const result = spawnSync(process.execPath, ["dist/cli.js"], {
      encoding: "utf8",
      env: { ...process.env, DRAX_CODEX_BIN: fakeCodex, DRAX_TEST_OUTPUT: output },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(readFileSync(output, "utf8"), /The first response must be only this question:\nDrax is activated\./);
    assert.match(readFileSync(output, "utf8"), /language strategy, stack\/security decision, 90-post\/class plan/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("session hook reads only known artifacts", () => {
  const result = spawnSync(process.execPath, ["plugins/drax/hooks/session-start.mjs"], {
    input: JSON.stringify({ cwd: process.cwd(), source: "startup" }),
    encoding: "utf8",
  });
  assert.equal(result.status, 0);
  const payload = JSON.parse(result.stdout);
  assert.match(payload.hookSpecificOutput.additionalContext, /Publishing defaults to dry-run/);
  assert.doesNotMatch(payload.hookSpecificOutput.additionalContext, /DRAX_CODEX_BIN/);
});

test("installer preserves a persistent working launcher", () => {
  const home = mkdtempSync(path.join(os.tmpdir(), "drax-install-"));
  try {
    const install = spawnSync(process.execPath, ["dist/cli.js", "install", "--target", "all"], {
      encoding: "utf8",
      env: { ...process.env, HOME: home },
    });
    assert.equal(install.status, 0, install.stderr);
    assert.equal(existsSync(path.join(home, ".local/bin/drax")), true);
    assert.equal(existsSync(path.join(home, ".local/share/drax-plugin/dist/prompts.js")), true);

    const doctor = spawnSync(path.join(home, ".local/bin/drax"), ["doctor"], {
      encoding: "utf8",
      env: { ...process.env, HOME: home },
    });
    assert.equal(doctor.status, 0, doctor.stderr);
    assert.match(doctor.stdout, /OK Persistent runtime/);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
