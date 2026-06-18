import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash, createPrivateKey, sign as edSign } from "node:crypto";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { canonicalAccessTokenBytes, verifyAccessTokenSignature } from "../dist/access.js";

const TEST_PUBLIC_KEY_B64 = "A6EHv/POEL4dcN0Y50vAmWfk1jCbpQ1fHdyGZBJVMbg=";
const TEST_PRIVATE_KEY_B64 = "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8DoQe/884Qvh1w3RjnS8CZZ+TWMJulDV8d3IZkElUxuA==";
const VECTOR_CANONICAL_HEX =
  "7b22736368656d6156657273696f6e223a22312e302e30222c22746f6b656e4964223a22746f6b5f746573745f766563746f72222c2274696572223a2253746172747570222c2262696c6c696e67496e74657276616c223a226d6f6e74686c79222c226973737565644174223a22323032362d30312d30315430303a30303a30305a222c22657870697265734174223a22323032362d30322d30315430303a30303a30305a222c226c696d697473223a7b226461696c7952756e436164656e6365223a226461696c79222c226d617850726f6a65637473223a312c226461696c79426c6f67506f7374436170223a312c226d617852756e74696d65486f757273506572446179223a322c226d617852756e73506572446179223a317d7d";
const VECTOR_SIGNATURE_B64 = "k/puUeHVL7NdWcXWROh3fmMT+y8rPjQCP1Dy5i57in9t4vRco3Y8hJ7mQMNtN0/UFC7Ux84vbqpfLU7SPPpVCg==";
const VECTOR_TOKEN = {
  schemaVersion: "1.0.0",
  tokenId: "tok_test_vector",
  tier: "Startup",
  billingInterval: "monthly",
  issuedAt: "2026-01-01T00:00:00Z",
  expiresAt: "2026-02-01T00:00:00Z",
  signature: VECTOR_SIGNATURE_B64,
  limits: {
    dailyRunCadence: "daily",
    maxProjects: 1,
    dailyBlogPostCap: 1,
    maxRuntimeHoursPerDay: 2,
    maxRunsPerDay: 1,
  },
};

