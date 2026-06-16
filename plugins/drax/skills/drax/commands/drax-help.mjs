#!/usr/bin/env node
// Deterministic command. Prints the Drax command reference. No external deps.
// Invoked by the `drax` skill when the user runs `$drax help`.

const VERSION = "1.1.5";

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
  "Drax is a self-hosted organic-automation runtime: it interviews you, turns your",
  "product knowledge into a 90-post editorial system, and runs a gated daily publish loop.",
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
