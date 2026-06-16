#!/usr/bin/env node
// Deterministic command. Prints the Drax command reference. No external deps.
// Invoked by the `drax` skill when the user runs `$drax help`.

const VERSION = "1.1.7";

const SKILL_COMMANDS = [
  ["$drax", "Start or resume the organic automation system: founder interview -> 12 baseline artifacts -> reviewable daily run."],
  ["$drax-map", "Show the installed system map: pipeline sectors, artifact status in this workspace, gates, and triggers."],
  ["$drax-help", "Show this command reference."],
  ["$drax map", "Alias for $drax-map."],
  ["$drax help", "Alias for $drax-help."],
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
  "DRAX — a self-hosted company that runs itself.",
  "",
  "134 agents organized like a real enterprise — strategy, product, design,",
  "marketing, sales, finance, security — each modeled on how a real employee",
  "decides and acts. Hand it your product knowledge and the organization shapes",
  "your brand and offer, turns it into articles, social posts, images and video,",
  "and distributes them automatically to grow your audience organically — then",
  "builds toward paid ads and scaling techniques on top.",
  "",
  "The belief: anyone should be able to run the company they always dreamed of —",
  "working for your success and for the customers you serve, 24/7, on any device.",
  "Every move is reviewable and gate-checked: it researches, drafts and dry-runs;",
  "you approve what goes live.",
  "",
  block("In a Codex session (skill commands):", SKILL_COMMANDS),
  "",
  ...CLI_NOTE,
  "",
  block("Updating Drax (Codex-native plugin upgrade):", UPDATE_COMMANDS),
  "",
  "Activation: Drax only loads its context inside a Drax workspace (a folder with a",
  ".drax/ directory or the baseline artifacts). Other sessions stay clean.",
].join("\n");

process.stdout.write(out + "\n");
