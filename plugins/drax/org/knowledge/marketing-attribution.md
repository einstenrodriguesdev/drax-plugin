# Attribution & Analytics
> Status: stub | Created: 2026-04-26 | Applies to: Analytics Attribution Specialist, CMO, Traffic Manager
> Schema version: 1.0
> Note: This file was listed in INDEX.md as existing but the file was absent. Created alongside the Analytics Attribution Specialist agent (2026-04-26).

---

## Purpose

This document defines the attribution model comparison framework, platform-specific attribution window defaults, cross-channel double-counting mechanics, the three-column ROAS reconciliation protocol, and the blended ROAS calculation formula. The Analytics Attribution Specialist loads this document before building any attribution report or ROAS reconciliation document.

---

## Attribution Model Reference

### Model Comparison Table

| Model | Credit logic | Strengths | Weaknesses | When it misleads most |
|---|---|---|---|---|
| Last-click | 100% credit to the last touchpoint before conversion | Simple, trackable, clear | Systematically over-credits bottom-funnel channels; under-credits awareness | When awareness spend is high — all credit goes to branded search/retargeting |
| First-click | 100% credit to the first tracked touchpoint | Shows which channels initiate journeys | Under-credits nurturing and conversion channels | When the first tracked touch is not the true starting point (direct traffic precedes the first UTM) |
| Linear | Equal credit across all touchpoints | Comprehensive view of full journey | Treats all touchpoints as equally valuable regardless of actual influence | When some touchpoints are clearly more influential than others |
| Time-decay | More credit to touchpoints closer to conversion, exponentially decreasing | Reflects recency of influence | Penalizes early-funnel awareness investment | Long sales cycles — the first touchpoint six months ago was critical but receives near-zero credit |
| Data-driven (GA4 DDA) | ML-weighted based on observed conversion path patterns | Adapts to actual behavior; Google's recommended default | Black-box; requires minimum data volume (GA4 requires ~thousands of conversions); biased toward Google-owned touchpoints | Low-volume conversions (not enough data for the model to be reliable) |
| Position-based (U-shaped) | 40% first, 40% last, 20% distributed across middle | Balances first and last touchpoint emphasis | Arbitrary weights (40/40/20) not calibrated for specific business | When the 40/40/20 split does not reflect this specific business's actual purchase driver distribution |

---

## Platform Attribution Window Defaults

### Post-iOS 14 Defaults (current as of 2024–2025)

| Platform | Default click window | Default view window | Historical default (pre-iOS 14) | Notes |
|---|---|---|---|---|
| Meta Ads Manager | 7-day click | 1-day view | 28-day click / 1-day view | Changed April 26, 2021. Meta's view-through attribution claims conversions from users who saw (but did not click) the ad within 24 hours. Major source of cross-platform double-counting. |
| Google Ads | 30-day click (data-driven) | No view-through by default | Same | Data-driven attribution is Google-platform-only — touchpoints from Meta, email, direct are invisible to it. |
| GA4 (default) | Session-based last-click | N/A — no view-through | Same | GA4 last-click reports on sessions, not individual ad exposures. Cross-device journeys are not stitched unless User-ID is implemented. |
| TikTok Ads Manager | 7-day click | 1-day view | Varies | Similar to Meta post-iOS 14 behavior. |
| LinkedIn Ads | 30-day click | 7-day view | Same | LinkedIn view-through window is longer than Meta — increases double-counting risk for B2B campaigns with longer sales cycles. |

### Attribution Window Recommendation

For budget decisions: use a **1-day click / no view** or **7-day click / no view** window for cross-channel comparison. View-through attribution credits vary dramatically by platform methodology and should be reported separately as "view-attributed" — not blended with click attribution for budget decisions.

---

## Cross-Channel Double-Counting Mechanics

### Why Summing Platform ROAS Always Exceeds Actual Revenue

Each platform's attribution model assigns conversion credit from its own perspective:
1. User is shown a Meta ad (Monday).
2. User clicks a Google Search ad (Wednesday).
3. User purchases (Wednesday evening).

