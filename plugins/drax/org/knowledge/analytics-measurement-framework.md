# Analytics Measurement Framework
> Status: stub | Created: 2026-04-26 | Applies to: Analytics Attribution Specialist, CMO, Traffic Manager
> Schema version: 1.0

---

## Purpose

This document defines the three-model measurement framework (MTA / MMM / Incrementality Testing) used by the Analytics Attribution Specialist to select the right measurement method for each business question. It also defines the incrementality test design protocol and the model selection decision table by business stage and spend level.

---

## The Three-Model Framework

### Role of Each Method

| Method | Question answered | Time horizon | Data requirement | Evidence type |
|---|---|---|---|---|
| Multi-Touch Attribution (MTA) | Which channels are performing right now at the campaign level? | Real-time to 30 days | Per-user touchpoint data from tracking pixels + server-side | Correlation (not causation) |
| Marketing Mix Modeling (MMM) | How should I allocate budget across channels next quarter? | Historical 18–24+ months | Weekly aggregate spend + revenue + external variables (seasonality, promotions) | Statistical correlation controlled for external factors |
| Incrementality Testing | Does this channel actually cause additional revenue, or would customers have converted anyway? | 2–8 weeks per test | Test/control group split (geo or platform) | Causal (the only causal method of the three) |

### Decision Rule: When to Use Each

- **Incrementality first**: before scaling any channel, run an incrementality test to establish causal proof. A channel with strong MTA ROAS but 0% incremental lift is a channel the business would achieve without paying for.
- **MTA for ongoing execution feedback**: once a channel is validated by incrementality, use MTA to optimize within the channel — which campaigns, audiences, and creatives are performing. MTA is the execution feedback loop.
- **MMM for portfolio allocation**: once 18+ months of weekly data exist, use MMM for quarterly budget allocation decisions across channels. Do not run MMM on fewer than 18 months of weekly data — the model cannot separate media effects from seasonality below that threshold.

---

## MTA: Multi-Touch Attribution

### Attribution Model Comparison

| Model | Credit distribution | Best use case | Key failure mode |
|---|---|---|---|
| Last-click | 100% to final touchpoint | Bottom-funnel optimization only | Under-credits awareness channels that initiated journey |
| First-click | 100% to first touchpoint | Measuring channel that drove initial awareness | Under-credits nurturing and conversion channels |
| Linear | Equal credit across all touchpoints | Understanding full journey contribution | Treats all touchpoints as equally valuable |
| Time-decay | More credit to touchpoints closer to conversion | Short sales cycles | Penalizes early awareness touchpoints |
| Data-driven (GA4) | ML-weighted based on observed conversion paths | Default GA4 recommendation; requires sufficient data volume | Black-box; difficult to audit; Google-biased in multi-platform contexts |
| Position-based (U-shaped) | 40% first, 40% last, 20% middle | Balanced first/last emphasis | Arbitrary weights not validated for specific business |

**Recommendation**: Always report last-click, linear, and first-click side by side for budget decisions. Use data-driven as supplementary. Never use only last-click — it systematically under-credits awareness investment.

### MTA Platform Defaults (post-iOS 14)

- **Meta Ads Manager**: 7-day click / 1-day view (default post-April 26, 2021). Previous default was 28-day click / 1-day view.
- **Google Ads**: data-driven attribution (DDA) — ML-weighted, Google-platform-only touchpoints visible.
- **GA4 default**: last-click for most reports; data-driven available in the Attribution section.
- **TikTok Ads Manager**: 7-day click / 1-day view (default).

---

## MMM: Marketing Mix Modeling

### Data Requirements

- Minimum data history: 18–24 months of weekly data (below this, seasonality and media effects cannot be separated)
- Required input variables: weekly spend per channel, weekly revenue (from CRM), external variables (promotions, price changes, macroeconomic indicators, seasonality flags)
- Model output: contribution % per channel, carryover effect (adstock), diminishing returns curves, budget scenario simulations

