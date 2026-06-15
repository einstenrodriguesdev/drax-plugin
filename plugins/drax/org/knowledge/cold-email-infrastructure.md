# Cold Email Infrastructure
> Status: stub | Created: 2026-04-28 | Applies to: Cold Outreach Specialist
> Sources: Instantly.ai deliverability guide 2025, Digital Bloom B2B Email Deliverability Report 2025, Google/Yahoo bulk sender mandates 2024–2025, Outreach deliverability playbook, SalesHive DKIM/DMARC/SPF best practices

---

## Purpose

This document defines the technical infrastructure required to run cold email outreach at scale with consistent inbox placement. It covers dedicated sending domain setup, DNS authentication configuration, inbox warmup protocol, inbox rotation architecture, deliverability monitoring methodology, and the P1/P2/P3 severity taxonomy for deliverability triage.

This is a prerequisite document for the Cold Outreach Specialist. Load before any infrastructure setup, new domain provisioning, or deliverability triage session.

---

## 1. Sending Domain Architecture

**The fundamental rule**: cold outreach never uses the primary brand domain (company.com). Dedicated sending domains are provisioned exclusively for outbound cold contact.

### Dedicated domain naming conventions
- Pattern: [action][company].com — e.g., trycompany.com, getcompany.com, company-outreach.com, usecompany.com
- Alternatively: [company][location/adjective].com — e.g., companyhq.com, companyio.com
- Avoid: domains that look deceptive (company-official.com, company-support.com) — spam filters flag deceptive naming patterns
- Recommended acquisition: Namecheap, Cloudflare Registrar, or GoDaddy — aged domains (3+ months) preferred for faster reputation building
- Domain age premium: mature domains achieve approximately 30 percentage point inbox placement premium over new domains (Digital Bloom 2025)

### Domain count at scale
- 1 domain per ICP segment or per campaign type at small scale (<500 contacts/week)
- 1 domain per 2,000–3,000 contacts at full scale — enables domain rotation if reputation is stressed on one domain
- Never put all sending volume on one domain — domain health is the infrastructure's single point of failure

---

## 2. DNS Authentication Configuration

### SPF (Sender Policy Framework)
- Purpose: authorizes which mail servers can send on behalf of the domain
- Record type: TXT record on root domain
- Syntax: `v=spf1 include:[esp_sender_domain] ~all`
  - Replace `[esp_sender_domain]` with the sending platform's SPF include (e.g., `include:spf.protection.outlook.com` for Microsoft 365, `include:_spf.google.com` for Google Workspace, `include:sendgrid.net` for SendGrid)
  - `~all` = softfail (recommended over `-all` to avoid false rejections during testing)
- Validation method: MXToolbox SPF checker, dmarcian, Postmark SPF tester
- Status check: fully authenticated domains achieve 2.7x higher inbox placement than unauthenticated (Digital Bloom 2025)

### DKIM (DomainKeys Identified Mail)
- Purpose: cryptographic signature proving email was not altered in transit
- Record type: TXT record at `[selector]._domainkey.[domain]`
- Key strength: 2048-bit minimum (1024-bit is deprecated as of 2024)
- Generation: most sending platforms (Google Workspace, Microsoft 365, Instantly) auto-generate DKIM keys — retrieve the public key from the platform and add the DNS TXT record
- Multiple selectors: if using multiple ESPs, each requires its own DKIM selector
- Validation: DKIMValidator.com, MXToolbox DKIM checker

### DMARC (Domain-based Message Authentication, Reporting & Conformance)
- Purpose: policy that tells receiving mail servers what to do with unauthenticated email claiming to be from your domain
- Record type: TXT record at `_dmarc.[domain]`
- Syntax: `v=DMARC1; p=[policy]; rua=mailto:[reporting_address]; pct=100`
- Policy progression protocol (mandatory for new domains):
  - Weeks 1–2: `p=none` — monitoring only. No enforcement. Review DMARC aggregate reports (rua) for authentication failures.
  - Weeks 3–4: `p=quarantine` — unauthenticated email goes to spam. Required for Google/Yahoo bulk sender mandate (5,000+ emails/day).
  - Week 5+: `p=reject` — unauthenticated email is rejected. Maximum protection.
- Google/Yahoo/Outlook 2025 mandate: p=quarantine or p=reject required for bulk senders (5,000+ emails/day). p=none does not satisfy the mandate.
- DMARC reporting address: use a dedicated inbox or a DMARC monitoring service (dmarcian, Postmark DMARC, EasyDMARC) — do not use a human inbox; aggregate reports are machine-readable XML

