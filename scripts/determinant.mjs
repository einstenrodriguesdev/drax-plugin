#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash, createPrivateKey, sign as edSign } from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(currentFile), "..");
const cli = path.join(root, "dist", "cli.js");
const baselineArtifacts = [
  "FOUNDER_PROFILE.md",
  "PRODUCT_CONTEXT.md",
  "LANGUAGE_STRATEGY.md",
  "STACK_DECISION.md",
  "ORGANIC_GROWTH_STRATEGY.md",
  "CONTENT_STRATEGY.md",
  "EDITORIAL_CALENDAR.md",
  "DISTRIBUTION_PLAN.md",
  "TRIGGER_PLAN.md",
  "WORKER_ROUTING.md",
  "MEASUREMENT_PLAN.md",
  "EXECUTION_STATE.md",
];
const expectedSector = [
  "content-strategist",
  "seo-manager",
  "copywriter-performance",
  "claims/quality-review",
];
const TEST_PUBLIC_KEY_B64 = "A6EHv/POEL4dcN0Y50vAmWfk1jCbpQ1fHdyGZBJVMbg=";
const TEST_PRIVATE_KEY_B64 = "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8DoQe/884Qvh1w3RjnS8CZZ+TWMJulDV8d3IZkElUxuA==";
const checks = [];
const workspaces = [];

function b64url(buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function privateKeyObjectFromBase64(priv64StdB64, pubStdB64) {
  const full = Buffer.from(priv64StdB64, "base64");
  const seed = full.subarray(0, 32);
  const pub = Buffer.from(pubStdB64, "base64");
  return createPrivateKey({ key: { kty: "OKP", crv: "Ed25519", d: b64url(seed), x: b64url(pub) }, format: "jwk" });
}

function canonicalAccessTokenBytes(token) {
  const limits = {
    dailyRunCadence: token.limits.dailyRunCadence,
    maxProjects: token.limits.maxProjects,
    dailyBlogPostCap: token.limits.dailyBlogPostCap,
    maxRuntimeHoursPerDay: token.limits.maxRuntimeHoursPerDay,
  };
  if (token.limits.maxRunsPerDay !== undefined) limits.maxRunsPerDay = token.limits.maxRunsPerDay;
  return Buffer.from(
    JSON.stringify({
      schemaVersion: token.schemaVersion,
      tokenId: token.tokenId,
      tier: token.tier,
      billingInterval: token.billingInterval,
      issuedAt: token.issuedAt,
      expiresAt: token.expiresAt,
      limits,
    }),
    "utf8",
  );
}

function signAccessToken(token) {
  return edSign(null, canonicalAccessTokenBytes(token), privateKeyObjectFromBase64(TEST_PRIVATE_KEY_B64, TEST_PUBLIC_KEY_B64)).toString(
    "base64",
  );
}

function signedAccessToken() {
  const token = {
    schemaVersion: "1.0.0",
    tokenId: "determinant-token",
    tier: "Startup",
    billingInterval: "monthly",
    issuedAt: new Date(Date.now() - 1000).toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    limits: {
      dailyRunCadence: "daily",
      maxProjects: 1,
      dailyBlogPostCap: 1,
      maxRuntimeHoursPerDay: 1,
      maxRunsPerDay: 1,
    },
    signature: "",
  };
  token.signature = signAccessToken(token);
  return token;
}

function accessEnv(extra = {}, token = signedAccessToken()) {
  return {
    ...process.env,
    DRAX_ACCESS_TOKEN_JSON: JSON.stringify(token),
    DRAX_ACCESS_PUBLIC_KEY: TEST_PUBLIC_KEY_B64,
    DRAX_ACCESS_VALIDATION_STUB: "allow",
    ...extra,
  };
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: "utf8",
    ...options,
  });
}

