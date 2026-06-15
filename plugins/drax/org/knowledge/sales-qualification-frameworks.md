# Sales Qualification Frameworks
> Applies to: BDR, AE (Account Executive), VP Sales, CRO
> Status: stub
> Created: 2026-04-28 by HR agent

---

## Scope

This document defines the qualification frameworks used by the BDR (for discovery call gating) and AE (for opportunity management). Covers: BANT, MEDDIC, SPICED — with a decision tree for framework selection by deal size and cycle length, BDR-scope vs. AE-scope field delineation, SQL handoff protocol, and MQL vs. SQL disqualification taxonomy.

---

## Framework Selection Decision Tree

| Deal size | Sales cycle | Buying committee | Recommended framework |
|---|---|---|---|
| Below $10K ACV | < 30 days | 1 decision-maker | BANT (3 of 4 minimum) |
| $10K–$50K ACV | 30–90 days | 1-2 decision-makers | BANT (4 of 4 for confident SQL) |
| $50K–$150K ACV | 90–180 days | 2-4 stakeholders | MEDDIC entry checklist (BDR), full MEDDIC (AE) |
| Above $150K ACV | 180+ days | 4+ stakeholders, formal procurement | MEDDIC full (BDR confirms Economic Buyer + Champion + Identified Pain minimum) |
| PLG + sales-assist | Variable | Product champion + Economic Buyer | SPICED (Situation, Pain, Impact, Critical Event, Decision) |

**Rule**: BDR does not attempt to complete the full MEDDIC scorecard. BDR's qualification scope is the entry criteria: Identified Pain, Economic Buyer identification, and Champion existence. AE completes Decision Criteria, Decision Process, Metrics, and Competition dimensions post-handoff.

---

## BANT Framework

**Definition:** Budget, Authority, Need, Timeline — rapid triage for SMB and mid-market deals.

**Question templates per dimension:**

**Budget:**
- "Do you have a budget set aside for solving [pain category] this year?"
- "Is this an already-allocated budget or a discretionary spend request?"
- "Roughly what range are companies like yours spending to solve this problem?"
- Disqualification signal: "We have no budget for this" + timeline > 12 months + no champion present — all three together = hard disqualification.

**Authority:**
- "Who else is involved in decisions like this at [Company]?"
- "Is [your contact] the primary decision-maker or are there others who would need to be aligned?"
- "What does a typical buying decision look like at your company for a solution in this category?"
- Watch for: contact is an influencer/evaluator but not the Economic Buyer — document accurately, do not assume they can close. This is not a disqualifier — it is a handoff note.

**Need:**
- "What is the current cost of not solving this?" — surfaces impact, not just symptoms.
- "How are you handling [problem area] today?"
- "What made you willing to take this call today?" — reveals urgency driver.
- Disqualification signal: "We're just exploring" with no specific problem statement = MQL, not SQL. Curiosity ≠ pain.

**Timeline:**
- "If this were the right solution, what would need to be true for you to move forward in the next 90 days?"
- "Is there a deadline or business event driving timing?"
- "What happens if you don't solve this by [their stated deadline]?"
- Disqualification signal: "Maybe next year" with no specific trigger event = re-cycle in 90 days, not SQL.

**SQL gate (BANT):**
- Confident SQL: all 4 BANT dimensions confirmed
- Standard SQL: 3 of 4 confirmed, 1 documented as gap with plan to resolve in AE call
- MQL: 2 or fewer confirmed — route to nurture; do not hand off to AE

---

## MEDDIC Framework

**Definition:** Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion — enterprise deal qualification.

**BDR scope (entry checklist — confirm before handoff):**

**Identify Pain:**
- "What is the specific problem costing you [time / revenue / risk] right now?"
- "How do you measure the impact of this problem today?"
- "What have you tried to solve it? Why didn't that work?"
- Required: a specific, articulated pain statement — not "we could probably be more efficient."

**Economic Buyer:**
- "Who has final sign-off on a purchase in this category at your company?"
- "Is that the same person we're speaking with today?"
- Required: name and title of the Economic Buyer confirmed. If contact is not Economic Buyer: confirm they have access to the Economic Buyer before handoff.

**Champion:**
- "Would it be helpful for me to put together something you could share internally with [stakeholders]?"
- Champion signal: contact takes independent action to advance the deal (schedules follow-up without prompting, requests materials to share with their team, introduces BDR to another internal stakeholder voluntarily)
- Required: at least one confirmed or suspected champion before SQL handoff.

**AE scope (complete post-handoff):**

**Metrics:** what specific, quantifiable business outcome must the solution deliver to justify purchase? (e.g., reduce reconciliation time from 15 hrs/week to under 2 hrs/week)

**Decision Criteria:** what formal criteria does the buying committee use to evaluate options? (security requirements, compliance certifications, integration requirements, SLA minimums)

