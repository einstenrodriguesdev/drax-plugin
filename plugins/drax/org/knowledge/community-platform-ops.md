# Community — Platform Operations & Moderation Architecture
> Status: stub | Created: 2026-04-28 | Applies to: Community Manager
> Content to be populated on first use by Community Manager agent.

---

## Schema

This document covers the following domains when populated:

### 1. Platform Comparison Matrix

Core evaluation criteria per platform: community model (chat-first vs. forum-first vs. hybrid), audience type fit, moderation tooling depth, analytics capabilities, MCP/API availability, pricing model, and optimal use-case.

**Discord**
- Model: Chat-first (channels, threads, voice). Forum channel type added 2022 — now supports structured threaded discussions.
- Audience fit: Developer communities, gaming communities, creator communities, early-adopter B2C, technical SaaS. Strong for high-frequency, informal engagement. Not optimal for knowledge-base-oriented or professional B2B communities.
- Moderation tooling: Native timeout, kick, ban, role-based permissions, AutoMod (spam/profanity filter), Audit Log. Forum channels support locking and pinning. Community Server required for Server Insights analytics.
- Analytics: Server Insights (Community Server only) — member join/leave, message activity, retention. Limited compared to purpose-built community platforms. API available (discord-mcp: barryyip0625/mcp-discord, 46+ tools).
- Pricing: Free for communities. Discord Nitro (optional for members). No per-seat cost for community admins.
- Optimal use case: developer relations, creator communities, early-stage startup communities with technical/enthusiast audience. High-frequency casual engagement. Not optimal for formal knowledge management.

**Slack**
- Model: Chat-first. Channel and thread structure. Designed for internal teams — repurposed for external communities.
- Audience fit: B2B professional communities, enterprise user communities, agency communities. Works best for small to mid-size communities (<500 active members) due to message history limits on free tier and Slack's internal-first UX.
- Moderation tooling: Limited native moderation. Admin can deactivate members, archive channels, set posting permissions. No native AutoMod or triage system. Slack Connect (cross-org) adds complexity.
- Analytics: Workspace analytics available on paid plans. Limited vs. purpose-built community platforms. Slack MCP: korotovsky/slack-mcp-server for DM, channel history, posting.
- Pricing: Free tier has 90-day message history limit (major constraint for knowledge management). Pro plan required for full history. Enterprise Grid for large enterprise.
- Optimal use case: customer communities for B2B SaaS with enterprise buyers, partner communities, small high-touch communities (<200 members). Not optimal for large-scale or knowledge-base communities.

**Circle**
- Model: Hybrid — combines structured spaces (forum-like) with chat (DM, channel), events, and membership management. All-in-one community OS.
- Audience fit: Creator communities, B2B SaaS customer communities, professional communities, branded membership communities. Strong for communities that need both content and conversation. Analytics-forward.
- Moderation tooling: Member suspension, content removal, space-level access control, automated welcome messages, member tagging. Admin panel with member management.
- Analytics: Strongest native analytics of the group — DAU/WAU/MAU, member activity profiles, space engagement, retention rate, leaderboards. Advanced Analytics add-on available for deeper cohort analysis.
- Pricing: Per-plan monthly fee (not per-seat for members). Plans scale by member count and feature access.
- Optimal use case: creator-audience communities, B2B SaaS communities with content focus, communities where the brand needs both structured content (posts) and real-time chat. No MCP available — requires interface-controller for admin automation.

**Discourse**
- Model: Forum-first. Topic-and-reply structure. The most mature open-source forum platform.
- Audience fit: Developer communities (Rust, Rails, etc.), technical product communities, open-source project communities, knowledge-base-oriented communities. Excellent for communities where knowledge persistence and searchability matter.
- Moderation tooling: Most sophisticated of the group — Trust Level system (TL0-TL4), Staff, Moderator roles, flag-and-review queue, topic locking, post editing, category permissions, Watched Words (AutoMod equivalent), API-accessible moderation actions.
- Analytics: Admin dashboard (basic). Data Explorer plugin for SQL queries. Reporting plugin for scheduled exports. Solved plugin for question resolution tracking.
- Pricing: Self-hosted (free, requires infrastructure) or Discourse-hosted (paid plans). Open-source GPL license.
- Optimal use case: technical product communities, developer relations, knowledge-intensive communities where search and topic persistence are critical. Highest moderation capability. Steepest admin learning curve.

