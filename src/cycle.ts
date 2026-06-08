import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

type CycleMode = "dry-run" | "publish";
type RunStatus = "PENDING" | "PUBLISHED" | "FAILED";
type PublishResult = "pending" | "succeeded" | "failed" | "rolled-back";

type CycleOptions = {
  cwd: string;
  cliPath: string;
  nodePath: string;
  env: NodeJS.ProcessEnv;
};

type CycleConfig = {
  manualCommand: string;
  clockSchedule: string;
  schedulerTimezone: string;
  cloneLocation: string;
  runDirectory: string;
  logDirectory: string;
  publishRecordDirectory: string;
  blogSurfaceDirectory: string;
  lockMode: "fail-fast";
  publishRecordFormat: "json";
  dryRunDefault: boolean;
};

type ExecutionState = {
  schemaVersion: "1.0.0";
  currentPhase: string;
  publishingMode: CycleMode;
  videoEngine: string;
  activeVersion: string;
  nextPostIndex: number;
  lastRunId: string | null;
  lastPublishedAt: string | null;
  config: CycleConfig;
  completed: string[];
  inProgress: string[];
  blocked: string[];
  nextGate: string;
  lastDecisions: Array<{
    date: string;
    artifact: string;
    decision: string;
    owner: string;
    revisitTrigger: string;
  }>;
};

type ContentPackage = {
  schemaVersion: "1.0.0";
  packageId: string;
  postClass: string;
  postIndex: number;
  title: string;
  description: string;
  slug: string;
  tags: string[];
  articlePath: string;
  proofNote: string;
};

type HashedFile = {
  path: string;
  sha256: string;
  mediaType?: string;
};

type RunManifest = {
  schemaVersion: "1.0.0";
  runId: string;
  mode: CycleMode;
  trigger: "manual" | "clock";
  startedAt: string;
  endedAt: string | null;
  postClass: string;
  postIndex: number;
  contentPackagePath: string | null;
  articlePath: string | null;
  assetManifestPath: string | null;
  artifactHash: string | null;
  publishRecordPath: string | null;
  status: RunStatus;
  failureReason: string | null;
  published: boolean;
};

type PublishRecord = {
  schemaVersion: "1.0.0";
  attemptId: string;
  runId: string;
  assetId: string;
  postClass: string;
  adapter: "local-blog";
  adapterVersion: string;
  mode: "dry-run" | "local-blog-deploy";
  targetAccount: string;
  approval: {
    approvedBy: string;
    approvedAt: string;
  };
  requestedAt: string;
  result: PublishResult;
  evidencePath: string;
  contentPackagePath: string;
  artifactHashes: HashedFile[];
  publishTarget: {
    kind: "blog-surface";
    path: string;
    slug: string;
  };
  dryRun: boolean;
};

const STATE_JSON = "EXECUTION_STATE.json";
const STATE_MD = "EXECUTION_STATE.md";
const CLONE_MARKER = ".drax-cycle-clone";
const DEFAULT_CONFIG: CycleConfig = {
  manualCommand: "drax cycle --dry-run",
  clockSchedule: "NEEDS_DECISION",
  schedulerTimezone: "NEEDS_DECISION",
  cloneLocation: ".drax/worktrees/current",
  runDirectory: ".drax/runs",
  logDirectory: ".drax/logs",
  publishRecordDirectory: ".drax/publish-records",
  blogSurfaceDirectory: "drax-blog",
  lockMode: "fail-fast",
  publishRecordFormat: "json",
  dryRunDefault: true,
};

const WORKSPACE_ARTIFACTS = [
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
  "EXECUTION_STATE.json",
];

class CycleError extends Error {
  constructor(readonly errors: string[]) {
    super(errors.join("\n"));
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

function writeJson(file: string, value: unknown): void {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, "utf8"));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function needsDecision(value: string | null | undefined): boolean {
  return !value || value.trim() === "" || value.trim() === "NEEDS_DECISION";
}

function resolveWorkspacePath(cwd: string, value: string): string {
  return path.isAbsolute(value) ? path.resolve(value) : path.resolve(cwd, value);
}

function relativePath(base: string, target: string): string {
  return path.relative(base, target).replaceAll(path.sep, "/") || ".";
}

function isInside(parent: string, child: string): boolean {
  const relative = path.relative(parent, child);
  return relative === "" || (!!relative && !relative.startsWith("..") && !path.isAbsolute(relative));
}

function fileStamp(date: Date): string {
  return date.toISOString().replaceAll(/[:.]/g, "-");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "")
    .slice(0, 80);
}

