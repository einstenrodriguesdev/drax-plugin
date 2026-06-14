#!/usr/bin/env node
// Deterministic command. Prints the Drax command reference. No external deps.
// Invoked by the `drax` skill when the user runs `$drax help`.

const VERSION = "1.0.1";

const SKILL_COMMANDS = [
  ["$drax", "Start or resume the organic automation system: founder interview -> 12 baseline artifacts -> reviewable daily run."],
  ["$drax-map", "Show the installed system map: pipeline sectors, artifact status in this workspace, gates, and triggers."],
  ["$drax-help", "Show this command reference."],
  ["$drax map", "Alias for $drax-map."],
  ["$drax help", "Alias for $drax-help."],
];

const CLI_COMMANDS = [
  ["drax", "Start founder intelligence intake in Codex (same brain as $drax, from a shell)."],
  ["drax init", "Copy the 12 baseline artifacts into the current workspace."],
  ["drax blog init", "Generate a self-contained Astro editorial blog surface."],
  ["drax cycle --dry-run", "Run the headless content cycle without publishing."],
  ["drax cycle --publish", "Run the content cycle and write the blog artifact in the isolated clone."],
  ["drax cycle cron", "Print the cron entry for the scheduled daily trigger."],
  ["drax distribute --platform <p>", "Queue a social post draft from the latest publish record (add --confirm to post)."],
  ["drax distribute login --platform <p>", "Open a browser once and save a Playwright session."],
  ["drax status [--json]", "Show funnel layer health (generation, distribution, activation)."],
  ["drax doctor", "Verify the local installation."],
  ["drax prompt \"task\"", "Print a portable Drax prompt."],
  ["drax install --target all", "Install Codex plugin, Claude command, and shell launcher."],
  ["drax --version", "Print version."],
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
  block("In a shell (CLI commands):", CLI_COMMANDS),
  "",
  "Activation: Drax only loads its context inside a Drax workspace (a folder with a",
  ".drax/ directory or the baseline artifacts). Other sessions stay clean.",
].join("\n");

process.stdout.write(out + "\n");