function record(name, fn) {
  try {
    fn();
    checks.push({ name, ok: true });
    console.log(`[PASS] ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    checks.push({ name, ok: false, message });
    console.log(`[FAIL] ${name}: ${message}`);
  }
}

function createWorkspace(prefix) {
  const directory = mkdtempSync(path.join(os.tmpdir(), prefix));
  workspaces.push(directory);
  return directory;
}

function initGitRepo(directory) {
  writeFileSync(path.join(directory, "README.md"), "# Determinant product\n", "utf8");
  assert.equal(run("git", ["init"], { cwd: directory }).status, 0);
  assert.equal(run("git", ["config", "user.email", "determinant@example.com"], { cwd: directory }).status, 0);
  assert.equal(run("git", ["config", "user.name", "Drax Determinant"], { cwd: directory }).status, 0);
  assert.equal(run("git", ["add", "README.md"], { cwd: directory }).status, 0);
  assert.equal(run("git", ["commit", "-m", "Initial determinant repo"], { cwd: directory }).status, 0);
}

function initDraxWorkspace(directory) {
  const result = run(process.execPath, [cli, "init"], {
    cwd: directory,
    env: accessEnv(),
  });
  assert.equal(result.status, 0, result.stderr);
}

function sha256File(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function words(value) {
  return value.trim().split(/\s+/).filter(Boolean);
}

function section(text, start, end) {
  const pattern = end
    ? new RegExp(`^${start}:\\s*\\n([\\s\\S]*?)^${end}:`, "m")
    : new RegExp(`^${start}:\\s*\\n([\\s\\S]*)`, "m");
  return text.match(pattern)?.[1] ?? "";
}

function quotedValues(text, key) {
  return [...text.matchAll(new RegExp(`${key}:\\s*"([^"]+)"`, "g"))].map((match) => match[1]);
}

function listItemCount(text) {
  return (text.match(/^\s+- /gm) ?? []).length;
}

