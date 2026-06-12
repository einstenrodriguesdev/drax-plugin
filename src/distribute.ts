import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

type RunOptions = {
  cwd: string;
  env: NodeJS.ProcessEnv;
  now?: Date;
};

type PublishRecordCandidate = {
  file: string;
  record: Record<string, unknown>;
  requestedAtMs: number;
  mtimeMs: number;
};

type ContentMetadata = {
  title: string;
  description: string;
  tags: string[];
};

type PlaywrightModule = {
  chromium: {
    launch(options?: Record<string, unknown>): Promise<{
      newContext(options?: Record<string, unknown>): Promise<{
        newPage(): Promise<unknown>;
        storageState(options: { path: string }): Promise<unknown>;
        close?: () => Promise<void>;
      }>;
      close(): Promise<void>;
    }>;
  };
};

export type PostAsset = { kind: "image" | "video"; path: string };
export type BuiltPost = { platform: string; slug: string; caption: string; assets: PostAsset[] };

export interface SocialPlatform {
  name: string;
  sessionFile: string;
  loginUrl: string;
  // Logged-in surface to open before posting with --confirm. Must be the page
  // platform.post() expects to act on (feed for IG, upload page for TikTok/YT),
  // NOT a hardcoded instagram.com — otherwise isLoggedIn runs against the wrong
  // site and falsely reports "session expired" for non-instagram platforms.
  homeUrl: string;
  isLoggedIn(page: unknown): Promise<boolean>;
  post(page: unknown, post: BuiltPost): Promise<{ permalink?: string }>;
}

type QueueEntry = {
  status: "queued" | "posted" | "error";
  platform: string;
  slug: string;
  caption: string;
  assets: PostAsset[];
  builtAt: string;
  postedAt?: string;
  permalink?: string;
  error?: string;
};

const DEFAULT_PUBLISH_RECORD_DIRECTORY = ".drax/publish-records";
const POST_QUEUE_DIRECTORY = ".drax/post-queue";
const LOG_DIRECTORY = ".drax/logs";
const PLAYWRIGHT_INSTALL_HINT =
  "Playwright is not installed. To enable social posting, run: npm i playwright && npx playwright install chromium";

class DistributionError extends Error {
  constructor(
    message: string,
    readonly exitCode = 1,
  ) {
    super(message);
  }
}

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

function optionValue(args: string[], flag: string): string | null {
  const index = args.indexOf(flag);
  if (index < 0) return null;
  const value = args[index + 1];
  return value && !value.startsWith("--") ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function stringArrayField(record: Record<string, unknown>, key: string): string[] {
  const value = record[key];
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0) : [];
}

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, "utf8"));
}