function b64url(buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function privateKeyObjectFromBase64(priv64StdB64, pubStdB64) {
  const full = Buffer.from(priv64StdB64, "base64");
  const seed = full.subarray(0, 32);
  const pub = Buffer.from(pubStdB64, "base64");
  return createPrivateKey({ key: { kty: "OKP", crv: "Ed25519", d: b64url(seed), x: b64url(pub) }, format: "jwk" });
}

function localCanonicalAccessTokenBytes(token) {
  const limits = {
    dailyRunCadence: token.limits.dailyRunCadence,
    maxProjects: token.limits.maxProjects,
    dailyBlogPostCap: token.limits.dailyBlogPostCap,
    maxRuntimeHoursPerDay: token.limits.maxRuntimeHoursPerDay,
  };
  if (token.limits.maxRunsPerDay !== undefined) limits.maxRunsPerDay = token.limits.maxRunsPerDay;
  return Buffer.from(
    JSON.stringify({
      schemaVersion: token.schemaVersion,
      tokenId: token.tokenId,
      tier: token.tier,
      billingInterval: token.billingInterval,
      issuedAt: token.issuedAt,
      expiresAt: token.expiresAt,
      limits,
    }),
    "utf8",
  );
}

function signAccessToken(token) {
  return edSign(null, localCanonicalAccessTokenBytes(token), privateKeyObjectFromBase64(TEST_PRIVATE_KEY_B64, TEST_PUBLIC_KEY_B64)).toString(
    "base64",
  );
}

function signedAccessToken(overrides = {}) {
  const issuedAt = new Date(Date.now() - 1000).toISOString();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const token = {
    schemaVersion: "1.0.0",
    tokenId: "test-token",
    tier: "Startup",
    billingInterval: "monthly",
    issuedAt,
    expiresAt,
    limits: {
      dailyRunCadence: "daily",
      maxProjects: 1,
      dailyBlogPostCap: 1,
      maxRuntimeHoursPerDay: 1,
      maxRunsPerDay: 1,
    },
    ...overrides,
    signature: "",
  };
  token.signature = signAccessToken(token);
  return token;
}

function accessEnv(extra = {}, token = signedAccessToken()) {
  return {
    ...process.env,
    DRAX_ACCESS_TOKEN_JSON: JSON.stringify(token),
    DRAX_ACCESS_PUBLIC_KEY: TEST_PUBLIC_KEY_B64,
    DRAX_ACCESS_VALIDATION_STUB: "allow",
    ...extra,
  };
}

function withoutAccessEnv() {
  const env = { ...process.env };
  delete env.DRAX_ACCESS_TOKEN_JSON;
  delete env.DRAX_ACCESS_TOKEN_FILE;
  delete env.DRAX_ACCESS_PUBLIC_KEY;
  delete env.DRAX_ACCESS_VALIDATION_STUB;
  return env;
}

function writeDoctorMarker(home, relativePath) {
  const target = path.join(home, relativePath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, "test marker\n", "utf8");
}

function runDoctor(home, cli = path.resolve("dist/cli.js")) {
  return spawnSync(process.execPath, [cli, "doctor"], {
    encoding: "utf8",
    env: { ...process.env, HOME: home, DRAX_CODEX_BIN: path.join(home, "missing-codex") },
  });
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

function initBlogSurface(directory) {
  const distributionPlan = path.join(directory, "CHANNEL_PLAN.md");
  writeFileSync(
    distributionPlan,
    readFileSync(distributionPlan, "utf8").replace("- Blog surface target directory:", "- Blog surface target directory: drax-blog"),
    "utf8",
  );
  const result = spawnSync(process.execPath, [path.resolve("dist/cli.js"), "blog", "init"], {
    cwd: directory,
    encoding: "utf8",
    env: accessEnv(),
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(existsSync(path.join(directory, "drax-blog/src/content/posts/.gitkeep")), true);
}

function sha256File(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function firstPublishRecord(directory) {
  const recordsDir = path.join(directory, ".drax/publish-records");
  const recordFiles = readdirSync(recordsDir).filter((entry) => entry.endsWith(".json"));
  assert.equal(recordFiles.length, 1);
  return JSON.parse(readFileSync(path.join(recordsDir, recordFiles[0]), "utf8"));
}

function pythonCanRenderSocialImages() {
  return spawnSync("python3", ["-c", "import PIL"], { stdio: "ignore" }).status === 0;
}

function canRenderSocialVideo() {
  return (
    spawnSync("python3", ["-c", "import PIL"], { stdio: "ignore" }).status === 0 &&
    spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0
  );
}

function pythonAvailable() {
  return spawnSync("python3", ["--version"], { stdio: "ignore" }).status === 0;
}

function rsvgAvailable() {
  return spawnSync("rsvg-convert", ["--version"], { stdio: "ignore" }).status === 0;
}

function writeFakeCycleCodex(directory, articleBody) {
  const fakeCodex = path.join(directory, "codex");
  writeFileSync(
    fakeCodex,
    [
      "#!/bin/sh",
      "set -eu",
      'mkdir -p "$DRAX_CYCLE_SECTOR_DIR"',
      'case "${DRAX_CYCLE_STAGE:-}" in',
      "  content-strategist)",
      '    cat > "$DRAX_CYCLE_SECTOR_DIR/01-content-brief.md" <<BRIEF',
      "# Content Brief",
      "",
      "Angle: safe test angle for post-1.",
      "Primary promise: teach from founder artifacts without inventing proof.",
      "BRIEF",
      "    ;;",
      "  seo-manager)",
      '    cat > "$DRAX_CYCLE_SECTOR_DIR/02-seo-brief.md" <<SEO',
      "# SEO Brief",
      "",
      "Target keyword: safe test post",
      "Search intent: founder education",
      "JSON-LD schema type: Article",
      "Question H2: What should the founder verify first?",
      "Entity block: Drax, founder workspace, organic automation",
      "Citation point: cite founder artifacts only",
      "Quotable stat 1: 3 of 3 required test gates are explicit in this fixture.",
      "Quotable stat 2: 4 sector stages must produce evidence.",
      "Quotable stat 3: 1 dry-run publish record is expected.",
      "SEO",
      "    ;;",
      "  copywriter)",
      '    mkdir -p "$(dirname "$DRAX_CYCLE_ARTICLE_PATH")"',
      '    cat > "$DRAX_CYCLE_ARTICLE_PATH" <<ARTICLE',
      "---",
      "title: Safe Test Post",
      "description: Safe test description",
      "publishedAt: 2026-06-08T00:00:00.000Z",
      "tags: [test]",
      "draft: false",
      "---",
      articleBody,
      "ARTICLE",
      '    cat > "$DRAX_CYCLE_PACKAGE_PATH" <<JSON',
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
      "    ;;",
      "  review)",
      '    cat > "$DRAX_CYCLE_SECTOR_DIR/04-review.md" <<REVIEW',
      "VERDICT: PASS",
      "",
      "The article includes the required proof note and stays within the fixture rules.",
      "REVIEW",
      "    ;;",
      "  *)",
      '    echo "unknown stage: ${DRAX_CYCLE_STAGE:-missing}" >&2',
      "    exit 2",
      "    ;;",
      "esac",
    ].join("\n"),
    "utf8",
  );
  chmodSync(fakeCodex, 0o755);
  return fakeCodex;
}

test("prints the package version", () => {
  const result = spawnSync(process.execPath, ["dist/cli.js", "--version"], { encoding: "utf8" });
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), "1.1.17");
});

test("prints a scoped direct-task prompt", () => {
  const result = spawnSync(process.execPath, ["dist/cli.js", "prompt", "build", "my", "calendar"], {
    encoding: "utf8",
    env: accessEnv(),
  });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /build my calendar/);
  assert.match(result.stdout, /90-theme planning/);
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
      /When there is no in-progress interview, the first response must be only this question:\nWelcome to DRAX\.\n\nI'm the Chairman/,
    );
    assert.match(prompt, /Phase 1 is Recognition: free text only, no visible choice menus/);
    assert.match(prompt, /Never dead-end the interview/);
    assert.match(prompt, /re-asking the exact last pending question/);
    assert.match(prompt, /resume instead of cold-starting/);
    assert.match(prompt, /do not assume the founder has marketing expertise/);
    assert.match(prompt, /one canonical blog post/);
    assert.match(prompt, /foundational launch baseline/);
    assert.match(prompt, /SME interview/);
    assert.match(prompt, /official org chain/);
    assert.match(prompt, /Hero-Hub-Hygiene/);
    assert.match(prompt, /read repository evidence before asking for repo facts/);
    assert.match(prompt, /AskUserQuestion/);
    assert.match(prompt, /scope decisions to the local blog surface only/);
    assert.doesNotMatch(prompt, /specific project you already want to build/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("session hook reads only known artifacts", () => {
  const workspace = mkdtempSync(path.join(os.tmpdir(), "drax-session-known-"));
  try {
    mkdirSync(path.join(workspace, ".drax"));
    const result = spawnSync(process.execPath, [path.resolve("plugins/drax/hooks/session-start.mjs")], {
      input: JSON.stringify({ cwd: workspace, source: "startup" }),
      encoding: "utf8",
    });
    assert.equal(result.status, 0);
    const payload = JSON.parse(result.stdout);
    assert.match(payload.hookSpecificOutput.additionalContext, /Publishing defaults to dry-run/);
    assert.doesNotMatch(payload.hookSpecificOutput.additionalContext, /DRAX_CODEX_BIN/);
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});

test("session hook stays silent outside a Drax workspace", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-session-nonworkspace-"));
  try {
    const result = spawnSync(process.execPath, [path.resolve("plugins/drax/hooks/session-start.mjs")], {
      input: JSON.stringify({ cwd: directory, source: "startup" }),
      encoding: "utf8",
    });
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), "{}");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
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
    assert.equal(existsSync(path.join(directory, "FOUNDER_BRAND_BRIEF.md")), false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("crypto vector pin matches drax-api Ed25519 contract", () => {
  assert.equal(canonicalAccessTokenBytes(VECTOR_TOKEN).toString("hex"), VECTOR_CANONICAL_HEX);
  assert.equal(signAccessToken({ ...VECTOR_TOKEN, signature: "" }), VECTOR_SIGNATURE_B64);
  assert.equal(verifyAccessTokenSignature(VECTOR_TOKEN, TEST_PUBLIC_KEY_B64), true);
});

test("runtime commands fail closed on a tampered signed token", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-tampered-access-"));
  try {
    const token = signedAccessToken();
    token.tier = "Unicorn";
    const result = spawnSync(process.execPath, [path.resolve("dist/cli.js"), "init"], {
      cwd: directory,
      encoding: "utf8",
      env: accessEnv({}, token),
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Access token signature is invalid/);
    assert.equal(existsSync(path.join(directory, "FOUNDER_BRAND_BRIEF.md")), false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("runtime commands fail closed on a forged signature", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-forged-access-"));
  try {
    const token = signedAccessToken();
    token.signature = "forged-signature";
    const result = spawnSync(process.execPath, [path.resolve("dist/cli.js"), "init"], {
      cwd: directory,
      encoding: "utf8",
      env: accessEnv({}, token),
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Access token signature is invalid/);
    assert.equal(existsSync(path.join(directory, "FOUNDER_BRAND_BRIEF.md")), false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("runtime commands fail closed when the token is not signed by the embedded production key", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-no-public-key-"));
  try {
    // Remove the test-key override so the embedded DRAX production public key is used.
    // The token is signed by the TEST key, so it must be rejected as signature-invalid.
    const env = accessEnv();
    delete env.DRAX_ACCESS_PUBLIC_KEY;
    const result = spawnSync(process.execPath, [path.resolve("dist/cli.js"), "init"], {
      cwd: directory,
      encoding: "utf8",
      env,
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Access token signature is invalid/);
    assert.equal(existsSync(path.join(directory, "FOUNDER_BRAND_BRIEF.md")), false);
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
    // Media generation scripts must reach the runtime root, or the cycle reports
    // "social_*.py is unavailable in this Drax package" and image/video/carousel fail.
    const runtimeScripts = path.join(home, ".local/share/drax-plugin/scripts");
    for (const script of ["social_image.py", "social_video.py", "social_carousel.py"]) {
      assert.equal(existsSync(path.join(runtimeScripts, script)), true, `missing runtime script: ${script}`);
    }
    assert.equal(existsSync(path.join(home, ".local/share/drax-plugin/requirements.txt")), true);

    const doctor = spawnSync(path.join(home, ".local/bin/drax"), ["doctor"], {
      encoding: "utf8",
      env: { ...process.env, HOME: home },
    });
    assert.equal(doctor.status, 0, doctor.stderr);
    assert.match(doctor.stdout, /OK Bundled runtime assets/);
    assert.match(doctor.stdout, /OK Install-flow runtime root/);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test("doctor passes in standalone CLI mode without surfaces or install-flow runtime root", (t) => {
  const home = mkdtempSync(path.join(os.tmpdir(), "drax-doctor-standalone-"));
  t.after(() => rmSync(home, { recursive: true, force: true }));

  const result = runDoctor(home);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /OK Bundled runtime assets/);
  assert.match(result.stdout, /absent \(standalone\/global install\) Install-flow runtime root/);
  assert.match(result.stdout, /No marketplace surface installed - standalone CLI mode/);
  assert.match(result.stdout, /Drax install: OK \(standalone CLI\)/);
});

test("doctor passes with a full Codex surface", (t) => {
  const home = mkdtempSync(path.join(os.tmpdir(), "drax-doctor-codex-"));
  t.after(() => rmSync(home, { recursive: true, force: true }));
  for (const marker of [
    "plugins/drax/.codex-plugin/plugin.json",
    "plugins/drax/skills/drax/SKILL.md",
    ".agents/plugins/marketplace.json",
  ]) {
    writeDoctorMarker(home, marker);
  }

  const result = runDoctor(home);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /MISSING Claude command/);
  assert.match(result.stdout, /MISSING \(optional\) Shell launcher/);
  assert.match(result.stdout, /Drax install: OK \(Codex surface\)/);
});

test("doctor fails when an integration surface is partial", (t) => {
  const home = mkdtempSync(path.join(os.tmpdir(), "drax-doctor-partial-"));
  t.after(() => rmSync(home, { recursive: true, force: true }));
  writeDoctorMarker(home, "plugins/drax/skills/drax/SKILL.md");

  const result = runDoctor(home);

  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stdout, /OK Bundled runtime assets/);
  assert.match(result.stdout, /Drax install: FAILED - .*Codex surface is partial/);
});

test("doctor fails when the running package is missing bundled runtime assets", (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), "drax-doctor-corrupt-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const home = path.join(root, "home");
  mkdirSync(home);
  cpSync(path.resolve("dist"), path.join(root, "dist"), { recursive: true });
  writeFileSync(path.join(root, "package.json"), '{"type":"module"}\n', "utf8");

  const result = runDoctor(home, path.join(root, "dist", "cli.js"));

  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stdout, /MISSING Bundled runtime assets/);
  assert.match(result.stdout, /Drax install: FAILED - bundled runtime assets are missing or corrupt/);
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
    assert.equal(existsSync(path.join(directory, "FOUNDER_BRAND_BRIEF.md")), true);
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
      path.join(directory, "CHANNEL_PLAN.md"),
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

    const record = firstPublishRecord(directory);
    assert.equal(record.mode, "dry-run");
    assert.equal(record.result, "succeeded");
    assert.equal(record.dryRun, true);
    assert.equal(record.postClass, "post-1");
    assert.equal(record.artifactHashes.length, 2);
    assert.deepEqual(record.images, { status: "skipped-dry-run" });
    assert.deepEqual(record.video, { status: "skipped-dry-run" });
    assert.deepEqual(record.carousel, { status: "skipped-dry-run" });
    assert.equal(existsSync(path.join(directory, "drax-blog/src/assets/social")), false);

    const pendingDir = path.join(directory, ".drax/runs/pending");
    assert.equal(readdirSync(pendingDir).filter((entry) => entry.endsWith(".json")).length, 1);
    const state = JSON.parse(readFileSync(path.join(directory, "EXECUTION_STATE.json"), "utf8"));
    assert.equal(state.nextPostIndex, 1);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("cycle dry-run records ordered sector evidence", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-cycle-sector-"));
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

    const recordsDir = path.join(directory, ".drax/publish-records");
    const recordFile = readdirSync(recordsDir).find((entry) => entry.endsWith(".json"));
    assert.ok(recordFile);
    const record = JSON.parse(readFileSync(path.join(recordsDir, recordFile), "utf8"));
    const packagePath = path.resolve(directory, record.contentPackagePath);
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
    assert.deepEqual(
      packageJson.sector.map((entry) => entry.stage),
      ["content-strategist", "seo-manager", "copywriter-performance", "claims/quality-review"],
    );
    assert.deepEqual(
      packageJson.sector.map((entry) => entry.role),
      ["content-strategist", "seo-manager", "copywriter-performance", "claims/quality-review"],
    );

    const packageDir = path.dirname(packagePath);
    for (const entry of packageJson.sector) {
      assert.match(entry.sha256, /^[a-f0-9]{64}$/);
      const artifact = path.resolve(packageDir, entry.artifactPath);
      assert.equal(existsSync(artifact), true);
      assert.notEqual(readFileSync(artifact, "utf8").trim(), "");
      assert.equal(sha256File(artifact), entry.sha256);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("cycle publish keeps succeeding when social image python is unavailable", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-cycle-no-python-"));
  try {
    initGitRepo(directory);
    initDraxWorkspace(directory);
    initBlogSurface(directory);
    const fakeCodex = writeFakeCycleCodex(directory, "Proof note: Verified from founder artifacts.\n\nThis teaches the buyer with source-backed context.");
    const result = spawnSync(process.execPath, [path.resolve("dist/cli.js"), "cycle", "--publish"], {
      cwd: directory,
      encoding: "utf8",
      env: accessEnv({ DRAX_CODEX_BIN: fakeCodex, DRAX_PYTHON_BIN: "/nonexistent/drax-python3" }),
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Drax cycle publish passed/);

    const record = firstPublishRecord(directory);
    assert.equal(record.result, "succeeded");
    assert.equal(record.dryRun, false);
    assert.equal(record.images.status, "skipped-no-python");
    assert.equal(record.video.status, "skipped-no-python");
    assert.equal(record.carousel.status, "skipped-no-python");
    const state = JSON.parse(readFileSync(path.join(directory, "EXECUTION_STATE.json"), "utf8"));
    assert.equal(state.nextPostIndex, 2);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("cycle publish keeps succeeding when social video ffmpeg is unavailable", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-cycle-no-ffmpeg-"));
  try {
    initGitRepo(directory);
    initDraxWorkspace(directory);
    initBlogSurface(directory);
    const fakeCodex = writeFakeCycleCodex(directory, "Proof note: Verified from founder artifacts.\n\nThis teaches the buyer with source-backed context.");
    const result = spawnSync(process.execPath, [path.resolve("dist/cli.js"), "cycle", "--publish"], {
      cwd: directory,
      encoding: "utf8",
      env: accessEnv({ DRAX_CODEX_BIN: fakeCodex, DRAX_FFMPEG_BIN: "/nonexistent/drax-ffmpeg" }),
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Drax cycle publish passed/);

    const record = firstPublishRecord(directory);
    assert.equal(record.result, "succeeded");
    assert.equal(record.dryRun, false);
    assert.equal(record.video.status, "skipped-no-ffmpeg");
    assert.equal(existsSync(path.join(directory, "drax-blog/src/assets/social/safe-test-post-reel.mp4")), false);
    if (pythonAvailable()) {
      assert.equal(record.carousel.status, "generated");
      assert.equal(record.carousel.slides >= 3 && record.carousel.slides <= 7, true);
      assert.equal(record.carousel.rasterized, rsvgAvailable());
      assert.equal(record.carousel.rasterStatus, rsvgAvailable() ? "generated" : "skipped-no-rasterizer");
      assert.match(record.carousel.svgs[0], /safe-test-post-carousel-01\.svg$/);
      assert.match(record.carousel.svgs.at(-2), /safe-test-post-story\.svg$/);
      assert.match(record.carousel.svgs.at(-1), /safe-test-post-highlight\.svg$/);
      for (const svg of record.carousel.svgs) {
        assert.equal(existsSync(path.resolve(directory, svg)), true);
      }
    } else {
      assert.equal(record.carousel.status, "skipped-no-python");
    }
    const state = JSON.parse(readFileSync(path.join(directory, "EXECUTION_STATE.json"), "utf8"));
    assert.equal(state.nextPostIndex, 2);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("cycle publish generates social images when python and Pillow are available", (t) => {
  if (!pythonCanRenderSocialImages()) {
    t.skip("python3 and Pillow are not available");
    return;
  }

  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-cycle-images-"));
  try {
    initGitRepo(directory);
    initDraxWorkspace(directory);
    initBlogSurface(directory);
    const fakeCodex = writeFakeCycleCodex(directory, "Proof note: Verified from founder artifacts.\n\nThis teaches the buyer with source-backed context.");
    const result = spawnSync(process.execPath, [path.resolve("dist/cli.js"), "cycle", "--publish"], {
      cwd: directory,
      encoding: "utf8",
      env: accessEnv({ DRAX_CODEX_BIN: fakeCodex }),
    });
    assert.equal(result.status, 0, result.stderr);

    const record = firstPublishRecord(directory);
    assert.equal(record.images.status, "generated");
    assert.match(record.images.vertical, /safe-test-post-vertical\.png$/);
    assert.match(record.images.square, /safe-test-post-square\.png$/);
    const vertical = path.resolve(directory, record.images.vertical);
    const square = path.resolve(directory, record.images.square);
    assert.equal(existsSync(vertical), true);
    assert.equal(existsSync(square), true);
    assert.equal(readFileSync(vertical).subarray(0, 4).toString("hex"), "89504e47");
    assert.equal(readFileSync(square).subarray(0, 4).toString("hex"), "89504e47");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("cycle publish generates social video when python, Pillow, and ffmpeg are available", (t) => {
  if (!canRenderSocialVideo()) {
    t.skip("python3, Pillow, and ffmpeg are not available");
    return;
  }

  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-cycle-video-"));
  try {
    initGitRepo(directory);
    initDraxWorkspace(directory);
    initBlogSurface(directory);
    const fakeCodex = writeFakeCycleCodex(directory, "Proof note: Verified from founder artifacts.\n\nThis teaches the buyer with source-backed context.");
    const result = spawnSync(process.execPath, [path.resolve("dist/cli.js"), "cycle", "--publish"], {
      cwd: directory,
      encoding: "utf8",
      env: accessEnv({ DRAX_CODEX_BIN: fakeCodex }),
    });
    assert.equal(result.status, 0, result.stderr);

    const record = firstPublishRecord(directory);
    assert.equal(record.video.status, "generated");
    assert.match(record.video.reel, /safe-test-post-reel\.mp4$/);
    const reel = path.resolve(directory, record.video.reel);
    assert.equal(existsSync(reel), true);
    const raw = readFileSync(reel);
    assert.equal(raw.subarray(4, 8).toString("utf8"), "ftyp");
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
