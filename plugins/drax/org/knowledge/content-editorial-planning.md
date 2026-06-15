# Content — Editorial Planning
> Status: stub | Created: 2026-04-27 | Owner: Content Strategist
> Applies to: Content Strategist, CMO

---

## Purpose

This document defines the sprint-based editorial planning cycle, Content Type Matrix, production capacity methodology, and editorial calendar governance protocol used by the Content Strategist in Conclave.

---

## 1. Sprint-Based Editorial Planning Cycle

### Sprint Length
- Standard sprint: 2 weeks
- Quarter = 6 sprints (with buffer for review and catch-up)

### Sprint Stages
1. **Sprint Planning (Day 1):** Content Strategist locks pieces for the sprint. Production capacity confirmed (executor availability per piece type). No piece enters the sprint without a confirmed executor and brief completion date.
2. **Brief Issuance (Days 1–2):** Content briefs delivered to assigned executors. Each brief includes: target keyword, angle/POV, COPE decomposition plan, distribution row, success metric.
3. **Production (Days 3–10):** Executors draft and revise. Content Strategist available for clarification; does not edit copy.
4. **Review and Approval (Days 11–13):** Brief-holder (Content Strategist) confirms the deliverable matches the brief: keyword used, angle executed, COPE plan accommodated. Does NOT rewrite copy — returns to Copywriter with specific gap if brief criteria unmet.
5. **Publish and Distribute (Day 14):** Publishing executor (Social Media Manager or assigned) publishes. Distribution row is activated: email newsletter queued, LinkedIn posts scheduled, visual assets submitted to designer.

### Sprint Governance Rules
- Pieces per sprint = confirmed production capacity only (not aspirational volume)
- No piece moves into production without a complete brief (all mandatory fields filled — including distribution row and success metric)
- Deadline slippage of > 3 days triggers sprint re-plan (piece moves to next sprint, not expedited)

---

## 2. Production Capacity Planning

### Capacity by Executor (Conclave context — agent-based)
| Executor Agent | Content types supported | Realistic capacity per sprint |
|---|---|---|
| Performance Copywriter | Long-form blog, case study, white paper, executive ghostwrite | 2–3 pieces per sprint (1,500–3,000 words each) |
| Email Marketing Manager | Newsletter (content brief → execution) | 1 newsletter issue per sprint |
| Social Media Manager | LinkedIn posts from COPE decomposition | Up to 6 posts per sprint (across all active pieces) |
| Art Director / Social Media Designer | Social graphics, quote cards, carousels | 2–3 assets per sprint |
| Video Editor | Video script → short-form clip | 1 video per sprint if active |

### Capacity Lock Protocol
Before any sprint begins:
1. List planned pieces for the sprint
2. Map each piece to an executor
3. Confirm executor is not blocked by another concurrent project
4. If over-capacity: defer piece to next sprint — do not add pieces expecting executors to absorb overload

---

## 3. Content Type Matrix

### Type × Funnel Stage × Priority

| Content Type | TOFU | MOFU | BOFU | Typical production time | Default executor |
|---|---|---|---|---|---|
| Long-form educational blog | Primary | Secondary | Rarely | 5–7 business days | Performance Copywriter |
| Thought leadership / POV post | Primary | — | — | 3–5 business days | Performance Copywriter (ghost) |
| Case study | — | Primary | Secondary | 7–10 business days (requires interview) | Performance Copywriter |
| Comparison guide | — | Primary | — | 5–8 business days | Performance Copywriter |
| White paper / technical deep-dive | — | Primary | — | 10–15 business days | Performance Copywriter |
| Email newsletter | TOFU | MOFU | — | 2–3 business days | Email Marketing Manager |
| LinkedIn carousel / document | TOFU | MOFU | — | 2–3 business days (design included) | Social Media Manager + Designer |
| ROI calculator / template | — | Primary | — | 5–10 business days (may require dev) | Content Strategist + CTO coordination |
| Video clip (short-form, ≤ 90s) | Primary | — | — | 5–7 business days | Video Editor |