function writeJson(file: string, value: unknown): void {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function resolveWorkspacePath(cwd: string, value: string): string {
  return path.isAbsolute(value) ? path.resolve(value) : path.resolve(cwd, value);
}

function fileStamp(date: Date): string {
  return date.toISOString().replaceAll(/[:.]/g, "-");
}

function publishRecordDirectory(cwd: string): string {
  const statePath = path.join(cwd, "EXECUTION_STATE.json");
  if (!existsSync(statePath)) return DEFAULT_PUBLISH_RECORD_DIRECTORY;
  try {
    const parsed = readJson(statePath);
    if (!isRecord(parsed) || !isRecord(parsed.config)) return DEFAULT_PUBLISH_RECORD_DIRECTORY;
    return stringField(parsed.config, "publishRecordDirectory") || DEFAULT_PUBLISH_RECORD_DIRECTORY;
  } catch {
    return DEFAULT_PUBLISH_RECORD_DIRECTORY;
  }
}

function publishRecordSlug(record: Record<string, unknown>): string | null {
  const target = record.publishTarget;
  if (isRecord(target)) return stringField(target, "slug");
  return stringField(record, "slug");
}

function isSucceededLiveRecord(record: Record<string, unknown>): boolean {
  return record.result === "succeeded" && record.mode !== "dry-run" && record.dryRun !== true;
}

function findPublishRecord(cwd: string, slug: string | null): PublishRecordCandidate | null {
  const root = resolveWorkspacePath(cwd, publishRecordDirectory(cwd));
  if (!existsSync(root)) return null;
  const candidates: PublishRecordCandidate[] = [];
  for (const entry of readdirSync(root)) {
    if (!entry.endsWith(".json")) continue;
    const file = path.join(root, entry);
    try {
      const parsed = readJson(file);
      if (!isRecord(parsed) || !isSucceededLiveRecord(parsed)) continue;
      if (slug && publishRecordSlug(parsed) !== slug) continue;
      const requestedAt = stringField(parsed, "requestedAt");
      candidates.push({
        file,
        record: parsed,
        requestedAtMs: requestedAt ? Date.parse(requestedAt) || 0 : 0,
        mtimeMs: statSync(file).mtimeMs,
      });
    } catch {
      continue;
    }
  }
  candidates.sort((a, b) => b.requestedAtMs - a.requestedAtMs || b.mtimeMs - a.mtimeMs || b.file.localeCompare(a.file));
  return candidates[0] ?? null;
}

function readContentMetadata(cwd: string, record: Record<string, unknown>): ContentMetadata {
  let contentPackage: Record<string, unknown> = {};
  const packagePath = stringField(record, "contentPackagePath");
  if (packagePath) {
    const target = resolveWorkspacePath(cwd, packagePath);
    if (existsSync(target)) {
      try {
        const parsed = readJson(target);
        if (isRecord(parsed)) contentPackage = parsed;
      } catch {
        contentPackage = {};
      }
    }
  }

  const slug = publishRecordSlug(record) || "untitled-post";
  return {
    title: stringField(record, "title") || stringField(contentPackage, "title") || slug,
    description: stringField(record, "description") || stringField(contentPackage, "description") || "",
    tags: stringArrayField(record, "tags").length ? stringArrayField(record, "tags") : stringArrayField(contentPackage, "tags"),
  };
}

function sentenceHook(description: string): string {
  const normalized = description.replaceAll(/\s+/g, " ").trim();
  if (!normalized) return "";
  return normalized
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");
}

function hashtag(value: string): string | null {
  const normalized = value
    .normalize("NFKD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "");
  return normalized ? `#${normalized}` : null;
}

export function buildCaption(input: ContentMetadata): string {
  const lines: string[] = [input.title.trim()];
  const hook = sentenceHook(input.description);
  if (hook) lines.push("", hook);

  const seen = new Set<string>();
  const hashtags = input.tags
    .map(hashtag)
    .filter((tag): tag is string => Boolean(tag))
    .filter((tag) => {
      if (seen.has(tag)) return false;
      seen.add(tag);
      return true;
    })
    .slice(0, 12);
  if (hashtags.length) lines.push("", hashtags.join(" "));
  return lines.join("\n");
}

function selectInstagramImageAsset(cwd: string, slug: string, record: Record<string, unknown>): PostAsset {
  const images = record.images;
  if (!isRecord(images) || images.status !== "generated") {
    throw new DistributionError(`no generated image asset for slug ${slug} - run a publish cycle with Pillow installed first`);
  }
  const imagePath = stringField(images, "square") || stringField(images, "vertical");
  if (!imagePath) {
    throw new DistributionError(`no generated image asset for slug ${slug} - run a publish cycle with Pillow installed first`);
  }
  const resolved = resolveWorkspacePath(cwd, imagePath);
  if (!existsSync(resolved)) {
    throw new DistributionError(`generated image asset for slug ${slug} is missing: ${imagePath}`);
  }
  return { kind: "image", path: resolved };
}

function selectReelVideoAsset(cwd: string, slug: string, record: Record<string, unknown>): PostAsset {
  const video = record.video;
  if (!isRecord(video) || video.status !== "generated") {
    throw new DistributionError(`no generated reel asset for slug ${slug} - run a publish cycle with ffmpeg installed first`);
  }
  const reelPath = stringField(video, "reel");
  if (!reelPath) {
    throw new DistributionError(`no generated reel asset for slug ${slug} - run a publish cycle with ffmpeg installed first`);
  }
  const resolved = resolveWorkspacePath(cwd, reelPath);
  if (!existsSync(resolved)) {
    throw new DistributionError(`generated reel asset for slug ${slug} is missing: ${reelPath}`);
  }
  return { kind: "video", path: resolved };
}

const VIDEO_PLATFORMS = new Set(["tiktok", "youtube", "instagram-reels"]);

function buildPost(cwd: string, platform: SocialPlatform, candidate: PublishRecordCandidate): BuiltPost {
  const slug = publishRecordSlug(candidate.record);
  if (!slug) throw new DistributionError(`Publish record ${candidate.file} has no publishTarget.slug.`);
  const metadata = readContentMetadata(cwd, candidate.record);
  const asset = VIDEO_PLATFORMS.has(platform.name)
    ? selectReelVideoAsset(cwd, slug, candidate.record)
    : selectInstagramImageAsset(cwd, slug, candidate.record);
  return {
    platform: platform.name,
    slug,
    caption: buildCaption(metadata),
    assets: [asset],
  };
}

function writeQueueEntry(cwd: string, platform: SocialPlatform, post: BuiltPost, now: Date): { file: string; entry: QueueEntry } {
  const entry: QueueEntry = {
    status: "queued",
    platform: platform.name,
    slug: post.slug,
    caption: post.caption,
    assets: post.assets,
    builtAt: now.toISOString(),
  };
  const file = path.join(resolveWorkspacePath(cwd, POST_QUEUE_DIRECTORY), `${fileStamp(now)}-${platform.name}.json`);
  writeJson(file, entry);
  return { file, entry };
}

function updateQueueEntry(file: string, entry: QueueEntry): void {
  writeJson(file, entry);
}

function writePostingLog(cwd: string, platform: SocialPlatform, slug: string, now: Date, value: unknown): string {
  const file = path.join(resolveWorkspacePath(cwd, LOG_DIRECTORY), `${fileStamp(now)}-${platform.name}-${slug}.json`);
  writeJson(file, value);
  return file;
}

function printQueuePreview(file: string, post: BuiltPost): void {
  const assetLines = post.assets.map((asset) => `- ${asset.kind}: ${asset.path}`).join("\n");
  console.log(
    [
      `Queued social post draft: ${file}`,
      `Platform: ${post.platform}`,
      `Slug: ${post.slug}`,
      "Assets:",
      assetLines,
      "Caption:",
      post.caption,
      "Live posting was not performed. Re-run with --confirm to post.",
    ].join("\n"),
  );
}

function isMissingModuleError(error: unknown): boolean {
  return isRecord(error) && (error.code === "MODULE_NOT_FOUND" || error.code === "ERR_MODULE_NOT_FOUND");
}

export async function loadPlaywright(): Promise<PlaywrightModule | null> {
  try {
    const specifier = "playwright";
    return (await import(specifier)) as PlaywrightModule;
  } catch (error) {
    if (isMissingModuleError(error)) return null;
    throw error;
  }
}

function playwrightHeadless(defaultValue: boolean, env: NodeJS.ProcessEnv): boolean {
  const override = env.DRAX_PLAYWRIGHT_HEADLESS;
  if (!override) return defaultValue;
  return ["1", "true", "yes", "on"].includes(override.toLowerCase());
}

async function launchChromium(playwright: PlaywrightModule, env: NodeJS.ProcessEnv, defaultHeadless: boolean): Promise<any> {
  const options: Record<string, unknown> = { headless: playwrightHeadless(defaultHeadless, env) };
  if (env.DRAX_PLAYWRIGHT_CHANNEL) options.channel = env.DRAX_PLAYWRIGHT_CHANNEL;
  return playwright.chromium.launch(options);
}

async function locatorVisible(locator: any, timeout = 500): Promise<boolean> {
  try {
    await locator.first().waitFor({ state: "visible", timeout });
    return true;
  } catch {
    return false;
  }
}

async function clickFirst(candidates: any[], timeout = 5000): Promise<boolean> {
  for (const candidate of candidates) {
    try {
      const locator = candidate.first ? candidate.first() : candidate;
      await locator.click({ timeout });
      return true;
    } catch {
      continue;
    }
  }
  return false;
}

async function fillFirst(candidates: any[], value: string, timeout = 5000): Promise<boolean> {
  for (const candidate of candidates) {
    try {
      const locator = candidate.first ? candidate.first() : candidate;
      await locator.fill(value, { timeout });
      return true;
    } catch {
      continue;
    }
  }
  return false;
}

async function textVisible(page: any, pattern: RegExp, timeout = 500): Promise<boolean> {
  try {
    await page.getByText(pattern).first().waitFor({ state: "visible", timeout });
    return true;
  } catch {
    return false;
  }
}

async function instagramRequiresManualVerification(page: any): Promise<boolean> {
  const url = typeof page.url === "function" ? page.url() : "";
  if (/checkpoint|challenge|suspended|disabled/i.test(url)) return true;
  return textVisible(page, /manual verification|verify your account|confirm your account|suspicious login|challenge required/i, 500);
}

async function fillInstagramCredentialsIfPresent(page: any, env: NodeJS.ProcessEnv): Promise<void> {
  const username = env.DRAX_IG_USERNAME;
  const password = env.DRAX_IG_PASSWORD;
  if (!username || !password) return;
  const filledUsername = await fillFirst(
    [page.locator('input[name="username"]'), page.locator('input[autocomplete="username"]')],
    username,
    5000,
  );
  const filledPassword = await fillFirst(
    [page.locator('input[name="password"]'), page.locator('input[type="password"]')],
    password,
    5000,
  );
  if (filledUsername && filledPassword) {
    await clickFirst([page.getByRole("button", { name: /log in/i }), page.locator('button[type="submit"]')], 5000);
    console.log("Submitted Instagram login form from DRAX_IG_* env fallback; credentials were not saved by DRAX.");
  }
}

async function waitForLogin(page: any, platform: SocialPlatform, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (typeof page.isClosed === "function" && page.isClosed()) return false;
    if (await platform.isLoggedIn(page)) return true;
    if (await instagramRequiresManualVerification(page)) {
      console.log("Instagram requires manual verification - complete it in the opened browser.");
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  return false;
}

async function runLogin(platform: SocialPlatform, options: RunOptions): Promise<number> {
  const playwright = await loadPlaywright();
  if (!playwright) {
    console.log(PLAYWRIGHT_INSTALL_HINT);
    return 0;
  }

  const sessionFile = resolveWorkspacePath(options.cwd, platform.sessionFile);
  mkdirSync(path.dirname(sessionFile), { recursive: true });
  let browser: Awaited<ReturnType<typeof launchChromium>> | null = null;
  try {
    browser = await launchChromium(playwright, options.env, false);
    const contextOptions: Record<string, unknown> = existsSync(sessionFile) ? { storageState: sessionFile } : {};
    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();
    console.log("Log in in the opened browser; DRAX will save the session (never your password).");
    await (page as any).goto(platform.loginUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await fillInstagramCredentialsIfPresent(page, options.env);
    const loggedIn = await waitForLogin(page, platform, 5 * 60 * 1000);
    if (!loggedIn) {
      console.error("Login timed out or the browser closed before DRAX could save the session.");
      return 1;
    }
    await context.storageState({ path: sessionFile });
    chmodSync(sessionFile, 0o600);
    await context.close?.();
    console.log(`Saved ${platform.name} session to ${platform.sessionFile} (no password stored).`);
    return 0;
  } finally {
    if (browser) await browser.close();
  }
}

async function runConfirmedPost(platform: SocialPlatform, post: BuiltPost, queueFile: string, queueEntry: QueueEntry, options: RunOptions): Promise<number> {
  const playwright = await loadPlaywright();
  if (!playwright) {
    console.log(PLAYWRIGHT_INSTALL_HINT);
    return 0;
  }

  const sessionFile = resolveWorkspacePath(options.cwd, platform.sessionFile);
  if (!existsSync(sessionFile)) {
    console.log(`No ${platform.name} session found. Run \`drax distribute login --platform ${platform.name}\` first.`);
    return 0;
  }

  let browser: Awaited<ReturnType<typeof launchChromium>> | null = null;
  try {
    browser = await launchChromium(playwright, options.env, true);
    const context = await browser.newContext({ storageState: sessionFile });
    const page = await context.newPage();
    await (page as any).goto(platform.homeUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    if (!(await platform.isLoggedIn(page))) {
      console.log(`The ${platform.name} session expired. Re-run \`drax distribute login --platform ${platform.name}\`.`);
      await context.close?.();
      return 0;
    }
    const result = await platform.post(page, post);
    const postedAt = new Date().toISOString();
    const postedEntry: QueueEntry = { ...queueEntry, status: "posted", postedAt };
    if (result.permalink) postedEntry.permalink = result.permalink;
    updateQueueEntry(queueFile, postedEntry);
    const logFile = writePostingLog(options.cwd, platform, post.slug, new Date(), {
      status: "posted",
      platform: platform.name,
      slug: post.slug,
      queueFile,
      postedAt,
      ...(result.permalink ? { permalink: result.permalink } : {}),
    });
    await context.close?.();
    console.log(`Posted ${platform.name} post for ${post.slug}. Queue: ${queueFile}. Log: ${logFile}.`);
    if (result.permalink) console.log(`Permalink: ${result.permalink}`);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const failedAt = new Date().toISOString();
    updateQueueEntry(queueFile, { ...queueEntry, status: "error", error: message });
    const logFile = writePostingLog(options.cwd, platform, post.slug, new Date(), {
      status: "error",
      platform: platform.name,
      slug: post.slug,
      queueFile,
      failedAt,
      error: message,
    });
    console.error(`Social posting failed for ${post.slug}: ${message}. Log: ${logFile}`);
    return 1;
  } finally {
    if (browser) await browser.close();
  }
}

function platformFor(name: string | null): SocialPlatform {
  return platformByName(name);
}

function platformByName(name: string | null): SocialPlatform {
  if (name === "instagram") return instagramPlatform;
  if (name === "tiktok") return tiktokPlatform;
  if (name === "youtube") return youtubePlatform;
  if (name === "instagram-reels") return instagramReelsPlatform;
  throw new DistributionError(
    name
      ? `Unsupported social platform: ${name}`
      : "Missing --platform. Supported platforms: instagram, tiktok, youtube, instagram-reels.",
  );
}

function noPublishRecordMessage(slug: string | null): string {
  return slug
    ? `No succeeded publish record found for slug ${slug}. Run \`drax cycle --publish\` first.`
    : "No succeeded publish record found. Run `drax cycle --publish` first.";
}

export async function runDistributeCommand(args: string[], options: RunOptions): Promise<number> {
  try {
    const platform = platformFor(optionValue(args, "--platform"));
    const login = args[0] === "login" || hasFlag(args, "--login");
    if (login) return runLogin(platform, options);

    const candidate = findPublishRecord(options.cwd, optionValue(args, "--slug"));
    if (!candidate) throw new DistributionError(noPublishRecordMessage(optionValue(args, "--slug")));
    const post = buildPost(options.cwd, platform, candidate);
    const now = options.now ?? new Date();

    if (!hasFlag(args, "--confirm")) {
      const queued = writeQueueEntry(options.cwd, platform, post, now);
      printQueuePreview(queued.file, post);
      return 0;
    }

    const queued = writeQueueEntry(options.cwd, platform, post, now);
    return runConfirmedPost(platform, post, queued.file, queued.entry, options);
  } catch (error) {
    if (error instanceof DistributionError) {
      console.error(error.message);
      return error.exitCode;
    }
    throw error;
  }
}

// Instagram web selectors are intentionally isolated here. The web UI changes often,
// so later maintenance should stay inside this adapter instead of leaking into command flow.
export const instagramPlatform: SocialPlatform = {
  name: "instagram",
  sessionFile: ".drax/sessions/instagram.json",
  loginUrl: "https://www.instagram.com/accounts/login/",
  homeUrl: "https://www.instagram.com/",
  async isLoggedIn(page: any): Promise<boolean> {
    if (typeof page.isClosed === "function" && page.isClosed()) return false;
    if (await instagramRequiresManualVerification(page)) return false;
    const url = typeof page.url === "function" ? page.url() : "";
    if (/\/accounts\/login|\/accounts\/emailsignup/i.test(url)) return false;
    return (
      (await locatorVisible(page.getByRole("link", { name: /create|new post|home|profile/i }), 750)) ||
      (await locatorVisible(page.getByRole("button", { name: /create|new post|home|profile/i }), 750)) ||
      (await locatorVisible(page.locator('[aria-label="Create"], [aria-label="New post"], nav'), 750))
    );
  },
  async post(page: any, post: BuiltPost): Promise<{ permalink?: string }> {
    const asset = post.assets[0];
    if (!asset || post.assets.length !== 1 || asset.kind !== "image") {
      throw new Error("Instagram 31a supports exactly one image asset.");
    }
    if (await instagramRequiresManualVerification(page)) {
      throw new Error("Instagram requires manual verification - complete it via `drax distribute login --platform instagram`.");
    }

    await clickFirst(
      [
        page.getByRole("button", { name: /create|new post/i }),
        page.getByRole("link", { name: /create|new post/i }),
        page.getByText(/create|new post/i),
        page.locator('[aria-label="Create"], [aria-label="New post"]'),
      ],
      10000,
    );

    const input = page.locator('input[type="file"]').first();
    await input.waitFor({ state: "attached", timeout: 30000 });
    await input.setInputFiles(asset.path);

    await clickFirst([page.getByRole("button", { name: /^next$/i }), page.getByText(/^next$/i)], 5000);
    await clickFirst([page.getByRole("button", { name: /^next$/i }), page.getByText(/^next$/i)], 5000);

    const filled = await fillFirst(
      [
        page.getByRole("textbox", { name: /caption|write a caption/i }),
        page.locator('textarea[aria-label*="caption" i]'),
        page.locator("textarea"),
        page.locator('[contenteditable="true"]'),
      ],
      post.caption,
      30000,
    );
    if (!filled) throw new Error("Could not find Instagram caption field.");

    const shared = await clickFirst([page.getByRole("button", { name: /^share$/i }), page.getByText(/^share$/i)], 30000);
    if (!shared) throw new Error("Could not find Instagram Share button.");

    await Promise.race([
      page.getByText(/posted|shared|your post has been shared/i).first().waitFor({ state: "visible", timeout: 60000 }).catch(() => null),
      page.waitForURL(/\/p\//, { timeout: 60000 }).catch(() => null),
    ]);

    const permalink =
      (await page.locator('a[href*="/p/"]').last().getAttribute("href").catch(() => null)) ||
      (typeof page.url === "function" && /\/p\//.test(page.url()) ? page.url() : null);
    if (!permalink) return {};
    return { permalink: permalink.startsWith("/") ? new URL(permalink, "https://www.instagram.com").toString() : permalink };
  },
};

// TikTok web upload adapter (vertical video reel).
export const tiktokPlatform: SocialPlatform = {
  name: "tiktok",
  sessionFile: ".drax/sessions/tiktok.json",
  loginUrl: "https://www.tiktok.com/login",
  homeUrl: "https://www.tiktok.com/upload",
  async isLoggedIn(page: any): Promise<boolean> {
    if (typeof page.isClosed === "function" && page.isClosed()) return false;
    const url = typeof page.url === "function" ? page.url() : "";
    if (/\/login|\/signup/i.test(url)) return false;
    return (
      (await locatorVisible(page.locator('[data-e2e="upload-icon"], [data-e2e="nav-upload"], [href*="/upload"]'), 750)) ||
      (await locatorVisible(page.getByRole("link", { name: /upload|profile|home/i }), 750)) ||
      (await locatorVisible(page.locator('[data-e2e="user-avatar"], [data-e2e="profile-icon"]'), 750))
    );
  },
  async post(page: any, post: BuiltPost): Promise<{ permalink?: string }> {
    const asset = post.assets[0];
    if (!asset || post.assets.length !== 1 || asset.kind !== "video") {
      throw new Error("TikTok adapter requires exactly one video asset.");
    }

    const input = page.locator('input[type="file"]').first();
    await input.waitFor({ state: "attached", timeout: 30000 });
    await input.setInputFiles(asset.path);

    const filled = await fillFirst(
      [
        page.getByRole("textbox", { name: /caption/i }),
        page.locator('textarea[placeholder*="caption" i]'),
        page.locator("textarea"),
        page.locator('[contenteditable="true"]'),
      ],
      post.caption,
      30000,
    );
    if (!filled) throw new Error("Could not find TikTok caption field.");

    const posted = await clickFirst(
      [
        page.getByRole("button", { name: /^post$/i }),
        page.getByText(/^post$/i),
        page.locator('[data-e2e="post-btn"]'),
      ],
      30000,
    );
    if (!posted) throw new Error("Could not find TikTok Post button.");

    await Promise.race([
      page.getByText(/uploaded|your video has been uploaded|video uploaded/i).first().waitFor({ state: "visible", timeout: 60000 }).catch(() => null),
      page.waitForURL(/\/@[^/]+\/video\//, { timeout: 60000 }).catch(() => null),
    ]);

    const permalink =
      (await page.locator('a[href*="/video/"]').last().getAttribute("href").catch(() => null)) ||
      (typeof page.url === "function" && /\/@[^/]+\/video\//.test(page.url()) ? page.url() : null);
    if (!permalink) return {};
    return { permalink: permalink.startsWith("/") ? new URL(permalink, "https://www.tiktok.com").toString() : permalink };
  },
};

// YouTube Studio upload adapter (vertical ≤60s mp4 is auto-classified as a Short).
export const youtubePlatform: SocialPlatform = {
  name: "youtube",
  sessionFile: ".drax/sessions/youtube.json",
  loginUrl: "https://studio.youtube.com",
  homeUrl: "https://studio.youtube.com/",
  async isLoggedIn(page: any): Promise<boolean> {
    if (typeof page.isClosed === "function" && page.isClosed()) return false;
    const url = typeof page.url === "function" ? page.url() : "";
    if (/accounts\.google\.com|\/signin/i.test(url)) return false;
    return (
      (await locatorVisible(page.locator('[aria-label="Upload video"], ytcp-button[label="Upload video"]'), 750)) ||
      (await locatorVisible(page.locator('#avatar-btn, ytd-topbar-menu-button-renderer'), 750)) ||
      (await locatorVisible(page.locator('yt-icon-button[id="guide-button"]'), 750))
    );
  },
  async post(page: any, post: BuiltPost): Promise<{ permalink?: string }> {
    const asset = post.assets[0];
    if (!asset || post.assets.length !== 1 || asset.kind !== "video") {
      throw new Error("YouTube adapter requires exactly one video asset.");
    }

    const input = page.locator('input[type="file"]').first();
    await input.waitFor({ state: "attached", timeout: 30000 });
    await input.setInputFiles(asset.path);

    // Title field
    const titleFilled = await fillFirst(
      [
        page.getByRole("textbox", { name: /title/i }),
        page.locator('input[id*="title" i], input[aria-label*="title" i]'),
        page.locator('#title-textarea input, ytcp-social-suggestions-textbox[id="title-textarea"] input'),
      ],
      post.caption.split("\n")[0] ?? post.caption,
      30000,
    );
    if (!titleFilled) throw new Error("Could not find YouTube title field.");

    // Description field (optional — best effort)
    await fillFirst(
      [
        page.getByRole("textbox", { name: /description/i }),
        page.locator('textarea[id*="description" i], textarea[aria-label*="description" i]'),
        page.locator('#description-textarea textarea, ytcp-social-suggestions-textbox[id="description-textarea"] textarea'),
        page.locator("textarea").nth(1),
      ],
      post.caption,
      5000,
    );

    const published = await clickFirst(
      [
        page.getByRole("button", { name: /^publish$/i }),
        page.getByText(/^publish$/i),
        page.locator('ytcp-button[label="Publish"], ytcp-button[id="publish-button"]'),
      ],
      30000,
    );
    if (!published) throw new Error("Could not find YouTube Publish button.");

    await Promise.race([
      page.getByText(/published|your video has been published|video published/i).first().waitFor({ state: "visible", timeout: 60000 }).catch(() => null),
      page.waitForURL(/youtube\.com\/(shorts|watch|video)/, { timeout: 60000 }).catch(() => null),
    ]);

    const permalink =
      (await page.locator('a[href*="/shorts/"], a[href*="/watch?v="]').last().getAttribute("href").catch(() => null)) ||
      (typeof page.url === "function" && /youtube\.(test|com)\/(shorts|watch)/.test(page.url()) ? page.url() : null);
    if (!permalink) return {};
    return { permalink: permalink.startsWith("/") ? new URL(permalink, "https://www.youtube.com").toString() : permalink };
  },
};

// Instagram Reels adapter — reuses the same .drax/sessions/instagram.json session as instagramPlatform (#31a).
export const instagramReelsPlatform: SocialPlatform = {
  name: "instagram-reels",
  sessionFile: ".drax/sessions/instagram.json",
  loginUrl: "https://www.instagram.com/accounts/login/",
  homeUrl: "https://www.instagram.com/",
  async isLoggedIn(page: any): Promise<boolean> {
    return instagramPlatform.isLoggedIn(page);
  },
  async post(page: any, post: BuiltPost): Promise<{ permalink?: string }> {
    const asset = post.assets[0];
    if (!asset || post.assets.length !== 1 || asset.kind !== "video") {
      throw new Error("Instagram Reels adapter requires exactly one video asset.");
    }
    if (await instagramRequiresManualVerification(page)) {
      throw new Error("Instagram requires manual verification - complete it via `drax distribute login --platform instagram-reels`.");
    }

    await clickFirst(
      [
        page.getByRole("button", { name: /create|new post/i }),
        page.getByRole("link", { name: /create|new post/i }),
        page.getByText(/create|new post/i),
        page.locator('[aria-label="Create"], [aria-label="New post"]'),
      ],
      10000,
    );

    const input = page.locator('input[type="file"]').first();
    await input.waitFor({ state: "attached", timeout: 30000 });
    await input.setInputFiles(asset.path);

    await clickFirst([page.getByRole("button", { name: /^next$/i }), page.getByText(/^next$/i)], 5000);
    await clickFirst([page.getByRole("button", { name: /^next$/i }), page.getByText(/^next$/i)], 5000);

    const filled = await fillFirst(
      [
        page.getByRole("textbox", { name: /caption|write a caption/i }),
        page.locator('textarea[aria-label*="caption" i]'),
        page.locator("textarea"),
        page.locator('[contenteditable="true"]'),
      ],
      post.caption,
      30000,
    );
    if (!filled) throw new Error("Could not find Instagram Reels caption field.");

    const shared = await clickFirst([page.getByRole("button", { name: /^share$/i }), page.getByText(/^share$/i)], 30000);
    if (!shared) throw new Error("Could not find Instagram Reels Share button.");

    await Promise.race([
      page.getByText(/reel|posted|shared|your reel has been shared/i).first().waitFor({ state: "visible", timeout: 60000 }).catch(() => null),
      page.waitForURL(/\/reel\//, { timeout: 60000 }).catch(() => null),
    ]);

    const permalink =
      (await page.locator('a[href*="/reel/"]').last().getAttribute("href").catch(() => null)) ||
      (typeof page.url === "function" && /\/reel\//.test(page.url()) ? page.url() : null);
    if (!permalink) return {};
    return { permalink: permalink.startsWith("/") ? new URL(permalink, "https://www.instagram.com").toString() : permalink };
  },
};
