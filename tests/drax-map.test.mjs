import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";

const CMD = path.resolve("plugins/drax/skills/drax/commands/drax-map.mjs");

test("drax map renders the bundled organization as a box-drawing tree and mechanisms", () => {
  const result = spawnSync(process.execPath, [CMD], { encoding: "utf8" });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /DRAX v/);
  assert.match(result.stdout, /== ORGANIZATION ==/);
  const agentTotal = result.stdout.match(/agents: ([0-9]+) \| sectors: 11/);
  assert.ok(agentTotal);
  assert.equal(Number(agentTotal[1]), 134);
  assert.match(result.stdout, /^Board & Office of the CEO\n├─ chairman[ \t]+board[ \t]+\[2\]\n└─ ceo[ \t]+c_level[ \t]+\[10\]$/m);
  assert.match(result.stdout, /Sectors \(11\):[\s\S]*Technology — exec cto — 23 agents — engineering/);
  assert.match(result.stdout, /Revenue — exec cro — 26 agents — sales, revenue-operations, customer-success, support/);
  assert.match(result.stdout, /Org tree \(sector › department › level › agent \[skills\]\):[\s\S]*TECHNOLOGY · cto · 23 agents/);
  assert.match(result.stdout, /├─ /);
  assert.match(result.stdout, /└─ /);
  assert.match(result.stdout, /│/);
  const leafLines = result.stdout
    .split("\n")
    .filter((line) => /^(?:[│ ]{3})?[├└]─ [a-z0-9-]+ +[a-z_]+ +\[[0-9]+\]$/.test(line));
  assert.equal(leafLines.length, Number(agentTotal[1]));
  assert.match(result.stdout, /\bseo-manager\b/);
  assert.match(result.stdout, /== MECHANISMS \/ PLATFORM ==/);
});

test("drax map agent detail prints real required skills", () => {
  const result = spawnSync(process.execPath, [CMD, "--agent", "seo-manager"], { encoding: "utf8" });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /agent: seo-manager/);
  assert.match(result.stdout, /required skills:\n(?:  - .+\n)+/);
  assert.match(result.stdout, /required knowledge:\n(?:  - .+\n)+/);
});
