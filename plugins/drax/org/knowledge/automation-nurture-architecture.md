# Automation — Nurture Stream Architecture
> Status: stub | Created: 2026-04-28 | Applies to: Marketing Automation Specialist
> Content to be populated on first use by Marketing Automation Specialist agent.

---

## Schema

This document covers the following domains when populated:

### 1. Behavioral Nurture DAG Structure
- Definition: a nurture DAG (directed acyclic graph) is the complete map of all nurture streams, their entry triggers, branch conditions, and exit events — drawn as a flowchart where no stream can loop back to itself
- Why time-based drips are a fallback, not primary architecture: time-based sequences ignore behavioral signals that should trigger stream changes mid-nurture; behavioral branching responds to buyer signals in real time
- DAG completeness requirement: every lead in the MAP must be enrolled in exactly one nurture stream at any time (or in no stream, with a suppression reason recorded). Leads that fall through all stream entry criteria without suppression are a MAP configuration gap.
- How to draw and document the DAG: stream nodes, entry condition arrows, branch condition arrows, exit condition arrows, and priority labels

### 2. Entry Trigger Types
- Behavioral entry triggers: specific event fired (pricing_page_visited, roi_calculator_completed, demo_requested_abandoned, webinar_attended, content_downloaded_[asset])
- Firmographic entry triggers: explicit score crosses a threshold (e.g., enters Consideration stream when explicit score ≥ 20 but implicit score < 30)
- Score-band entry triggers: lead exits one score band and enters another (implicit score crosses from 15 to 16 = move from Awareness to Consideration stream)
- Time-based fallback entry: if no behavioral trigger fires within N days of lead creation, enroll in Awareness stream
- Source-based entry: lead created from a specific form or campaign is pre-enrolled in a specific stream (e.g., all demo request abandoned leads enter Evaluation stream immediately)
- Entry guard (firmographic gate): even if behavioral trigger fires, firmographic explicit score must meet minimum threshold before entering a high-touch stream (prevents low-fit leads from consuming high-touch email capacity)

### 3. Standard Stream Definitions

**Awareness Stream (TOFU):**
- Entry: new lead, implicit score 0-15, no high-intent behavioral signal
- Purpose: educate on category problem, build brand familiarity, surface ICP pain points
- Content angle: problem-aware content (thought leadership, industry data, pain point identification)
- Cadence: 4-5 emails over 21-28 days
- Exit: implicit score crosses 20 → Consideration stream; behavioral trigger (pricing page) → Evaluation stream; unsubscribed; max emails reached

**Consideration Stream (MOFU):**
- Entry: implicit score 16-30, explicit score ≥ minimum threshold
- Purpose: position the product as the solution, provide social proof, build evaluation intent
- Content angle: solution-aware content (case studies, product use cases, comparison content, ROI framing)
- Cadence: 5-6 emails over 28 days
- Exit: MQL threshold crossed → route to sales; behavioral trigger (pricing page, ROI calc) → Evaluation stream; unsubscribed; max emails

**Evaluation Stream (BOFU):**
- Entry: pricing page visited (2+ times in 7 days), demo request abandoned, ROI calculator completed, webinar attended + explicit score ≥ threshold
- Purpose: remove final objections, facilitate demo booking, create urgency
- Content angle: decision-stage content (demo offers, customer references, implementation timeline, pricing context)
- Cadence: 3-4 emails over 10-14 days (compressed — high-intent leads should not wait)
- Exit: demo booked → exit nurture (enter sales-managed sequence); MQL threshold crossed; unsubscribed

**Acceleration Stream:**
- Entry: high-intent signal detected mid-nurture (pricing page 3× in 7 days, ROI calculator + pricing page, competitor comparison page visited)
- Purpose: fast-track to demo or MQL — this lead is in active evaluation mode
- Cadence: 2 emails over 7 days; direct offer of demo or consultation
- Exit: demo booked; MQL threshold crossed; unsubscribed; max emails → return to Evaluation stream