**Meta reports**: 1 conversion (7-day click window — Wednesday purchase within 7 days of Monday Meta ad click... or 1-day view if they saw but didn't click)
**Google Ads reports**: 1 conversion (user clicked Google Search ad and purchased same day)
**GA4 reports**: 1 conversion — attributed to google / cpc (last-click)
**CRM records**: 1 customer

Platforms aggregate: 2 conversions from a 1-conversion reality. ROAS calculated from platform totals is therefore inflated.

**The double-counting coefficient**: in multi-platform campaigns, platform-summed conversions typically exceed CRM conversions by 20–60%. The exact coefficient depends on: number of active channels, average touchpoints per conversion, mix of click-through and view-through attribution, and iOS data gap (which affects platform-reported numbers differently per channel).

---

## The Three-Column ROAS Reconciliation Protocol

### Definition of Each Column

| Column | Source | Formula | Use case |
|---|---|---|---|
| Platform ROAS | Ad platform's own reporting (Meta Ads Manager, Google Ads, etc.) | Platform-reported revenue / platform spend | Within-platform optimization only; not for cross-channel comparison |
| GA4 Last-Click ROAS | GA4 Conversions report or BigQuery GA4 export | GA4 attributed revenue / total ad spend | Cross-channel comparison signal; better than platform but still affected by iOS gap and cross-device limits |
| CRM-Blended ROAS | CRM total revenue + total ad spend including tools and fees | CRM revenue (new customers acquired in period) / (total ad spend + tools + agency fees) | Authoritative figure for budget decisions; unaffected by attribution model methodology |

### Blended ROAS Calculation Formula

```
CRM-Blended ROAS = CRM New Customer Revenue (period) 
                   ÷ 
                   (Ad Spend + Tool Fees + Agency/Freelancer Fees)
```

Where:
- **CRM New Customer Revenue**: revenue from customers whose first purchase/subscription occurred in the measurement period (attributed to marketing)
- **Ad Spend**: total media spend across all channels
- **Tool Fees**: attribution tools (Northbeam, Triple Whale), tag management, analytics platform costs
- **Agency/Freelancer Fees**: any paid media management fees

**Critical**: use CRM revenue, not platform-reported revenue. Platform-reported revenue is the double-counted figure. CRM revenue is the single source of truth.

### Reconciliation Steps

1. Pull platform-reported ROAS for each channel for the measurement period.
2. Pull GA4 last-click ROAS for the same period using GA4 Acquisition report or BigQuery query.
3. Pull CRM new customer revenue for the period.
4. Calculate total cost (ad spend + tools + fees).
5. Calculate CRM-Blended ROAS = step 3 / step 4.
6. For each channel, calculate the delta between platform ROAS and CRM-Blended ROAS.
7. Identify the attribution mechanism causing the delta:
   - Large delta on Meta = likely view-through credit + iOS data gap
   - Large delta on Google = likely data-driven model over-weighting Google touchpoints
   - Consistent delta across all channels = iOS ATT data gap inflating platform numbers
8. Document the delta explanation in the reconciliation report.
9. Use CRM-Blended ROAS as the authoritative figure in all budget recommendations.

---

## CAC Payback Calculation

**Reference**: `~/.claude/commands/skills/ltv-cac-gate.md` for full LTV:CAC gate thresholds.

### Per-Channel CAC (Blended)

```
Channel CAC = (Channel Ad Spend + Proportional Tool Fees) / New Customers from Channel (CRM)
```

Note: "new customers from channel" requires a channel attribution decision — use last significant touchpoint from CRM UTM data or first-touch if top-of-funnel channel.

### CAC Payback Period

```
CAC Payback (months) = Channel CAC / (ARPA × Gross Margin %)
```

Where ARPA = Average Revenue Per Account per month (MRR / active accounts).

**Benchmark**: ≤12 months for SaaS. >18 months = cash flow risk at scale. Flag any channel exceeding 18-month payback in the ROAS reconciliation report.

---

## Attribution Integrity Checklist

Before any attribution report is delivered to CMO or Traffic Manager:

- [ ] Three-column ROAS reconciliation completed (platform / GA4 / CRM-blended)
- [ ] Data gap percentage documented (CRM conversions vs. GA4 conversions)
- [ ] View-through attribution reported separately from click-through attribution
- [ ] CAC payback calculated per channel using blended cost (not just ad spend)
- [ ] CRM-blended ROAS used as the authoritative budget decision metric (not platform ROAS)
- [ ] UTM fragmentation checked: no unexpected source/medium groups in GA4 that indicate UTM inconsistencies
- [ ] Attribution window used for each platform stated explicitly in the report

---

## Stub Note

> This file is a stub. The following sections require full research and content build-out:
> - BigQuery SQL query templates for three-column ROAS reconciliation
> - GA4 attribution model comparison report configuration walkthrough
> - Cross-device attribution: User-ID setup guide for improved journey stitching
> - Server-side deduplication configuration for Meta CAPI + client-side pixel
> - Attribution model benchmarks by industry vertical (B2B SaaS vs. e-commerce vs. D2C)
> - View-through attribution value framework: when 1-day view credit is defensible vs. misleading