function writeGeoRichFakeCodex(directory, mode) {
  const fakeCodex = path.join(directory, `codex-${mode}`);
  const articleBody =
    mode === "forbidden"
      ? "Proof note: Verified from founder artifacts.\n\nThis revolutionary claim must fail because the deterministic safety gate forbids unsupported hype."
      : positiveArticleBody();
  writeFileSync(
    fakeCodex,
    [
      "#!/bin/sh",
      "set -eu",
      'mkdir -p "$DRAX_CYCLE_SECTOR_DIR"',
      'case "${DRAX_CYCLE_STAGE:-}" in',
      "  content-strategist)",
      "    cat > \"$DRAX_CYCLE_SECTOR_DIR/01-content-brief.md\" <<'BRIEF'",
      "# Content Brief",
      "",
      "Post class: post-1",
      "Angle: show how a founder validates local blog automation before publishing.",
      "Primary buyer: founder running a site on a VPS.",
      "Promise: prove the automation pipeline with artifacts, dry-run records, and safety gates.",
      "Voice: concrete, sober, operator-focused.",
      "Safety: no invented customer outcomes, revenue, or unsupported platform claims.",
      "BRIEF",
      "    ;;",
      "  seo-manager)",
      "    cat > \"$DRAX_CYCLE_SECTOR_DIR/02-seo-brief.md\" <<'SEO'",
      "# SEO/GEO Brief",
      "",
      "## Source Inputs",
      "- Founder artifacts from the seeded workspace.",
      "- sector/01-content-brief.md",
      "",
      "## Strategic Search Target",
      "The post targets founders who need local blog deploy automation with proof before they enable publishing.",
      "",
      "## V1.1.0 Brief Schema",
      "```yaml",
      'target_keywords:',
      '  primary: "founder blog automation"',
      '  secondary:',
      '    - "local blog deploy automation"',
      '    - "VPS blog publishing workflow"',
      '    - "AI content safety gates"',
      '    - "organic blog automation dry run"',
      'search_intent: informational',
      'serp_format: guide',
      'cluster_id: "blog-automation-foundations"',
      'subtopic: "dry-run proof for founder-owned blog automation"',
      'pillar_url: "/blog/automation-foundations"',
      'schema_types:',
      '  - "Article"',
      '  - "FAQPage"',
      '  - "BreadcrumbList"',
      'question_h2s:',
      '  - h2: "How does a founder prove blog automation safely?"',
      '    answer_first_40_60_words: "A founder proves blog automation safely by running the cycle in dry-run mode, checking generated artifacts, verifying the publish record, and confirming the execution state did not advance. That sequence proves the machinery without touching the live site or inventing production evidence."',
      '  - h2: "What must a SEO brief include before copywriting starts?"',
      '    answer_first_40_60_words: "A useful SEO brief must define the primary keyword, supporting queries, intent, schema, question headings, entities, statistics, citations, FAQs, links, metadata, author, and freshness. Those fields turn search strategy into an executable contract for the copywriter before any finished article is drafted."',
      'entity_blocks:',
      '  - entity: "DRAX cycle"',
      '    definition: "The local automation run that generates and checks a blog content package."',
      '    attributes: ["dry-run", "sector chain", "publish record"]',
      '  - entity: "Founder workspace"',
      '    definition: "The directory containing the 12 strategy artifacts that configure the engine."',
      '    attributes: ["strategy source", "execution state", "safety constraints"]',
      'quotable_stats:',
      '  - claim: "Princeton GEO found citation tactics can lift visibility in generative answers."',
      '    value: "up to 40 percent"',
      '    source: "Princeton GEO study, ACM KDD 2024"',
      '    date: "2024"',
      '  - claim: "Topic clusters with enough interlinked pages win most AI citations in their topic."',
      '    value: "86 percent"',
      '    source: "Yext AI citation study"',
      '    date: "2025"',
      '  - claim: "Domains with trust profiles are more likely to be selected as ChatGPT sources."',
      '    value: "about 3 times more likely"',
      '    source: "SE Ranking E-E-A-T analysis"',
      '    date: "2025"',
      'citation_points:',
      '  - "Princeton GEO citation-lift finding"',
      '  - "Yext topic-cluster citation finding"',
      '  - "SE Ranking E-E-A-T source-selection finding"',
      'faq:',
      '  - q: "Does dry-run publish to the live site?"',
      '    a: "No. Dry-run fabricates and checks the package, then stops before the publish step."',
      '  - q: "What proves the sector chain ran?"',
      '    a: "The content package contains ordered sector evidence with artifact paths and hashes."',
      '  - q: "Why does the review stage need the briefs?"',
      '    a: "The reviewer must compare the article with the content and SEO contracts, not only read the article."',
      'internal_links:',
      '  - url: "/blog/automation-foundations"',
      '    anchor: "blog automation foundations"',
      '  - url: "/blog/safety-gates"',
      '    anchor: "AI content safety gates"',
      '  - url: "/blog/local-deploy"',
      '    anchor: "local blog deploy workflow"',
      'meta_title: "Founder Blog Automation Dry-Run Proof"',
      'meta_description: "See how a founder can prove blog automation with sector evidence, GEO briefs, dry-run records, and fail-closed safety gates."',
      'author: "Drax Determinant Harness"',
      'dateModified: "2026-06-09"',
      "```",
      "",
      "## GEO Execution Requirements",
      "- Use answer-first chunks under question H2s.",
      "- Include at least three cited statistics.",
      "- Include FAQ content that supports FAQPage schema.",
      "",
      "## Citation Plan",
      "- Cite Princeton GEO, Yext, and SE Ranking evidence in the article.",
      "",
      "## Internal Linking Plan",
      "- Include three internal links with descriptive anchors.",
      "",
      "## Copywriter Contract",
      "copywriter-performance is the only writer of finished copy and must include the Proof note line.",
      "SEO",
      "    ;;",
      "  copywriter)",
      '    mkdir -p "$(dirname "$DRAX_CYCLE_ARTICLE_PATH")"',
      "    cat > \"$DRAX_CYCLE_ARTICLE_PATH\" <<'ARTICLE'",
      "---",
      "title: Founder Blog Automation Dry-Run Proof",
      "description: See how a founder can prove blog automation with sector evidence, GEO briefs, dry-run records, and fail-closed safety gates.",
      "publishedAt: 2026-06-09T00:00:00.000Z",
      "tags: [automation, seo, geo]",
      "draft: false",
      "---",
      articleBody,
      "ARTICLE",
      '    cat > "$DRAX_CYCLE_PACKAGE_PATH" <<JSON',
      "{",
      '  "schemaVersion": "1.0.0",',
      '  "packageId": "$DRAX_CYCLE_RUN_ID",',
      '  "postClass": "post-1",',
      '  "postIndex": 1,',
      '  "title": "Founder Blog Automation Dry-Run Proof",',
      '  "description": "See how a founder can prove blog automation with sector evidence, GEO briefs, dry-run records, and fail-closed safety gates.",',
      '  "slug": "founder-blog-automation-dry-run-proof",',
      '  "tags": ["automation", "seo", "geo"],',
      '  "articlePath": "$DRAX_CYCLE_ARTICLE_PATH",',
      '  "proofNote": "Proof note: Verified from founder artifacts and determinant fixture."',
      "}",
      "JSON",
      "    ;;",
      "  review)",
      "    cat > \"$DRAX_CYCLE_SECTOR_DIR/04-review.md\" <<'REVIEW'",
      "VERDICT: PASS",
      "",
      "## Claims audit",
      "| Claim | Source | Status |",
      "|---|---|---|",
      "| GEO citation lift | Princeton GEO study | PASS |",
      "| Topic-cluster citation share | Yext AI citation study | PASS |",
      "| Trust profile source selection | SE Ranking analysis | PASS |",
      "",
      "## Brief compliance",
      "| Field | Met? | Note |",
      "|---|---|---|",
      "| quotable_stats | yes | Three cited statistics appear. |",
      "| question_h2s | yes | Both questions use answer-first chunks. |",
      "| FAQPage | yes | FAQ section exists. |",
      "",
      "## Safety & voice",
      "- Product truth: PASS",
      "- Founder voice: PASS",
      "- Forbidden claims: PASS",
      "- Private data: PASS",
      "",
      "## GEO leverage",
      "- Princeton top-5 coverage: PASS",
      "- Cited statistics density: PASS",
      "- Answer-first chunks: PASS",
      "",
      "## Required fixes",
      "- Empty if PASS.",
      "REVIEW",
      "    ;;",
      "  *)",
      '    echo "unknown stage: ${DRAX_CYCLE_STAGE:-missing}" >&2',
      "    exit 2",
      "    ;;",
      "esac",
    ].join("\n"),
    "utf8",
  );
  chmodSync(fakeCodex, 0o755);
  return fakeCodex;
}