**Re-engagement Stream:**
- Entry: no behavioral action in 45 days while still in active nurture; or MQL rejected by sales and returned to marketing
- Purpose: confirm continued interest or clean the database
- Cadence: 3 emails over 14 days
- Exit: any click → return to Consideration stream with refreshed score; unsubscribed; no action after all emails → suppress (add to global suppression list — propose to founder/CMO for sign-off)

### 4. Branch Condition Taxonomy
- High-intent branch: behavioral event that signals active evaluation (pricing page visit, ROI calculator, demo abandonment) → redirect to higher-priority stream
- Medium-intent branch: email clicked (specific CTA clicked, not just any link) → advance within current stream
- Conversion branch: MQL threshold crossed mid-stream → exit all nurture, route to sales queue
- Negative branch: unsubscribed, hard bounced → global suppression, exit all streams
- Inactivity branch: no action by email N → continue to next email or branch to re-engagement
- Drip fallback: no behavioral signal detected → continue time-based drip sequence (fallback only, not primary path)

### 5. Exit Condition Hierarchy
Priority order (highest wins):
1. Unsubscribed / hard bounced → global suppression (cannot be overridden)
2. MQL threshold crossed → route to sales, exit all nurture
3. Demo booked → exit all nurture, enter sales-managed sequence
4. Conversion to paid/trial → exit nurture, enter Email Marketing Manager lifecycle sequences
5. High-intent signal → escalate to Acceleration or Evaluation stream
6. Max emails reached → route to Re-engagement stream after 14-day cooling
7. Inactivity timeout → route to Re-engagement stream
8. Time-based drip continues (only when no other condition applies)

### 6. Stream Priority Conflict Resolution
When a lead qualifies for two streams simultaneously (e.g., is enrolled in Consideration stream when Acceleration stream entry trigger fires):
- Acceleration > Evaluation > Consideration > Re-engagement > Awareness (priority order)
- Higher-priority stream pauses the lower-priority stream enrollment (do not exit — pause with ability to resume)
- If lead exits the higher-priority stream without converting (e.g., Acceleration completes without demo booked), resume the paused lower-priority stream from where it stopped (not from the beginning)
- Global suppression (unsubscribe) always overrides all streams — no exceptions

### 7. Nurture-to-Lifecycle Handoff Rule
The boundary between MAP nurture (Marketing Automation Specialist domain) and ESP lifecycle automation (Email Marketing Manager domain):
- Pre-conversion: lead has no account, no trial, no paid subscription → MAP nurture (MAS domain)
- Post-signup: lead creates a trial account or purchases → MAP nurture exits immediately; ESP lifecycle sequences enter (EMM domain)
- The handoff event: `trial_started` OR `account_created` OR `paid_subscription_created` — whichever applies to the product model
- Implementation: MAP workflow monitors for the handoff event; when detected, removes lead from all nurture streams, updates lifecycle stage in MAP and CRM, and triggers notification to EMM's ESP workflow

### 8. Progressive Profiling — Form Strategy
- Definition: collecting additional firmographic and intent data across multiple form submissions rather than in a single long form at first touch
- First touch form: email + company name (minimum viable data — maximizes conversion rate at first gate)
- Second touch form: job title + company size (firmographic data for explicit scoring — ask at second gated asset)
- Third touch form: pain point + evaluation timeline + current solution (intent data for routing and personalization — ask at high-value asset like ROI calculator or assessment)
- Implementation in HubSpot: Progressive Profiling feature (shows only unanswered fields on subsequent form views)
- Implementation in Marketo: Progressive Profiling module in Marketo Forms 2.0 — configure fields to show/hide based on known contact properties
- Why not ask everything at first touch: each additional field at first touch reduces form conversion rate by ~3-8%. A 5-field form at first touch produces 40-65% fewer leads than a 2-field form. Collect data progressively as the relationship deepens.