### Minimum per Quarter per Active Pillar
- 4 cluster posts (blog / long-form) per pillar per quarter
- 1 MOFU piece per pillar per quarter (case study or comparison guide)
- 2 thought leadership POV posts per week (across all pillars, founder account)

---

## 4. Editorial Calendar Field Definitions

Every row in the editorial calendar (`editorial-calendar-[YYYY-QQ].md`) must include:

| Field | Definition | Acceptable values |
|---|---|---|
| Piece | Working title | String |
| Pillar | Which content pillar this supports | Pillar 1 / Pillar 2 / etc. |
| Content type | Format | Blog / case study / white paper / newsletter / LinkedIn / podcast / video |
| Funnel stage | Where in funnel | TOFU / MOFU / BOFU |
| Awareness stage | ICP awareness stage targeted | Unaware / Problem-Aware / Solution-Aware / Product-Aware / Most Aware |
| Executor | Which agent or person produces this | Agent name or "founder" |
| Brief due | Date by which brief must be delivered to executor | Date |
| Draft due | Date by which first draft is expected | Date |
| Publish date | Target publication date | Date |
| Distribution | Channels and dates for distribution | Channel list with dates |
| Pipeline metric | Which pipeline outcome this piece targets | MQL-sourced / MQL-influenced / opp-influenced / brand |
| Status | Current stage | briefed / in production / in review / published / paused |

No field may be left blank when a piece enters the sprint. Empty fields = incomplete brief = piece is not sprint-ready.

---

## 5. Quarterly Planning Protocol

### Q-minus-2 Weeks (Planning Window)
1. Content Strategist reviews: prior quarter performance report, active pillar coverage gap analysis, SEO Manager's keyword priority list for the quarter
2. Draft editorial calendar for Q: pieces proposed per sprint, pillar balance confirmed, 50/30/20 content type distribution checked
3. CMO review: calendar submitted to CMO for awareness (not approval — Content Strategist owns the calendar; CMO reviews for strategic alignment)
4. Production capacity confirmed: executors informed of sprint volume

### Q-minus-1 Week (Prep)
1. Briefs for Sprint 1 written and delivered to executors
2. Distribution plan for Sprint 1 confirmed with Social Media Manager and Email Marketing Manager
3. COPE decomposition plans for all Sprint 1 pieces documented in briefs

### In-Quarter (Weekly Ops)
- Monday: review sprint status (pieces delivered / in progress / blocked)
- Thursday: issue briefs for next sprint's first batch
- End of sprint: move completed pieces to "published" in calendar; log distribution actions

---

## 6. Editorial Calendar Governance Rules

1. **No piece enters production without a complete brief.** Missing distribution row = brief is incomplete. Missing success metric = brief is incomplete.
2. **No pillar expansion without coverage threshold met.** New pillars are blocked until at least one active pillar has ≥ 8 cluster posts live.
3. **Publish schedule is non-negotiable for SEO.** Consistency signals are measured by search engines. A piece delayed > 2 weeks is rescheduled to next sprint — not published on a random date.
4. **Distribution is part of the sprint, not post-sprint.** COPE derivatives are scheduled at brief stage. Distribution actions are tracked in the calendar status column.
5. **Performance report gates next quarter.** Q performance report must be completed before Q+1 calendar is locked. Underperforming pieces from Q influence Q+1 content type and pillar priorities.

---

## Sources

- Orbit Media Studios — Annual Content Marketing Survey (editorial consistency and scheduling discipline)
- Animalz — Content Marketing Strategy for SaaS (sprint-based planning patterns)
- Kordiam — Best Editorial Content Planning Tools 2026: https://kordiam.io/best-editorial-content-planning-tools
- LeanTaaS Content Marketing Manager job posting: https://jobs.lever.co/leantaas/585fad14-8fd6-4db5-b7b4-443bb02fda6c
- LaunchDarkly Content Marketing Manager job posting: https://job-boards.greenhouse.io/launchdarkly/jobs/7701298003