**Bettermode** (formerly Tribe)
- Model: Hybrid — visual-first with block builder for custom layouts, spaces, and widgets. More customizable than Circle for branded experiences.
- Audience fit: B2B SaaS customer communities, branded customer portals, product-adjacent communities. Strong white-label capability.
- Moderation tooling: Content moderation, member management, role-based permissions. Less mature than Discourse.
- Analytics: Built-in analytics dashboard. Less detailed than Circle's native analytics.
- Pricing: Per-plan. Free trial available.
- Optimal use case: communities where brand visual consistency matters most, B2B customer community with white-label requirement. Alternative to Circle for brands that need more layout flexibility.

**Khoros Communities**
- Model: Forum-first, enterprise-grade. Designed for large-scale customer support communities.
- Audience fit: Enterprise B2C (telco, finance, software), large customer support deflection communities. Not appropriate for early-stage startups.
- Moderation tooling: Enterprise-grade — gamification (badges, ranks), moderation queue, content labeling, community manager dashboard.
- Analytics: Advanced analytics, custom reporting, API integration with enterprise CRMs.
- Pricing: Enterprise contract — high cost, not appropriate for seed-stage.
- Optimal use case: large enterprise customer support communities (10,000+ active members). Overkill for early-stage.

### 2. Platform Selection Decision Framework

Use this decision tree before selecting a platform or recommending a migration:

**Step 1 — Identify primary SPACES objective**
- Acquisition or Product feedback → Discord (technical/startup audience) OR Circle (professional/creator audience) OR Bettermode (B2B white-label)
- Support → Discourse (searchability + Solved plugin) OR Khoros (enterprise scale)
- Contribution → Discourse (open-source contributor model) OR Circle (content creator model)

**Step 2 — Identify audience type**
- Technical / developer / enthusiast → Discord or Discourse
- Professional B2B / SaaS buyer → Slack (small communities) or Circle or Bettermode
- Creator / consumer / lifestyle → Circle or Discord

**Step 3 — Identify required analytics depth**
- Need detailed native analytics → Circle (best) or Discourse with Data Explorer
- API access for automated health reports → Discord (discord-mcp) or Discourse (API)
- Minimal analytics acceptable → Slack or Bettermode

**Step 4 — Identify moderation complexity**
- High moderation complexity (legal risk, harmful content categories, large scale) → Discourse or Khoros
- Standard moderation (off-topic, competitor mentions, P2-level incidents) → any platform
- Low moderation complexity (private, invite-only, professional community) → Slack or Circle

**Step 5 — Apply channel-hypothesis.md**
- Before committing to platform configuration: define platform success threshold for 90-day validation (return rate >25% AND P2P ratio >20% by day 90)
- If migrating from an existing platform: define migration success threshold (retain >60% of active members within 30 days of migration)

### 3. Platform Moderation Triage Protocol — P1/P2/P3 Severity Taxonomy

**P1 — Immediate removal + escalation (SLA: 1 hour)**
- Definition: content that poses legal risk, brand-damaging public harm, harassment, or safety risk.
- Qualifying scenarios: harassment targeting a specific member (personal attack, doxxing attempt), content infringing intellectual property rights, defamatory statements about the company, illegal content (CSAM — mandatory report; illegal activity promotion), data exposure (member posts personal identifying information of another member).
- Response protocol: remove content immediately. DM the posting member (do not publicly debate the removal). Escalate to CMO + CLO within 1 hour with screenshot and context. Do not interpret legal documents — CLO decides legal response. If member is a repeat P1 offender: ban pending CMO + CLO review.
- Escalation contacts: CLO (legal risk, IP claims, defamation, data exposure), CMO (brand crisis, media spillover risk).

**P2 — Response within 4 hours (no removal unless escalated to P1)**
- Definition: content that violates community policy, risks brand reputation, or creates moderation friction — but does not require immediate removal.
- Qualifying scenarios: off-topic post in a structured channel (redirect, do not remove), competitor mention or comparison post (acknowledge per template, do not suppress), negative product feedback posted publicly (respond per template, route to Product Manager), policy violation (language warning, first offense), spam (first post — warning; repeat — remove and DM).
- Response protocol: respond using the relevant P2 response template (see Moderation Playbook section). Do not editorialize. Do not debate the member publicly. Document in moderation incident log (monthly health report section).
- CMO notification: if the P2 incident has public spillover risk (member threatening to post on Twitter/LinkedIn), notify CMO before responding.