### 2025 Bulk Sender Mandates Summary
| Provider | Requirement | Effective |
|---|---|---|
| Google | SPF + DKIM + DMARC (p=quarantine+), spam complaint rate <0.1% warning / <0.3% hard limit, one-click unsubscribe for bulk | February 2024 enforced, 2025 hardened |
| Yahoo | Same as Google | February 2024 |
| Microsoft Outlook | SPF + DKIM + DMARC required for high-volume senders (>5,000/day) as of May 5, 2025 | May 2025 |

---

## 3. Inbox Provisioning

### Inbox count and configuration
- Minimum viable: 5 inboxes per sending domain for campaigns up to 500 contacts/week
- Scale target: 20–50 inboxes per sending domain for campaigns 1,000–5,000 contacts/week
- Inbox ceiling per day: 30–50 emails per inbox during warmup; 100–200 emails per inbox at full speed (platform-specific)
- Sending platform inbox rotation: enabled at all times — never send all volume through one inbox

### Inbox providers for cold outreach
- Google Workspace: strong deliverability to Gmail recipients (majority of B2B contacts); $6/user/month; limit of 500 emails/day per account for external sends via SMTP
- Microsoft 365: required for strong deliverability to Outlook recipients; $6/user/month
- Mixed fleet recommended: 50% Google Workspace + 50% Microsoft 365 inboxes for maximum cross-provider deliverability
- IONOS/Namecheap email: lower cost alternative; lower reputation baseline — use only for Tier 3 volume campaigns

---

## 4. Domain Warmup Protocol

**Mandatory for all new sending domains. No exceptions.**

Warmup is the process of building sender reputation by starting with low volume, high-engagement sends and gradually increasing volume over 4–6 weeks.

### Warmup timeline

| Week | Daily volume ceiling (per inbox) | Recommended send type | Complaint rate checkpoint | Action if breached |
|---|---|---|---|---|
| Week 1 | 5–10 emails/inbox/day | Warmup tool sends + real engaged contacts | <0.1% | Pause, investigate source |
| Week 2 | 15–25 emails/inbox/day | Warmup tool sends + real engaged contacts | <0.1% | Pause, investigate |
| Week 3 | 30–50 emails/inbox/day | Begin mixing cold prospects (Tier 2/3 only) | <0.2% | Reduce volume to prior tier |
| Week 4 | 75–100 emails/inbox/day | Cold prospects at target rate | <0.3% | Hard stop — reduce by 50% |
| Week 5+ | 150–200 emails/inbox/day | Full cold outreach | <0.3% | Hard stop — domain rotation |

### Warmup tool options
- Instantly warmup (built-in): included in Instantly subscription — automatically exchanges warmup emails with other Instantly users
- Smartlead warmup (built-in): same network model
- Mailwarm, Lemwarm: standalone warmup services
- First 2 weeks: warmup tool handles all sends (no cold prospect sends during this period)
- Week 3 onward: begin mixing cold prospect sends at Tier 3 (lowest-personalization) volume first

### Hard-stop conditions during warmup
- Complaint rate exceeds 0.3% at any tier → pause sending for 48 hours, investigate list quality, resume at prior week's volume ceiling
- Bounce rate exceeds 5% → list quality failure — clean the list before resuming
- Google Postmaster Tools shows "Low" reputation on day 3+ → infrastructure configuration issue — verify SPF/DKIM/DMARC before continuing

---

## 5. Inbox Rotation Architecture

Inbox rotation distributes sending volume across multiple inboxes to:
1. Stay below each inbox's daily sending ceiling
2. Prevent ISP pattern-matching of identical send behavior from a single inbox
3. Enable domain resting (temporarily pausing a stressed inbox) without killing the campaign

### Configuration in Instantly / Smartlead
- Import all inboxes associated with the sending domain into the campaign
- Set per-inbox daily send limit: 30–50 during warmup, 100–200 at scale
- Enable random delay between sends: 2–5 minute randomized intervals (simulates human behavior)
- Enable randomized send time: spread sends across the business day in the prospect's timezone
- Unified inbox (Smartlead) or Lead Status (Instantly): aggregate all replies into a single view regardless of which inbox received the reply

---

## 6. Pre-Campaign Inbox Placement Testing

**Run before every new campaign launch. A campaign that fails the placement test does not send.**

### Tools
- MailReach: sends test emails from your sending domain to seed addresses across Gmail, Outlook, Yahoo — reports inbox vs. spam vs. promotions placement rate
- GlockApps: similar seed-list testing with additional B2B email provider coverage
- MXToolbox Deliverability: DNS record validation + basic placement signals

### Pass/fail thresholds
| Metric | Pass | Warn | Fail |
|---|---|---|---|
| Inbox placement rate | >85% | 70–85% | <70% |
| Spam folder rate | <5% | 5–15% | >15% |
| Promotions tab (Gmail only) | <20% | 20–40% | >40% |