function positiveArticleBody() {
  return [
    "Proof note: Verified from founder artifacts and determinant fixture.",
    "",
    "A founder running a website on a VPS needs proof before automation touches the public surface. The correct proof is not a promise from the model. It is a dry-run cycle that reads the founder workspace, runs the marketing sector, produces auditable files, and refuses unsafe output before any live publish. That is why Gate A checks artifacts rather than trusting a final message.",
    "",
    "According to the Princeton GEO study (2024), citation-oriented tactics can lift visibility in generative answers by up to 40 percent. That matters because a founder blog is no longer written only for blue-link ranking. It must also be easy for answer engines to extract, quote, and cite without losing the product truth recorded in the founder artifacts.",
    "",
    "## How does a founder prove blog automation safely?",
    "",
    "A founder proves blog automation safely by running the cycle in dry-run mode, checking generated artifacts, verifying the publish record, and confirming the execution state did not advance. That sequence proves the machinery without touching the live site or inventing production evidence.",
    "",
    "The dry-run starts with the same command path that a real cycle uses. It initializes the workspace, reads the twelve baseline artifacts, clones the repository for isolation, and asks each marketing role to produce its part of the package. The clone matters because the customer's live working tree should not be modified while the engine fabricates, checks, and prepares content.",
    "",
    "The content-strategist writes the angle. The seo-manager writes the search and GEO contract. The copywriter writes the finished article and package. The claims and quality reviewer inspects the article against the briefs. The deterministic gate then checks the final package for forbidden claims, missing proof, unresolved decisions, duplicate publish state, and artifact hash mismatches.",
    "",
    "Yext's AI citation research in 2025 reported that sufficiently interlinked topic clusters won 86 percent of citations in their topic. That is why the SEO brief must include internal links instead of treating one article as an isolated asset. A local blog surface compounds when each post strengthens the pillar, neighboring posts, and the product entity.",
    "",
    "## What must a SEO brief include before copywriting starts?",
    "",
    "A useful SEO brief must define the primary keyword, supporting queries, intent, schema, question headings, entities, statistics, citations, FAQs, links, metadata, author, and freshness. Those fields turn search strategy into an executable contract for the copywriter before any finished article is drafted.",
    "",
    "Without those fields, the copywriter can produce a polished article that still fails search and answer-engine requirements. The determinant harness catches that gap by reading the actual `sector/02-seo-brief.md` file and checking the mandatory contract: primary keyword, at least three secondary keywords, Article and FAQPage schema, question H2s, entity blocks, quotable statistics, citation points, FAQ items, internal links, metadata, author, and dateModified.",
    "",
    "SE Ranking's E-E-A-T analysis in 2025 found that domains with visible trust profiles were about 3 times more likely to be selected as ChatGPT sources. The owned blog cannot create third-party reputation by itself, but it can keep the basics correct: named author, current date, source-backed claims, consistent entity definitions, and a useful answer-first structure.",
    "",
    "The article also has to be long enough to carry substance. A shallow post can satisfy a filename check while giving the founder nothing usable. Gate A therefore checks a practical word floor, question sections, FAQ structure, cited statistics, proof note, publish record, and sector evidence with matching hashes. The result is not a literary quality score. It is a determinant proof that the product wiring and safety gates are real.",
    "",
    "The negative pass is equally important. A fixture that contains a forbidden hype claim must fail before a publish record is written. If the bad post succeeds, the determinant fails because the safety gate has no teeth.",
    "",
    "## FAQ",
    "",
    "### Does dry-run publish to the live site?",
    "",
    "No. Dry-run fabricates the package, executes the sector, runs the gates, writes audit records, and stops before the irreversible publish step. The execution state does not advance, so the same post index can be retried safely.",
    "",
    "### What proves the sector chain ran?",
    "",
    "The content package includes ordered sector evidence for content-strategist, seo-manager, copywriter-performance, and claims/quality-review. Each entry has an artifact path and a SHA-256 hash that must match the file on disk.",
    "",
    "### Why does the review stage need the briefs?",
    "",
    "The reviewer cannot verify compliance by reading only the article. It needs the content brief and SEO brief so it can check whether the copywriter satisfied the strategic angle, GEO fields, citations, internal links, and safety constraints.",
  ].join("\n");
}

