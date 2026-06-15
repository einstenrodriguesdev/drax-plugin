# Email Deliverability
> Applies to: Email Marketing Manager, Cold Outreach Specialist, Marketing Automation Specialist, RevOps Manager
> Status: active
> Created: 2026-05-23

Email deliverability is the operating discipline that keeps legitimate lifecycle, nurture, and outbound messages out of spam while protecting the sender reputation of the company.

## Operating Principles

- Never send cold or experimental campaigns from the primary corporate domain.
- Authenticate every sending domain before volume begins.
- Reputation is accumulated slowly and lost quickly.
- Deliverability is measured by inbox placement and business replies, not open rate alone.
- Post-Apple Mail Privacy Protection, opens are directional at best and should not control revenue decisions.

## Required Technical Baseline

- SPF includes only required senders.
- DKIM is enabled per sending platform.
- DMARC exists before serious volume. Start at `p=none`, move toward quarantine/reject after monitoring.
- Custom tracking domain is configured when the ESP supports it.
- Bounce handling is automatic and hard bounces are suppressed.
- Unsubscribe is visible, functional, and honored.
- Reply-to inbox is monitored.

## Domain Strategy

| Use Case | Domain Recommendation |
|---|---|
| Customer lifecycle | primary or product subdomain with strong consent |
| Newsletter | branded subdomain |
| Cold outbound | separate lookalike or outreach domain |
| High-risk tests | isolated domain only |

Do not mix cold outbound reputation with customer lifecycle messaging.

## Warm-Up Rules

- Begin with low daily volume.
- Increase gradually only when bounce, complaint, and reply signals remain healthy.
- Send to verified addresses only.
- Avoid large jumps in volume or sudden content changes.
- Pause if bounce or complaint rates spike.

## List Quality

- Use verified emails.
- Remove role accounts when not appropriate: `info@`, `support@`, `admin@`.
- Remove known complainers and hard bounces.
- Segment by source, consent, and expected intent.
- Do not upload scraped lists into lifecycle/customer ESPs.

## Metrics

| Metric | Use |
|---|---|
| Hard bounce rate | list quality and sender risk |
| Soft bounce rate | temporary delivery issues |
| Complaint rate | message-market mismatch or bad consent |
| Reply rate | strongest cold outbound signal |
| Positive reply rate | pipeline signal |
| Unsubscribe rate | fatigue and relevance |
| Conversion rate | business outcome |

Open rate should not be used as the primary decision metric.

## Failure Modes

- Primary Domain Damage: cold campaigns sent from the domain customers need to receive from.
- Authentication Theater: SPF/DKIM set but DMARC ignored.
- Volume Shock: new inboxes pushed to high volume too quickly.
- Purchased List Spiral: bad list creates bounces, then reputation damage, then worse inboxing.
- Open-Rate Optimism: inflated opens treated as engagement.

## Agent Usage Notes

- Email Marketing Manager loads this before lifecycle or nurture volume decisions.
- Cold Outreach Specialist loads this before domain setup, warm-up, or campaign send.
- Marketing Automation Specialist loads this before workflow enrollment rules that generate email volume.
- RevOps Manager loads this when deliverability affects pipeline or attribution.