**P3 — Response or facilitation within 24 hours (no removal, no escalation)**
- Definition: unanswered questions, low-engagement introductions, inactive discussion threads needing facilitation.
- Qualifying scenarios: member question unanswered for >24 hours (P3 flag — Community Manager responds or tags a Contributor/Ambassador to respond), new member introduction with no peer replies (Community Manager acknowledges and asks a follow-up question), discussion thread losing momentum (Community Manager adds a new prompt or tags a relevant expert member).
- Response protocol: respond directly or facilitate a peer response. Aim to move the interaction from brand-initiated to peer-to-peer (improve P2P ratio). Document P3 count monthly.

### 4. New-Member Onboarding Architecture

**Core principle**: 90% of community churn occurs within the first 7 days of membership. New members who make their first post within 24 hours of joining have a 3.5× higher 30-day return rate (Circle research, 2024). The onboarding sequence must trigger a first contribution, not just deliver information.

**Fogg B=MAP design requirement**: each onboarding touchpoint must be designed as a Fogg B=MAP intervention — arrive when the new member's Motivation is highest (immediately post-join), reduce the Ability barrier to first contribution (single low-friction prompt, specific channel, one-sentence ask), and deliver a clear Prompt (direct CTA specifying the action and location).

**Five-step onboarding sequence structure**:

1. **Day 0 — Welcome message (immediate, automated)**
   - Trigger: join event
   - Channel: automated DM or #welcome channel
   - Content: name the platform, state the value they joined for (ICP-aligned), give ONE specific action (e.g., "Post a one-sentence intro in #introductions")
   - Fogg design: Motivation = peak (just joined), Ability = minimum (one-sentence post, named channel), Prompt = direct CTA with channel name

2. **Day 1 — First contribution prompt (24-hour trigger if no post made)**
   - Trigger: 24 hours since join AND zero posts
   - Channel: DM
   - Content: specific, low-friction contribution request. Example: "What are you building? Drop a line in #introductions — one sentence is perfect."
   - Fogg design: Motivation = still high, Ability = lowest possible ask, Prompt = named channel + named action. Do NOT use "join the conversation" — this is a non-prompt.

3. **Day 3 — Value nudge (if no post made by Day 3)**
   - Trigger: 72 hours since join AND zero posts
   - Channel: DM
   - Content: link to a high-value discussion or resource inside the community relevant to their ICP segment. Demonstrate what the community offers without asking them to post.

4. **Day 7 — Check-in (if member posted at least once)**
   - Trigger: 7 days since join AND post count ≥ 1
   - Channel: DM or community thread (if natural to do so)
   - Content: acknowledgment of their contribution + specific invitation to a relevant ongoing initiative (product feedback thread, AMA event, peer group).
   - Goal: move from Participant to Contributor orbit level.

5. **Day 14 — Contributor invitation (if post count ≥ 3)**
   - Trigger: 14 days since join AND post count ≥ 3
   - Channel: DM
   - Content: direct invitation to a higher-engagement program (answer a member question, contribute a use case, join an Ambassador-candidate cohort)
   - Goal: identify early Contributor-to-Ambassador transition candidates.

**Platform-specific onboarding tooling**:
- Discord: automated DMs via bot (MEE6, Carl-bot, or custom bot). Forum channel pinned intro post. Role assignment on intro post completion.
- Circle: Circle's native member onboarding flow — automated welcome email + in-platform welcome post. Drip functionality requires integration with email platform.
- Discourse: Discourse Welcome Bot (automated DM). Watched Words for trigger-based messages. Admin can configure automated DMs for new TL0 users.

### 5. Ambassador Program Design Checklist

The Ambassador program is a formal recognition and enablement program for Level 1 Orbit (Ambassador) members. It is the primary tool for converting high-engagement members into community growth multipliers.

**Eligibility criteria (minimum)**:
- [ ] Member for ≥ 30 days
- [ ] Post count ≥ 10 in the last 30 days
- [ ] Has voluntarily recruited or referred at least one other member OR created content shared outside the community
- [ ] No P1 or P2 moderation incidents in the last 90 days
- [ ] Engages with product threads (product-intent signal — also CQL eligible)

