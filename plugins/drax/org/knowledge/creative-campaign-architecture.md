# Creative Campaign Architecture
> Status: stub | Created: 2026-04-25 | Owner: Creative Director
> Applies to: Creative Director, Art Director
> Source references: Stripe Creative Director job description (stripe.com/jobs), VaynerMedia integrated creative model (The Drum), Asana Creative Strategy guide, Campaign Live, Brand Master Academy

---

## Purpose

This document defines the structural logic of a multi-channel campaign — how a single creative concept is translated into a coherent system of executions across platforms, formats, and funnel stages. It provides the campaign structure taxonomy, channel-to-format mapping decisions, brand expression system, production brief derivation method, and campaign integrity principles.

---

## Campaign Structure Taxonomy

Every campaign has three phases. Not every campaign activates all three simultaneously — the phases activated depend on the campaign objective and the ICP's current awareness stage.

| Phase | Funnel stage | Audience awareness | Creative job | Primary channels |
|---|---|---|---|---|
| Awareness | TOFU | Unaware / Problem-Aware | Introduce the problem or category; do not lead with the product | Organic social (reach-focused), YouTube pre-roll, TikTok |
| Consideration | MOFU | Solution-Aware / Product-Aware | Introduce the solution and differentiate; educate | Email, LinkedIn, Instagram carousels, retargeting |
| Conversion | BOFU | Most Aware | Reduce friction; provide proof and a clear CTA | Landing pages, direct response ads, email sequences |

A campaign brief that requests "awareness AND conversion in the same post" indicates a phase confusion error. The Creative Director's role is to resolve the phase before commissioning any production.

---

## Brand Expression System

The Brand Expression System defines how the campaign concept translates into channel-specific executions without losing coherence.

### Three levels of brand expression:

**Level 1 — The Big Idea (Hero Concept)**
One sentence that captures the campaign's creative territory. Must be:
- Specific enough to generate consistent executions
- Flexible enough to work across channels
- Traceable to the positioning statement in GTM.md

Example structure: "[Audience insight] expressed through [creative mechanism] to make the audience feel/think [desired effect]."

**Level 2 — Channel Variants**
How the Big Idea adapts to each channel's native context. Adaptation is NOT dilution — it is translation. The core idea remains identical; the execution format respects the channel's native content behavior.

| Channel | Adaptation principle | What stays constant |
|---|---|---|
| Instagram feed | Visual-first, aspirational, high production | SIMM, color system |
| Instagram Stories | Fast, high-energy, text-minimal | SIMM, CTA |
| TikTok | Trend-native, lo-fi acceptable, authentic | Core idea |
| LinkedIn | Data-forward, clean, credibility-focused | SIMM, tone |
| Email | Personal, conversational, one CTA | SIMM, audience stage |
| Landing page | Conversion-focused, removes distractions | SIMM, one CTA |

**Level 3 — Execution Units**
Individual assets produced by specialists. Each execution unit maps to: one channel + one format + one content pillar + one specialist + one locked brief. This mapping is documented in the channel-to-format matrix in the Creative Strategy Document.

---

## Channel-to-Format Mapping Decision Framework

When building the campaign's channel-to-format matrix, apply the following decision sequence:

1. **What is the ICP's dominant channel?** (from GTM.md) → prioritize this channel first
2. **What is the campaign phase?** → Awareness = reach-first channels; Consideration = mid-funnel channels; Conversion = direct response channels
3. **What content pillar is the asset serving?** (from content-mix.md skill) → match to the 50/30/20 distribution
4. **What format is native to that channel × pillar combination?** → never retrofit a format from a different channel
5. **What specialist owns this format?** → assign and brief in one step

Guiding principle: "lead with a strong point of view and let the channel adapt it" (Stripe CD requirement: "ability to express and communicate a brand through distinct graphics, patterns, motion, interaction"). The concept is upstream; the format is downstream.

---

## Production Brief Derivation

From one Creative Strategy Document, derive one brief per specialist:

| Specialist | Brief components to emphasize | Brief components to simplify |
|---|---|---|
| Social Media Designer | Dimensions, safe zones, visual reference, brand token requirements | Copy (provided separately or by Copywriter) |
| Motion Designer | Duration, fps, sequence structure, data inputs, Remotion composition scope | Static visual reference (motion spec replaces) |
| Performance Copywriter | Awareness stage, SIMM, VOC sticky phrases, variant requirement (min. 3) | Visual spec (handled by Designer) |
| Video Editor | Raw footage location, cut structure, pacing, caption requirements, export format | Design tokens (handled by Social Media Designer or Art Director) |

---

## Campaign Integrity Principles

1. **One SIMM per campaign** — the entire campaign communicates one thing. If the brief has two SIMMs, the campaign has zero clarity. The Creative Director resolves conflicting messages before locking any brief.

2. **No phase mixing at asset level** — an individual asset is either Awareness, Consideration, or Conversion. It cannot serve two phases. If the CMO requests a single asset that "builds awareness AND drives sign-ups," the Creative Director explains the phase conflict and proposes separate assets for each job.

3. **Concept before execution** — no production begins without a Stage 1 (Concept Gate) approval. The concept must be approved in the Creative Strategy Document before any specialist begins execution. Skipping Stage 1 to save time creates Stage 2 and Stage 3 failures.

4. **Coherence across channels** — a campaign where Instagram looks like a fashion brand and LinkedIn looks like a B2B software vendor is not a campaign. It is two unrelated executions. The Brand System defines the visual grammar; the Creative Strategy defines the verbal grammar. Both must be active for a campaign to be coherent.

5. **Performance feedback as creative input** — performance data (CTR, scroll-stop rate, engagement rate, conversion) is creative feedback, not just media feedback. After a campaign cycle, the Creative Director reviews performance data with the Traffic Manager or Analytics Specialist and applies learnings to the next brief. Creative iteration is data-informed in all cases.

---

## Stub note
This document contains the framework skeleton. The following content must be added in the 90-day review:
- Annotated campaign architecture examples (awareness-only campaign, full-funnel campaign, product launch)
- Channel-to-format matrix templates with pre-filled platform-format-pillar combinations
- Campaign performance review protocol (how CD and Traffic Manager close the feedback loop after a campaign cycle)
- Multi-brand campaign architecture (when the startup has more than one product line)
