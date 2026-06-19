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
import { fileURLToPath } from "node:url";

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

type SectorEvidence = {
  stage: string;
  role: string;
  artifactPath: string;
  sha256: string;
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
  sector?: SectorEvidence[];
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
  images: SocialImageResult;
  video: SocialVideoResult;
  carousel: SocialCarouselResult;
};

type SocialImageStatus = "generated" | "skipped-dry-run" | "skipped-no-python" | "error";

type SocialImageResult = {
  status: SocialImageStatus;
  vertical?: string;
  square?: string;
  error?: string;
};

type SocialVideoStatus = "generated" | "skipped-dry-run" | "skipped-no-python" | "skipped-no-ffmpeg" | "error";

type SocialVideoResult = {
  status: SocialVideoStatus;
  reel?: string;
  error?: string;
};

type SocialCarouselStatus = "generated" | "skipped-dry-run" | "skipped-no-python" | "error";
type SocialCarouselRasterStatus = "generated" | "skipped-no-rasterizer" | "skipped-rasterizer-error";

type SocialCarouselResult = {
  status: SocialCarouselStatus;
  slides?: number;
  rasterized?: boolean;
  rasterStatus?: SocialCarouselRasterStatus;
  svgs?: string[];
  pngs?: string[];
  error?: string;
};

const STATE_JSON = "EXECUTION_STATE.json";
const STATE_MD = "EXECUTION_STATE.md";
const CLONE_MARKER = ".drax-cycle-clone";
const DEFAULT_STAGE_TIMEOUT_MS = 1_200_000;
const currentFile = fileURLToPath(import.meta.url);
const packageRoot = path.resolve(path.dirname(currentFile), "..");
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
  "EXECUTION_STATE.json",
];
const FOUNDER_ARTIFACTS = WORKSPACE_ARTIFACTS.filter((artifact) => artifact.endsWith(".md"));

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