**Decision Process:** what is the formal purchasing process? (procurement review, legal review, security review, board approval threshold, contract routing timeline)

**Competition:** what alternatives are being evaluated? What is the incumbent? What is the switching cost?

---

## SPICED Framework

**Definition:** Situation, Pain, Impact, Critical Event, Decision — discovery-driven framework for PLG + sales-assist and shorter cycles.

| Dimension | Question focus | BDR objective |
|---|---|---|
| Situation | Current state — what are they using, how big is the team, what's the context | Establish baseline to personalize pain hypothesis |
| Pain | Specific problem they are experiencing right now | Surface the verbatim pain statement |
| Impact | Business cost of the pain — revenue, time, risk | Quantify the value of solving it |
| Critical Event | Specific deadline or event that creates urgency | Identify if there is a natural forcing function |
| Decision | Who decides, what is the process, what does a decision look like | Identify Economic Buyer and process |

**SPICED vs. BANT:** SPICED starts with Situation context-gathering before probing Pain — more appropriate for PLG motions where the prospect's existing product usage provides context that shapes the conversation. BANT is faster and works when pain is already clear from the inbound signal or intent data.

---

## SQL Handoff Protocol — 5 Required Fields

Before a meeting is transferred to AE and classified as SQL, BDR must complete all 5 fields in the `sql-handoff-[prospect]-[date].md` document:

**Field 1: Qualification dimensions confirmed**
List which BANT or MEDDIC entry criteria are confirmed, which are partially confirmed (with the specific gap noted), and which are unknown. Incomplete qualification is not a handoff blocker — it is documented context for AE.

**Field 2: Pain point verbatim from prospect**
The exact words the prospect used to describe their problem. Paraphrase is not acceptable — verbatim quote only. This is the AE's opening anchor in the discovery call.

**Field 3: Stakeholders identified**
Name, title, decision role (Economic Buyer / Champion / Evaluator / Blocker / Unknown), and contact information for every stakeholder mentioned.

**Field 4: Next agreed action**
Date, format (demo / discovery call / POC), and confirmed attendees. The prospect must have agreed to the next step — "I'll follow up to schedule" is not a confirmed next action.

**Field 5: Known objections with responses given**
Every objection the prospect raised during BDR engagement, the response the BDR gave, and the prospect's reaction. AE must not re-trigger objections with responses already established as effective.

**What happens without all 5 fields:**
Incomplete handoff = MQL classification. AE returns it to BDR with missing fields flagged. BDR cannot claim the SQL count until all 5 fields are complete.

---

## MQL vs. SQL Disqualification Taxonomy

| Classification | Criteria | Routing |
|---|---|---|
| SQL | 3+ BANT dimensions confirmed (or MEDDIC entry: Pain + EB identified + Champion present), next action agreed | Hand off to AE — create sql-handoff document |
| MQL — late stage | 2 BANT dimensions confirmed, active interest expressed, no agreed next action | Route to Marketing Automation Specialist for Evaluation-stage nurture |
| MQL — mid stage | Interest expressed, specific pain present, no authority or budget confirmed | Route to Marketing Automation Specialist for Consideration-stage nurture |
| MQL — early stage | Curiosity only, no specific pain, no budget, no timeline | Route to Marketing Automation Specialist for Awareness-stage nurture |
| Disqualified — recycle | "Not the right time" with specific future date | Re-queue in 90-day recycle sequence |
| Disqualified — competitive | Currently under contract with competitor, no evaluation in progress | Add to competitive displacement watch list, recycle in 180 days |
| Disqualified — hard | Out of ICP, unsubscribed, out of business, explicit permanent rejection | Remove from all sequences, suppress in CRM |

---

## Objection Handling Protocol

**Log every objection:**
Every objection must be logged to `objection-library.md` with: exact wording, deal stage it appeared in, ICP tier of the prospect, frequency count (how many times this objection has appeared), and the best-tested response.

**Objection classification:**
- **Smoke screen**: a reflexive objection that disappears when acknowledged and probed (e.g., "We're too busy right now" — often dissolves when asked "If timing were better, would this be worth a conversation?")
- **Real blocker**: a substantive objection that requires a real answer or indicates disqualification (e.g., "We have a 3-year contract with [Competitor]")
- **Buying signal disguised as objection**: "Your pricing seems high" said after 20 minutes of discovery = interest. Treat as an invitation to discuss value, not rejection.

**Response structure:**
1. Acknowledge: confirm you heard the objection without arguing
2. Clarify: determine if it is a smoke screen or a real blocker
3. Respond: if smoke screen — use tested response. If real blocker — document and determine if it is a disqualification signal.
4. Move: pivot to the next discovery dimension — do not dwell on objections
