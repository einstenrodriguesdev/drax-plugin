# Community — Health Metrics & Member Classification
> Status: stub | Created: 2026-04-28 | Applies to: Community Manager
> Content to be populated on first use by Community Manager agent.

---

## Schema

This document covers the following domains when populated:

### 1. Community Health Score (CHS) — Five-Dimension Framework

- **New member acquisition rate**: raw member count added in the reporting period. Reported as a growth rate, not an absolute number. Acceptable signal only when paired with retention data — acquisition without retention produces churn amplification (faster influx of members who leave quickly). Never reported as a standalone health metric.

- **30-day return rate**: percentage of all active members (ever posted or visited) who returned to the platform within the last 30 days. Formula: (members who visited or posted in the last 30 days) / (total active members) × 100. Target: >25%. Warning threshold: <20% for 2 consecutive months. Critical threshold: <15%. This is the primary retention signal. FeverBee (2023) documented communities with 50,000+ registered members that shut down because 30-day return rate was below 12% — all engagement was brand-initiated.

- **Peer-to-peer (P2P) interaction ratio**: percentage of total interactions in the platform that are member-to-member (not brand-to-member). Formula: (posts, replies, reactions by members) / (all posts, replies, reactions including brand account) × 100. Target: >30%. Warning: <20%. Critical: <12%. A P2P ratio above 30% indicates the community is developing self-sustaining conversation and will survive if the brand stops posting. Below 20% means all value depends on the brand's own posts — the community is a broadcast channel, not a community.

- **Question resolution rate**: percentage of questions posted by members that receive an answer within 24 hours. Applicable to support and product communities (SPACES Support/Product objectives). Formula: (questions answered within 24 hours) / (total questions posted in the period) × 100. Target: >80% within 24 hours. Unanswered questions are classified as P3 moderation incidents. Decline in resolution rate is an early churn signal — members who ask and receive no answer rarely return.

- **Content contribution rate**: percentage of total content posts in the reporting period that were initiated by members (not the brand account). Formula: (member-initiated posts and threads) / (total posts and threads) × 100. Target: >40%. This metric tracks whether the community is consuming content the brand provides or generating its own discussions. A community that is only consuming brand content is at high churn risk.

### 2. Weekly Health Signal Interpretation Table

| Signal combination | Interpretation | Recommended action |
|---|---|---|
| Return rate ↑, P2P ratio ↑ | Healthy growth — community self-sustaining | Maintain cadence; invest in Ambassador program |
| Return rate ↓, P2P ratio ↑ | Value delivery gap — members connect but not returning for platform | Audit onboarding; investigate platform UX friction |
| Return rate ↑, P2P ratio ↓ | Brand dependency — members return only for brand posts | Reduce brand post frequency; launch P2P-prompting initiatives |
| Return rate ↓, P2P ratio ↓ | Collapse signal — community in decline | Immediate intervention: SPACES audit, onboarding review, new initiative |
| High acquisition, low return rate | Onboarding failure — members join but find no value | Audit Day 1-7 onboarding touchpoints; apply Fogg B=MAP analysis to first contribution prompt |
| High CQL volume, low return rate | Extraction-only dynamic — community is being used for leads but not retained | Increase Product and Success SPACES initiatives; reduce Acquisition weighting |

### 3. Orbit Model — Four-Level Member Classification Schema

Based on the Orbit Model (orbit-love/orbit-model, GitHub) with adaptations for branded product communities:

**Level 1 — Ambassador** (highest engagement):
- Definition: members who actively recruit other members, create high-value content unprompted, and publicly advocate for the product or community. Their love (depth of engagement) and reach (network influence) are both high.
- Behavioral indicators: creates original content (guides, tutorials, templates), refers others to the community via social posts or direct invitation, responds to other members' questions proactively, participates in beta testing or co-creation programs, mentions the product positively in public channels outside the community.
- Target count: typically 1-5% of active members. Ambassadors are identified, not manufactured.
- Management: recognized publicly, invited to formal Ambassador program, given early access and direct feedback channel to Product Manager.

**Level 2 — Contributor** (regular active member):
- Definition: members who post regularly, generate UGC (user-generated content), respond to other members, and consistently return to the platform. Post count ≥ 3 in the last 30 days.
- Behavioral indicators: replies to other members' threads (not just brand posts), creates original posts or shares use cases, engages with product feedback threads, maintains regular platform visits (>2/week).
- Target count: 10-20% of active members for a healthy community.
- CQL eligibility: Contributor level is the minimum orbit level for CQL consideration — must also meet product-intent signal criterion.

**Level 3 — Participant** (passive consumer):
- Definition: members who visit and react (likes, reactions) but rarely post original content or replies. May comment on brand posts but do not initiate conversations.
- Behavioral indicators: regular visits (weekly), reactions to content, rare original posts, no member-to-member interactions initiated.
- Target count: 40-60% of active members.
- Uplift path: targeted with low-friction contribution prompts (e.g., poll, 1-sentence question) designed to move to Contributor level.

