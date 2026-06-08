import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

function accessEnv(extra = {}) {
  return {
    ...process.env,
    DRAX_ACCESS_TOKEN_JSON: JSON.stringify({
      schemaVersion: "1.0.0",
      tokenId: "test-token",
      tier: "Solo",
      billingInterval: "monthly",
      issuedAt: "2026-01-01T00:00:00.000Z",
      expiresAt: "2099-01-01T00:00:00.000Z",
      signature: "test-signature",
      limits: {
        dailyRunCadence: "daily",
        maxProjects: 1,
        dailyBlogPostCap: 1,
        maxRuntimeHoursPerDay: 1,
        maxRunsPerDay: 1,
      },
    }),
    DRAX_ACCESS_VALIDATION_STUB: "allow",
    ...extra,
  };
}

function withoutAccessEnv() {
  const env = { ...process.env };
  delete env.DRAX_ACCESS_TOKEN_JSON;
  delete env.DRAX_ACCESS_TOKEN_FILE;
  delete env.DRAX_ACCESS_VALIDATION_STUB;
  return env;
}

function initGitRepo(directory) {
  writeFileSync(path.join(directory, "README.md"), "# Test product\n", "utf8");
  assert.equal(spawnSync("git", ["init"], { cwd: directory, encoding: "utf8" }).status, 0);
  assert.equal(spawnSync("git", ["config", "user.email", "test@example.com"], { cwd: directory }).status, 0);
  assert.equal(spawnSync("git", ["config", "user.name", "Drax Test"], { cwd: directory }).status, 0);
  assert.equal(spawnSync("git", ["add", "README.md"], { cwd: directory }).status, 0);
  assert.equal(spawnSync("git", ["commit", "-m", "Initial test repo"], { cwd: directory }).status, 0);
}

function initDraxWorkspace(directory) {
  const result = spawnSync(process.execPath, [path.resolve("dist/cli.js"), "init"], {
    cwd: directory,
    encoding: "utf8",
    env: accessEnv(),
  });
  assert.equal(result.status, 0, result.stderr);
}

function writeFakeCycleCodex(directory, articleBody) {
  const fakeCodex = path.join(directory, "codex");
  writeFileSync(
    fakeCodex,
    [
      "#!/bin/sh",
      'mkdir -p "$(dirname "$DRAX_CYCLE_ARTICLE_PATH")"',
      'cat > "$DRAX_CYCLE_ARTICLE_PATH" <<ARTICLE',
      "---",
      "title: Safe Test Post",
      "description: Safe test description",
      "publishedAt: 2026-06-08T00:00:00.000Z",
      "tags: [test]",
      "draft: false",
      "---",
      articleBody,
      "ARTICLE",
      'cat > "$DRAX_CYCLE_PACKAGE_PATH" <<JSON',
      "{",
      '  "schemaVersion": "1.0.0",',
      '  "packageId": "$DRAX_CYCLE_RUN_ID",',
      '  "postClass": "post-1",',
      '  "postIndex": 1,',
      '  "title": "Safe Test Post",',
      '  "description": "Safe test description",',
      '  "slug": "safe-test-post",',
      '  "tags": ["test"],',
      '  "articlePath": "$DRAX_CYCLE_ARTICLE_PATH",',
      '  "proofNote": "Proof note: Verified from founder artifacts."',
      "}",
      "JSON",
    ].join("\n"),
    "utf8",
  );
  chmodSync(fakeCodex, 0o755);
  return fakeCodex;
}

test("prints the package version", () => {
  const result = spawnSync(process.execPath, ["dist/cli.js", "--version"], { encoding: "utf8" });
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), "1.0.0");
});

test("prints a scoped direct-task prompt", () => {
  const result = spawnSync(process.execPath, ["dist/cli.js", "prompt", "build", "my", "calendar"], {
    encoding: "utf8",
    env: accessEnv(),
  });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /build my calendar/);
  assert.match(result.stdout, /90-post\/class planning/);
  assert.match(result.stdout, /Strategic Definition decision pattern/);
  assert.match(result.stdout, /AskUserQuestion/);
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
      env: accessEnv({ DRAX_CODEX_BIN: fakeCodex, DRAX_TEST_OUTPUT: output }),
    });
    assert.equal(result.status, 0, result.stderr);
    const prompt = readFileSync(output, "utf8");
    assert.match(
      prompt,
      /The first response must be only this question:\nDrax is activated\. Before we decide what to build, tell me who you are and what you are building\./,
    );
    assert.match(prompt, /Phase 1 is Recognition: free text only, no visible choice menus/);
    assert.match(prompt, /read repository evidence before asking for repo facts/);
    assert.match(prompt, /AskUserQuestion/);
    assert.match(prompt, /scope decisions to the local blog surface only/);
    assert.doesNotMatch(prompt, /specific project you already want to build/);
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