function publishRecord(directory) {
  const recordsDir = path.join(directory, ".drax", "publish-records");
  const recordFiles = existsSync(recordsDir) ? readdirSync(recordsDir).filter((entry) => entry.endsWith(".json")) : [];
  assert.equal(recordFiles.length, 1);
  const recordPath = path.join(recordsDir, recordFiles[0]);
  return JSON.parse(readFileSync(recordPath, "utf8"));
}

function assertBaselineArtifacts(directory) {
  for (const artifact of baselineArtifacts) {
    assert.equal(existsSync(path.join(directory, artifact)), true, `${artifact} missing`);
  }
  assert.equal(existsSync(path.join(directory, "EXECUTION_STATE.json")), true, "EXECUTION_STATE.json missing");
}

function assertGeoBriefContract(brief) {
  assert.match(brief, /primary:\s*"founder blog automation"/);
  assert.ok(listItemCount(section(brief, "  secondary", "search_intent")) >= 3, "secondary keywords below 3");
  assert.match(brief, /search_intent:\s*informational/);
  assert.match(brief, /serp_format:\s*guide/);
  assert.match(section(brief, "schema_types", "question_h2s"), /Article/);
  assert.match(section(brief, "schema_types", "question_h2s"), /FAQPage/);

  const answers = quotedValues(brief, "answer_first_40_60_words");
  assert.ok(answers.length >= 2, "question_h2s below 2");
  for (const answer of answers) {
    const count = words(answer).length;
    assert.ok(count >= 40 && count <= 60, `answer-first chunk must be 40 to 60 words, got ${count}`);
  }

  assert.ok((brief.match(/^\s+- entity:/gm) ?? []).length >= 2, "entity_blocks below 2");
  assert.ok((brief.match(/^\s+definition:/gm) ?? []).length >= 2, "entity definitions below 2");
  assert.ok((brief.match(/^\s+attributes:/gm) ?? []).length >= 2, "entity attributes below 2");
  assert.ok((brief.match(/^\s+- claim:/gm) ?? []).length >= 3, "quotable_stats below 3");
  assert.ok((brief.match(/^\s+source:/gm) ?? []).length >= 3, "quotable_stats sources below 3");
  assert.ok(listItemCount(section(brief, "citation_points", "faq")) >= 2, "citation_points below 2");
  const faqCount = (brief.match(/^\s+- q:/gm) ?? []).length;
  assert.ok(faqCount >= 3 && faqCount <= 6, `faq count must be 3 to 6, got ${faqCount}`);
  assert.ok((brief.match(/^\s+- url:/gm) ?? []).length >= 3, "internal_links below 3");
  assert.ok((brief.match(/^\s+anchor:/gm) ?? []).length >= 3, "internal link anchors below 3");

  const metaTitle = brief.match(/meta_title:\s*"([^"]+)"/)?.[1] ?? "";
  const metaDescription = brief.match(/meta_description:\s*"([^"]+)"/)?.[1] ?? "";
  assert.ok(metaTitle.length > 0 && metaTitle.length <= 60, `meta_title length invalid: ${metaTitle.length}`);
  assert.ok(metaDescription.length > 0 && metaDescription.length <= 155, `meta_description length invalid: ${metaDescription.length}`);
  assert.match(brief, /author:\s*"Drax Determinant Harness"/);
  assert.match(brief, /dateModified:\s*"2026-06-09"/);
}

