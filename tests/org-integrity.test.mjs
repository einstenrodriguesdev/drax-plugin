import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = path.resolve(".");
const ORG = path.join(ROOT, "plugins", "drax", "org");
const AGENTS = path.join(ORG, "agents");
const SKILLS = path.join(ORG, "skills");
const KNOWLEDGE = path.join(ORG, "knowledge");

function parseOrgChart(source) {
  const agents = new Map();
  const sectors = new Map();
  let section = null;
  let current = null;
  let activeList = null;

  for (const line of source.split(/\r?\n/)) {
    const sectionMatch = line.match(/^([a-z_]+):\s*$/);
    if (sectionMatch) {
      section = sectionMatch[1];
      current = null;
      activeList = null;
      continue;
    }

    const entryMatch = line.match(/^  ([a-z0-9][a-z0-9-]*):$/);
    if (entryMatch && section === "agents") {
      current = { file: null, department: null, level: null, requiredSkills: [], requiredKnowledge: [] };
      agents.set(entryMatch[1], current);
      activeList = null;
      continue;
    }
    if (entryMatch && section === "sectors") {
      current = { key: entryMatch[1], name: null, executive: null, departments: [] };
      sectors.set(entryMatch[1], current);
      activeList = null;
      continue;
    }
    if (!current) continue;

    const fieldMatch = line.match(/^    (file|department|level|name|executive):\s+(.+)$/);
    if (fieldMatch) {
      current[fieldMatch[1]] = fieldMatch[2].trim();
      activeList = null;
      continue;
    }

    const listMatch = line.match(/^    (required_skills|required_knowledge|departments):(?:\s+\[\])?$/);
    if (listMatch) {
      activeList = line.endsWith("[]") ? null : listMatch[1];
      continue;
    }
    if (/^    \S/.test(line)) {
      activeList = null;
      continue;
    }

    const itemMatch = line.match(/^      -\s+(.+)$/);
    if (!itemMatch || !activeList) continue;
    const item = itemMatch[1].trim();
    if (activeList === "required_skills") current.requiredSkills.push(item);
    if (activeList === "required_knowledge") current.requiredKnowledge.push(item);
    if (activeList === "departments") current.departments.push(item);
  }

  return { agents, sectors };
}

function markdownFiles(directory) {
  return readdirSync(directory).filter((entry) => entry.endsWith(".md")).sort();
}

function assertDirectFile(directory, name, description) {
  const target = path.resolve(directory, name);
  assert.equal(path.dirname(target), directory, `${description} escapes its bundle directory: ${name}`);
  assert.equal(existsSync(target), true, `${description} is missing: ${name}`);
}

test("bundled agent org chart and references are complete", () => {
  const { agents } = parseOrgChart(readFileSync(path.join(ORG, "_org-chart.yaml"), "utf8"));
  const agentFiles = markdownFiles(AGENTS);
  const skillFiles = markdownFiles(SKILLS);
  const knowledgeFiles = markdownFiles(KNOWLEDGE);

  assert.ok(agentFiles.length >= 130, `expected at least 130 agents, found ${agentFiles.length}`);
  assert.ok(skillFiles.length >= 25, `expected at least 25 skills, found ${skillFiles.length}`);
  assert.ok(knowledgeFiles.length >= 100, `expected at least 100 knowledge files, found ${knowledgeFiles.length}`);

  const chartAgentFiles = [];
  for (const [name, agent] of agents) {
    assert.ok(agent.file, `agent ${name} has no file entry`);
    const target = path.resolve(ORG, agent.file);
    assert.equal(path.dirname(target), AGENTS, `agent ${name} file escapes org/agents: ${agent.file}`);
    assert.equal(existsSync(target), true, `agent ${name} file is missing: ${agent.file}`);
    chartAgentFiles.push(path.basename(agent.file));

    for (const skill of agent.requiredSkills) {
      assertDirectFile(SKILLS, skill, `agent ${name} required skill`);
    }
    for (const knowledge of agent.requiredKnowledge) {
      assertDirectFile(KNOWLEDGE, knowledge, `agent ${name} required knowledge`);
    }
  }

  assert.deepEqual(chartAgentFiles.sort(), agentFiles, "org chart agent entries must equal bundled agent files");
});

test("bundled sector layer covers every non-apex department exactly once", () => {
  const { agents, sectors } = parseOrgChart(readFileSync(path.join(ORG, "_org-chart.yaml"), "utf8"));
  assert.equal(sectors.size, 11);

  const departments = new Map();
  for (const agent of agents.values()) {
    if (!departments.has(agent.department)) departments.set(agent.department, 0);
    departments.set(agent.department, departments.get(agent.department) + 1);
  }

  const departmentToSector = new Map();
  for (const [key, sector] of sectors) {
    const executive = agents.get(sector.executive);
    assert.ok(executive, `sector ${key} executive is not an agent: ${sector.executive}`);
    assert.equal(executive.level, "c_level", `sector ${key} executive is not c_level: ${sector.executive}`);

    for (const department of sector.departments) {
      assert.equal(departments.has(department), true, `sector ${key} department has no agents: ${department}`);
      assert.equal(departmentToSector.has(department), false, `department appears in multiple sectors: ${department}`);
      departmentToSector.set(department, key);
    }
  }

  for (const agent of agents.values()) {
    if (agent.department === "executive") continue;
    assert.equal(departmentToSector.has(agent.department), true, `agent ${agent.file} department is not mapped to a sector: ${agent.department}`);
  }

  const uncovered = [...departments.keys()].filter((department) => !departmentToSector.has(department)).sort();
  assert.deepEqual(uncovered, ["executive"]);
});
