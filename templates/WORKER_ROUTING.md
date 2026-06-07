# Worker Routing

Status: draft
Owner: operations
Last reviewed:

Every job gets one accountable worker. Workers may consult others, but the owner is responsible for the output artifact and gate.

## Worker Sources

Use vendored V1 worker definitions from `templates/workers/` for customer installs. New-role creation through the internal Conclave HR protocol is DRAX-internal only and is not part of the customer V1 runtime.

## Routing Table

| Job | Worker | Source role | Required inputs | Allowed tools | Forbidden actions | Output artifact | Approval gate |
|---|---|---|---|---|---|---|---|
| Founder interview | Drax intake | drax skill | Founder answers | Prompt only | Guessing missing facts | FOUNDER_PROFILE.md, PRODUCT_CONTEXT.md | Founder confirms |
| Language strategy | Growth strategy | templates/workers/content-strategist.md | Founder profile, product context | Research, docs | Publishing before language lock | LANGUAGE_STRATEGY.md | Founder confirms |
| Stack/security decision | Technical operations | CTO/CISO pattern from source library | Current stack, constraints | Docs, shell diagnostics when approved | Credential exposure, destructive changes | STACK_DECISION.md | Founder confirms |
| 90-post plan | Content strategy | templates/workers/content-strategist.md | Language strategy, product context | Research, docs | Calendar without 90-class plan | NINETY_POST_PLAN.md | Founder confirms |
| SEO brief/metadata | SEO | templates/workers/seo-manager.md | Product context, language strategy, class plan, site surface | Research, docs | Keyword stuffing, unsupported search claims | SEO brief/metadata | Editorial review |
| Article brief/draft | Editorial writer | templates/workers/content-strategist.md, templates/workers/copywriter-performance.md | Class plan, sources | Research, markdown | Unsupported claims | Article draft/brief | Editorial review |
| SVG/carousel | Social visual production | templates/workers/social-media-designer.md | Article brief, brand tokens | SVG/code/image tools | Off-brand tokens, unreviewed claims | Asset manifest | Creative review |
| Short video | Motion/video production | templates/workers/motion-designer.md, templates/workers/video-editor.md | Script, visual brief, audio policy | python-ffmpeg, remotion, ffmpeg-template | Unlicensed music, public upload | Video manifest/export | Creative review |
| Publishing queue | Distribution operator | templates/workers/marketing-automation-specialist.md | Approved assets, trigger plan | Official API, manual export, Playwright test | Duplicate post, unapproved live publish | Publish record | Publish approval |
| Measurement | Analytics | templates/workers/analytics-attribution-specialist.md | Publish records, platform metrics | Analytics tools, spreadsheets | Budget decisions without gate | MEASUREMENT_PLAN.md updates | Weekly review |

## Permission Rules

- Read/write access is limited to Drax artifacts, generated assets, and approved project files.
- Secrets are read from environment or secret manager only.
- No worker can approve its own public publish.
- Browser automation workers operate only in isolated test accounts unless a production gate is explicitly approved.
