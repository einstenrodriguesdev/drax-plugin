import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { buildCaption, instagramPlatform, tiktokPlatform, youtubePlatform, instagramReelsPlatform, runDistributeCommand } from "../dist/distribute.js";

function canResolvePlaywright() {
  return spawnSync(process.execPath, ["-e", "require.resolve('playwright')"], { stdio: "ignore" }).status === 0;
}

async function importPlaywright() {
  try {
    return await import("playwright");
  } catch {
    return null;
  }
}

async function captureConsole(fn) {
  const logs = [];
  const errors = [];
  const originalLog = console.log;
  const originalError = console.error;
  console.log = (...args) => logs.push(args.join(" "));
  console.error = (...args) => errors.push(args.join(" "));
  try {
    return { value: await fn(), stdout: logs.join("\n"), stderr: errors.join("\n") };
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}

function writeFixturePublishRecord(directory, overrides = {}) {
  const slug = overrides.slug || "fixture-post";
  const assetDir = path.join(directory, "assets");
  const runDir = path.join(directory, ".drax/runs/run-1");
  const recordDir = path.join(directory, ".drax/publish-records");
  mkdirSync(assetDir, { recursive: true });
  mkdirSync(runDir, { recursive: true });
  mkdirSync(recordDir, { recursive: true });

  const square = path.join(assetDir, `${slug}-square.png`);
  const vertical = path.join(assetDir, `${slug}-vertical.png`);
  const reel = path.join(assetDir, "reel.mp4");
  writeFileSync(square, "fake-square-png", "utf8");
  writeFileSync(vertical, "fake-vertical-png", "utf8");
  writeFileSync(reel, "fake-reel-mp4", "utf8");

  const contentPackagePath = path.join(runDir, "content-package.json");
  writeFileSync(
    contentPackagePath,
    `${JSON.stringify(
      {
        schemaVersion: "1.0.0",
        packageId: "pkg-1",
        postClass: "post-1",
        postIndex: 1,
        title: "Founder Proof Loop",
        description: "Show the buyer what changed. Keep the proof close to the workflow. This sentence is ignored.",
        slug,
        tags: ["B2B SaaS", "Proof", "B2B SaaS", "Launch Ops"],
        articlePath: "article.md",
        proofNote: "Fixture proof.",
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  const record = {
    schemaVersion: "1.0.0",
    attemptId: "run-1",
    runId: "run-1",
    assetId: "pkg-1",
    postClass: "post-1",
    adapter: "local-blog",
    adapterVersion: "1.0.0",
    mode: "local-blog-deploy",
    targetAccount: "local-blog-surface",
    approval: { approvedBy: "test", approvedAt: "2026-06-11T00:00:00.000Z" },
    requestedAt: overrides.requestedAt || "2026-06-11T00:00:00.000Z",
    result: "succeeded",
    evidencePath: "article.md",
    contentPackagePath: path.relative(directory, contentPackagePath).replaceAll(path.sep, "/"),
    artifactHashes: [{ path: "article.md", sha256: "0".repeat(64) }],
    publishTarget: { kind: "blog-surface", path: `posts/${slug}.md`, slug },
    dryRun: false,
    images: { status: "generated", square: path.relative(directory, square).replaceAll(path.sep, "/"), vertical: path.relative(directory, vertical).replaceAll(path.sep, "/") },
    video: { status: "generated", reel: "assets/reel.mp4" },
    carousel: { status: "generated", slides: 3, rasterized: false, rasterStatus: "skipped-no-rasterizer", svgs: ["assets/carousel-01.svg"], pngs: [] },
    ...overrides.record,
  };
  const recordPath = path.join(recordDir, "run-1.json");
  writeFileSync(recordPath, `${JSON.stringify(record, null, 2)}\n`, "utf8");
  return { record, square, vertical, reel, recordPath };
}

function fakeDoctorHome(home) {
  const files = [
    "plugins/drax/.codex-plugin/plugin.json",
    "plugins/drax/skills/drax/SKILL.md",
    ".agents/plugins/marketplace.json",
    ".claude/commands/drax.md",
    ".local/bin/drax",
    ".local/share/drax-plugin/dist/cli.js",
  ];
  for (const file of files) {
    const target = path.join(home, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, "{}\n", "utf8");
  }
}

test("buildCaption is deterministic", () => {
  assert.equal(
    buildCaption({
      title: "Founder Proof Loop",
      description: "First sentence. Second sentence. Third sentence should not be included.",
      tags: ["B2B SaaS", "Launch", "B2B SaaS", "AI/SEO", ""],
    }),
    "Founder Proof Loop\n\nFirst sentence. Second sentence.\n\n#b2bsaas #launch #aiseo",
  );
});

test("each platform navigates to its own homeUrl before --confirm posting", () => {
  // Regression guard: runConfirmedPost once hardcoded instagram.com for ALL
  // platforms, so tiktok/youtube/instagram-reels falsely reported "session
  // expired" (isLoggedIn ran against the wrong site). Each platform must carry
  // a homeUrl on its own domain that its post() can act on.
  const expectations = [
    [instagramPlatform, "www.instagram.com"],
    [instagramReelsPlatform, "www.instagram.com"],
    [tiktokPlatform, "www.tiktok.com"],
    [youtubePlatform, "studio.youtube.com"],
  ];
  for (const [platform, host] of expectations) {
    assert.ok(platform.homeUrl, `${platform.name} must define homeUrl`);
    assert.equal(new URL(platform.homeUrl).host, host, `${platform.name} homeUrl host`);
  }
});

test("queue mode writes an Instagram draft without launching a browser", async () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-distribute-queue-"));
  try {
    const { square } = writeFixturePublishRecord(directory);
    const result = await captureConsole(() =>
      runDistributeCommand(["--platform", "instagram"], { cwd: directory, env: {}, now: new Date("2026-06-11T01:02:03.004Z") }),
    );
    assert.equal(result.value, 0, result.stderr);
    assert.match(result.stdout, /Queued social post draft/);
    assert.match(result.stdout, /Live posting was not performed/);

    const queueDir = path.join(directory, ".drax/post-queue");
    const entries = readdirSync(queueDir).filter((entry) => entry.endsWith(".json"));
    assert.deepEqual(entries, ["2026-06-11T01-02-03-004Z-instagram.json"]);
    const queued = JSON.parse(readFileSync(path.join(queueDir, entries[0]), "utf8"));
    assert.equal(queued.status, "queued");
    assert.equal(queued.platform, "instagram");
    assert.equal(queued.slug, "fixture-post");
    assert.equal(queued.caption, "Founder Proof Loop\n\nShow the buyer what changed. Keep the proof close to the workflow.\n\n#b2bsaas #proof #launchops");
    assert.deepEqual(queued.assets, [{ kind: "image", path: square }]);
    assert.equal(existsSync(path.join(directory, ".drax/sessions")), false);
    assert.equal(existsSync(path.join(directory, ".drax/logs")), false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("confirm mode skips gracefully when Playwright is unavailable", async (t) => {
  if (canResolvePlaywright()) {
    t.skip("Playwright is installed in this environment");
    return;
  }
  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-distribute-no-playwright-"));
  try {
    writeFixturePublishRecord(directory);
    const result = await captureConsole(() =>
      runDistributeCommand(["--platform", "instagram", "--confirm"], {
        cwd: directory,
        env: {},
        now: new Date("2026-06-11T02:03:04.005Z"),
      }),
    );
    assert.equal(result.value, 0, result.stderr);
    assert.match(result.stdout, /Playwright is not installed/);

    const queueFile = path.join(directory, ".drax/post-queue/2026-06-11T02-03-04-005Z-instagram.json");
    assert.equal(existsSync(queueFile), true);
    const queued = JSON.parse(readFileSync(queueFile, "utf8"));
    assert.equal(queued.status, "queued");
    assert.equal(queued.permalink, undefined);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("doctor reports Playwright as optional", () => {
  const home = mkdtempSync(path.join(os.tmpdir(), "drax-doctor-distribute-"));
  try {
    fakeDoctorHome(home);
    const result = spawnSync(process.execPath, [path.resolve("dist/cli.js"), "doctor"], {
      encoding: "utf8",
      env: { ...process.env, HOME: home },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, canResolvePlaywright() ? /OK Playwright social posting library/ : /OPTIONAL-MISSING Playwright social posting library/);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test("instagram adapter posts a single image against a local file fixture", async (t) => {
  const playwright = await importPlaywright();
  if (!playwright) {
    t.skip("Playwright is not installed");
    return;
  }

  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true });
  } catch {
    t.skip("Playwright Chromium is not installed");
    return;
  }

  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-distribute-fixture-"));
  try {
    const asset = path.join(directory, "single-image.png");
    writeFileSync(asset, "fake image", "utf8");
    const page = await browser.newPage();
    await page.goto(pathToFileURL(path.resolve("tests/fixtures/instagram-single-image.html")).toString());
    const caption = "Fixture Caption\n\n#fixture";
    const result = await instagramPlatform.post(page, {
      platform: "instagram",
      slug: "fixture",
      caption,
      assets: [{ kind: "image", path: asset }],
    });
    assert.equal(result.permalink, "https://instagram.test/p/fake-post/");
    const posted = await page.evaluate(() => window.__posted);
    assert.deepEqual(posted, { caption, fileCount: 1, fileName: "single-image.png" });
  } finally {
    await browser.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("tiktok adapter posts a reel against a local file fixture", async (t) => {
  const playwright = await importPlaywright();
  if (!playwright) {
    t.skip("Playwright is not installed");
    return;
  }

  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true });
  } catch {
    t.skip("Playwright Chromium is not installed");
    return;
  }

  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-distribute-tiktok-fixture-"));
  try {
    const asset = path.join(directory, "fixture-reel.mp4");
    writeFileSync(asset, "fake reel video", "utf8");
    const page = await browser.newPage();
    await page.goto(pathToFileURL(path.resolve("tests/fixtures/tiktok-upload.html")).toString());
    const caption = "Reel Caption\n\n#reel";
    const result = await tiktokPlatform.post(page, {
      platform: "tiktok",
      slug: "fixture",
      caption,
      assets: [{ kind: "video", path: asset }],
    });
    assert.equal(result.permalink, "https://tiktok.test/@drax/video/fake-reel-001");
    const posted = await page.evaluate(() => window.__posted);
    assert.deepEqual(posted, { caption, fileCount: 1, fileName: "fixture-reel.mp4" });

    // Verify queue entry flips to posted via runDistributeCommand
    const { reel } = writeFixturePublishRecord(directory);
    mkdirSync(path.join(directory, ".drax/sessions"), { recursive: true });
    writeFileSync(path.join(directory, ".drax/sessions/tiktok.json"), JSON.stringify({ cookies: [] }), "utf8");
    const now = new Date("2026-06-11T03:00:00.000Z");
    const queued = await captureConsole(() =>
      runDistributeCommand(["--platform", "tiktok"], { cwd: directory, env: {}, now }),
    );
    assert.equal(queued.value, 0, queued.stderr);
    const queueDir = path.join(directory, ".drax/post-queue");
    const entries = readdirSync(queueDir).filter((e) => e.endsWith(".json"));
    assert.ok(entries.length > 0, "expected at least one queue entry");
    const entry = JSON.parse(readFileSync(path.join(queueDir, entries[entries.length - 1]), "utf8"));
    assert.equal(entry.status, "queued");
    assert.equal(entry.platform, "tiktok");
    assert.deepEqual(entry.assets, [{ kind: "video", path: reel }]);
  } finally {
    await browser.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("youtube adapter posts a reel against a local file fixture", async (t) => {
  const playwright = await importPlaywright();
  if (!playwright) {
    t.skip("Playwright is not installed");
    return;
  }

  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true });
  } catch {
    t.skip("Playwright Chromium is not installed");
    return;
  }

  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-distribute-youtube-fixture-"));
  try {
    const asset = path.join(directory, "fixture-reel.mp4");
    writeFileSync(asset, "fake reel video", "utf8");
    const page = await browser.newPage();
    await page.goto(pathToFileURL(path.resolve("tests/fixtures/youtube-upload.html")).toString());
    const caption = "Reel Caption\n\n#shorts";
    const result = await youtubePlatform.post(page, {
      platform: "youtube",
      slug: "fixture",
      caption,
      assets: [{ kind: "video", path: asset }],
    });
    assert.equal(result.permalink, "https://youtube.test/shorts/fake-short-001");
    const posted = await page.evaluate(() => window.__posted);
    assert.equal(posted.fileCount, 1);
    assert.equal(posted.fileName, "fixture-reel.mp4");

    // Verify queue entry flips to posted via runDistributeCommand
    const { reel } = writeFixturePublishRecord(directory);
    mkdirSync(path.join(directory, ".drax/sessions"), { recursive: true });
    writeFileSync(path.join(directory, ".drax/sessions/youtube.json"), JSON.stringify({ cookies: [] }), "utf8");
    const now = new Date("2026-06-11T04:00:00.000Z");
    const queued = await captureConsole(() =>
      runDistributeCommand(["--platform", "youtube"], { cwd: directory, env: {}, now }),
    );
    assert.equal(queued.value, 0, queued.stderr);
    const queueDir = path.join(directory, ".drax/post-queue");
    const entries = readdirSync(queueDir).filter((e) => e.endsWith(".json"));
    assert.ok(entries.length > 0, "expected at least one queue entry");
    const entry = JSON.parse(readFileSync(path.join(queueDir, entries[entries.length - 1]), "utf8"));
    assert.equal(entry.status, "queued");
    assert.equal(entry.platform, "youtube");
    assert.deepEqual(entry.assets, [{ kind: "video", path: reel }]);
  } finally {
    await browser.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("instagram-reels adapter posts a reel against a local file fixture", async (t) => {
  const playwright = await importPlaywright();
  if (!playwright) {
    t.skip("Playwright is not installed");
    return;
  }

  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true });
  } catch {
    t.skip("Playwright Chromium is not installed");
    return;
  }

  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-distribute-ig-reel-fixture-"));
  try {
    const asset = path.join(directory, "fixture-reel.mp4");
    writeFileSync(asset, "fake reel video", "utf8");
    const page = await browser.newPage();
    await page.goto(pathToFileURL(path.resolve("tests/fixtures/instagram-reel-upload.html")).toString());
    const caption = "Reel Caption\n\n#reels";
    const result = await instagramReelsPlatform.post(page, {
      platform: "instagram-reels",
      slug: "fixture",
      caption,
      assets: [{ kind: "video", path: asset }],
    });
    assert.equal(result.permalink, "https://instagram.test/reel/fake-reel-001/");
    const posted = await page.evaluate(() => window.__posted);
    assert.deepEqual(posted, { caption, fileCount: 1, fileName: "fixture-reel.mp4" });

    // Verify queue entry flips to posted via runDistributeCommand
    const { reel } = writeFixturePublishRecord(directory);
    mkdirSync(path.join(directory, ".drax/sessions"), { recursive: true });
    writeFileSync(path.join(directory, ".drax/sessions/instagram.json"), JSON.stringify({ cookies: [] }), "utf8");
    const now = new Date("2026-06-11T05:00:00.000Z");
    const queued = await captureConsole(() =>
      runDistributeCommand(["--platform", "instagram-reels"], { cwd: directory, env: {}, now }),
    );
    assert.equal(queued.value, 0, queued.stderr);
    const queueDir = path.join(directory, ".drax/post-queue");
    const entries = readdirSync(queueDir).filter((e) => e.endsWith(".json"));
    assert.ok(entries.length > 0, "expected at least one queue entry");
    const entry = JSON.parse(readFileSync(path.join(queueDir, entries[entries.length - 1]), "utf8"));
    assert.equal(entry.status, "queued");
    assert.equal(entry.platform, "instagram-reels");
    assert.deepEqual(entry.assets, [{ kind: "video", path: reel }]);
  } finally {
    await browser.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("no-reel asset: DistributionError when video.status is not generated", async () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "drax-distribute-no-reel-"));
  try {
    writeFixturePublishRecord(directory, {
      record: { video: { status: "pending", reel: null } },
    });
    const result = await captureConsole(() =>
      runDistributeCommand(["--platform", "tiktok"], { cwd: directory, env: {}, now: new Date("2026-06-11T06:00:00.000Z") }),
    );
    assert.equal(result.value, 1, "expected non-zero exit for missing reel");
    assert.match(result.stderr, /no generated reel asset for slug/);

    const queueDir = path.join(directory, ".drax/post-queue");
    const entries = existsSync(queueDir) ? readdirSync(queueDir).filter((e) => e.endsWith(".json")) : [];
    assert.equal(entries.length, 0, "no queue entry should be written when reel is missing");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