**Program components**:
- [ ] Public recognition: Ambassador badge or role tag in the community platform
- [ ] Direct access: dedicated #ambassadors channel with direct Community Manager and Product Manager access
- [ ] Early access: product beta access, preview of product roadmap items, first access to community announcements before general release
- [ ] Content collaboration: invitation to co-create tutorials, use cases, or AMAs
- [ ] Feedback loop: monthly structured feedback session with Product Manager (closes the product feedback loop)

**Program brief requirement**: every Ambassador program must have a `community-program-brief-ambassador.md` written before any member is formally invited. The brief must specify SPACES objective (Acquisition + Contribution), success metric (Ambassador-recruited new members per month), execution steps, and resource requirements (founder involvement required for product roadmap sharing).

### 6. Community Seeding Protocol — First 90 Days

The seeding phase is the period before the community reaches P2P self-sufficiency (P2P ratio >30%). During this phase, the brand must generate enough high-quality content to give members a reason to visit and stay — but must actively transition toward member-generated content as quickly as possible.

**Day 0-30 — Foundation phase**:
- Launch platform structure: create channels/spaces aligned with primary SPACES objectives. Do not over-build — maximum 5-7 channels at launch (more causes decision paralysis for new members).
- Seed content: prepare 10-15 high-value discussion starters before first member invitation. These should be ICP-specific questions, use cases, or resources — not marketing copy.
- Onboarding sequence: deploy Day 0-Day 7 automated sequence before any member is invited.
- Moderation playbook: finalize and review before first member invitation.
- First 50 members: invite by hand (direct outreach to existing users, prospects, or email list subscribers). Curated early community quality sets the tone for all subsequent members.

**Day 31-60 — Seeding transition phase**:
- Target: P2P ratio ≥ 15% by end of Day 60.
- Reduce brand post frequency to 3-4 per week. Monitor if P2P ratio rises as brand posting decreases.
- Launch first community initiative (AMA, expert Q&A, product showcase thread) to stimulate member-initiated content.
- Identify first Ambassador candidates from early members. Personal outreach — invite to contribute more formally.
- Begin CQL monitoring: members reaching Day 14+ with 3+ posts should be assessed for product-intent signals.

**Day 61-90 — Self-sufficiency gate**:
- Target: P2P ratio ≥ 20%, 30-day return rate ≥ 20%, at least 3 identified Contributor-level members.
- If P2P ratio is below 15% at Day 90: revert to Day 0-30 seeding analysis — check onboarding sequence effectiveness, SPACES primary objective, and whether platform choice matches the target audience's actual behavior.
- Community health report #1 due at Day 90: document CHS dimensions, Orbit distribution, CQL volume, moderation incident count.

### 7. Community Platform Migration Decision Framework

Migration from one platform to another is a high-risk operation — active member churn of 30-50% is common during migrations. Execute only when the current platform is provably limiting community health, not as a platform preference.

**Migration trigger criteria (require at least 2 of 4)**:
1. Current platform P2P ratio has been below 20% for 3+ months and platform tooling is identified as the constraint (not onboarding or content quality)
2. Community analytics are insufficient to produce a monthly health report — platform does not expose the data needed for CHS calculation
3. Current platform is mismatched with the evolved audience type (e.g., community grew from developer-focused to professional B2B and Slack is now the wrong platform)
4. API/MCP availability on the new platform is significantly superior and the Community Manager's reporting and CQL identification are blocked by lack of data access

**Migration protocol**:
- [ ] Apply channel-hypothesis.md: structure the migration as a testable hypothesis with a 90-day success threshold before committing
- [ ] Announce migration 30 days before cutover — give members time to join the new platform before the old one is archived
- [ ] Preserve content: export top-performing threads and posts from the old platform; recreate as pinned posts or wiki pages in the new platform
- [ ] Dual-run period: 30 days where both platforms are active. New platform is primary; old platform is archived-mode (read-only or low post frequency)
- [ ] Migration success threshold: ≥60% of Contributor-level members (Orbit Level 2+) active on new platform within 30 days of cutover
- [ ] Write `moderation-playbook-[new-platform].md` and `community-onboarding-sequence.md` for the new platform before cutover — do not migrate without updated ops documents