### If test fails (inbox placement <85% or spam rate >5%)
1. Check DMARC/SPF/DKIM validity — fix authentication errors first
2. Check domain reputation on Google Postmaster Tools — if "Low," return to warmup protocol
3. Check prior campaign complaint rate — if above 0.3%, pause and clean the list
4. Do NOT launch campaign until placement test passes — sending to cold contacts with sub-70% inbox placement wastes the entire campaign and further damages reputation

---

## 7. Deliverability Monitoring

### Google Postmaster Tools
- Domain Reputation: HIGH (strong, maintain current practices) | MEDIUM (monitor closely, reduce volume if needed) | LOW (active problem — reduce volume immediately) | BAD (critical — stop sending from this domain)
- Spam Rate: percentage of messages sent that were marked as spam by Gmail users
- Authentication: DMARC, DKIM, and SPF pass rates
- Access: register domain at postmaster.google.com (requires DNS verification)

### Key metrics to monitor weekly

| Metric | Healthy | Warning | Critical |
|---|---|---|---|
| Spam complaint rate | <0.1% | 0.1–0.3% | >0.3% |
| Hard bounce rate | <2% | 2–5% | >5% |
| Inbox placement rate | >85% | 70–85% | <70% |
| DMARC pass rate | >98% | 90–98% | <90% |
| Google Postmaster Domain Reputation | HIGH | MEDIUM | LOW or BAD |

---

## 8. P1/P2/P3 Deliverability Severity Taxonomy

### P1 — Active Failure (immediate action required)
Definition: deliverability is actively broken — a significant percentage of emails are not reaching inboxes right now.
Triggers:
- Inbox placement rate <70% on MailReach/GlockApps test
- Complaint rate >0.3% in last 7 days
- Google Postmaster shows domain reputation LOW or BAD
- Domain on a major blacklist (Spamhaus, Barracuda, SURBL)
Action: pause all sending from affected domain immediately. Investigate root cause. If blacklisted: initiate blacklist delisting request. Rotate to a backup domain to maintain campaign continuity. Do not resume until placement test shows >85% inbox.

### P2 — Risk Accumulating (fix within 7 days)
Definition: no active failure today, but trajectory is toward P1 if unaddressed.
Triggers:
- Complaint rate 0.1–0.3% (approaching Google's hard limit)
- Bounce rate 3–5% (approaching the 5% threshold that signals list quality failure)
- DMARC policy still at p=none after 4+ weeks (not satisfying bulk sender mandate)
- Inbox placement test shows 70–85% (warning zone)
- Domain warmup skipped or accelerated (risk of reputation issue materializing)
Action: reduce sending volume by 30–50% immediately. Clean the list (remove hard bounces, remove unverified emails). Progress DMARC to p=quarantine. Re-run placement test after 72 hours. Document issue in campaign launch log.

### P3 — Hygiene (fix within 30 days)
Definition: no active or near-term risk, but configuration is below best practice and will become a P2 if left unaddressed.
Triggers:
- BIMI not implemented (email brand logo in inbox — improves open rates, trust signal)
- Warmup protocol not documented in writing
- Inbox rotation not active (all sends from single inbox)
- DKIM key strength 1024-bit (deprecated)
Action: schedule fix in the next infrastructure maintenance window. Document in the outreach-infrastructure doc under P3 Issues.

---

## 9. Bounce Rate Management and List Hygiene

### Bounce classification
- Hard bounce: permanent delivery failure — invalid email address, domain does not exist, or mailbox permanently unavailable. Must be permanently suppressed from all future sends. Do NOT retry hard bounces.
- Soft bounce: temporary delivery failure — mailbox full, server temporarily unavailable, message too large. Retry is acceptable (most platforms auto-retry 2–3 times). If a contact soft-bounces 3+ times consecutively, move to suppression list.

### List hygiene before any campaign launch
- Run the lead list through an email verification tool (ZeroBounce, NeverBounce, Bouncer) before any campaign launch — remove all addresses flagged as invalid, catch-all, or high-risk
- Remove hard bounces from prior campaigns
- Remove all role-based email addresses (info@, sales@, support@, admin@, hello@) — these are often monitored by multiple people, generate low personal engagement, and high complaint rates

### Bounce rate thresholds before pausing a campaign
| Bounce rate in first 24 hours | Action |
|---|---|
| <1% | Continue normally |
| 1–2% | Monitor closely — run verification on remaining list |
| 2–5% | Pause campaign — clean list before resuming |
| >5% | Stop campaign — full list audit required |
