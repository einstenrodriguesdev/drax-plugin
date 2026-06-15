# Analytics Tracking Plan
> Status: stub | Created: 2026-04-26 | Applies to: Analytics Attribution Specialist, CMO, Traffic Manager
> Schema version: 1.0

---

## Purpose

This document defines the canonical schema for the Conclave tracking plan — covering event taxonomy design, UTM parameter governance, consent mode v2 configuration, server-side tagging setup, and data gap audit methodology. The Analytics Attribution Specialist uses this as the authoritative reference when creating or updating any `tracking_plan_[YYYY-MM-DD].md` output document.

---

## Event Taxonomy Schema

### Canonical Event Schema Fields

Every event in the tracking plan must be documented with the following fields:

| Field | Description | Example |
|---|---|---|
| Event name | snake_case, globally consistent across all platforms | `lead_form_submitted` |
| Trigger | The exact user action or system condition that fires the event | "User clicks submit on the /demo form and receives a 200 success response" |
| Parameters | Key-value pairs sent with the event | `form_type: "demo_request"`, `page_location: "/demo"`, `lead_source: {{utm_source}}` |
| Data layer push | The exact `dataLayer.push()` object if using GTM | `dataLayer.push({ event: 'lead_form_submitted', form_type: 'demo_request' })` |
| Funnel stage | TOFU / MOFU / BOFU classification | BOFU |
| Channel(s) | Which channels this event is attributed to | All channels |
| GA4 event type | Standard / Recommended / Custom | Recommended |
| Server-side required | Whether this event must be fired server-side for iOS gap recovery | Yes / No |

### Event Naming Conventions

- Use snake_case: `video_completed`, not `VideoCompleted` or `video-completed`
- Use past tense for user actions: `form_submitted`, `button_clicked`, `page_viewed`
- Use noun + verb: `lead_qualified`, `trial_started`, `subscription_cancelled`
- Avoid platform-specific names: do not name events `facebook_lead` or `google_conversion` — events are platform-agnostic at the taxonomy level

### Core E-Commerce / SaaS Event Set (Minimum Viable Tracking)

| Event | Trigger | Funnel stage | Priority |
|---|---|---|---|
| `page_view` | Every page load | All | Required |
| `session_start` | First event of a session | TOFU | Required |
| `scroll_depth_50` | User scrolls 50% of page | TOFU | High |
| `cta_clicked` | Any primary CTA button click | TOFU–MOFU | High |
| `lead_form_submitted` | Lead/demo/contact form submit success | MOFU | Required |
| `trial_started` | User activates free trial | BOFU | Required |
| `purchase` | Transaction completed | BOFU | Required (e-comm) |
| `subscription_started` | Paid subscription begins | BOFU | Required (SaaS) |
| `aha_moment_reached` | Business-specific activation event (from GTM.md) | BOFU | Required |

---

## UTM Parameter Governance

### Five-Parameter Standard

| Parameter | Purpose | Governance level |
|---|---|---|
| `utm_source` | The platform/channel that sent the traffic | LOCKED — approved values only |
| `utm_medium` | The marketing medium/type | LOCKED — approved values only |
| `utm_campaign` | The specific campaign name | PATTERN — follows naming convention |
| `utm_content` | The specific ad or content variant | PATTERN — follows naming convention |
| `utm_term` | The keyword (paid search only) | PATTERN — auto-populated for search, manual for display |

### Approved Values Template (customize per business)

**utm_source approved values:**
- `google` (Google Ads — search and display)
- `meta` (Meta Ads — Facebook and Instagram)
- `linkedin` (LinkedIn Ads)
- `tiktok` (TikTok Ads)
- `email` (email campaigns, newsletters)
- `organic` (organic social — use only for UTM-tagged organic posts)
- `referral` (partner or affiliate links)
- `direct` (do not apply UTMs to direct traffic — GA4 assigns this automatically)

**utm_medium approved values:**
- `cpc` (cost-per-click paid ads)
- `paid-social` (paid social media ads)
- `email` (email campaigns)
- `organic-social` (organic social posts with UTMs)
- `affiliate` (affiliate/partner links)
- `display` (display/banner ads)

**utm_campaign naming pattern:**
`[objective]-[audience-or-targeting]-[YYYY-MM]`
Example: `brand-awareness-cold-2026-04`, `retargeting-cart-abandoners-2026-04`

**utm_content naming pattern:**
`[format]-[creative-variant]-[copy-variant]`
Example: `video-ugc-a-headline1`, `static-product-b-headline2`

### Pre-Launch UTM Validation Checklist

Before any campaign URL goes live:
- [ ] `utm_source` is in the approved values list (exact case match)
- [ ] `utm_medium` is in the approved values list (exact case match)
- [ ] `utm_campaign` follows the naming pattern (no spaces, no special characters except hyphens)
- [ ] `utm_content` follows the naming pattern (no spaces)
- [ ] No `utm_term` on non-search campaigns
- [ ] URL decoded and tested: paste the URL into a browser to confirm no redirect breaks the parameters
- [ ] GA4 DebugView: confirm the `session_start` and `page_view` events show the correct source/medium in DebugView before campaign goes live

