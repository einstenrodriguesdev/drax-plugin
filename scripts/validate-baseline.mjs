#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const artifacts = [
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
];

const blankTemplateMarkers = [
  ["FOUNDER_PROFILE.md", /^Status:\s*draft\s*$/im, "Status: draft"],
  ["PRODUCT_CONTEXT.md", /^Status:\s*draft\s*$/im, "Status: draft"],
  ["LANGUAGE_STRATEGY.md", /^Status:\s*draft\s*$/im, "Status: draft"],
  ["STACK_DECISION.md", /^Status:\s*draft\s*$/im, "Status: draft"],
  ["ORGANIC_GROWTH_STRATEGY.md", /^Status:\s*draft\s*$/im, "Status: draft"],
  ["NINETY_POST_PLAN.md", /^Status:\s*draft\s*$/im, "Status: draft"],
  ["EDITORIAL_CALENDAR.md", /^Status:\s*draft\s*$/im, "Status: draft"],
  ["DISTRIBUTION_PLAN.md", /^Status:\s*dry-run\s*$/im, "Status: dry-run"],
  ["TRIGGER_PLAN.md", /^Status:\s*draft\s*$/im, "Status: draft"],
  ["WORKER_ROUTING.md", /^Status:\s*draft\s*$/im, "Status: draft"],
  ["MEASUREMENT_PLAN.md", /^Status:\s*draft\s*$/im, "Status: draft"],
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

const productContext = contents.get("PRODUCT_CONTEXT.md");
if (productContext) {
  const qualification = listField(productContext, "Qualified for v1 organic automation");
  const normalized = cleanValue(qualification ?? "").toLowerCase();
  if (normalized !== "yes") {
    const current = normalized || "blank";
    errors.push(
      `PRODUCT_CONTEXT.md Qualified for v1 organic automation must resolve to yes before Path 2 starts; current value: ${current}. Path 2 must not start.`,
    );
  }
}

const decisionChecks = [
  ["LANGUAGE_STRATEGY.md", ["Selected option", "Custom answer"]],
  ["STACK_DECISION.md", ["Selected option", "Custom answer"]],
  ["ORGANIC_GROWTH_STRATEGY.md", ["Custom answer"]],
  ["DISTRIBUTION_PLAN.md", ["Custom answer"]],
  ["TRIGGER_PLAN.md", ["Selected option", "Custom answer"]],
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
