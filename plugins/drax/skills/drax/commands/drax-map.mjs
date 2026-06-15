#!/usr/bin/env node
// Deterministic command. Introspects the bundled Drax organization and current workspace.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const commandDir = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(commandDir, "../../..");
const packageRoot = path.resolve(pluginRoot, "../..");
const FALLBACK_VERSION = "1.1.0";

const ARTIFACTS = [
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

const GATE_ARTIFACTS = ["FOUNDER_PROFILE.md", "NINETY_POST_PLAN.md"];

function parseArgs(args) {
  let agent = null;
  let workspace = null;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--agent") {
      agent = args[index + 1] || null;
      index += 1;
    } else if (!args[index].startsWith("--") && !workspace) {
      workspace = args[index];
    }
  }
  return { agent, workspace: path.resolve(workspace || process.cwd()) };
}

function readVersion() {
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(pluginRoot, ".codex-plugin", "plugin.json"), "utf8"));
    return manifest.version || FALLBACK_VERSION;
  } catch {
    return FALLBACK_VERSION;
  }
}

function firstExistingFile(candidates) {
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || null;
}

function firstExistingDirectory(candidates) {
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) || null;
}

function locateOrgChart(workspace) {
  return firstExistingFile([
    path.resolve(commandDir, "../../../org/_org-chart.yaml"),
    path.resolve(commandDir, "../../../../org/_org-chart.yaml"),
    path.resolve(commandDir, "../../../../../org/_org-chart.yaml"),
    path.resolve(workspace, "plugins/drax/org/_org-chart.yaml"),
    path.resolve(workspace, "org/_org-chart.yaml"),
    path.resolve(process.cwd(), "plugins/drax/org/_org-chart.yaml"),
    path.resolve(process.cwd(), "org/_org-chart.yaml"),
  ]);
}

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
      current = {
        name: entryMatch[1],
        file: "",
        department: "",
        level: "",
        reportsTo: "",
        executiveOwner: "",
        roleType: "",
        requiredSkills: [],
        requiredKnowledge: [],
      };
      agents.set(current.name, current);
      activeList = null;
      continue;
    }
    if (entryMatch && section === "sectors") {
      current = {
        key: entryMatch[1],
        name: "",
        executive: "",
        departments: [],
      };
      sectors.set(current.key, current);
      activeList = null;
      continue;
    }
    if (!current) continue;

    const fieldMatch = line.match(/^    (file|department|level|reports_to|executive_owner|role_type|name|executive):\s*(.*)$/);
    if (fieldMatch) {
      const fields = {
        file: "file",
        department: "department",
        level: "level",
        reports_to: "reportsTo",
        executive_owner: "executiveOwner",
        role_type: "roleType",
        name: "name",
        executive: "executive",
      };
      current[fields[fieldMatch[1]]] = fieldMatch[2].trim();
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
    if (activeList === "required_skills") current.requiredSkills.push(itemMatch[1].trim());
    if (activeList === "required_knowledge") current.requiredKnowledge.push(itemMatch[1].trim());
    if (activeList === "departments") current.departments.push(itemMatch[1].trim());
  }

  return { agents, sectors };
}

