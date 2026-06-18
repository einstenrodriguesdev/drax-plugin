# Responsibility Matrix

Status: draft
Owner: operations
Last reviewed:

Every job has one accountable owner; this RACI matrix maps each job to who is Responsible, Accountable, Consulted, and Informed, plus the output artifact and approval gate.

## Worker Sources

Use vendored V1 worker definitions from `templates/workers/` for customer installs. New-role creation through the internal Conclave HR protocol is DRAX-internal only and is not part of the customer V1 runtime.

## RACI Matrix

| Job | Responsible | Accountable | Consulted | Informed | Output artifact | Approval gate |
|---|---|---|---|---|---|---|
| Founder interview | Drax intake | Chairman | Founder | Founder | FOUNDER_BRAND_BRIEF.md, POSITIONING_STATEMENT.md | Founder confirms |
| Language/localization strategy | Growth strategy | CMO | Founder, content strategist | Founder | MARKET_LOCALIZATION_STRATEGY.md | Founder confirms |
| Stack/security decision | Technical operations | CTO/CISO | Founder, technical operators | Founder | TECH_DECISION_RECORD.md | Founder confirms |
| Content plan | Content strategy | CMO | Founder, content strategist, SEO, claims review | Founder | CONTENT_STRATEGY.md | Editorial/claims review + founder confirms |
| SEO brief/metadata | SEO | Director of Marketing Operations | Product, localization, content strategy, site surface | Founder | SEO brief/metadata | Editorial review |
| Article brief/draft | Editorial writer | Director of Marketing Operations | Content strategist, claims review | Founder | Article draft/brief | Editorial review |
| SVG/carousel | Social visual production | Creative director | Editorial writer, brand owner, claims review | Founder | Asset manifest | Creative review |
| Short video | Motion/video production | Creative director | Editorial writer, visual production, claims review | Founder | Video manifest/export | Creative review |
| Publishing queue | Distribution operator | COO | Approved assets, automation runbook, channel owners | Founder | Publish record | Publish approval |
| Measurement | Analytics | CFO/CMO | Distribution, platform owners | Founder | MEASUREMENT_FRAMEWORK.md updates | Weekly review |

## Tool And Permission Boundaries

| Job | Required inputs | Allowed tools | Forbidden actions |
|---|---|---|---|
| Founder interview | Founder answers | Prompt only | Guessing missing facts |
| Language/localization strategy | Founder brand brief, positioning statement | Research, docs | Publishing before language lock |
| Stack/security decision | Current stack, constraints | Docs, shell diagnostics when approved | Credential exposure, destructive changes |
| Content plan | Market localization strategy, positioning statement, SME interview (founder + specialists) | Research, docs | Calendar without cadence-derived content plan |
| SEO brief/metadata | Positioning statement, market localization strategy, content plan, site surface | Research, docs | Keyword stuffing, unsupported search claims |
| Article brief/draft | Content plan, sources | Research, markdown | Unsupported claims |
| SVG/carousel | Article brief, brand tokens | SVG/code/image tools | Off-brand tokens, unreviewed claims |
| Short video | Script, visual brief, audio policy | python-ffmpeg, remotion, ffmpeg-template | Unlicensed music, public upload |
| Publishing queue | Approved assets, automation runbook | Official API, manual export, Playwright test | Duplicate post, unapproved live publish |
| Measurement | Publish records, platform metrics | Analytics tools, spreadsheets | Budget decisions without gate |

## Content Plan Orchestration

The content plan is governed by the org chain Chairman -> C-level -> Director -> Specialists, not improvised by one worker:

1. Chairman authorizes the job, sets the objective, and owns the final approval gate.
2. CMO frames the content mandate from positioning, audience priority, and the founder's objective.
3. Director of Marketing Operations decomposes the plan, assigns the specialist workstream, and runs the review cadence.
4. Content strategist (`templates/workers/content-strategist.md`) runs an SME interview first — jtbd-interview and Voice-of-Customer technique to extract real material from the founder as the primary subject-matter expert and any relevant specialist agent — then writes the cadence-derived quarterly content plan, each item a coupled create-once-publish-everywhere unit.
5. SEO (`templates/workers/seo-manager.md`) maps keyword, intent, and GEO metadata onto each content item.
6. Editorial/claims review (`templates/workers/claims-quality-reviewer.md`) renders an independent pass or fail; it gates, it never rewrites.

`CONTENT_STRATEGY.md` flips to `ready` only after this chain completes and the review passes.

## Permission Rules

- Read/write access is limited to Drax artifacts, generated assets, and approved project files.
- Secrets are read from environment or secret manager only.
- No worker can approve its own public publish.
- Browser automation workers operate only in isolated test accounts unless a production gate is explicitly approved.