**Level 4 — Observer** (lowest engagement):
- Definition: members who joined but have not engaged meaningfully. May have visited once or twice since join date but have not posted or reacted.
- Behavioral indicators: join date ≥ 7 days ago, 0-1 platform visits, no posts or replies, no reactions in the last 30 days.
- Target count: expect 20-40% of total registered members to be Observers. This is normal — goal is to reduce Observer % over time via onboarding optimization.
- Churn risk: Observers who do not progress to Participant within 14 days of joining have a >70% likelihood of permanent churn.

### 4. CQL Qualification Criteria — Four-Factor Behavioral Checklist

A community member qualifies as a Community-Qualified Lead (CQL) when ALL four criteria are met simultaneously:

**Factor 1 — Membership duration ≥ 14 days**
- Rationale: eliminates onboarding curiosity spikes. Members who show intent within the first 14 days are often exploring — not evaluating. 14 days filters for sustained interest.
- Platform extraction: join date field in Discord/Circle/Discourse member record.

**Factor 2 — Post or reply count ≥ 3 in the last 30 days**
- Rationale: demonstrates active participation (Contributor orbit level). Passive Observers and occasional Participants do not meet the engagement depth required for CQL classification.
- Platform extraction: Discord — member post count per server; Circle — member activity tab; Discourse — user profile post count.

**Factor 3 — Product-intent behavioral signal detected**
- Definition: a specific behavior that signals product evaluation, not general community curiosity. Qualifying signals: pricing page visit via UTM-tracked link embedded in community channels; product documentation access via UTM-tracked link; demo request initiated via community thread or embedded form; response to a product-specific poll ("Are you currently evaluating [Product]?"); engagement with a pricing comparison thread.
- Platform extraction: UTM parameter tracking on community-embedded links → GA4 or MAP event; platform poll response data.
- Critical: product-intent signal detection requires that community-embedded links use UTM parameters traceable to the community platform. Untracked links cannot be used to detect this signal.

**Factor 4 — Product-related thread engagement**
- Definition: commented on, replied to, or reacted to a thread related to product features, integrations, use cases, pricing comparisons, or product feedback. Not sufficient: reacted to a generic community discussion unrelated to the product.
- Platform extraction: Discord — thread-level reaction and reply history; Circle — comment and reaction history per post; Discourse — post like and reply history.

**CQL conversion rate benchmark**: CQLs meeting all four criteria convert at 4.8× the MQL rate (Common Room, 2025 CLG Guide). Partial-criteria flags (any 3 of 4) convert at MQL-parity — not worth dedicated CQL track.

**Volume-over-quality failure pattern**: the most common CQL framework failure is flagging all active members with 3+ posts as CQLs without the product-intent signal criterion. This floods the MAP with unqualified leads and burns SDR time — CMSwire (2024) documented this as the primary reason community-to-sales handoff programs are abandoned within 6 months.

### 5. Platform-Specific Metric Extraction Protocols

**Discord — Server Insights dashboard:**
- Access: Server Settings → Community → Server Insights (requires Community Server enabled)
- Available metrics: new members (daily/weekly/monthly), member retention (% who visited in last 30 days), message activity (total messages per channel), top channels by activity
- P2P ratio extraction: requires exporting message data by author type (brand account vs. member accounts) — available via Discord API or discord-mcp server tool. Manual approximation: count brand account posts in a sample week and subtract from total message count.
- Orbit level classification: manual via member profile inspection (post count, join date) or via Common Room integration for automated classification.

**Circle — Analytics dashboard:**
- Access: Admin panel → Analytics → Member Activity
- Available metrics: DAU/WAU/MAU, new members, member retention (stickiness: DAU/MAU ratio), post count by member, space engagement rates
- 30-day return rate: Circle reports MAU directly — use as the primary retention proxy. (MAU / total registered members) × 100 approximates return rate.
- P2P ratio: Circle analytics shows total posts; brand account posts can be filtered by author. P2P ratio = (total posts − brand account posts) / total posts × 100.

**Discourse — Admin Dashboard and Data Explorer:**
- Access: Admin panel → Dashboard (basic) + Admin panel → Plugins → Data Explorer (advanced SQL queries)
- Available metrics: new users, posts per period, topic views, solved topics (if Solved plugin enabled), trust level distribution
- Question resolution rate: requires Discourse Solved plugin. Solved ratio = (topics marked solved) / (total question-type topics) × 100. Without Solved plugin, track manually via topic reply presence.
- P2P ratio: Data Explorer SQL query — filter posts by author role (staff vs. non-staff) over the reporting period.
- Trust level distribution maps approximately to Orbit levels: Trust Level 0 (Observer), TL1 (Participant), TL2-3 (Contributor), TL4 (Ambassador candidate).

**Bettermode / Vanilla Forums / Khoros:**
- These platforms provide analytics dashboards via their admin panels. Metric extraction follows the same principles as Circle but with platform-specific field names.
- Metric mapping: active members metric → 30-day return rate proxy; post analytics by author type → P2P ratio; reply rate on member-initiated posts → contribution rate.
- For platforms without native P2P breakdown: manual sampling protocol — extract 20 posts from the last 30 days, classify each as brand-initiated or member-initiated, calculate ratio from sample.
