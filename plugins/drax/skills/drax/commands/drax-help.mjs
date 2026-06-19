#!/usr/bin/env node
// Deterministic command. Prints the Drax command reference. No external deps.
// Invoked by the `drax` skill when the user runs `$drax help`.

const VERSION = "1.1.25";

const SKILL_COMMANDS = [
  ["$drax", "Start or resume the organic automation system: founder interview -> 14 baseline artifacts -> reviewable daily run."],
  ["$drax-map", "Show the installed system map: pipeline sectors, artifact status in this workspace, gates, and triggers."],
  ["$drax-orq", "Introspect the real orchestration engine: live 4-stage pipeline, run state, and the honest authority model."],
  ["$drax-orq-overview", "Show the high-level founder→published journey with live status, no agent detail."],
  ["$drax-help", "Show this command reference."],
  ["$drax map", "Alias for $drax-map."],
  ["$drax help", "Alias for $drax-help."],
];

const RESUME_NOTE = [
  "Resuming an interview:",
  "  Run $drax in a workspace that already has the baseline artifacts and DRAX",
  "  resumes where you stopped: it reads EXECUTION_STATE.md, confirms what is",
  "  already settled and what is still open, and continues with the next open",
  "  decision instead of asking your name again. Say \"start over\" to begin fresh.",
];

const CLI_NOTE = [
  "Standalone shell CLI:",
  "  The standalone `drax ...` CLI is available only after a standalone install (`drax install`).",
  "  It is not part of a Codex-only plugin session. Run `drax --help` in a shell for that surface.",
];

const UPDATE_COMMANDS = [
  ["codex plugin marketplace upgrade drax", "Refresh the Drax marketplace snapshot from its source (pulls the newest published build)."],
  ["codex plugin add drax@drax", "Reinstall Drax from the refreshed snapshot so the new version becomes active."],
  ["codex plugin list", "Confirm the active Drax version after the upgrade."],
];

function pad(s, n) {
  return s + " ".repeat(Math.max(0, n - s.length));
}

function block(title, rows) {
  const width = Math.max(...rows.map(([c]) => c.length));
  const lines = rows.map(([c, d]) => `  ${pad(c, width)}   ${d}`);
  return [title, ...lines].join("\n");
}

const out = [
  `DRAX v${VERSION} - command reference`,
  "",
  "DR△X is an enterprise operating architecture for agentic execution. It",
  "maps AI onto the structure of a company, with executive direction,",
  "departmental ownership, managerial coordination and specialist execution.",
  "",
  "Founder vision becomes organizational direction. That direction is",
  "distributed across accountable domains such as strategy, product,",
  "technology, marketing, revenue, finance, security, operations and legal,",
  "each operating through scoped context, reviewable artifacts and reporting",
  "paths.",
  "",
  "The result is coherent enterprise execution: plans, workflows, product",
  "decisions, content systems, distribution loops, financial models,",
  "compliance records and investor readiness produced from the same",
  "organizational substrate.",
  "",
  block("In a Codex session (skill commands):", SKILL_COMMANDS),
  "",
  ...RESUME_NOTE,
  "",
  ...CLI_NOTE,
  "",
  block("Updating Drax (Codex-native plugin upgrade):", UPDATE_COMMANDS),
  "",
  "Activation: Drax only loads its context inside a Drax workspace (a folder with a",
  ".drax/ directory or the baseline artifacts). Other sessions stay clean.",
].join("\n");

process.stdout.write(out + "\n");
