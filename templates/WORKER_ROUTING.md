# Worker Routing

Status: draft
Owner: operations
Last reviewed:

Every job gets one accountable worker. Workers may consult others, but the owner is responsible for the output artifact and gate.

## Worker Sources

Use existing `conclave-cc` roles when available. If a new role is required, follow `/home/conclave/conclave-cc/agents/hr.md` before adding it.

## Routing Table

| Job | Worker | Source role | Required inputs | Allowed tools | Forbidden actions | Output artifact | Approval gate |
|---|---|---|---|---|---|---|---|
| Founder interview | Drax intake | drax skill | Founder answers | Prompt only | Guessing missing facts | FOUNDER_PROFILE.md, PRODUCT_CONTEXT.md | Founder confirms |
| Language strategy | Growth strategy | content-strategist | Founder profile, product context | Research, docs | Publishing before language lock | LANGUAGE_STRATEGY.md | Founder confirms |
| Stack/security decision | Technical operations | CTO/CISO pattern from source library | Current stack, constraints | Docs, shell diagnostics when approved | Credential exposure, destructive changes | STACK_DECISION.md | Founder confirms |
| 90-post plan | Content strategy | content-strategist | Language strategy, product context | Research, docs | Calendar without 90-class plan | NINETY_POST_PLAN.md | Founder confirms |
| Article brief/draft | Editorial writer | content-strategist/copywriter-performance | Class plan, sources | Research, markdown | Unsupported claims | Article draft/brief | Editorial review |
| SVG/carousel | Social visual production | social-media-designer | Article brief, brand tokens | SVG/code/image tools | Off-brand tokens, unreviewed claims | Asset manifest | Creative review |
| Short video | Motion/video production | motion-designer/video-editor | Script, visual brief, audio policy | python-ffmpeg, remotion, ffmpeg-template | Unlicensed music, public upload | Video manifest/export | Creative review |
| Publishing queue | Distribution operator | marketing-automation-specialist | Approved assets, trigger plan | Official API, manual export, Playwright test | Duplicate post, unapproved live publish | Publish record | Publish approval |
| Measurement | Analytics | analytics-attribution-specialist | Publish records, platform metrics | Analytics tools, spreadsheets | Budget decisions without gate | MEASUREMENT_PLAN.md updates | Weekly review |

## Permission Rules

- Read/write access is limited to Drax artifacts, generated assets, and approved project files.
- Secrets are read from environment or secret manager only.
- No worker can approve its own public publish.
- Browser automation workers operate only in isolated test accounts unless a production gate is explicitly approved.