function firstParagraphAfterHeading(article, heading) {
  const start = article.indexOf(heading);
  assert.notEqual(start, -1, `${heading} missing`);
  const rest = article.slice(start + heading.length);
  return rest
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .find((part) => part && !part.startsWith("#")) ?? "";
}

function assertNonShallowArticle(article) {
  assert.ok(words(article).length >= 400, `article word count below 400: ${words(article).length}`);
  const firstAnswer = firstParagraphAfterHeading(article, "## How does a founder prove blog automation safely?");
  const secondAnswer = firstParagraphAfterHeading(article, "## What must a SEO brief include before copywriting starts?");
  assert.ok(words(firstAnswer).length >= 40 && words(firstAnswer).length <= 60, "first question answer is not 40 to 60 words");
  assert.ok(words(secondAnswer).length >= 40 && words(secondAnswer).length <= 60, "second question answer is not 40 to 60 words");
  assert.match(article, /^## FAQ$/m);
  assert.ok((article.match(/^### /gm) ?? []).length >= 3, "FAQ items below 3");
  assert.ok((article.match(/According to|reported that|found that/g) ?? []).length >= 3, "cited statistics below 3");
  assert.match(article, /^Proof note:/m);
}

function assertSectorEvidence(packagePath, packageJson) {
  assert.deepEqual(packageJson.sector.map((entry) => entry.stage), expectedSector);
  assert.deepEqual(packageJson.sector.map((entry) => entry.role), expectedSector);
  const packageDir = path.dirname(packagePath);
  for (const entry of packageJson.sector) {
    assert.match(entry.sha256, /^[a-f0-9]{64}$/);
    const artifact = path.resolve(packageDir, entry.artifactPath);
    assert.equal(existsSync(artifact), true, `${entry.artifactPath} missing`);
    assert.notEqual(readFileSync(artifact, "utf8").trim(), "", `${entry.artifactPath} empty`);
    assert.equal(sha256File(artifact), entry.sha256, `${entry.artifactPath} hash mismatch`);
  }
}

function runPositivePass() {
  const directory = createWorkspace("drax-determinant-pass-");
  initGitRepo(directory);
  initDraxWorkspace(directory);
  record("positive: all 12 baseline artifacts plus EXECUTION_STATE.json exist after init", () => assertBaselineArtifacts(directory));
  const beforeState = JSON.parse(readFileSync(path.join(directory, "EXECUTION_STATE.json"), "utf8"));
  const fakeCodex = writeGeoRichFakeCodex(directory, "positive");
  const result = run(process.execPath, [cli, "cycle", "--dry-run"], {
    cwd: directory,
    env: accessEnv({ DRAX_CODEX_BIN: fakeCodex }),
  });
  record("positive: drax cycle --dry-run exits 0", () => {
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Drax cycle dry-run passed/);
  });

  const recordData = publishRecord(directory);
  const packagePath = path.resolve(directory, recordData.contentPackagePath);
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
  const packageDir = path.dirname(packagePath);
  const articlePath = path.resolve(packageDir, packageJson.articlePath);
  const contentBriefPath = path.resolve(packageDir, "sector/01-content-brief.md");
  const seoBriefPath = path.resolve(packageDir, "sector/02-seo-brief.md");
  const reviewPath = path.resolve(packageDir, "sector/04-review.md");

  record("positive: sector artifacts, article.md, and content-package.json were produced", () => {
    for (const file of [contentBriefPath, seoBriefPath, reviewPath, articlePath, packagePath]) {
      assert.equal(existsSync(file), true, `${file} missing`);
      assert.notEqual(readFileSync(file, "utf8").trim(), "", `${file} empty`);
    }
  });
  record("positive: SEO/GEO brief contract is complete", () => assertGeoBriefContract(readFileSync(seoBriefPath, "utf8")));
  record("positive: article is non-shallow and carries answer-first sections, FAQ, cited stats, and Proof note", () =>
    assertNonShallowArticle(readFileSync(articlePath, "utf8")),
  );
  record("positive: sector evidence has four ordered stages with matching SHA-256 hashes", () =>
    assertSectorEvidence(packagePath, packageJson),
  );
  record("positive: review gate first line is VERDICT: PASS", () => {
    assert.equal(readFileSync(reviewPath, "utf8").split(/\r?\n/)[0], "VERDICT: PASS");
  });
  record("positive: dry-run publish record is succeeded and execution state did not advance", () => {
    assert.equal(recordData.mode, "dry-run");
    assert.equal(recordData.result, "succeeded");
    assert.equal(recordData.dryRun, true);
    const afterState = JSON.parse(readFileSync(path.join(directory, "EXECUTION_STATE.json"), "utf8"));
    assert.equal(afterState.nextPostIndex, beforeState.nextPostIndex);
  });
}

function runNegativePass() {
  const directory = createWorkspace("drax-determinant-fail-");
  initGitRepo(directory);
  initDraxWorkspace(directory);
  const fakeCodex = writeGeoRichFakeCodex(directory, "forbidden");
  const result = run(process.execPath, [cli, "cycle", "--dry-run"], {
    cwd: directory,
    env: accessEnv({ DRAX_CODEX_BIN: fakeCodex }),
  });
  record("negative: forbidden-claim fixture exits non-zero", () => {
    assert.notEqual(result.status, 0);
  });
  record("negative: forbidden-claim error is surfaced", () => {
    assert.match(result.stderr, /forbidden hype claim/);
  });
  record("negative: no publish record is written when the safety gate fails", () => {
    assert.equal(existsSync(path.join(directory, ".drax", "publish-records")), false);
  });
}

function runForgedSignaturePass() {
  const directory = createWorkspace("drax-determinant-forged-token-");
  const forged = signedAccessToken();
  forged.signature = "forged-signature";
  const result = run(process.execPath, [cli, "init"], {
    cwd: directory,
    env: accessEnv({}, forged),
  });
  record("negative: forged access-token signature exits non-zero", () => {
    assert.notEqual(result.status, 0);
  });
  record("negative: forged access-token signature error is surfaced", () => {
    assert.match(result.stderr, /Access token signature is invalid/);
  });
  record("negative: forged access-token run writes no baseline artifacts", () => {
    assert.equal(existsSync(path.join(directory, "FOUNDER_PROFILE.md")), false);
  });
}

function main() {
  console.log(
    "Honesty: determinant proves wiring, GEO contract shape, and safety-gate teeth with a fixture codex. Real prose quality is proven by the Docker real-Codex test.",
  );
  if (!existsSync(cli)) {
    throw new Error("dist/cli.js is missing. Run npm run build before scripts/determinant.mjs.");
  }

  try {
    runPositivePass();
    runNegativePass();
    runForgedSignaturePass();
  } finally {
    for (const workspace of workspaces) {
      rmSync(workspace, { recursive: true, force: true });
    }
  }

  const failed = checks.filter((check) => !check.ok);
  if (failed.length) {
    console.log("DETERMINANT: FAIL");
    process.exitCode = 1;
    return;
  }
  console.log("DETERMINANT: PASS");
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.log(`[FAIL] determinant harness crashed: ${message}`);
  console.log("DETERMINANT: FAIL");
  for (const workspace of workspaces) {
    rmSync(workspace, { recursive: true, force: true });
  }
  process.exitCode = 1;
}