### UTM Changelog

Every new approved value or naming pattern change must be logged:

| Date | Parameter | Change type | Old value | New value | Reason | Approved by |
|---|---|---|---|---|---|---|

---

## Consent Mode v2 Configuration

### Mode Selection

| Mode | When to use | Behavior |
|---|---|---|
| Basic mode | Lower regulatory exposure; fewer consent management requirements | Tags do not fire until user grants consent. No modeled conversions for users who decline. |
| Advanced mode | GDPR / ePrivacy compliance; EU traffic significant | Tags fire immediately but in cookieless mode for users who decline. Google uses modeled conversions to estimate behavior of non-consenting users. Required for maintaining conversion data in EU. |

**Recommendation**: Use advanced consent mode for any business with >5% EU traffic or for any business handling personal data under GDPR. Basic mode is acceptable for US-only businesses with no EU user base.

### Consent Mode v2 Setup Checklist

- [ ] Google Consent Mode v2 implemented via GTM (requires gtag consent API or CMP integration)
- [ ] Consent Management Platform (CMP) connected to GTM: (Cookiebot, OneTrust, Osano, or CookieYes)
- [ ] `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization` consent signals mapped to CMP consent categories
- [ ] Default state set to `denied` for GDPR regions (geolocation-based default)
- [ ] Modeled conversions enabled in Google Ads: Settings → Consent Mode → Enable
- [ ] GA4 modeled conversions: Admin → Data Settings → Data Collection → Enable modeled conversions
- [ ] Test: confirm consent banner fires; confirm `gtag('consent', 'update', ...)` fires correctly on consent grant; verify in GA4 DebugView

---

## Server-Side Tagging Setup

### Why Server-Side Tagging is Required

Client-side tracking (standard GTM browser container) fires from the user's browser. If the user has ad blockers, iOS ATT opted out, or browser privacy features (Firefox Enhanced Tracking Protection, Safari ITP), the tracking pixel never fires and the conversion is invisible. Server-side tagging moves the tracking logic to a server you control — the conversion event is sent from your server directly to GA4/Meta/Google's measurement APIs, bypassing browser-level blocking.

**iOS ATT data gap without server-side**: ~30–40% of iOS conversions are invisible in client-side-only setups (post-April 2021 ATT framework).

### Server-Side GTM Setup Checklist

- [ ] Google Cloud Run (recommended) or App Engine instance provisioned for the server-side GTM container
- [ ] Custom subdomain configured: `tag.yourdomain.com` pointing to the server container (first-party context — avoids ad blocker blocking of `gtm.js` domains)
- [ ] Web container updated to send data to server container endpoint (not directly to Google)
- [ ] Server container configured with clients: GA4 client, Meta CAPI client, (add others as needed)
- [ ] Meta Conversions API (CAPI) configured: send `Purchase`, `Lead`, `CompleteRegistration` events server-side to Meta with hashed email for identity matching
- [ ] Google Ads Conversion Import: import GA4 goals into Google Ads rather than using Google Ads tag — reduces double-counting
- [ ] Event deduplication: for events fired both client-side and server-side, include `event_id` parameter for deduplication at the destination

---

## Data Gap Audit Methodology

### Estimating the Data Gap

The data gap is the percentage of real conversions that are not visible in your client-side analytics.

**Step 1**: Pull CRM total conversions (leads / purchases / trials started) for the measurement period.
**Step 2**: Pull GA4 reported conversions for the same period.
**Step 3**: Data gap % = (CRM conversions - GA4 conversions) / CRM conversions × 100

**Expected ranges:**
- No server-side + no consent mode: 30–50% gap (heavy iOS traffic) to 10–20% (Android/desktop heavy)
- Server-side + consent mode v2: 5–15% gap (some irrecoverable loss remains for fully opted-out users)
- Below 5% gap: excellent data coverage

**Step 4**: Break the gap down by channel:
- Channels with high iOS audience (Meta, TikTok): higher gap
- Channels with lower iOS audience (Google Search, LinkedIn): lower gap
- Email: depends on email client (Gmail tracking pixel = counted; Apple Mail Privacy Protection = not counted)

**Step 5**: Document the gap in every tracking plan and attribution report. Never present attribution percentages without noting the data completeness level.

---

## Stub Note

> This file is a stub. The following sections require full research and content build-out:
> - Complete consent mode v2 implementation walkthrough with GCP provisioning steps
> - Meta Conversions API (CAPI) full setup guide
> - Google Ads enhanced conversions setup
> - dbt model for UTM audit (detecting invalid UTM values in BigQuery GA4 export)
> - Sample data layer push templates for SaaS-specific event set
> - iOS ATT gap recovery measurement methodology with statistical confidence approach