function filesIn(directory, predicate = () => true) {
  if (!directory) return [];
  try {
    return fs.readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && predicate(entry.name))
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

function directoriesIn(directory) {
  if (!directory) return [];
  try {
    return fs.readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

function markdownCount(directory) {
  return filesIn(directory, (name) => name.endsWith(".md")).length;
}

const LEVEL_PRIORITY = {
  board: 0,
  c_level: 1,
  vp: 2,
  director: 3,
  senior_manager: 4,
  manager: 5,
  senior_ic: 6,
  ic: 7,
  lead: 8,
  operator: 9,
  support: 10,
};

function levelOrder(left, right) {
  return (LEVEL_PRIORITY[left] ?? 99) - (LEVEL_PRIORITY[right] ?? 99) || left.localeCompare(right);
}

function agentOrder(left, right) {
  return levelOrder(left.level, right.level) || left.name.localeCompare(right.name);
}

function agentsForDepartments(agents, departments) {
  const selected = new Set(departments);
  return [...agents.values()].filter((agent) => selected.has(agent.department));
}

function renderDepartmentTree(lines, agents, departments, indent = "    ") {
  const selected = new Set(departments);
  for (const department of [...selected].sort()) {
    const departmentAgents = agents.filter((agent) => agent.department === department);
    if (!departmentAgents.length) continue;
    lines.push(`${indent}${department}`);
    const levels = new Map();
    for (const agent of departmentAgents) {
      if (!levels.has(agent.level)) levels.set(agent.level, []);
      levels.get(agent.level).push(agent);
    }
    for (const level of [...levels.keys()].sort(levelOrder)) {
      lines.push(`${indent}  ${level}`);
      for (const agent of levels.get(level).sort((left, right) => left.name.localeCompare(right.name))) {
        lines.push(`${indent}    - ${agent.name} [${agent.requiredSkills.length} skills]`);
      }
    }
  }
}

function renderOrganization(lines, orgChart, agents, sectors) {
  lines.push("== ORGANIZATION ==");
  if (!orgChart) {
    lines.push("org bundle not found (expected plugins/drax/org/_org-chart.yaml)");
    lines.push("");
    return;
  }

  const orgDir = path.dirname(orgChart);
  const departments = new Set([...agents.values()].map((agent) => agent.department).filter(Boolean));
  const cLevels = [...agents.values()].filter((agent) => agent.level === "c_level");
  const directors = [...agents.values()].filter((agent) => agent.level === "director");
  const managers = [...agents.values()].filter((agent) => agent.level === "manager");
  const specialists = agents.size - cLevels.length - directors.length - managers.length;
  const skills = markdownCount(path.join(orgDir, "skills"));
  const knowledge = markdownCount(path.join(orgDir, "knowledge"));
  const coveredDepartments = new Set([...sectors.values()].flatMap((sector) => sector.departments));
  const apexAgents = [...agents.values()].filter((agent) => !coveredDepartments.has(agent.department)).sort(agentOrder);

  lines.push(
    `agents: ${agents.size} | sectors: ${sectors.size} | departments: ${departments.size} | C-levels: ${cLevels.length} | directors: ${directors.length} | managers: ${managers.length} | ICs/specialists: ${specialists}`,
  );
  lines.push(`skills library: ${skills} | knowledge library: ${knowledge}`);
  lines.push("");
  lines.push("Board & Office of the CEO:");
  for (const agent of apexAgents) {
    lines.push(`  - ${agent.name} [${agent.level}]`);
  }
  lines.push("");
  lines.push(`Sectors (${sectors.size}):`);
  for (const sector of sectors.values()) {
    const count = agentsForDepartments(agents, sector.departments).length;
    lines.push(`  - ${sector.name} — exec ${sector.executive} — ${count} agents — ${sector.departments.join(", ")}`);
  }
  lines.push("");
  lines.push("Org tree (sector → department → level → agent [n skills]):");
  for (const sector of sectors.values()) {
    const sectorAgents = agentsForDepartments(agents, sector.departments);
    lines.push(`  ${sector.name.toUpperCase()}  (exec: ${sector.executive})`);
    renderDepartmentTree(lines, sectorAgents, sector.departments);
  }
  const unassignedAgents = [...agents.values()].filter((agent) => agent.department !== "executive" && !coveredDepartments.has(agent.department));
  if (unassignedAgents.length) {
    lines.push("  UNASSIGNED");
    renderDepartmentTree(lines, unassignedAgents, [...new Set(unassignedAgents.map((agent) => agent.department))]);
  }
  lines.push("");
}

function renderMechanisms(lines, orgChart, workspace) {
  const orgDir = orgChart ? path.dirname(orgChart) : null;
  const roots = [...new Set([pluginRoot, packageRoot, workspace, process.cwd()])];
  const hooks = firstExistingDirectory([
    path.join(pluginRoot, "hooks"),
    ...roots.map((root) => path.join(root, "plugins/drax/hooks")),
  ]);
  const skillsRoot = firstExistingDirectory([
    path.join(pluginRoot, "skills"),
    ...roots.map((root) => path.join(root, "plugins/drax/skills")),
  ]);
  const scripts = firstExistingDirectory(roots.flatMap((root) => [path.join(root, "scripts"), path.join(root, "plugins/drax/scripts")]));
  const schemas = firstExistingDirectory(roots.flatMap((root) => [path.join(root, "schemas"), path.join(root, "plugins/drax/schemas")]));
  const templates = firstExistingDirectory(roots.flatMap((root) => [path.join(root, "templates"), path.join(root, "plugins/drax/templates")]));

  const skillCommands = [];
  for (const skill of directoriesIn(skillsRoot)) {
    const commands = path.join(skillsRoot, skill, "commands");
    for (const command of filesIn(commands)) skillCommands.push(`${skill}/commands/${command}`);
  }
  const renderers = filesIn(scripts, (name) => /^social_[a-z0-9_-]+\.py$/.test(name));
  const schemaFiles = filesIn(schemas);
  const baselineTemplates = filesIn(templates, (name) => /\.(md|json)$/.test(name));
  const workers = markdownCount(templates ? path.join(templates, "workers") : null);

  lines.push("== MECHANISMS / PLATFORM ==");
  lines.push(`competency skills: ${orgDir ? markdownCount(path.join(orgDir, "skills")) : 0}`);
  lines.push(`knowledge docs: ${orgDir ? markdownCount(path.join(orgDir, "knowledge")) : 0}`);
  lines.push(`hooks: ${hooks ? filesIn(hooks).join(", ") || "none" : "not found"}`);
  lines.push(`skill commands: ${skillCommands.length ? skillCommands.join(", ") : "not found"}`);
  lines.push(`renderers: ${renderers.length ? renderers.join(", ") : "not found"}`);
  lines.push(`schemas: ${schemas ? schemaFiles.length : "not found"}`);
  lines.push(`templates: ${templates ? `${baselineTemplates.length} baseline/state files, ${workers} workers` : "not found"}`);
  lines.push("");
}

function statusOf(workspace, file) {
  const target = path.join(workspace, file);
  if (!fs.existsSync(target)) return "missing";
  try {
    const match = fs.readFileSync(target, "utf8").match(/^[-*\s]*status:\s*([a-z]+)/im);
    return match ? match[1].toLowerCase() : "present";
  } catch {
    return "present";
  }
}

function isWorkspace(workspace) {
  if (fs.existsSync(path.join(workspace, ".drax"))) return true;
  if (fs.existsSync(path.join(workspace, "EXECUTION_STATE.json"))) return true;
  return ARTIFACTS.some((file) => fs.existsSync(path.join(workspace, file)));
}

function pad(value, width) {
  return value + " ".repeat(Math.max(0, width - value.length));
}

function renderWorkspace(lines, workspace) {
  const detected = isWorkspace(workspace);
  lines.push("== WORKSPACE ==");
  lines.push(`workspace: ${workspace} (${detected ? "DETECTED" : "not a Drax workspace"})`);
  if (!detected) {
    lines.push("Workspace artifact and readiness details are available after `drax init` or `$drax`.");
    lines.push("");
    return;
  }

  const statuses = ARTIFACTS.map((file) => [file, statusOf(workspace, file)]);
  const gateBlocked = GATE_ARTIFACTS.filter((file) => statusOf(workspace, file) !== "ready");
  const width = Math.max(...statuses.map(([file]) => file.length));

  lines.push("");
  lines.push("Baseline artifacts (status in this workspace):");
  for (const [file, status] of statuses) lines.push(`  [${pad(status, 7)}] ${pad(file, width)}`);
  lines.push("");
  lines.push("Release gates:");
  lines.push("  - Artifact Readiness Gate: FOUNDER_PROFILE.md + NINETY_POST_PLAN.md must be `ready` before unattended posting.");
  lines.push("  - Claims/quality review must pass before any publish.");
  lines.push("  - Fail-closed: triggers refuse on manifest, asset-hash, or connection mismatch.");
  lines.push("");
  lines.push("Triggers: clock (scheduled daily) + manual (operator command).");
  lines.push("Publishing modes: local-blog-deploy, official-api, playwright-experimental, export-manual (live requires approval).");
  lines.push("");
  lines.push(
    gateBlocked.length
      ? `Unattended daily posting: NOT CLEARED (gate artifacts not ready: ${gateBlocked.join(", ")}).`
      : "Unattended daily posting: CLEARED (gate artifacts ready).",
  );
  lines.push("");
}

function renderAgentDetail(lines, orgChart, agents, name) {
  if (!orgChart) {
    console.error("org bundle not found (expected plugins/drax/org/_org-chart.yaml)");
    process.exitCode = 1;
    return false;
  }
  const agent = agents.get(name);
  if (!agent) {
    console.error(`Unknown Drax agent: ${name}`);
    process.exitCode = 1;
    return false;
  }

  lines.push(`agent: ${agent.name}`);
  lines.push(`department: ${agent.department || "unassigned"}`);
  lines.push(`level: ${agent.level || "unassigned"}`);
  lines.push(`role_type: ${agent.roleType || "unassigned"}`);
  lines.push(`reports_to: ${agent.reportsTo || "none"}`);
  lines.push(`executive_owner: ${agent.executiveOwner || "unassigned"}`);
  lines.push("required skills:");
  lines.push(...(agent.requiredSkills.length ? agent.requiredSkills.map((skill) => `  - ${skill}`) : ["  - none"]));
  lines.push("required knowledge:");
  lines.push(...(agent.requiredKnowledge.length ? agent.requiredKnowledge.map((item) => `  - ${item}`) : ["  - none"]));
  lines.push("");
  return true;
}

const { agent: requestedAgent, workspace } = parseArgs(process.argv.slice(2));
const version = readVersion();
const orgChart = locateOrgChart(workspace);
const { agents, sectors } = orgChart ? parseOrgChart(fs.readFileSync(orgChart, "utf8")) : { agents: new Map(), sectors: new Map() };
const lines = [
  `DRAX v${version} — capability map`,
  `org bundle: ${orgChart ? path.dirname(orgChart) : "not found"}`,
  "",
];

if (requestedAgent) {
  renderAgentDetail(lines, orgChart, agents, requestedAgent);
} else {
  renderOrganization(lines, orgChart, agents, sectors);
  renderMechanisms(lines, orgChart, workspace);
}
renderWorkspace(lines, workspace);
process.stdout.write(`${lines.join("\n").trimEnd()}\n`);
