import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const CMD = path.resolve("plugins/drax/skills/drax/commands/drax-map.mjs");

test("drax map renders the bundled organization as a box-drawing tree and mechanisms", () => {
  const workspace = mkdtempSync(path.join(os.tmpdir(), "drax-map-"));
  try {
    const result = spawnSync(process.execPath, [CMD, workspace], { encoding: "utf8" });
    const mapPath = path.join(workspace, "DRAX_MAP.txt");

    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.startsWith("```\n"));
    assert.ok(result.stdout.endsWith("\n```\n"));
    assert.match(result.stdout, /DRAX v/);
    assert.ok(result.stdout.includes(`Full map (all 134 agents + their skills) written to: ${mapPath}`));
    assert.match(result.stdout, /Open that file if your terminal truncates the output below\./);
    assert.match(result.stdout, /== ORGANIZATION ==/);
    const agentTotal = result.stdout.match(/agents: ([0-9]+) \| sectors: 11/);
    assert.ok(agentTotal);
    assert.equal(Number(agentTotal[1]), 134);
    assert.match(result.stdout, /^Board & Office of the CEO$/m);
    assert.match(result.stdout, /^├─ chairman[ \t]+board[ \t]+\[2\]$/m);
    assert.match(result.stdout, /^└─ ceo[ \t]+c_level[ \t]+\[10\]$/m);
    assert.match(result.stdout, /Sectors \(11\):[\s\S]*Technology — exec cto — 23 agents — engineering/);
    assert.match(result.stdout, /Revenue — exec cro — 26 agents — sales, revenue-operations, customer-success, support/);
    assert.match(result.stdout, /Org tree \(sector › department › agent \[skills\] › skill\):[\s\S]*TECHNOLOGY · cto · 23 agents/);
    assert.match(result.stdout, /├─ /);
    assert.match(result.stdout, /└─ /);
    assert.match(result.stdout, /│/);
    const agentLines = result.stdout
      .split("\n")
      .filter((line) => /^(?:[│ ]{3})?[├└]─ [a-z0-9-]+ +[a-z_]+ +\[[0-9]+\]$/.test(line));
    assert.equal(agentLines.length, Number(agentTotal[1]));
    const skillLeaves = result.stdout
      .split("\n")
      .filter((line) => /^(?:[│ ]{3})+[├└]─ [a-z0-9-]+$/.test(line));
    assert.ok(skillLeaves.length > agentLines.length, "skill names should render as child branches");
    assert.match(result.stdout, /\bseo-manager\b/);
    assert.match(result.stdout, /== MECHANISMS \/ PLATFORM ==/);

    const mapDump = readFileSync(mapPath, "utf8");
    assert.match(mapDump, /Org tree \(sector › department › agent \[skills\] › skill\):/);
    assert.match(mapDump, /\bseo-manager\b/);
    assert.match(mapDump, /├─ positioning/);
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});

test("drax map agent detail prints real required skills", () => {
  const result = spawnSync(process.execPath, [CMD, "--agent", "seo-manager"], { encoding: "utf8" });

  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.startsWith("```\n"));
  assert.ok(result.stdout.endsWith("\n```\n"));
  assert.match(result.stdout, /agent: seo-manager/);
  assert.match(result.stdout, /required skills:\n(?:  - .+\n)+/);
  assert.match(result.stdout, /required knowledge:\n(?:  - .+\n)+/);
});
