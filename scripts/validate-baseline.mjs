#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const artifacts = [
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
];

const blankTemplateMarkers = [
  ["FOUNDER_BRAND_BRIEF.md", /^Status:\s*draft\s*$/im, "Status: draft"],
  ["BOARD_MANDATE.md", /^Status:\s*draft\s*$/im, "Status: draft"],
  ["VISION_AND_STRATEGY.md", /^Status:\s*draft\s*$/im, "Status: draft"],
  ["POSITIONING_STATEMENT.md", /^Status:\s*draft\s*$/im, "Status: draft"],
  ["MARKET_LOCALIZATION_STRATEGY.md", /^Status:\s*draft\s*$/im, "Status: draft"],
  ["TECH_DECISION_RECORD.md", /^Status:\s*draft\s*$/im, "Status: draft"],
  ["GTM_STRATEGY.md", /^Status:\s*draft\s*$/im, "Status: draft"],
  ["CONTENT_STRATEGY.md", /^Status:\s*draft\s*$/im, "Status: draft"],
  ["EDITORIAL_CALENDAR.md", /^Status:\s*draft\s*$/im, "Status: draft"],
  ["CHANNEL_PLAN.md", /^Status:\s*dry-run\s*$/im, "Status: dry-run"],
  ["AUTOMATION_RUNBOOK.md", /^Status:\s*draft\s*$/im, "Status: draft"],
  ["RESPONSIBILITY_MATRIX.md", /^Status:\s*draft\s*$/im, "Status: draft"],
  ["MEASUREMENT_FRAMEWORK.md", /^Status:\s*draft\s*$/im, "Status: draft"],
  ["EXECUTION_STATE.md", /^Current phase:\s*qualification\s*$/im, "Current phase: qualification"],
];

const errors = [];
const contents = new Map();

function cleanValue(value) {
  return value
    .trim()
    .replace(/^`+|`+$/g, "")
    .trim();
}

function listField(content, label) {
  const escaped = label.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = content.match(new RegExp(`^-\\s*${escaped}:\\s*(.*)$`, "im"));
  return match ? cleanValue(match[1] ?? "") : null;
}

function customAnswer(content) {
  const match = content.match(/^Custom answer:\s*(.*)$/im);
  if (match?.index === undefined) return null;

  const inline = cleanValue(match[1] ?? "");
  if (inline) return inline;

  const afterLine = content.slice(match.index + match[0].length);
  const nextHeading = afterLine.search(/\n##\s+/);
  const block = nextHeading >= 0 ? afterLine.slice(0, nextHeading) : afterLine;
  return cleanValue(block);
}

function hasAnyDecision(content, labels) {
  return labels.some((label) => {
    const value = label === "Custom answer" ? customAnswer(content) : listField(content, label);
    return value !== null && value.length > 0;
  });
}

for (const artifact of artifacts) {
  const target = path.join(root, artifact);
  if (!fs.existsSync(target)) {
    errors.push(`Missing required artifact: ${artifact}`);
    continue;
  }

  const stat = fs.statSync(target);
  if (!stat.isFile()) {
    errors.push(`Required artifact is not a file: ${artifact}`);
    continue;
  }

  contents.set(artifact, fs.readFileSync(target, "utf8"));
}

for (const [artifact, pattern, marker] of blankTemplateMarkers) {
  const content = contents.get(artifact);
  if (content && pattern.test(content)) {
    errors.push(`${artifact} still has blank-template marker: ${marker}`);
  }
}

for (const [artifact, content] of contents) {
  if (/NEEDS(?:_| )DECISION/i.test(content)) {
    errors.push(`${artifact} still contains NEEDS_DECISION or NEEDS DECISION`);
  }
}

const productContext = contents.get("POSITIONING_STATEMENT.md");
if (productContext) {
  const qualification = listField(productContext, "Qualified for v1 organic automation");
  const normalized = cleanValue(qualification ?? "").toLowerCase();
  if (normalized !== "yes") {
    const current = normalized || "blank";
    errors.push(
      `POSITIONING_STATEMENT.md Qualified for v1 organic automation must resolve to yes before Path 2 starts; current value: ${current}. Path 2 must not start.`,
    );
  }
}

const decisionChecks = [
  ["MARKET_LOCALIZATION_STRATEGY.md", ["Selected option", "Custom answer"]],
  ["TECH_DECISION_RECORD.md", ["Selected option", "Custom answer"]],
  ["GTM_STRATEGY.md", ["Custom answer"]],
  ["CHANNEL_PLAN.md", ["Custom answer"]],
  ["AUTOMATION_RUNBOOK.md", ["Selected option", "Custom answer"]],
];

for (const [artifact, labels] of decisionChecks) {
  const content = contents.get(artifact);
  if (content && !hasAnyDecision(content, labels)) {
    errors.push(`${artifact} has option fields but no non-empty decision recorded.`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Drax baseline validation passed.");