### When NOT to Use MMM

- Fewer than 18 months of weekly data
- Business is pre-PMF or revenue is highly irregular (makes baseline unstable)
- Spend is below ~$20k/month total (signal-to-noise ratio too low for reliable channel separation)
- Substitution: use Incrementality Testing instead until data and spend thresholds are met

---

## Incrementality Testing

### Test Method Selection

| Scenario | Recommended method |
|---|---|
| Can split geographic markets (e.g., state-level, city-level) | Geo-holdout |
| Cannot split geo (e.g., national-only campaigns, global brand) | Platform lift study (Meta Conversion Lift / Google Brand Lift) |
| Testing a single creative or audience | Platform A/B split test (within platform, not geo) |
| Testing full channel on/off effect | Geo-holdout preferred; platform lift study as fallback |

### Geo-Holdout Design Protocol

1. **Holdout size**: minimum 10% of total traffic volume allocated to control (holdout) group. Larger holdout = more statistical power but more revenue risk.
2. **Geographic split**: control regions must be demographically and behaviorally similar to test regions. Avoid geographic adjacency (neighboring markets contaminate each other).
3. **Pause in control**: in the control region, pause the channel being tested for the full test duration. Do not pause all channels — only the channel under test.
4. **Test duration**:
   - High-volume channels (>1,000 conversions/week): 2 weeks minimum
   - Low-volume channels (<100 conversions/week): 4–6 weeks minimum
   - Awareness channels (measuring brand lift, not direct conversions): 4–8 weeks
5. **Pre-test baseline**: measure conversion rate in both test and control regions for 2+ weeks before the test starts. Confirm comparability.
6. **Contamination monitoring**: if control region users are exposed to the test channel (e.g., via organic spillover), log the contamination event and adjust interpretation accordingly.

### Platform Lift Study Protocol

- **Meta Conversion Lift**: available in Meta Ads Manager → Measure & Report. Requires minimum budget and audience size per Meta's eligibility criteria. Uses a holdout group managed by Meta's auction system.
- **Google Brand Lift**: available in Google Ads for YouTube campaigns. Measures brand awareness, ad recall, consideration.
- **TikTok Split Testing**: available for conversion objective campaigns. Platform-managed holdout.
- **Limitation**: platform lift studies are managed by the platform — the holdout methodology is not independently auditable. Use in conjunction with geo-holdout for high-stakes channel decisions.

### Success and Failure Thresholds

- **VALIDATED**: incremental lift ≥5% at ≥80% statistical confidence
- **NOT VALIDATED**: incremental lift <5% OR confidence <80%
- **Thresholds must be defined before the test starts** — changing thresholds after seeing results invalidates the test as a causal proof mechanism

---

## Model Selection Decision Table by Business Stage

| Business stage | Monthly ad spend | Recommended measurement approach |
|---|---|---|
| Pre-PMF, no active paid channels | $0 | Basic GA4 setup only; no attribution infrastructure needed |
| Early-stage, 1–2 channels | $1k–$5k/month | GA4 last-click + UTM taxonomy; no MTA or MMM yet |
| Growth, 2–4 channels | $5k–$20k/month | GA4 multi-model reporting (first/linear/last) + UTM governance + incrementality test before scaling each channel |
| Scaling, 4+ channels | $20k–$100k/month | Dedicated MTA platform (Northbeam / Triple Whale) + incrementality tests + ROAS reconciliation monthly |
| Mature, 5+ channels | $100k+/month | MMM (if 18+ months data) + MTA + incrementality + quarterly portfolio review |

---

## Stub Note

> This file is a stub. The following sections require full research and content build-out:
> - Specific MMM implementation guide (Robyn open-source, Meridian by Google, or Northbeam MMM+)
> - Adstock decay rate calibration
> - Budget scenario simulation methodology
> - Incrementality testing statistical power calculator
> - Integration guide: how MTA output feeds MMM calibration