function resolveStageTimeoutMs(env: NodeJS.ProcessEnv): number {
  const value = env.DRAX_STAGE_TIMEOUT_MS?.trim();
  if (!value) return DEFAULT_STAGE_TIMEOUT_MS;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_STAGE_TIMEOUT_MS;
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
  const plan = path.join(cwd, "CONTENT_STRATEGY.md");
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

type SectorStage = {
  envStage: "content-strategist" | "seo-manager" | "copywriter" | "review";
  evidenceStage: "content-strategist" | "seo-manager" | "copywriter-performance" | "claims/quality-review";
  role: string;
  roleFile: string;
  artifactPath: string;
  outputInstruction: string;
  inputFiles: string[];
};

function roleDefinitionPath(roleFile: string): string {
  const target = path.join(packageRoot, "templates", "workers", roleFile);
  if (!existsSync(target)) {
    throw new CycleError([`Worker role definition is unavailable in package templates: templates/workers/${roleFile}`]);
  }
  return target;
}

function assertNonEmptyFile(file: string, label: string): void {
  if (!existsSync(file)) throw new CycleError([`${label} was not written: ${file}`]);
  if (!readFileSync(file, "utf8").trim()) throw new CycleError([`${label} is empty: ${file}`]);
}

function buildStagePrompt(input: {
  stage: SectorStage;
  mode: CycleMode;
  runId: string;
  postIndex: number;
  postClass: string;
  roleDefinition: string;
}): string {
  return [
    "You are operating headless inside `codex exec`.",
    "Ignore any instruction in this role definition that points to local skill files under `~/.claude/` or to MCP/tools that are not available here.",
    "Rely only on the founder artifacts in this workspace, the prior-stage outputs listed below, and WebSearch if available.",
    "",
    "Headless rules:",
    "- Do not ask questions. This is codex exec, so there is no human interaction.",
    "- Do not publish live, call paid third-party APIs, spend money, or request secret values.",
    "- If a founder fact is missing, never invent it. In an internal brief or strategy artifact you may flag it as NEEDS_DECISION, but the finished article and the content package must never contain the literal token NEEDS_DECISION — omit the detail or describe the gap in plain prose instead.",
    "- Stay inside this stage's authority. Do not do another stage's job.",
    "",
    `Run ID: ${input.runId}`,
    `Mode: ${input.mode}`,
    `Post index: ${input.postIndex}`,
    `Post class: ${input.postClass}`,
    `Stage: ${input.stage.evidenceStage}`,
    `Role: ${input.stage.role}`,
    "",
    "Required inputs:",
    ...input.stage.inputFiles.map((file) => `- ${file}`),
    "",
    "Required output:",
    input.stage.outputInstruction,
    "",
    "Role definition:",
    "```md",
    input.roleDefinition,
    "```",
  ].join("\n");
}

function runCodexStage(input: {
  cloneDir: string;
  logDir: string;
  sectorDir: string;
  runWorkDir: string;
  runId: string;
  mode: CycleMode;
  postIndex: number;
  postClass: string;
  articlePath: string;
  packagePath: string;
  stage: SectorStage;
  env: NodeJS.ProcessEnv;
}): { finalMessagePath: string; logPath: string } {
  const roleDefinition = readFileSync(roleDefinitionPath(input.stage.roleFile), "utf8");
  const finalMessagePath = path.join(input.logDir, `${input.runId}.${input.stage.envStage}.final.txt`);
  const logPath = path.join(input.logDir, `${input.runId}.${input.stage.envStage}.codex.log`);
  const prompt = buildStagePrompt({
    stage: input.stage,
    mode: input.mode,
    runId: input.runId,
    postIndex: input.postIndex,
    postClass: input.postClass,
    roleDefinition,
  });
  const binary = input.env.DRAX_CODEX_BIN || "codex";
  // Codex sandbox policy. Default "workspace-write" (bubblewrap-isolated) is the
  // safe choice on normal hosts. On hosts that cannot create user/net namespaces
  // (containerized VPS without CAP_NET_ADMIN/unprivileged-userns), bubblewrap
  // fails ("loopback: RTM_NEWADDR" / "setting up uid map") and every sector
  // file-write is blocked. Such trusted hosts set DRAX_CODEX_SANDBOX=danger-full-access.
  const sandboxMode = input.env.DRAX_CODEX_SANDBOX || "workspace-write";
  const timeoutMs = resolveStageTimeoutMs(input.env);
  const startedAt = Date.now();
  const result = spawnSync(
    binary,
    ["exec", "--sandbox", sandboxMode, "--cd", input.cloneDir, "--output-last-message", finalMessagePath, prompt],
    {
      cwd: input.cloneDir,
      encoding: "utf8",
      timeout: timeoutMs,
      killSignal: "SIGKILL",
      // Codex exec streams reasoning + content to stdout, which routinely exceeds
      // Node's 1 MB spawnSync default and aborts the run with ENOBUFS. The
      // authoritative output is also written to --output-last-message, but the
      // captured stdout/stderr feed the run log, so allow a generous ceiling.
      maxBuffer: 1024 * 1024 * 256,
      env: {
        ...input.env,
        DRAX_CYCLE_MODE: input.mode,
        DRAX_CYCLE_RUN_ID: input.runId,
        DRAX_CYCLE_STAGE: input.stage.envStage,
        DRAX_CYCLE_SECTOR_DIR: input.sectorDir,
        DRAX_CYCLE_ARTICLE_PATH: input.articlePath,
        DRAX_CYCLE_PACKAGE_PATH: input.packagePath,
      },
    },
  );
  const elapsedMs = Date.now() - startedAt;
  const errorCode = (result.error as NodeJS.ErrnoException | undefined)?.code;
  const timedOut = Boolean(result.error) && (result.signal === "SIGKILL" || errorCode === "ETIMEDOUT" || elapsedMs >= timeoutMs);
  const timeoutMarker = timedOut
    ? `[timeout] killed after ${elapsedMs} ms (budget ${timeoutMs} ms, signal ${result.signal ?? "SIGKILL"})`
    : "";

  writeFileSync(
    logPath,
    [
      `command: ${binary} exec --sandbox ${sandboxMode} --cd ${input.cloneDir}`,
      `stage: ${input.stage.envStage}`,
      `status: ${result.status ?? "error"}`,
      "",
      "[stdout]",
      result.stdout,
      "",
      "[stderr]",
      result.stderr,
      "",
      timeoutMarker,
      "",
      result.error ? `[error]\n${result.error.message}\n` : "",
    ].join("\n"),
    "utf8",
  );

  if (timedOut) {
    throw new CycleError([
      `codex exec stage ${input.stage.envStage} in run ${input.runId} exceeded the ${timeoutMs} ms budget and was killed (fail-closed). See ${logPath}.`,
    ]);
  }
  if (result.error) {
    throw new CycleError([
      result.error.message.includes("ENOENT")
        ? "Codex CLI was not found. Add Codex to PATH or set DRAX_CODEX_BIN."
        : result.error.message,
    ]);
  }
  if (result.status !== 0) {
    throw new CycleError([`codex exec failed for stage ${input.stage.envStage} in run ${input.runId}. See ${logPath}`]);
  }
  assertNonEmptyFile(input.stage.artifactPath, `Sector stage ${input.stage.evidenceStage} artifact`);
  return { finalMessagePath, logPath };
}

function sectorEvidence(packagePath: string, stage: SectorStage): SectorEvidence {
  return {
    stage: stage.evidenceStage,
    role: stage.role,
    artifactPath: relativePath(path.dirname(packagePath), stage.artifactPath),
    sha256: sha256File(stage.artifactPath),
  };
}

function verifySectorEvidence(packagePath: string, expected: SectorEvidence[]): void {
  const parsed = readJson(packagePath);
  if (!isRecord(parsed)) throw new CycleError(["Content package must be a JSON object before sector verification."]);
  if (!Array.isArray(parsed.sector)) throw new CycleError(["Content package sector evidence block is missing."]);

  const errors: string[] = [];
  if (parsed.sector.length !== expected.length) {
    errors.push(`Content package sector evidence must contain ${expected.length} stages.`);
  }
  for (const [index, required] of expected.entries()) {
    const actual = parsed.sector[index];
    if (!isRecord(actual)) {
      errors.push(`Content package sector[${index}] must be an object.`);
      continue;
    }
    if (actual.stage !== required.stage) errors.push(`Content package sector[${index}].stage must be ${required.stage}.`);
    if (actual.role !== required.role) errors.push(`Content package sector[${index}].role must be ${required.role}.`);
    if (!nonEmptyString(actual.artifactPath)) errors.push(`Content package sector[${index}].artifactPath is required.`);
    if (!nonEmptyString(actual.sha256)) errors.push(`Content package sector[${index}].sha256 is required.`);
    if (actual.artifactPath !== required.artifactPath || actual.sha256 !== required.sha256) {
      errors.push(`Content package sector[${index}] does not match recorded artifact evidence.`);
      continue;
    }
    const artifact = path.resolve(path.dirname(packagePath), actual.artifactPath);
    if (!existsSync(artifact)) {
      errors.push(`Content package sector[${index}] artifact is missing: ${actual.artifactPath}`);
    } else if (sha256File(artifact) !== actual.sha256) {
      errors.push(`Content package sector[${index}] artifact hash mismatch: ${actual.artifactPath}`);
    }
  }
  if (errors.length) throw new CycleError(errors);
}

function writeSectorEvidence(packagePath: string, sector: SectorEvidence[]): void {
  const parsed = readJson(packagePath);
  if (!isRecord(parsed)) throw new CycleError(["Content package must be a JSON object before sector evidence is recorded."]);
  writeJson(packagePath, { ...parsed, sector });
  verifySectorEvidence(packagePath, sector);
}

function assertReviewPassed(reviewPath: string): void {
  const review = readFileSync(reviewPath, "utf8");
  if (!/^VERDICT:\s*PASS\b/im.test(review)) {
    const failure = review.match(/^VERDICT:\s*FAIL.*$/im)?.[0] ?? "Review verdict is missing.";
    throw new CycleError([`Claims/quality review failed: ${failure}`]);
  }
}

function combineStageOutputs(target: string, files: string[], label: string): void {
  const parts = files.map((file) => {
    const content = existsSync(file) ? readFileSync(file, "utf8") : "";
    return [`[${label}: ${path.basename(file)}]`, content].join("\n");
  });
  writeFileSync(target, `${parts.join("\n\n")}\n`, "utf8");
}

function runSector(input: {
  cloneDir: string;
  logDir: string;
  runWorkDir: string;
  runId: string;
  mode: CycleMode;
  postIndex: number;
  postClass: string;
  env: NodeJS.ProcessEnv;
}): { articlePath: string; packagePath: string; finalMessagePath: string; logPath: string; sector: SectorEvidence[] } {
  mkdirSync(input.runWorkDir, { recursive: true });
  mkdirSync(input.logDir, { recursive: true });

  const articlePath = path.join(input.runWorkDir, "article.md");
  const packagePath = path.join(input.runWorkDir, "content-package.json");
  const sectorDir = path.join(input.runWorkDir, "sector");
  const finalMessagePath = path.join(input.logDir, `${input.runId}.final.txt`);
  const logPath = path.join(input.logDir, `${input.runId}.codex.log`);
  mkdirSync(sectorDir, { recursive: true });

  const contentBriefPath = path.join(sectorDir, "01-content-brief.md");
  const seoBriefPath = path.join(sectorDir, "02-seo-brief.md");
  const reviewPath = path.join(sectorDir, "04-review.md");
  const stages: SectorStage[] = [
    {
      envStage: "content-strategist",
      evidenceStage: "content-strategist",
      role: "content-strategist",
      roleFile: "content-strategist.md",
      artifactPath: contentBriefPath,
      inputFiles: FOUNDER_ARTIFACTS,
      outputInstruction: `Write the strategic angle and content brief for this post to ${contentBriefPath}. Do not write finished copy.`,
    },
    {
      envStage: "seo-manager",
      evidenceStage: "seo-manager",
      role: "seo-manager",
      roleFile: "seo-manager.md",
      artifactPath: seoBriefPath,
      inputFiles: [...FOUNDER_ARTIFACTS, contentBriefPath],
      outputInstruction: [
        `Write the SEO/GEO brief to ${seoBriefPath}.`,
        "Include target keywords, search intent, JSON-LD schema type, question-formatted H2s, entity blocks, citation points, and at least 3 quotable statistics.",
        "Do not write finished article copy.",
      ].join(" "),
    },
    {
      envStage: "copywriter",
      evidenceStage: "copywriter-performance",
      role: "copywriter-performance",
      roleFile: "copywriter-performance.md",
      artifactPath: articlePath,
      inputFiles: [contentBriefPath, seoBriefPath],
      outputInstruction: [
        `Write the final article to ${articlePath}.`,
        `Write the content package JSON to ${packagePath}.`,
        'Set the package field `articlePath` to exactly "article.md" (the article is written in the same directory as the package).',
        'The package must include packageId, postClass, postIndex, title, description, slug, tags, articlePath, and proofNote, and set schemaVersion to the exact literal string "1.0.0" (the content-package protocol version, which is NOT the DRAX product version).',
        "The article body must include a line beginning with `Proof note:`.",
        "Neither the article nor the content package (including the proofNote field) may contain the literal token NEEDS_DECISION; if a fact is undecided, omit it or describe the gap in plain prose.",
        "The exact primary keyword from the SEO brief's `target_keywords.primary` must appear verbatim at least once, woven in naturally without stuffing — either in the article body or in the content package title or description.",
        "If the SEO brief's `schema_types` includes `FAQPage`, the article must contain a visibly labeled FAQ section whose questions and answers map to the brief's `question_h2s`; never declare or imply FAQPage schema without that visible section.",
      ].join(" "),
    },
    {
      envStage: "review",
      evidenceStage: "claims/quality-review",
      role: "claims/quality-review",
      roleFile: "claims-quality-reviewer.md",
      artifactPath: reviewPath,
      inputFiles: [articlePath, contentBriefPath, seoBriefPath],
      outputInstruction: [
        `Inspect the article and write the claims and quality review to ${reviewPath}.`,
        "The first verdict line must be `VERDICT: PASS` or `VERDICT: FAIL - <rule>`.",
        "Do not rewrite the article.",
      ].join(" "),
    },
  ];
  const sector: SectorEvidence[] = [];
  const finalMessageFiles: string[] = [];
  const logFiles: string[] = [];

  for (const stage of stages) {
    const result = runCodexStage({
      cloneDir: input.cloneDir,
      logDir: input.logDir,
      sectorDir,
      runWorkDir: input.runWorkDir,
      runId: input.runId,
      mode: input.mode,
      postIndex: input.postIndex,
      postClass: input.postClass,
      articlePath,
      packagePath,
      stage,
      env: input.env,
    });
    finalMessageFiles.push(result.finalMessagePath);
    logFiles.push(result.logPath);

    if (stage.envStage === "copywriter") {
      assertNonEmptyFile(articlePath, "Content engine article");
      assertNonEmptyFile(packagePath, "Content engine package JSON");
    }
    if (stage.envStage === "review") assertReviewPassed(reviewPath);
    sector.push(sectorEvidence(packagePath, stage));
  }

  writeSectorEvidence(packagePath, sector);
  combineStageOutputs(finalMessagePath, finalMessageFiles, "final-message");
  combineStageOutputs(logPath, logFiles, "codex-log");

  return { articlePath, packagePath, finalMessagePath, logPath, sector };
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

  // schemaVersion is a plugin-owned, single-run protocol stamp (already set to "1.0.0" above), so a
  // model-authored value is normalized rather than gated — the content engine must never block a
  // valid, review-passed post over an internal constant it reproduced as the product version.
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

  // The engine owns the real article path (article.md in the run-work dir) and publishes that path
  // downstream regardless of this field, so accept any model-expressed path that points at the same
  // file — absolute, package-relative, or clone-relative — by also matching on basename. Only a
  // genuinely different file reference (the model wrote a different document) should trip this.
  const resolvedArticle = path.resolve(path.dirname(packagePath), packageRecord.articlePath);
  const articleMatches =
    path.resolve(articlePath) === resolvedArticle ||
    path.resolve(packageRecord.articlePath) === path.resolve(articlePath) ||
    path.basename(packageRecord.articlePath) === path.basename(articlePath);
  if (!articleMatches) {
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
  const plan = readArtifact(cloneDir, "CHANNEL_PLAN.md");
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

function renderBlogPost(articlePath: string, contentPackage: ContentPackage): string {
  // The generated Astro blog declares a content-collection schema that requires title, description,
  // and publishedAt frontmatter, so a raw article body would fail `astro build`. The post layout
  // renders the title as its own <h1>, so strip a leading body H1 to avoid a duplicate title.
  // JSON.stringify yields YAML-safe scalars and a valid flow sequence for tags.
  const body = readFileSync(articlePath, "utf8").replace(/^﻿/, "");
  const withoutLeadingH1 = body.replace(/^\s*#\s+[^\n]*(?:\r?\n)+/, "");
  const frontmatter = [
    "---",
    `title: ${JSON.stringify(contentPackage.title)}`,
    `description: ${JSON.stringify(contentPackage.description)}`,
    `publishedAt: ${JSON.stringify(new Date().toISOString())}`,
    `tags: ${JSON.stringify(contentPackage.tags)}`,
    "---",
    "",
  ].join("\n");
  return `${frontmatter}${withoutLeadingH1}`;
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
  writeFileSync(targetPath, renderBlogPost(input.articlePath, input.contentPackage), "utf8");
  return { targetPath, published: true };
}

function persistPublishedPost(input: {
  cwd: string;
  cloneDir: string;
  state: ExecutionState;
  contentPackage: ContentPackage;
  env: NodeJS.ProcessEnv;
}): { persisted: string[]; committed: boolean } {
  // Durable publish. The cycle generates and validates the post inside a throwaway
  // clone (.drax/worktrees/current) that prepareClone wipes on every run, so without
  // this copy-back the published post never survives into the real workspace. Only
  // runs on a real publish that already passed every gate. Opt out with
  // DRAX_PERSIST_PUBLISH=0.
  if (input.env.DRAX_PERSIST_PUBLISH === "0") return { persisted: [], committed: false };

  const surface = distributionBlogSurface(input.cloneDir, input.state);
  if (needsDecision(surface)) return { persisted: [], committed: false };

  const cloneSurfaceDir = resolveWorkspacePath(input.cloneDir, surface);
  const workspaceSurfaceDir = resolveWorkspacePath(input.cwd, surface);
  if (!isInside(input.cloneDir, cloneSurfaceDir)) return { persisted: [], committed: false };
  if (!isInside(input.cwd, workspaceSurfaceDir)) {
    throw new CycleError(["Blog surface must stay inside the workspace to persist published posts."]);
  }

  const slug = input.contentPackage.slug;
  const persisted: string[] = [];

  const postRel = path.join("src", "content", "posts", `${slug}.md`);
  const postSource = path.join(cloneSurfaceDir, postRel);
  const postTarget = path.join(workspaceSurfaceDir, postRel);
  if (existsSync(postSource)) {
    mkdirSync(path.dirname(postTarget), { recursive: true });
    copyFileSync(postSource, postTarget);
    persisted.push(postTarget);
  }

  // This post's social assets are all "<slug>-" prefixed (image/reel/carousel/story/highlight).
  const assetSourceDir = path.join(cloneSurfaceDir, "src", "assets", "social");
  const assetTargetDir = path.join(workspaceSurfaceDir, "src", "assets", "social");
  if (existsSync(assetSourceDir)) {
    for (const entry of readdirSync(assetSourceDir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.startsWith(`${slug}-`)) continue;
      mkdirSync(assetTargetDir, { recursive: true });
      copyFileSync(path.join(assetSourceDir, entry.name), path.join(assetTargetDir, entry.name));
      persisted.push(path.join(assetTargetDir, entry.name));
    }
  }

  // Commit the persisted artifacts to the workspace repo: gives published posts a real
  // history and feeds them into future clones (copyWorkspaceInputs cpSyncs the surface).
  // Scoped to only these files so engine state files never ride along. A non-git
  // workspace just keeps the copied files. Opt out with DRAX_PERSIST_COMMIT=0.
  let committed = false;
  if (persisted.length > 0 && input.env.DRAX_PERSIST_COMMIT !== "0") {
    const relPaths = persisted.map((file) => path.relative(input.cwd, file));
    const add = spawnSync("git", ["add", "--", ...relPaths], { cwd: input.cwd, encoding: "utf8" });
    if (add.status === 0) {
      const commit = spawnSync("git", ["commit", "-m", `drax: publish ${slug}`, "--", ...relPaths], {
        cwd: input.cwd,
        encoding: "utf8",
      });
      committed = commit.status === 0;
    }
  }

  return { persisted, committed };
}

function stderrTail(value: string | null | undefined): string {
  const text = (value || "").trim();
  if (!text) return "";
  return text.split(/\r?\n/).slice(-8).join("\n");
}

function socialImageWarning(message: string): void {
  console.warn(`Drax social images: ${message}`);
}

function writeSocialImageLog(input: {
  logDir: string;
  runId: string;
  lines: string[];
  stdout?: string | undefined;
  stderr?: string | undefined;
  error?: string | undefined;
}): string {
  mkdirSync(input.logDir, { recursive: true });
  const logPath = path.join(input.logDir, `${input.runId}.social-images.log`);
  writeFileSync(
    logPath,
    [
      ...input.lines,
      "",
      "[stdout]",
      input.stdout ?? "",
      "",
      "[stderr]",
      input.stderr ?? "",
      "",
      input.error ? `[error]\n${input.error}\n` : "",
    ].join("\n"),
    "utf8",
  );
  return logPath;
}

function socialImageError(input: {
  logDir: string;
  runId: string;
  message: string;
  lines?: string[];
  stdout?: string | undefined;
  stderr?: string | undefined;
  error?: string | undefined;
}): SocialImageResult {
  const logPath = writeSocialImageLog({
    logDir: input.logDir,
    runId: input.runId,
    lines: input.lines ?? [`status: error`, `message: ${input.message}`],
    stdout: input.stdout,
    stderr: input.stderr,
    error: input.error,
  });
  const detail = `${input.message} See ${logPath}`;
  socialImageWarning(detail);
  return { status: "error", error: input.message };
}

function generateSocialImages(input: {
  cwd: string;
  cloneDir: string;
  logDir: string;
  runWorkDir: string;
  runId: string;
  mode: CycleMode;
  published: boolean;
  state: ExecutionState;
  contentPackage: ContentPackage;
  env: NodeJS.ProcessEnv;
}): SocialImageResult {
  try {
    if (input.mode === "dry-run" || !input.published) {
      writeSocialImageLog({
        logDir: input.logDir,
        runId: input.runId,
        lines: [
          "status: skipped-dry-run",
          `mode: ${input.mode}`,
          `published: ${String(input.published)}`,
          "Social images would be generated after a successful publish run.",
        ],
      });
      return { status: "skipped-dry-run" };
    }

    const scriptPath = path.join(packageRoot, "scripts", "social_image.py");
    if (!existsSync(scriptPath)) {
      return socialImageError({
        logDir: input.logDir,
        runId: input.runId,
        message: "scripts/social_image.py is unavailable in this Drax package.",
      });
    }

    const binary = input.env.DRAX_PYTHON_BIN || "python3";
    const pillowProbe = spawnSync(binary, ["-c", "import PIL"], {
      cwd: input.cloneDir,
      encoding: "utf8",
      env: input.env,
    });
    if (pillowProbe.error) {
      writeSocialImageLog({
        logDir: input.logDir,
        runId: input.runId,
        lines: [
          `command: ${binary} -c import PIL`,
          `status: ${pillowProbe.status ?? "error"}`,
        ],
        stdout: pillowProbe.stdout,
        stderr: pillowProbe.stderr,
        error: pillowProbe.error.message,
      });
      if ("code" in pillowProbe.error && pillowProbe.error.code === "ENOENT") {
        socialImageWarning("python3 was not found. Install python3 and Pillow to enable social image generation.");
        return { status: "skipped-no-python" };
      }
      return { status: "error", error: pillowProbe.error.message };
    }
    if (pillowProbe.status !== 0) {
      writeSocialImageLog({
        logDir: input.logDir,
        runId: input.runId,
        lines: [
          `command: ${binary} -c import PIL`,
          `status: ${pillowProbe.status}`,
          "Pillow is unavailable, so social image generation was skipped.",
        ],
        stdout: pillowProbe.stdout,
        stderr: pillowProbe.stderr,
      });
      socialImageWarning("Pillow is not installed. Install with `python3 -m pip install -r requirements.txt` to enable social images.");
      return { status: "skipped-no-python", error: "Pillow is not installed." };
    }

    mkdirSync(input.runWorkDir, { recursive: true });
    const imageInputPath = path.join(input.runWorkDir, "image-input.json");
    writeJson(imageInputPath, {
      title: input.contentPackage.title,
      description: input.contentPackage.description,
      tags: input.contentPackage.tags,
      postClass: input.contentPackage.postClass,
      slug: input.contentPackage.slug,
      brand: {
        bg: [8, 8, 8],
        fg: [237, 232, 223],
        accent: [255, 61, 0],
        dim: [100, 100, 100],
      },
      outDir: input.runWorkDir,
    });

    const result = spawnSync(binary, [scriptPath, imageInputPath], {
      cwd: input.cloneDir,
      encoding: "utf8",
      env: {
        ...input.env,
        DRAX_CYCLE_MODE: input.mode,
        DRAX_CYCLE_RUN_ID: input.runId,
      },
    });

    writeSocialImageLog({
      logDir: input.logDir,
      runId: input.runId,
      lines: [
        `command: ${binary} ${scriptPath} ${imageInputPath}`,
        `status: ${result.status ?? "error"}`,
      ],
      stdout: result.stdout,
      stderr: result.stderr,
      error: result.error?.message,
    });

    if (result.error) {
      if ("code" in result.error && result.error.code === "ENOENT") {
        socialImageWarning("python3 was not found. Install python3 and Pillow to enable social image generation.");
        return { status: "skipped-no-python" };
      }
      return { status: "error", error: result.error.message };
    }
    if (result.status !== 0) {
      const message = stderrTail(result.stderr) || `social image renderer exited with status ${result.status}`;
      socialImageWarning(message);
      return { status: "error", error: message };
    }

    const parsed = JSON.parse(result.stdout.trim());
    if (!isRecord(parsed) || !nonEmptyString(parsed.vertical) || !nonEmptyString(parsed.square)) {
      return socialImageError({
        logDir: input.logDir,
        runId: input.runId,
        message: "social image renderer did not return vertical and square paths.",
        stdout: result.stdout,
        stderr: result.stderr,
      });
    }

    const verticalSource = path.resolve(parsed.vertical);
    const squareSource = path.resolve(parsed.square);
    if (!existsSync(verticalSource) || !existsSync(squareSource)) {
      return socialImageError({
        logDir: input.logDir,
        runId: input.runId,
        message: "social image renderer completed but one or more PNG outputs are missing.",
        stdout: result.stdout,
        stderr: result.stderr,
      });
    }

    const surface = distributionBlogSurface(input.cloneDir, input.state);
    if (needsDecision(surface)) {
      return socialImageError({
        logDir: input.logDir,
        runId: input.runId,
        message: "Blog surface target directory must be decided before social images can be copied.",
      });
    }
    const surfaceDir = resolveWorkspacePath(input.cloneDir, surface);
    if (!isInside(input.cloneDir, surfaceDir)) {
      return socialImageError({
        logDir: input.logDir,
        runId: input.runId,
        message: "Blog surface target directory must be relative to the isolated clone.",
      });
    }

    const assetDir = path.join(surfaceDir, "src", "assets", "social");
    mkdirSync(assetDir, { recursive: true });
    const verticalTarget = path.join(assetDir, `${input.contentPackage.slug}-vertical.png`);
    const squareTarget = path.join(assetDir, `${input.contentPackage.slug}-square.png`);
    copyFileSync(verticalSource, verticalTarget);
    copyFileSync(squareSource, squareTarget);

    return {
      status: "generated",
      vertical: relativePath(input.cwd, verticalTarget),
      square: relativePath(input.cwd, squareTarget),
    };
  } catch (error) {
    return socialImageError({
      logDir: input.logDir,
      runId: input.runId,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

function socialVideoWarning(message: string): void {
  console.warn(`Drax social video: ${message}`);
}

function writeSocialVideoLog(input: {
  logDir: string;
  runId: string;
  lines: string[];
  stdout?: string | undefined;
  stderr?: string | undefined;
  error?: string | undefined;
}): string {
  mkdirSync(input.logDir, { recursive: true });
  const logPath = path.join(input.logDir, `${input.runId}.social-video.log`);
  writeFileSync(
    logPath,
    [
      ...input.lines,
      "",
      "[stdout]",
      input.stdout ?? "",
      "",
      "[stderr]",
      input.stderr ?? "",
      "",
      input.error ? `[error]\n${input.error}\n` : "",
    ].join("\n"),
    "utf8",
  );
  return logPath;
}

function socialVideoError(input: {
  logDir: string;
  runId: string;
  message: string;
  lines?: string[];
  stdout?: string | undefined;
  stderr?: string | undefined;
  error?: string | undefined;
}): SocialVideoResult {
  const logPath = writeSocialVideoLog({
    logDir: input.logDir,
    runId: input.runId,
    lines: input.lines ?? [`status: error`, `message: ${input.message}`],
    stdout: input.stdout,
    stderr: input.stderr,
    error: input.error,
  });
  const detail = `${input.message} See ${logPath}`;
  socialVideoWarning(detail);
  return { status: "error", error: input.message };
}

function generateSocialVideo(input: {
  cwd: string;
  cloneDir: string;
  logDir: string;
  runWorkDir: string;
  runId: string;
  mode: CycleMode;
  published: boolean;
  state: ExecutionState;
  contentPackage: ContentPackage;
  env: NodeJS.ProcessEnv;
}): SocialVideoResult {
  try {
    if (input.mode === "dry-run" || !input.published) {
      writeSocialVideoLog({
        logDir: input.logDir,
        runId: input.runId,
        lines: [
          "status: skipped-dry-run",
          `mode: ${input.mode}`,
          `published: ${String(input.published)}`,
          "Social video would be generated after a successful publish run.",
        ],
      });
      return { status: "skipped-dry-run" };
    }

    const scriptPath = path.join(packageRoot, "scripts", "social_video.py");
    if (!existsSync(scriptPath)) {
      return socialVideoError({
        logDir: input.logDir,
        runId: input.runId,
        message: "scripts/social_video.py is unavailable in this Drax package.",
      });
    }

    const binary = input.env.DRAX_PYTHON_BIN || "python3";
    const pythonProbe = spawnSync(binary, ["--version"], {
      cwd: input.cloneDir,
      encoding: "utf8",
      env: input.env,
    });
    if (pythonProbe.error) {
      writeSocialVideoLog({
        logDir: input.logDir,
        runId: input.runId,
        lines: [
          `command: ${binary} --version`,
          `status: ${pythonProbe.status ?? "error"}`,
        ],
        stdout: pythonProbe.stdout,
        stderr: pythonProbe.stderr,
        error: pythonProbe.error.message,
      });
      if ("code" in pythonProbe.error && pythonProbe.error.code === "ENOENT") {
        socialVideoWarning("python3 was not found. Install python3, Pillow, and ffmpeg to enable social video reels.");
        return { status: "skipped-no-python" };
      }
      return { status: "error", error: pythonProbe.error.message };
    }
    if (pythonProbe.status !== 0) {
      const message = stderrTail(pythonProbe.stderr) || "python3 is unavailable for social video generation.";
      socialVideoWarning(message);
      return { status: "skipped-no-python", error: message };
    }

    const ffmpeg = input.env.DRAX_FFMPEG_BIN || "ffmpeg";
    const ffmpegProbe = spawnSync(ffmpeg, ["-version"], {
      cwd: input.cloneDir,
      encoding: "utf8",
      env: input.env,
    });
    if (ffmpegProbe.error) {
      writeSocialVideoLog({
        logDir: input.logDir,
        runId: input.runId,
        lines: [
          `command: ${ffmpeg} -version`,
          `status: ${ffmpegProbe.status ?? "error"}`,
        ],
        stdout: ffmpegProbe.stdout,
        stderr: ffmpegProbe.stderr,
        error: ffmpegProbe.error.message,
      });
      if ("code" in ffmpegProbe.error && ffmpegProbe.error.code === "ENOENT") {
        socialVideoWarning("ffmpeg was not found. Install ffmpeg to enable social video reels.");
        return { status: "skipped-no-ffmpeg" };
      }
      return { status: "error", error: ffmpegProbe.error.message };
    }
    if (ffmpegProbe.status !== 0) {
      writeSocialVideoLog({
        logDir: input.logDir,
        runId: input.runId,
        lines: [
          `command: ${ffmpeg} -version`,
          `status: ${ffmpegProbe.status}`,
          "ffmpeg is unavailable, so social video generation was skipped.",
        ],
        stdout: ffmpegProbe.stdout,
        stderr: ffmpegProbe.stderr,
      });
      socialVideoWarning("ffmpeg is unavailable. Install ffmpeg to enable social video reels.");
      return { status: "skipped-no-ffmpeg", error: stderrTail(ffmpegProbe.stderr) || "ffmpeg is unavailable." };
    }

    const pillowProbe = spawnSync(binary, ["-c", "import PIL"], {
      cwd: input.cloneDir,
      encoding: "utf8",
      env: input.env,
    });
    if (pillowProbe.error) {
      writeSocialVideoLog({
        logDir: input.logDir,
        runId: input.runId,
        lines: [
          `command: ${binary} -c import PIL`,
          `status: ${pillowProbe.status ?? "error"}`,
        ],
        stdout: pillowProbe.stdout,
        stderr: pillowProbe.stderr,
        error: pillowProbe.error.message,
      });
      if ("code" in pillowProbe.error && pillowProbe.error.code === "ENOENT") {
        socialVideoWarning("python3 was not found. Install python3, Pillow, and ffmpeg to enable social video reels.");
        return { status: "skipped-no-python" };
      }
      return { status: "error", error: pillowProbe.error.message };
    }
    if (pillowProbe.status !== 0) {
      writeSocialVideoLog({
        logDir: input.logDir,
        runId: input.runId,
        lines: [
          `command: ${binary} -c import PIL`,
          `status: ${pillowProbe.status}`,
          "Pillow is unavailable, so social video generation was skipped.",
        ],
        stdout: pillowProbe.stdout,
        stderr: pillowProbe.stderr,
      });
      socialVideoWarning("Pillow is not installed. Install with `python3 -m pip install -r requirements.txt` to enable social video reels.");
      return { status: "skipped-no-python", error: "Pillow is not installed." };
    }

    mkdirSync(input.runWorkDir, { recursive: true });
    const videoInputPath = path.join(input.runWorkDir, "video-input.json");
    writeJson(videoInputPath, {
      title: input.contentPackage.title,
      description: input.contentPackage.description,
      tags: input.contentPackage.tags,
      postClass: input.contentPackage.postClass,
      slug: input.contentPackage.slug,
      brand: {
        bg: [8, 8, 8],
        fg: [237, 232, 223],
        accent: [255, 61, 0],
        dim: [100, 100, 100],
      },
      ffmpegBin: ffmpeg,
      outDir: input.runWorkDir,
    });

    const result = spawnSync(binary, [scriptPath, videoInputPath], {
      cwd: input.cloneDir,
      encoding: "utf8",
      env: {
        ...input.env,
        DRAX_CYCLE_MODE: input.mode,
        DRAX_CYCLE_RUN_ID: input.runId,
      },
    });

    writeSocialVideoLog({
      logDir: input.logDir,
      runId: input.runId,
      lines: [
        `command: ${binary} ${scriptPath} ${videoInputPath}`,
        `status: ${result.status ?? "error"}`,
      ],
      stdout: result.stdout,
      stderr: result.stderr,
      error: result.error?.message,
    });

    if (result.error) {
      if ("code" in result.error && result.error.code === "ENOENT") {
        socialVideoWarning("python3 was not found. Install python3, Pillow, and ffmpeg to enable social video reels.");
        return { status: "skipped-no-python" };
      }
      return { status: "error", error: result.error.message };
    }
    if (result.status !== 0) {
      const message = stderrTail(result.stderr) || `social video renderer exited with status ${result.status}`;
      socialVideoWarning(message);
      return { status: "error", error: message };
    }

    const parsed = JSON.parse(result.stdout.trim());
    if (!isRecord(parsed) || !nonEmptyString(parsed.reel)) {
      return socialVideoError({
        logDir: input.logDir,
        runId: input.runId,
        message: "social video renderer did not return a reel path.",
        stdout: result.stdout,
        stderr: result.stderr,
      });
    }

    const reelSource = path.resolve(parsed.reel);
    if (!existsSync(reelSource)) {
      return socialVideoError({
        logDir: input.logDir,
        runId: input.runId,
        message: "social video renderer completed but the MP4 output is missing.",
        stdout: result.stdout,
        stderr: result.stderr,
      });
    }

    const surface = distributionBlogSurface(input.cloneDir, input.state);
    if (needsDecision(surface)) {
      return socialVideoError({
        logDir: input.logDir,
        runId: input.runId,
        message: "Blog surface target directory must be decided before social video can be copied.",
      });
    }
    const surfaceDir = resolveWorkspacePath(input.cloneDir, surface);
    if (!isInside(input.cloneDir, surfaceDir)) {
      return socialVideoError({
        logDir: input.logDir,
        runId: input.runId,
        message: "Blog surface target directory must be relative to the isolated clone.",
      });
    }

    const assetDir = path.join(surfaceDir, "src", "assets", "social");
    mkdirSync(assetDir, { recursive: true });
    const reelTarget = path.join(assetDir, `${input.contentPackage.slug}-reel.mp4`);
    copyFileSync(reelSource, reelTarget);

    return {
      status: "generated",
      reel: relativePath(input.cwd, reelTarget),
    };
  } catch (error) {
    return socialVideoError({
      logDir: input.logDir,
      runId: input.runId,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

function socialCarouselWarning(message: string): void {
  console.warn(`Drax social carousel: ${message}`);
}

function writeSocialCarouselLog(input: {
  logDir: string;
  runId: string;
  lines: string[];
  stdout?: string | undefined;
  stderr?: string | undefined;
  error?: string | undefined;
}): string {
  mkdirSync(input.logDir, { recursive: true });
  const logPath = path.join(input.logDir, `${input.runId}.social-carousel.log`);
  writeFileSync(
    logPath,
    [
      ...input.lines,
      "",
      "[stdout]",
      input.stdout ?? "",
      "",
      "[stderr]",
      input.stderr ?? "",
      "",
      input.error ? `[error]\n${input.error}\n` : "",
    ].join("\n"),
    "utf8",
  );
  return logPath;
}

function socialCarouselError(input: {
  logDir: string;
  runId: string;
  message: string;
  lines?: string[];
  stdout?: string | undefined;
  stderr?: string | undefined;
  error?: string | undefined;
}): SocialCarouselResult {
  const logPath = writeSocialCarouselLog({
    logDir: input.logDir,
    runId: input.runId,
    lines: input.lines ?? [`status: error`, `message: ${input.message}`],
    stdout: input.stdout,
    stderr: input.stderr,
    error: input.error,
  });
  const detail = `${input.message} See ${logPath}`;
  socialCarouselWarning(detail);
  return { status: "error", error: input.message };
}

function stripMarkdownInline(value: string): string {
  return value
    .replaceAll(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replaceAll(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replaceAll(/[`*_~>#-]+/g, "")
    .replaceAll(/\s+/g, " ")
    .trim();
}

function truncateCarouselPoint(value: string): string {
  const cleaned = stripMarkdownInline(value);
  if (cleaned.length <= 90) return cleaned;
  return `${cleaned.slice(0, 87).replaceAll(/\s+\S*$/g, "").trimEnd()}...`;
}

function firstSentence(value: string): string {
  const cleaned = stripMarkdownInline(value);
  const match = cleaned.match(/^(.+?[.!?])(?:\s|$)/);
  return match?.[1]?.trim() || cleaned;
}

function articleWithoutFrontmatter(article: string): string {
  return article.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
}

function carouselPointsFromArticle(articlePath: string, contentPackage: ContentPackage): string[] {
  const article = articleWithoutFrontmatter(readFileSync(articlePath, "utf8"));
  const headings = article
    .split(/\r?\n/)
    .map((line) => line.match(/^##\s+(.+)$/)?.[1] ?? "")
    .map(truncateCarouselPoint)
    .filter((line) => line && !/^faq$/i.test(line))
    .slice(0, 5);
  if (headings.length >= 2) return headings;

  const paragraphs = article
    .split(/\r?\n\s*\r?\n/)
    .map((part) => part.trim())
    .filter((part) => part && !part.startsWith("#") && !part.startsWith("---"))
    .map((part) => truncateCarouselPoint(firstSentence(part)))
    .filter(Boolean)
    .slice(0, 5);
  if (paragraphs.length) return paragraphs;
  return [truncateCarouselPoint(contentPackage.description || contentPackage.title)];
}

function joinUrl(base: string, ...parts: string[]): string {
  const cleanBase = base.replaceAll(/\/+$/g, "");
  const cleanParts = parts
    .map((part) => part.replaceAll(/^\/+|\/+$/g, ""))
    .filter(Boolean);
  return [cleanBase, ...cleanParts].join("/");
}

function carouselCtaUrl(cloneDir: string, state: ExecutionState, slug: string): string {
  const plan = readArtifact(cloneDir, "CHANNEL_PLAN.md");
  const canonical = artifactField(plan, "Canonical site URL");
  const basePath = artifactField(plan, "Public base path");
  if (canonical && !needsDecision(canonical)) {
    return joinUrl(canonical, basePath && !needsDecision(basePath) ? basePath : "", slug);
  }
  const surface = state.config.blogSurfaceDirectory;
  return joinUrl("/", surface && !needsDecision(surface) ? surface : "", slug);
}

function stringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const entries = value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
  return entries.length === value.length ? entries : null;
}

function socialCarouselTargetName(slug: string, source: string): string {
  const parsed = path.parse(source);
  if (/^carousel-\d{2}$/.test(parsed.name)) return `${slug}-${parsed.base}`;
  if (parsed.name === "story") return `${slug}-story${parsed.ext}`;
  if (parsed.name === "highlight-cover") return `${slug}-highlight${parsed.ext}`;
  return `${slug}-${parsed.base}`;
}

function copySocialCarouselOutputs(input: {
  cwd: string;
  cloneDir: string;
  state: ExecutionState;
  slug: string;
  sources: string[];
}): string[] {
  const surface = distributionBlogSurface(input.cloneDir, input.state);
  if (needsDecision(surface)) throw new Error("Blog surface target directory must be decided before social carousel assets can be copied.");
  const surfaceDir = resolveWorkspacePath(input.cloneDir, surface);
  if (!isInside(input.cloneDir, surfaceDir)) throw new Error("Blog surface target directory must be relative to the isolated clone.");

  const assetDir = path.join(surfaceDir, "src", "assets", "social");
  mkdirSync(assetDir, { recursive: true });
  const targets: string[] = [];
  for (const source of input.sources) {
    const sourcePath = path.resolve(source);
    if (!existsSync(sourcePath)) throw new Error(`social carousel renderer output is missing: ${source}`);
    const target = path.join(assetDir, socialCarouselTargetName(input.slug, path.basename(sourcePath)));
    copyFileSync(sourcePath, target);
    targets.push(relativePath(input.cwd, target));
  }
  return targets;
}

function generateSocialCarousel(input: {
  cwd: string;
  cloneDir: string;
  logDir: string;
  runWorkDir: string;
  runId: string;
  mode: CycleMode;
  published: boolean;
  state: ExecutionState;
  contentPackage: ContentPackage;
  articlePath: string;
  env: NodeJS.ProcessEnv;
}): SocialCarouselResult {
  try {
    if (input.mode === "dry-run" || !input.published) {
      writeSocialCarouselLog({
        logDir: input.logDir,
        runId: input.runId,
        lines: [
          "status: skipped-dry-run",
          `mode: ${input.mode}`,
          `published: ${String(input.published)}`,
          "Social carousel assets would be generated after a successful publish run.",
        ],
      });
      return { status: "skipped-dry-run" };
    }

    const scriptPath = path.join(packageRoot, "scripts", "social_carousel.py");
    if (!existsSync(scriptPath)) {
      return socialCarouselError({
        logDir: input.logDir,
        runId: input.runId,
        message: "scripts/social_carousel.py is unavailable in this Drax package.",
      });
    }

    const binary = input.env.DRAX_PYTHON_BIN || "python3";
    const pythonProbe = spawnSync(binary, ["--version"], {
      cwd: input.cloneDir,
      encoding: "utf8",
      env: input.env,
    });
    if (pythonProbe.error) {
      writeSocialCarouselLog({
        logDir: input.logDir,
        runId: input.runId,
        lines: [
          `command: ${binary} --version`,
          `status: ${pythonProbe.status ?? "error"}`,
        ],
        stdout: pythonProbe.stdout,
        stderr: pythonProbe.stderr,
        error: pythonProbe.error.message,
      });
      if ("code" in pythonProbe.error && pythonProbe.error.code === "ENOENT") {
        socialCarouselWarning("python3 was not found. Install python3 to enable SVG carousel asset generation.");
        return { status: "skipped-no-python" };
      }
      return { status: "error", error: pythonProbe.error.message };
    }
    if (pythonProbe.status !== 0) {
      const message = stderrTail(pythonProbe.stderr) || "python3 is unavailable for social carousel generation.";
      socialCarouselWarning(message);
      return { status: "skipped-no-python", error: message };
    }

    const rsvg = input.env.DRAX_RSVG_BIN || "rsvg-convert";
    let rsvgForRenderer = "";
    let rasterStatus: SocialCarouselRasterStatus = "skipped-no-rasterizer";
    const rsvgProbe = spawnSync(rsvg, ["--version"], {
      cwd: input.cloneDir,
      encoding: "utf8",
      env: input.env,
    });
    if (!rsvgProbe.error && rsvgProbe.status === 0) {
      rsvgForRenderer = rsvg;
      rasterStatus = "generated";
    }

    mkdirSync(input.runWorkDir, { recursive: true });
    const carouselInputPath = path.join(input.runWorkDir, "carousel-input.json");
    writeJson(carouselInputPath, {
      title: input.contentPackage.title,
      description: input.contentPackage.description,
      tags: input.contentPackage.tags,
      points: carouselPointsFromArticle(input.articlePath, input.contentPackage),
      postClass: input.contentPackage.postClass,
      slug: input.contentPackage.slug,
      ctaUrl: carouselCtaUrl(input.cloneDir, input.state, input.contentPackage.slug),
      brand: {
        bg: [8, 8, 8],
        fg: [237, 232, 223],
        accent: [255, 61, 0],
        dim: [100, 100, 100],
      },
      rsvgBin: rsvgForRenderer,
      outDir: input.runWorkDir,
    });

    const result = spawnSync(binary, [scriptPath, carouselInputPath], {
      cwd: input.cloneDir,
      encoding: "utf8",
      env: {
        ...input.env,
        DRAX_CYCLE_MODE: input.mode,
        DRAX_CYCLE_RUN_ID: input.runId,
      },
    });

    writeSocialCarouselLog({
      logDir: input.logDir,
      runId: input.runId,
      lines: [
        `command: ${binary} ${scriptPath} ${carouselInputPath}`,
        `status: ${result.status ?? "error"}`,
        `rsvg: ${rsvgForRenderer || "skipped-no-rasterizer"}`,
      ],
      stdout: result.stdout,
      stderr: result.stderr,
      error: result.error?.message,
    });

    if (result.error) {
      if ("code" in result.error && result.error.code === "ENOENT") {
        socialCarouselWarning("python3 was not found. Install python3 to enable SVG carousel asset generation.");
        return { status: "skipped-no-python" };
      }
      return { status: "error", error: result.error.message };
    }
    if (result.status !== 0) {
      const message = stderrTail(result.stderr) || `social carousel renderer exited with status ${result.status}`;
      socialCarouselWarning(message);
      return { status: "error", error: message };
    }

    const parsed = JSON.parse(result.stdout.trim());
    if (!isRecord(parsed)) {
      return socialCarouselError({
        logDir: input.logDir,
        runId: input.runId,
        message: "social carousel renderer did not return a JSON object.",
        stdout: result.stdout,
        stderr: result.stderr,
      });
    }
    const svgs = stringArray(parsed.svgs);
    const pngs = stringArray(parsed.pngs) ?? [];
    const slides = typeof parsed.slides === "number" && Number.isInteger(parsed.slides) ? parsed.slides : 0;
    if (!svgs || slides < 3 || slides > 7) {
      return socialCarouselError({
        logDir: input.logDir,
        runId: input.runId,
        message: "social carousel renderer did not return SVG paths and a valid slide count.",
        stdout: result.stdout,
        stderr: result.stderr,
      });
    }

    const copiedSvgs = copySocialCarouselOutputs({
      cwd: input.cwd,
      cloneDir: input.cloneDir,
      state: input.state,
      slug: input.contentPackage.slug,
      sources: svgs,
    });
    let copiedPngs: string[] = [];
    if (pngs.length) {
      try {
        copiedPngs = copySocialCarouselOutputs({
          cwd: input.cwd,
          cloneDir: input.cloneDir,
          state: input.state,
          slug: input.contentPackage.slug,
          sources: pngs,
        });
      } catch (error) {
        rasterStatus = "skipped-rasterizer-error";
        socialCarouselWarning(error instanceof Error ? error.message : String(error));
      }
    }
    const rasterized = copiedPngs.length > 0 && parsed.rasterized === true;
    if (!rasterized && rasterStatus === "generated") rasterStatus = "skipped-rasterizer-error";
    if (rasterStatus === "skipped-no-rasterizer") {
      socialCarouselWarning("rsvg-convert was not found; SVG carousel assets generated without PNG rasterization.");
    }

    return {
      status: "generated",
      slides,
      rasterized,
      rasterStatus,
      svgs: copiedSvgs,
      pngs: copiedPngs,
    };
  } catch (error) {
    return socialCarouselError({
      logDir: input.logDir,
      runId: input.runId,
      message: error instanceof Error ? error.message : String(error),
    });
  }
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
  images: SocialImageResult;
  video: SocialVideoResult;
  carousel: SocialCarouselResult;
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
    images: input.images,
    video: input.video,
    carousel: input.carousel,
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
    const codexResult = runSector({
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
    const images = generateSocialImages({
      cwd: options.cwd,
      cloneDir,
      logDir,
      runWorkDir,
      runId,
      mode,
      published: published.published,
      state,
      contentPackage,
      env: options.env,
    });
    const video = generateSocialVideo({
      cwd: options.cwd,
      cloneDir,
      logDir,
      runWorkDir,
      runId,
      mode,
      published: published.published,
      state,
      contentPackage,
      env: options.env,
    });
    const carousel = generateSocialCarousel({
      cwd: options.cwd,
      cloneDir,
      logDir,
      runWorkDir,
      runId,
      mode,
      published: published.published,
      state,
      contentPackage,
      articlePath: codexResult.articlePath,
      env: options.env,
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
      images,
      video,
      carousel,
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
      sector: codexResult.sector,
    };
    manifestFile = writeManifest(runRoot, manifest);

    if (published.published) {
      state.nextPostIndex += 1;
      state.lastPublishedAt = startedAt;
      state.lastRunId = runId;
      state.publishingMode = "publish";
      writeExecutionState(options.cwd, state, new Date().toISOString());

      try {
        const persistence = persistPublishedPost({
          cwd: options.cwd,
          cloneDir,
          state,
          contentPackage,
          env: options.env,
        });
        if (persistence.persisted.length > 0) {
          console.log(
            `Persisted ${persistence.persisted.length} published artifact(s) to workspace${persistence.committed ? " (committed)" : ""}.`,
          );
        } else {
          console.warn("Drax durable publish: nothing copied back (post remains only in the isolated clone).");
        }
      } catch (error) {
        console.warn(
          `Drax durable publish: persist step failed (post remains in isolated clone): ${error instanceof Error ? error.message : String(error)}`,
        );
      }
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
