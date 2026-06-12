/**
 * Tests for `drax status` / `drax status --json`
 *
 * Pattern mirrors tests/cli.test.mjs: spawn the built CLI into a temp workspace,
 * assert on stdout / exit code. No new dependencies — pure Node stdlib.
 */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const CLI = path.resolve("dist/cli.js");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function runStatus(cwd, extraArgs = []) {
  return spawnSync(process.execPath, [CLI, "status", ...extraArgs], {
    cwd,
    encoding: "utf8",
    env: { ...process.env },
  });
}

function makeTempDir() {
  return mkdtempSync(path.join(os.tmpdir(), "drax-status-test-"));
}

function writeJson(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

/** Minimal valid publish record — result can be overridden */
function publishRecord(overrides = {}) {
  return {
    schemaVersion: "1.0.0",
    attemptId: "run-test-1",
    runId: "run-test-1",
    assetId: "pkg-test-1",
    postClass: "post-1",
    adapter: "local-blog",
    adapterVersion: "1.0.0",
    mode: "dry-run",
    targetAccount: "local-blog-surface",
    approval: { approvedBy: "dry-run", approvedAt: "2026-06-01T00:00:00.000Z" },
    requestedAt: "2026-06-01T00:00:00.000Z",
    result: "succeeded",
    evidencePath: "article.md",
    contentPackagePath: "content-package.json",
    artifactHashes: [],
    publishTarget: { kind: "blog-surface", path: "drax-blog/src/content/posts/test-slug.md", slug: "test-slug" },
    dryRun: true,
    images: { status: "generated", vertical: "v.png", square: "s.png" },
    video: { status: "skipped-dry-run" },
    carousel: { status: "skipped-dry-run" },
    ...overrides,
  };
}

/** Minimal valid queue entry */
function queueEntry(overrides = {}) {
  return {
    status: "queued",
    platform: "instagram",
    slug: "test-slug",
    caption: "test caption",
    assets: [],
    builtAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Test 1: fixture workspace with one succeeded record, one failed record,
//         one posted entry, one error entry
// ---------------------------------------------------------------------------

test("status --json counts and last-states with fixture records", (t) => {
  const dir = makeTempDir();
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  const recordsDir = path.join(dir, ".drax", "publish-records");
  const queueDir = path.join(dir, ".drax", "post-queue");

  // Two publish records: one succeeded, one failed
  // Use lexicographically ordered filenames so "last" is predictable.
  writeJson(
    path.join(recordsDir, "2026-06-01T00-00-00-000Z-dry-run.json"),
    publishRecord({ result: "succeeded", requestedAt: "2026-06-01T00:00:00.000Z", publishTarget: { kind: "blog-surface", path: "p1.md", slug: "slug-one" } }),
  );
  writeJson(
    path.join(recordsDir, "2026-06-02T00-00-00-000Z-dry-run.json"),
    publishRecord({
      result: "failed",
      requestedAt: "2026-06-02T00:00:00.000Z",
      publishTarget: { kind: "blog-surface", path: "p2.md", slug: "slug-two" },
      images: { status: "error", error: "render failed" },
      video: { status: "skipped-no-python" },
      carousel: { status: "error", error: "carousel failed" },
    }),
  );

  // Two queue entries: one posted (instagram), one error (tiktok)
  writeJson(
    path.join(queueDir, "a-posted.json"),
    queueEntry({ status: "posted", platform: "instagram", permalink: "https://instagram.com/p/abc" }),
  );
  writeJson(
    path.join(queueDir, "b-error.json"),
    queueEntry({ status: "error", platform: "tiktok", error: "upload timeout" }),
  );

  const result = runStatus(dir, ["--json"]);
  assert.equal(result.status, 0, `exit non-zero: ${result.stderr}`);

  const json = JSON.parse(result.stdout);

  // generation counts
  assert.equal(json.layers.generation.total, 2);
  assert.equal(json.layers.generation.succeeded, 1);
  assert.equal(json.layers.generation.failed, 1);
  assert.equal(json.layers.generation.corrupt, 0);

  // last record (lexicographically latest = slug-two / failed)
  assert.equal(json.layers.generation.last.result, "failed");
  assert.equal(json.layers.generation.last.slug, "slug-two");
  assert.equal(json.layers.generation.last.dryRun, true);
  assert.equal(json.layers.generation.last.images, "error");
  assert.equal(json.layers.generation.last.video, "skipped-no-python");
  assert.equal(json.layers.generation.last.carousel, "error");

  // distribution counts
  assert.equal(json.layers.distribution.platforms.instagram.posted, 1);
  assert.equal(json.layers.distribution.platforms.instagram.queued, 0);
  assert.equal(json.layers.distribution.platforms.instagram.error, 0);
  assert.equal(json.layers.distribution.platforms.instagram.latestPermalink, "https://instagram.com/p/abc");

  assert.equal(json.layers.distribution.platforms.tiktok.error, 1);
  assert.equal(json.layers.distribution.platforms.tiktok.latestError, "upload timeout");

  assert.equal(json.layers.distribution.platforms.youtube.queued, 0);
  assert.equal(json.layers.distribution.platforms["instagram-reels"].queued, 0);

  // notes array present
  assert.ok(Array.isArray(json.notes));
  assert.ok(json.notes.length > 0);

  // generatedAt is a parseable ISO timestamp
  assert.ok(!Number.isNaN(new Date(json.generatedAt).valueOf()));
});

// ---------------------------------------------------------------------------
// Test 2: empty / missing .drax/ → graceful "no data yet", exit 0
// ---------------------------------------------------------------------------

test("status with no .drax/ directory exits 0 and reports NO-DATA", (t) => {
  const dir = makeTempDir();
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  // No .drax/ at all
  const result = runStatus(dir);
  assert.equal(result.status, 0, `exit non-zero: ${result.stderr}`);
  assert.match(result.stdout, /NO-DATA/);
  assert.match(result.stdout, /No publish records/);
  assert.match(result.stdout, /No post-queue entries/);
  assert.match(result.stdout, /No access token/);
});

test("status --json with no .drax/ exits 0 and returns zero totals", (t) => {
  const dir = makeTempDir();
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  const result = runStatus(dir, ["--json"]);
  assert.equal(result.status, 0, `exit non-zero: ${result.stderr}`);

  const json = JSON.parse(result.stdout);
  assert.equal(json.layers.generation.total, 0);
  assert.equal(json.layers.generation.last, null);
  assert.equal(json.layers.activation.present, false);
});

// ---------------------------------------------------------------------------
// Test 3: corrupt JSON file in publish-records → skipped+counted, no crash
// ---------------------------------------------------------------------------

test("status skips corrupt JSON files and does not crash", (t) => {
  const dir = makeTempDir();
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  const recordsDir = path.join(dir, ".drax", "publish-records");
  mkdirSync(recordsDir, { recursive: true });

  // One valid record
  writeJson(
    path.join(recordsDir, "valid.json"),
    publishRecord({ result: "succeeded" }),
  );
  // One corrupt file
  writeFileSync(path.join(recordsDir, "corrupt.json"), "{ not valid json {{", "utf8");

  const result = runStatus(dir, ["--json"]);
  assert.equal(result.status, 0, `exit non-zero: ${result.stderr}`);

  const json = JSON.parse(result.stdout);
  // Valid record counted; corrupt skipped
  assert.equal(json.layers.generation.total, 1);
  assert.equal(json.layers.generation.succeeded, 1);
  assert.equal(json.layers.generation.corrupt, 1);
});

test("status skips corrupt post-queue files and does not crash", (t) => {
  const dir = makeTempDir();
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  const queueDir = path.join(dir, ".drax", "post-queue");
  mkdirSync(queueDir, { recursive: true });

  writeJson(path.join(queueDir, "valid.json"), queueEntry({ status: "posted", platform: "youtube", permalink: "https://yt.com/v/xyz" }));
  writeFileSync(path.join(queueDir, "bad.json"), "not json at all", "utf8");

  const result = runStatus(dir, ["--json"]);
  assert.equal(result.status, 0, `exit non-zero: ${result.stderr}`);

  const json = JSON.parse(result.stdout);
  assert.equal(json.layers.distribution.platforms.youtube.posted, 1);
  assert.equal(json.layers.distribution.corrupt, 1);
});

// ---------------------------------------------------------------------------
// Test 4: activation layer — token present and decoded correctly
// ---------------------------------------------------------------------------

test("status --json reads access token tier and expiry when token file present", (t) => {
  const dir = makeTempDir();
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  const token = {
    schemaVersion: "1.0.0",
    tokenId: "tok_status_test",
    tier: "Centaur",
    billingInterval: "annual",
    issuedAt: "2026-01-01T00:00:00.000Z",
    expiresAt: "2027-01-01T00:00:00.000Z",
    signature: "fake-sig-for-status-read-only-test",
    limits: { dailyRunCadence: "daily", maxProjects: 3, dailyBlogPostCap: 3, maxRuntimeHoursPerDay: 4 },
  };
  writeJson(path.join(dir, ".drax", "access-token.json"), token);

  // Clear any env token so it reads from file
  const env = { ...process.env };
  delete env.DRAX_ACCESS_TOKEN_JSON;
  delete env.DRAX_ACCESS_TOKEN_FILE;

  const result = spawnSync(process.execPath, [CLI, "status", "--json"], { cwd: dir, encoding: "utf8", env });
  assert.equal(result.status, 0, `exit non-zero: ${result.stderr}`);

  const json = JSON.parse(result.stdout);
  assert.equal(json.layers.activation.present, true);
  assert.equal(json.layers.activation.tier, "Centaur");
  assert.equal(json.layers.activation.expiresAt, "2027-01-01T00:00:00.000Z");
  assert.equal(json.layers.activation.expired, false);
});

test("status --json reports expired token correctly", (t) => {
  const dir = makeTempDir();
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  const token = {
    schemaVersion: "1.0.0",
    tokenId: "tok_expired",
    tier: "Startup",
    billingInterval: "monthly",
    issuedAt: "2025-01-01T00:00:00.000Z",
    expiresAt: "2025-02-01T00:00:00.000Z", // clearly in the past
    signature: "fake-sig",
    limits: { dailyRunCadence: "daily", maxProjects: 1, dailyBlogPostCap: 1, maxRuntimeHoursPerDay: 1 },
  };
  writeJson(path.join(dir, ".drax", "access-token.json"), token);

  const env = { ...process.env };
  delete env.DRAX_ACCESS_TOKEN_JSON;
  delete env.DRAX_ACCESS_TOKEN_FILE;

  const result = spawnSync(process.execPath, [CLI, "status", "--json"], { cwd: dir, encoding: "utf8", env });
  assert.equal(result.status, 0);

  const json = JSON.parse(result.stdout);
  assert.equal(json.layers.activation.present, true);
  assert.equal(json.layers.activation.expired, true);
});

// ---------------------------------------------------------------------------
// Test 5: human-readable output structure check
// ---------------------------------------------------------------------------

test("status human output contains expected section headers", (t) => {
  const dir = makeTempDir();
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  const result = runStatus(dir);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Layer 1-2: Generation/);
  assert.match(result.stdout, /Layer 3: Social Distribution/);
  assert.match(result.stdout, /Layer 7: Activation/);
  assert.match(result.stdout, /Layers 4-6/);
  assert.match(result.stdout, /drax-api/);
});