test("runtime commands fail closed without an access token", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-no-access-"));
  try {
    const result = spawnSync(process.execPath, [path.resolve("dist/cli.js"), "init"], {
      cwd: directory,
      encoding: "utf8",
      env: withoutAccessEnv(),
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Drax access token validation failed/);
    assert.equal(existsSync(path.join(directory, "FOUNDER_PROFILE.md")), false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("installer preserves a persistent working launcher", () => {
  const home = mkdtempSync(path.join(os.tmpdir(), "drax-install-"));
  try {
    const install = spawnSync(process.execPath, ["dist/cli.js", "install", "--target", "all"], {
      encoding: "utf8",
      env: { ...process.env, HOME: home },
    });
    assert.equal(install.status, 0, install.stderr);
    assert.match(install.stdout, /~\/.local\/bin is on PATH/);
    assert.match(install.stdout, /Device Code login/);
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

test("init copies baseline artifacts into a workspace", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-workspace-"));
  try {
    const result = spawnSync(process.execPath, [path.resolve("dist/cli.js"), "init"], {
      cwd: directory,
      encoding: "utf8",
      env: accessEnv(),
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Drax baseline artifacts ready/);
    assert.equal(existsSync(path.join(directory, "FOUNDER_PROFILE.md")), true);
    assert.equal(existsSync(path.join(directory, "EXECUTION_STATE.md")), true);
    assert.equal(existsSync(path.join(directory, "EXECUTION_STATE.json")), true);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("blog init generates a self-contained Astro surface", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-blog-"));
  const target = path.join(directory, "blog");
  try {
    writeFileSync(
      path.join(directory, "DISTRIBUTION_PLAN.md"),
      [
        "# Distribution Plan",
        "",
        "## Local Blog Deploy",
        "",
        "- Blog attachment mode: subpath",
        "- Editorial site name: Customer Editorial",
        "- Canonical site URL: https://example.com",
        "- Editorial description: Customer updates",
        "- Public base path: /news",
      ].join("\n"),
      "utf8",
    );
    const result = spawnSync(
      process.execPath,
      [
        path.resolve("dist/cli.js"),
        "blog",
        "init",
        "--target",
        target,
      ],
      { cwd: directory, encoding: "utf8", env: accessEnv() },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(existsSync(path.join(target, "package.json")), true);
    assert.equal(existsSync(path.join(target, "src/pages/[...slug].astro")), true);
    assert.match(readFileSync(path.join(target, "src/site.config.ts"), "utf8"), /Customer Editorial/);
    assert.match(readFileSync(path.join(target, "src/site.config.ts"), "utf8"), /\/news/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("cycle dry-run writes run manifest and publish record", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-cycle-"));
  try {
    initGitRepo(directory);
    initDraxWorkspace(directory);
    const fakeCodex = writeFakeCycleCodex(directory, "Proof note: Verified from founder artifacts.\n\nThis teaches the buyer with source-backed context.");
    const result = spawnSync(process.execPath, [path.resolve("dist/cli.js"), "cycle", "--dry-run"], {
      cwd: directory,
      encoding: "utf8",
      env: accessEnv({ DRAX_CODEX_BIN: fakeCodex }),
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Drax cycle dry-run passed/);

    const recordsDir = path.join(directory, ".drax/publish-records");
    const recordFiles = readdirSync(recordsDir).filter((entry) => entry.endsWith(".json"));
    assert.equal(recordFiles.length, 1);
    const record = JSON.parse(readFileSync(path.join(recordsDir, recordFiles[0]), "utf8"));
    assert.equal(record.mode, "dry-run");
    assert.equal(record.result, "succeeded");
    assert.equal(record.dryRun, true);
    assert.equal(record.postClass, "post-1");
    assert.equal(record.artifactHashes.length, 2);

    const pendingDir = path.join(directory, ".drax/runs/pending");
    assert.equal(readdirSync(pendingDir).filter((entry) => entry.endsWith(".json")).length, 1);
    const state = JSON.parse(readFileSync(path.join(directory, "EXECUTION_STATE.json"), "utf8"));
    assert.equal(state.nextPostIndex, 1);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("cycle fails closed on forbidden claims", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-cycle-forbidden-"));
  try {
    initGitRepo(directory);
    initDraxWorkspace(directory);
    const fakeCodex = writeFakeCycleCodex(directory, "Proof note: Verified from founder artifacts.\n\nThis revolutionary claim must fail.");
    const result = spawnSync(process.execPath, [path.resolve("dist/cli.js"), "cycle", "--dry-run"], {
      cwd: directory,
      encoding: "utf8",
      env: accessEnv({ DRAX_CODEX_BIN: fakeCodex }),
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /forbidden hype claim/);
    assert.equal(existsSync(path.join(directory, ".drax/publish-records")), false);
    const failedDir = path.join(directory, ".drax/runs/failed");
    assert.equal(readdirSync(failedDir).filter((entry) => entry.endsWith(".json")).length, 1);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("cycle cron prints the scheduled wrapper command", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-cycle-cron-"));
  try {
    initDraxWorkspace(directory);
    mkdirSync(path.join(directory, ".drax"), { recursive: true });
    const result = spawnSync(process.execPath, [path.resolve("dist/cli.js"), "cycle", "cron"], {
      cwd: directory,
      encoding: "utf8",
      env: accessEnv(),
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Clock schedule is NEEDS_DECISION/);
    assert.match(result.stdout, /Scheduler timezone is NEEDS_DECISION/);
    assert.match(result.stdout, /\$HOME\/\.local\/bin\/drax cycle --dry-run/);
    assert.match(result.stdout, /0 6 \* \* \*/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
