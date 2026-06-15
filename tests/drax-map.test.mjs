import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";

const CMD = path.resolve("plugins/drax/skills/drax/commands/drax-map.mjs");

test("drax map renders the bundled organization and mechanisms", () => {
  const result = spawnSync(process.execPath, [CMD], { encoding: "utf8" });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /DRAX v/);
  assert.match(result.stdout, /== ORGANIZATION ==/);
  const agentTotal = result.stdout.match(/agents: (\d+) \| sectors: 11/);
  assert.ok(agentTotal);
  assert.ok(Number(agentTotal[1]) >= 130);
  assert.match(result.stdout, /Board & Office of the CEO:[\s\S]*- chairman \[board\][\s\S]*- ceo \[c_level\]/);
  assert.match(result.stdout, /Sectors \(11\):[\s\S]*Technology — exec cto — 23 agents — engineering/);
  assert.match(result.stdout, /Revenue — exec cro — 26 agents — sales, revenue-operations, customer-success, support/);
  assert.match(result.stdout, /Org tree \(sector → department → level → agent \[n skills\]\):[\s\S]*TECHNOLOGY  \(exec: cto\)/);
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