function sha256File(file: string): string {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function renderExecutionState(state: ExecutionState, reviewedAt: string): string {
  const decisions = state.lastDecisions.length
    ? state.lastDecisions
        .map(
          (entry) =>
            `| ${entry.date} | ${entry.artifact} | ${entry.decision} | ${entry.owner} | ${entry.revisitTrigger} |`,
        )
        .join("\n")
    : "|  |  |  |  |  |";

  return [
    "# Execution State",
    "",
    `Current phase: ${state.currentPhase}`,
    `Publishing mode: ${state.publishingMode}`,
    `Video engine: ${state.videoEngine}`,
    `Last reviewed: ${reviewedAt}`,
    "",
    "## Runtime Configuration",
    "",
    `- Primary language: NEEDS_DECISION`,
    `- Daily clock trigger: ${state.config.clockSchedule}`,
    `- Manual trigger: ${state.config.manualCommand}`,
    `- Publishing adapter: local-blog-deploy`,
    `- Isolated environment: ${state.config.cloneLocation}`,
    `- Environment reference: ${STATE_JSON}`,
    `- Scheduler timezone: ${state.config.schedulerTimezone}`,
    `- Next post index: ${state.nextPostIndex}`,
    `- Last run ID: ${state.lastRunId ?? ""}`,
    `- Last published at: ${state.lastPublishedAt ?? ""}`,
    "",
    "## Completed",
    "",
    ...state.completed.map((entry) => `- ${entry}`),
    "",
    "## In Progress",
    "",
    ...state.inProgress.map((entry) => `- ${entry}`),
    "",
    "## Blocked",
    "",
    ...state.blocked.map((entry) => `- ${entry}`),
    "",
    "## Next Gate",
    "",
    state.nextGate,
    "",
    "## Last Decisions",
    "",
    "| Date | Artifact | Decision | Owner | Revisit trigger |",
    "|---|---|---|---|---|",
    decisions,
    "",
  ].join("\n");
}

function parseExecutionState(cwd: string): ExecutionState {
  const statePath = path.join(cwd, STATE_JSON);
  if (!existsSync(statePath)) {
    throw new CycleError([`Missing ${STATE_JSON}. Run \`drax init\` from the founder workspace before running a cycle.`]);
  }

  const parsed = readJson(statePath);
  if (!isRecord(parsed)) throw new CycleError([`${STATE_JSON} must be a JSON object.`]);
  if (parsed.schemaVersion !== "1.0.0") throw new CycleError([`${STATE_JSON} schemaVersion must be 1.0.0.`]);

  const config = isRecord(parsed.config) ? parsed.config : {};
  const errors: string[] = [];
  const state: ExecutionState = {
    schemaVersion: "1.0.0",
    currentPhase: nonEmptyString(parsed.currentPhase) ? parsed.currentPhase : "qualification",
    publishingMode: parsed.publishingMode === "publish" ? "publish" : "dry-run",
    videoEngine: nonEmptyString(parsed.videoEngine) ? parsed.videoEngine : "python-ffmpeg",
    activeVersion: nonEmptyString(parsed.activeVersion) ? parsed.activeVersion : "1.1.0",
    nextPostIndex: typeof parsed.nextPostIndex === "number" ? parsed.nextPostIndex : 1,
    lastRunId: nonEmptyString(parsed.lastRunId) ? parsed.lastRunId : null,
    lastPublishedAt: nonEmptyString(parsed.lastPublishedAt) ? parsed.lastPublishedAt : null,
    config: {
      manualCommand: nonEmptyString(config.manualCommand) ? config.manualCommand : DEFAULT_CONFIG.manualCommand,
      clockSchedule: nonEmptyString(config.clockSchedule) ? config.clockSchedule : DEFAULT_CONFIG.clockSchedule,
      schedulerTimezone: nonEmptyString(config.schedulerTimezone)
        ? config.schedulerTimezone
        : DEFAULT_CONFIG.schedulerTimezone,
      cloneLocation: nonEmptyString(config.cloneLocation) ? config.cloneLocation : DEFAULT_CONFIG.cloneLocation,
      runDirectory: nonEmptyString(config.runDirectory) ? config.runDirectory : DEFAULT_CONFIG.runDirectory,
      logDirectory: nonEmptyString(config.logDirectory) ? config.logDirectory : DEFAULT_CONFIG.logDirectory,
      publishRecordDirectory: nonEmptyString(config.publishRecordDirectory)
        ? config.publishRecordDirectory
        : DEFAULT_CONFIG.publishRecordDirectory,
      blogSurfaceDirectory: nonEmptyString(config.blogSurfaceDirectory)
        ? config.blogSurfaceDirectory
        : DEFAULT_CONFIG.blogSurfaceDirectory,
      lockMode: "fail-fast",
      publishRecordFormat: "json",
      dryRunDefault: config.dryRunDefault === false ? false : true,
    },
    completed: Array.isArray(parsed.completed) ? parsed.completed.filter(nonEmptyString) : [],
    inProgress: Array.isArray(parsed.inProgress) ? parsed.inProgress.filter(nonEmptyString) : [],
    blocked: Array.isArray(parsed.blocked) ? parsed.blocked.filter(nonEmptyString) : [],
    nextGate: nonEmptyString(parsed.nextGate) ? parsed.nextGate : "NEEDS_DECISION",
    lastDecisions: Array.isArray(parsed.lastDecisions)
      ? parsed.lastDecisions.filter(isRecord).map((entry) => ({
          date: nonEmptyString(entry.date) ? entry.date : "NEEDS_DECISION",
          artifact: nonEmptyString(entry.artifact) ? entry.artifact : "NEEDS_DECISION",
          decision: nonEmptyString(entry.decision) ? entry.decision : "NEEDS_DECISION",
          owner: nonEmptyString(entry.owner) ? entry.owner : "NEEDS_DECISION",
          revisitTrigger: nonEmptyString(entry.revisitTrigger) ? entry.revisitTrigger : "NEEDS_DECISION",
        }))
      : [],
  };

  if (!Number.isInteger(state.nextPostIndex) || state.nextPostIndex < 1) {
    errors.push(`${STATE_JSON} nextPostIndex must be a positive integer.`);
  }
  for (const [label, value] of [
    ["cloneLocation", state.config.cloneLocation],
    ["runDirectory", state.config.runDirectory],
    ["logDirectory", state.config.logDirectory],
    ["publishRecordDirectory", state.config.publishRecordDirectory],
    ["blogSurfaceDirectory", state.config.blogSurfaceDirectory],
  ] as const) {
    if (needsDecision(value)) errors.push(`${STATE_JSON} config.${label} must be decided before the trigger runs.`);
  }

  if (errors.length) throw new CycleError(errors);
  return state;
}

function writeExecutionState(cwd: string, state: ExecutionState, reviewedAt: string): void {
  writeJson(path.join(cwd, STATE_JSON), state);
  writeFileSync(path.join(cwd, STATE_MD), renderExecutionState(state, reviewedAt), "utf8");
}

function requireGitRepoRoot(cwd: string): void {
  const result = spawnSync("git", ["rev-parse", "--show-toplevel"], { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    throw new CycleError(["Drax cycle requires a git repository workspace so actions can run on an isolated clone."]);
  }
  const root = path.resolve(result.stdout.trim());
  if (root !== path.resolve(cwd)) {
    throw new CycleError([`Run Drax cycle from the workspace git root: ${root}`]);
  }
}

function copyWorkspaceInputs(source: string, clone: string, blogSurfaceDirectory: string): void {
  for (const artifact of WORKSPACE_ARTIFACTS) {
    const sourceFile = path.join(source, artifact);
    if (!existsSync(sourceFile)) continue;
    const targetFile = path.join(clone, artifact);
    mkdirSync(path.dirname(targetFile), { recursive: true });
    copyFileSync(sourceFile, targetFile);
  }

  const blogSource = resolveWorkspacePath(source, blogSurfaceDirectory);
  const blogTarget = resolveWorkspacePath(clone, blogSurfaceDirectory);
  if (existsSync(blogSource) && isInside(source, blogSource) && !isInside(path.join(source, ".drax"), blogSource)) {
    rmSync(blogTarget, { recursive: true, force: true });
    cpSync(blogSource, blogTarget, { recursive: true, force: true });
  }
}

function prepareClone(cwd: string, cloneLocation: string, blogSurfaceDirectory: string): string {
  requireGitRepoRoot(cwd);
  const cloneDir = resolveWorkspacePath(cwd, cloneLocation);
  const generatedRoot = path.resolve(cwd, ".drax");
  if (!isInside(generatedRoot, cloneDir)) {
    throw new CycleError(["config.cloneLocation must stay inside .drax/ so the live workspace is not modified."]);
  }

  if (existsSync(cloneDir)) {
    const marker = path.join(cloneDir, CLONE_MARKER);
    if (!existsSync(marker)) {
      throw new CycleError([`Refusing to replace unmarked clone directory: ${cloneDir}`]);
    }
    rmSync(cloneDir, { recursive: true, force: true });
  }

  mkdirSync(path.dirname(cloneDir), { recursive: true });
  const result = spawnSync("git", ["clone", "--local", "--no-hardlinks", cwd, cloneDir], {
    cwd,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new CycleError([`git clone failed for isolated cycle workspace.`, result.stderr.trim()].filter(Boolean));
  }
  writeFileSync(path.join(cloneDir, CLONE_MARKER), "Generated by Drax cycle.\n", "utf8");
  copyWorkspaceInputs(cwd, cloneDir, blogSurfaceDirectory);
  return cloneDir;
}

function nextPostClass(cwd: string, index: number): string {
  const plan = path.join(cwd, "NINETY_POST_PLAN.md");
  if (!existsSync(plan)) return `post-${index}`;
  const lines = readFileSync(plan, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && !line.includes("---"));
  for (const line of lines) {
    const cells = line
      .split("|")
      .map((cell) => cell.trim())
      .filter(Boolean);
    if (!cells.length) continue;
    if (cells.some((cell) => cell === String(index))) {
      return slugify(cells.find((cell) => cell !== String(index)) ?? `post-${index}`) || `post-${index}`;
    }
  }
  return `post-${index}`;
}

function createInitialManifest(runId: string, mode: CycleMode, postIndex: number, postClass: string, now: string): RunManifest {
  return {
    schemaVersion: "1.0.0",
    runId,
    mode,
    trigger: process.env.DRAX_TRIGGER_SOURCE === "clock" ? "clock" : "manual",
    startedAt: now,
    endedAt: null,
    postClass,
    postIndex,
    contentPackagePath: null,
    articlePath: null,
    assetManifestPath: null,
    artifactHash: null,
    publishRecordPath: null,
    status: "PENDING",
    failureReason: null,
    published: false,
  };
}

function manifestPath(runRoot: string, manifest: RunManifest): string {
  const statusDir = manifest.status === "PUBLISHED" ? "published" : manifest.status === "FAILED" ? "failed" : "pending";
  return path.join(runRoot, statusDir, `${manifest.runId}.json`);
}

function writeManifest(runRoot: string, manifest: RunManifest): string {
  for (const dir of ["pending", "published", "failed"]) {
    const target = path.join(runRoot, dir, `${manifest.runId}.json`);
    if (existsSync(target)) rmSync(target, { force: true });
  }
  const target = manifestPath(runRoot, manifest);
  writeJson(target, manifest);
  return target;
}

function buildCyclePrompt(input: {
  mode: CycleMode;
  runId: string;
  postIndex: number;
  postClass: string;
  articlePath: string;
  packagePath: string;
}): string {
  return [
    "Run the Drax V1 blog content engine in headless mode.",
    "",
    "Rules:",
    "- Do not ask questions. This is codex exec, so there is no human interaction.",
    "- Read the founder artifacts in this workspace.",
    "- Do not publish live, call third-party APIs, spend money, or request secret values.",
    "- If a founder fact is missing, write NEEDS_DECISION in the content package rather than inventing it.",
    "- Generate only the next blog content package for the local blog surface.",
    "- Include an explicit line beginning with `Proof note:` in the article body.",
    "",
    "Write these files. They are the source of truth for the trigger engine:",
    `- Article Markdown: ${input.articlePath}`,
    `- Content package JSON: ${input.packagePath}`,
    "",
    "The content package JSON must contain:",
    "- schemaVersion: 1.0.0",
    `- packageId: ${input.runId}`,
    `- postClass: ${input.postClass}`,
    `- postIndex: ${input.postIndex}`,
    "- title, description, slug, tags, articlePath, proofNote",
    "",
    `Mode: ${input.mode}`,
    `Run ID: ${input.runId}`,
  ].join("\n");
}

function invokeCodexExec(input: {
  cloneDir: string;
  logDir: string;
  runWorkDir: string;
  runId: string;
  mode: CycleMode;
  postIndex: number;
  postClass: string;
  env: NodeJS.ProcessEnv;
}): { articlePath: string; packagePath: string; finalMessagePath: string; logPath: string } {
  mkdirSync(input.runWorkDir, { recursive: true });
  mkdirSync(input.logDir, { recursive: true });

  const articlePath = path.join(input.runWorkDir, "article.md");
  const packagePath = path.join(input.runWorkDir, "content-package.json");
  const finalMessagePath = path.join(input.logDir, `${input.runId}.final.txt`);
  const logPath = path.join(input.logDir, `${input.runId}.codex.log`);
  const prompt = buildCyclePrompt({
    mode: input.mode,
    runId: input.runId,
    postIndex: input.postIndex,
    postClass: input.postClass,
    articlePath,
    packagePath,
  });
  const binary = input.env.DRAX_CODEX_BIN || "codex";
  const result = spawnSync(
    binary,
    ["exec", "--sandbox", "workspace-write", "--cd", input.cloneDir, "--output-last-message", finalMessagePath, prompt],
    {
      cwd: input.cloneDir,
      encoding: "utf8",
      env: {
        ...input.env,
        DRAX_CYCLE_MODE: input.mode,
        DRAX_CYCLE_RUN_ID: input.runId,
        DRAX_CYCLE_ARTICLE_PATH: articlePath,
        DRAX_CYCLE_PACKAGE_PATH: packagePath,
      },
    },
  );

  writeFileSync(
    logPath,
    [
      `command: ${binary} exec --sandbox workspace-write --cd ${input.cloneDir}`,
      `status: ${result.status ?? "error"}`,
      "",
      "[stdout]",
      result.stdout,
      "",
      "[stderr]",
      result.stderr,
      "",
      result.error ? `[error]\n${result.error.message}\n` : "",
    ].join("\n"),
    "utf8",
  );

  if (result.error) {
    throw new CycleError([
      result.error.message.includes("ENOENT")
        ? "Codex CLI was not found. Add Codex to PATH or set DRAX_CODEX_BIN."
        : result.error.message,
    ]);
  }
  if (result.status !== 0) {
    throw new CycleError([`codex exec failed for run ${input.runId}. See ${logPath}`]);
  }
  if (!existsSync(articlePath)) throw new CycleError([`Content engine did not write article: ${articlePath}`]);
  if (!existsSync(packagePath)) throw new CycleError([`Content engine did not write package JSON: ${packagePath}`]);

  return { articlePath, packagePath, finalMessagePath, logPath };
}

function parseContentPackage(packagePath: string, articlePath: string, postIndex: number): ContentPackage {
  const parsed = readJson(packagePath);
  if (!isRecord(parsed)) throw new CycleError(["Content package must be a JSON object."]);

  const errors: string[] = [];
  const packageRecord: ContentPackage = {
    schemaVersion: "1.0.0",
    packageId: nonEmptyString(parsed.packageId) ? parsed.packageId : "",
    postClass: nonEmptyString(parsed.postClass) ? parsed.postClass : "",
    postIndex: typeof parsed.postIndex === "number" ? parsed.postIndex : postIndex,
    title: nonEmptyString(parsed.title) ? parsed.title : "",
    description: nonEmptyString(parsed.description) ? parsed.description : "",
    slug: nonEmptyString(parsed.slug) ? slugify(parsed.slug) : "",
    tags: Array.isArray(parsed.tags) ? parsed.tags.filter(nonEmptyString) : [],
    articlePath: nonEmptyString(parsed.articlePath) ? parsed.articlePath : articlePath,
    proofNote: nonEmptyString(parsed.proofNote) ? parsed.proofNote : "",
  };

  if (parsed.schemaVersion !== "1.0.0") errors.push("Content package schemaVersion must be 1.0.0.");
  for (const [field, value] of [
    ["packageId", packageRecord.packageId],
    ["postClass", packageRecord.postClass],
    ["title", packageRecord.title],
    ["description", packageRecord.description],
    ["slug", packageRecord.slug],
    ["proofNote", packageRecord.proofNote],
  ] as const) {
    if (needsDecision(value)) errors.push(`Content package ${field} must be decided.`);
  }
  if (packageRecord.postIndex !== postIndex) {
    errors.push(`Content package postIndex ${packageRecord.postIndex} does not match execution state ${postIndex}.`);
  }

  const resolvedArticle = path.resolve(path.dirname(packagePath), packageRecord.articlePath);
  if (path.resolve(articlePath) !== resolvedArticle && path.resolve(packageRecord.articlePath) !== path.resolve(articlePath)) {
    errors.push("Content package articlePath does not match the generated article path.");
  }

  if (errors.length) throw new CycleError(errors);
  return packageRecord;
}

function writeAssetManifest(runWorkDir: string, runId: string, files: HashedFile[]): string {
  const assetManifest = {
    schemaVersion: "1.0.0",
    assetId: runId,
    briefId: runId,
    renderer: "svg",
    rendererVersion: "drax-cycle-1.0.0",
    inputs: files,
    outputs: files,
    channels: ["local-blog"],
  };
  const target = path.join(runWorkDir, "asset-manifest.json");
  writeJson(target, assetManifest);
  return target;
}

function verifyAssetHashes(files: HashedFile[], baseDir: string): void {
  const errors: string[] = [];
  for (const file of files) {
    const target = path.isAbsolute(file.path) ? file.path : path.resolve(baseDir, file.path);
    if (!existsSync(target)) {
      errors.push(`Missing hashed artifact: ${file.path}`);
      continue;
    }
    const actual = sha256File(target);
    if (actual !== file.sha256) errors.push(`Hash mismatch for ${file.path}.`);
  }
  if (errors.length) throw new CycleError(errors);
}

function artifactField(content: string, label: string): string | null {
  const escaped = label.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = content.match(new RegExp(`^-\\s+${escaped}:\\s*(.*)$`, "im"));
  const value = match?.[1]?.trim();
  return value || null;
}

function readArtifact(cwd: string, file: string): string {
  const target = path.join(cwd, file);
  return existsSync(target) ? readFileSync(target, "utf8") : "";
}

function distributionBlogSurface(cloneDir: string, state: ExecutionState): string {
  const plan = readArtifact(cloneDir, "DISTRIBUTION_PLAN.md");
  return artifactField(plan, "Blog surface target directory") || state.config.blogSurfaceDirectory;
}

function duplicatePublished(cwd: string, publishRecordDir: string, postClass: string): string | null {
  const root = resolveWorkspacePath(cwd, publishRecordDir);
  if (!existsSync(root)) return null;
  for (const entry of readdirSync(root)) {
    if (!entry.endsWith(".json")) continue;
    const target = path.join(root, entry);
    try {
      const parsed = readJson(target);
      if (!isRecord(parsed)) continue;
      if (parsed.postClass === postClass && parsed.result === "succeeded" && parsed.mode !== "dry-run") {
        return target;
      }
    } catch {
      return target;
    }
  }
  return null;
}

function runSafetyGates(input: {
  mode: CycleMode;
  originalCwd: string;
  publishRecordDirectory: string;
  articlePath: string;
  packagePath: string;
  contentPackage: ContentPackage;
  hashes: HashedFile[];
}): void {
  const article = readFileSync(input.articlePath, "utf8");
  const packageText = readFileSync(input.packagePath, "utf8");
  const combined = `${article}\n${packageText}`;
  const errors: string[] = [];

  const forbiddenPatterns: Array<[RegExp, string]> = [
    [/\brevolutionary\b/i, "forbidden hype claim: revolutionary"],
    [/\bovernight[-\s]?money\b/i, "forbidden overnight-money claim"],
    [/\bfake urgency\b/i, "forbidden fake urgency claim"],
    [/\binvented client stor(y|ies)\b/i, "forbidden invented client story"],
    [/\bfake customer(s)?\b/i, "forbidden fake customer claim"],
    [/\bguaranteed\s+(income|revenue|results|growth)\b/i, "forbidden guarantee claim"],
  ];

  for (const [pattern, message] of forbiddenPatterns) {
    if (pattern.test(combined)) errors.push(message);
  }
  if (!/^Proof note:/im.test(article)) errors.push("Article must contain a `Proof note:` line.");
  if (combined.includes("NEEDS_DECISION")) errors.push("Generated content still contains NEEDS_DECISION.");

  const duplicate = duplicatePublished(input.originalCwd, input.publishRecordDirectory, input.contentPackage.postClass);
  if (input.mode === "publish" && duplicate) {
    errors.push(`Duplicate publication refused for ${input.contentPackage.postClass}: ${duplicate}`);
  }

  try {
    verifyAssetHashes(input.hashes, path.dirname(input.packagePath));
  } catch (error) {
    if (error instanceof CycleError) errors.push(...error.errors);
    else errors.push(error instanceof Error ? error.message : String(error));
  }

  if (errors.length) throw new CycleError(errors);
}

function publishBlogArtifact(input: {
  mode: CycleMode;
  cloneDir: string;
  state: ExecutionState;
  articlePath: string;
  contentPackage: ContentPackage;
}): { targetPath: string; published: boolean } {
  const surface = distributionBlogSurface(input.cloneDir, input.state);
  if (needsDecision(surface)) throw new CycleError(["Blog surface target directory must be decided before publishing."]);

  const surfaceDir = resolveWorkspacePath(input.cloneDir, surface);
  if (!isInside(input.cloneDir, surfaceDir)) {
    throw new CycleError(["Blog surface target directory must be relative to the isolated clone."]);
  }

  const postDir = path.join(surfaceDir, "src", "content", "posts");
  const targetPath = path.join(postDir, `${input.contentPackage.slug}.md`);

  if (input.mode === "dry-run") {
    return { targetPath, published: false };
  }

  if (!existsSync(postDir)) {
    throw new CycleError([`Blog posts directory is missing in isolated clone: ${postDir}`]);
  }
  if (existsSync(targetPath)) {
    throw new CycleError([`Refusing to overwrite existing blog post: ${targetPath}`]);
  }
  mkdirSync(postDir, { recursive: true });
  copyFileSync(input.articlePath, targetPath);
  return { targetPath, published: true };
}

function writePublishRecord(input: {
  cwd: string;
  state: ExecutionState;
  manifest: RunManifest;
  mode: CycleMode;
  contentPackage: ContentPackage;
  articlePath: string;
  packagePath: string;
  targetPath: string;
  hashes: HashedFile[];
  requestedAt: string;
}): string {
  const record: PublishRecord = {
    schemaVersion: "1.0.0",
    attemptId: input.manifest.runId,
    runId: input.manifest.runId,
    assetId: input.contentPackage.packageId,
    postClass: input.contentPackage.postClass,
    adapter: "local-blog",
    adapterVersion: "1.0.0",
    mode: input.mode === "dry-run" ? "dry-run" : "local-blog-deploy",
    targetAccount: "local-blog-surface",
    approval: {
      approvedBy: input.mode === "dry-run" ? "dry-run" : "operator-command",
      approvedAt: input.requestedAt,
    },
    requestedAt: input.requestedAt,
    result: "succeeded",
    evidencePath: relativePath(input.cwd, input.articlePath),
    contentPackagePath: relativePath(input.cwd, input.packagePath),
    artifactHashes: input.hashes,
    publishTarget: {
      kind: "blog-surface",
      path: relativePath(input.cwd, input.targetPath),
      slug: input.contentPackage.slug,
    },
    dryRun: input.mode === "dry-run",
  };
  const target = path.join(resolveWorkspacePath(input.cwd, input.state.config.publishRecordDirectory), `${input.manifest.runId}.json`);
  writeJson(target, record);
  return target;
}

function verifyPublishRecord(recordPath: string, hashes: HashedFile[], baseDir: string): void {
  const parsed = readJson(recordPath);
  if (!isRecord(parsed)) throw new CycleError(["Publish record must be a JSON object."]);
  if (parsed.schemaVersion !== "1.0.0") throw new CycleError(["Publish record schemaVersion must be 1.0.0."]);
  if (parsed.result !== "succeeded") throw new CycleError(["Publish record result is not succeeded."]);
  verifyAssetHashes(hashes, baseDir);
}

function executeCycle(args: string[], options: CycleOptions): number {
  const publish = hasFlag(args, "--publish");
  const dryRun = hasFlag(args, "--dry-run");
  if (publish && dryRun) throw new CycleError(["Use either --dry-run or --publish, not both."]);

  const state = parseExecutionState(options.cwd);
  const mode: CycleMode = publish ? "publish" : dryRun ? "dry-run" : state.config.dryRunDefault ? "dry-run" : state.publishingMode;
  const now = new Date();
  const startedAt = now.toISOString();
  const runId = `${fileStamp(now)}-${mode}`;
  const runRoot = resolveWorkspacePath(options.cwd, state.config.runDirectory);
  const logDir = resolveWorkspacePath(options.cwd, state.config.logDirectory);
  const postIndex = state.nextPostIndex;
  const postClass = optionValue(args, "--post-class") || nextPostClass(options.cwd, postIndex);
  let manifest = createInitialManifest(runId, mode, postIndex, postClass, startedAt);
  let manifestFile = writeManifest(runRoot, manifest);

  try {
    const cloneDir = prepareClone(options.cwd, state.config.cloneLocation, state.config.blogSurfaceDirectory);
    const runWorkDir = path.join(cloneDir, ".drax", "run-work", runId);
    const codexResult = invokeCodexExec({
      cloneDir,
      logDir,
      runWorkDir,
      runId,
      mode,
      postIndex,
      postClass,
      env: options.env,
    });
    const contentPackage = parseContentPackage(codexResult.packagePath, codexResult.articlePath, postIndex);
    const hashes: HashedFile[] = [
      {
        path: relativePath(path.dirname(codexResult.packagePath), codexResult.articlePath),
        sha256: sha256File(codexResult.articlePath),
        mediaType: "text/markdown",
      },
      {
        path: relativePath(path.dirname(codexResult.packagePath), codexResult.packagePath),
        sha256: sha256File(codexResult.packagePath),
        mediaType: "application/json",
      },
    ];
    const assetManifestPath = writeAssetManifest(runWorkDir, runId, hashes);
    runSafetyGates({
      mode,
      originalCwd: options.cwd,
      publishRecordDirectory: state.config.publishRecordDirectory,
      articlePath: codexResult.articlePath,
      packagePath: codexResult.packagePath,
      contentPackage,
      hashes,
    });
    const published = publishBlogArtifact({
      mode,
      cloneDir,
      state,
      articlePath: codexResult.articlePath,
      contentPackage,
    });
    const publishRecordPath = writePublishRecord({
      cwd: options.cwd,
      state,
      manifest,
      mode,
      contentPackage,
      articlePath: codexResult.articlePath,
      packagePath: codexResult.packagePath,
      targetPath: published.targetPath,
      hashes,
      requestedAt: startedAt,
    });
    verifyPublishRecord(publishRecordPath, hashes, path.dirname(codexResult.packagePath));

    manifest = {
      ...manifest,
      endedAt: new Date().toISOString(),
      contentPackagePath: relativePath(options.cwd, codexResult.packagePath),
      articlePath: relativePath(options.cwd, codexResult.articlePath),
      assetManifestPath: relativePath(options.cwd, assetManifestPath),
      artifactHash: sha256File(codexResult.articlePath),
      publishRecordPath: relativePath(options.cwd, publishRecordPath),
      status: published.published ? "PUBLISHED" : "PENDING",
      published: published.published,
    };
    manifestFile = writeManifest(runRoot, manifest);

    if (published.published) {
      state.nextPostIndex += 1;
      state.lastPublishedAt = startedAt;
      state.lastRunId = runId;
      state.publishingMode = "publish";
      writeExecutionState(options.cwd, state, new Date().toISOString());
    }

    console.log(`Drax cycle ${mode} passed.`);
    console.log(`Run manifest: ${manifestFile}`);
    console.log(`Publish record: ${publishRecordPath}`);
    if (mode === "dry-run") console.log(`Would publish blog post: ${published.targetPath}`);
    else console.log(`Published blog post in isolated clone: ${published.targetPath}`);
    return 0;
  } catch (error) {
    const errors = error instanceof CycleError ? error.errors : [error instanceof Error ? error.message : String(error)];
    manifest = {
      ...manifest,
      endedAt: new Date().toISOString(),
      status: "FAILED",
      failureReason: errors.join("\n"),
      published: false,
    };
    manifestFile = writeManifest(runRoot, manifest);
    console.error([`Drax cycle failed.`, ...errors, `Run manifest: ${manifestFile}`].join("\n"));
    return 1;
  }
}

function runWithFlock(args: string[], options: CycleOptions): number {
  const lockDir = path.join(options.cwd, ".drax", "locks");
  mkdirSync(lockDir, { recursive: true });
  const lockPath = path.join(lockDir, "cycle.lock");
  const result = spawnSync("flock", ["-E", "66", "-n", lockPath, options.nodePath, options.cliPath, "cycle", ...args], {
    cwd: options.cwd,
    stdio: "inherit",
    env: { ...options.env, DRAX_CYCLE_LOCKED: "1" },
  });
  if (result.error) {
    console.error(
      result.error.message.includes("ENOENT")
        ? "flock is required for Drax cycle locking and was not found."
        : result.error.message,
    );
    return 1;
  }
  if (result.status === 66) {
    console.error("Drax cycle is already running. The lock is held, so this invocation exits without work.");
  }
  return result.status ?? 1;
}

export function runCycleCommand(args: string[], options: CycleOptions): number {
  if (args[0] === "cron") return printCronCommand(args.slice(1), options);
  if (options.env.DRAX_CYCLE_LOCKED === "1") return executeCycle(args, options);
  return runWithFlock(args, options);
}

export function printCronCommand(args: string[], options: CycleOptions): number {
  try {
    const state = parseExecutionState(options.cwd);
    const mode = hasFlag(args, "--publish") ? "--publish" : hasFlag(args, "--dry-run") ? "--dry-run" : `--${state.publishingMode}`;
    const schedule = state.config.clockSchedule;
    const timezone = state.config.schedulerTimezone;
    const command = `$HOME/.local/bin/drax cycle ${mode}`;
    const cronLog = path.join(state.config.logDirectory, "cron.log");
    if (needsDecision(schedule)) {
      console.log("Clock schedule is NEEDS_DECISION in EXECUTION_STATE.json.");
    }
    if (needsDecision(timezone)) {
      console.log("Scheduler timezone is NEEDS_DECISION in EXECUTION_STATE.json.");
    }
    console.log("# Add this to the founder workspace crontab after schedule and timezone are decided.");
    console.log("SHELL=/bin/sh");
    console.log('PATH="$HOME/.local/bin:/usr/local/bin:/usr/bin:/bin"');
    if (!needsDecision(timezone)) console.log(`CRON_TZ=${timezone}`);
    console.log(`${needsDecision(schedule) ? "0 6 * * *" : schedule} cd "${options.cwd}" && ${command} >> "${cronLog}" 2>&1`);
    return 0;
  } catch (error) {
    const errors = error instanceof CycleError ? error.errors : [error instanceof Error ? error.message : String(error)];
    console.error(errors.join("\n"));
    return 1;
  }
}
