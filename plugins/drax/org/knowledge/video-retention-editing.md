# Video Retention Editing
> Status: stub | Created: 2026-04-25 | Applies to: Video Editor
> Content to be filled on 90-day research cycle or when platform analytics mechanics change

---

## Hook-Body-CTA Architecture

The structural framework for every video deliverable, regardless of platform or duration.

### Short-Form (under 60 seconds)

| Zone | Timing | Function | Failure signal |
|---|---|---|---|
| Hook | 0–3s | Stop scroll; state or show the single most compelling reason to keep watching — outcome, conflict, or surprise | Sub-60% 3s hold rate |
| Body | 3s to (total - 5s) | Deliver on the hook's promise with escalating value; maintain visual variety (dense cut + breathing space alternation) | Sharp retention drop at 50–70% |
| CTA | Final 5s | Single specific action — follow, comment, visit link. Do not introduce new information. | N/A (no CTA metric on most platforms) |

### Long-Form (over 3 minutes)

| Zone | Timing | Function | Failure signal |
|---|---|---|---|
| Hook | 0–15s | Preview the payoff (what the viewer will know/have by the end); set stakes | Sub-60% at 15s |
| Body | 15s to (total - 30s) | Escalate through value beats; include a retention spike at the 40–50% mark (new reveal, visual change, surprising claim) | Steady drop from 30% through 70% |
| CTA | Final 20–30s | Single specific action; do not open new topics | Late-video drop (last 15%) |

**Rule: hook never opens on a brand logo, legal disclaimer, or "welcome back" greeting. These are placed post-CTA or in the video description.**

---

## Hook Rate and Hold Rate — Definitions and Benchmarks

### Hook Rate (3-second hold rate)

**Definition:** Percentage of viewers who watch at least 3 seconds of the video out of total impressions.

**Formula:** (3-second video views / total impressions) × 100

**Benchmarks (2025 — short-form):**

| Rate | Assessment |
|---|---|
| < 40% | Hook failure — opening content does not stop scroll |
| 40–60% | Below average — hook content competes with feed noise |
| 60–70% | Acceptable — hook is functional |
| > 70% | Strong — hook is clearly scroll-stopping |

### Hold Rate (mid-video retention)

**Definition:** Percentage of initial viewers who are still watching at the midpoint of the video.

**Formula:** (viewers at 50% timestamp / viewers at 3s) × 100

**Benchmarks:**

| Rate | Assessment |
|---|---|
| < 35% | Pacing problem — body is losing viewers faster than average |
| 35–55% | Average |
| > 55% | Strong retention — body delivers on hook promise |

---

## Retention Curve Interpretation by Platform

### YouTube Studio (Audience Retention Graph)

- X-axis: timestamp in the video
- Y-axis: percentage of viewers who have watched to that point
- Benchmark for any video: retention should stay above the "average for videos of similar length" line (shown as a gray band)

**Drop signature → diagnosis:**

| Drop pattern | Timestamp | Diagnosis | Edit correction |
|---|---|---|---|
| Sharp drop at 0–3s | First 3 seconds | Hook failure — opening content not compelling enough | Reorder opening to lead with the hook payoff, not the setup |
| Gradual early decline | 3–30s | Setup too long — viewer doesn't understand what value they'll receive | Cut setup; move payoff preview earlier |
| Sharp mid-video drop | Specific timestamp | Pacing problem at that timestamp — cut density too uniform or content dip | Insert B-roll, tighten cut, add a new visual element at that point |
| Steady decline (no spikes) | Throughout | No variation in rhythm — monotone editing | Add breathing frames every 10–15s; vary cut frequency |
| Late-video drop (final 25%) | Last quarter | Video ran past natural conclusion OR value delivered without forward momentum | Cut the tail; move CTA earlier |

### Meta (Instagram / Facebook) Retention

- Available in Instagram Insights (Reels analytics) and Meta Business Suite
- Key metric: "Average watch time" relative to video duration
- No full curve view — use average watch time percentage as proxy for hold rate

### TikTok Analytics

- "Average watch time" and "percentage watched" available per video
- Re-watch rate (> 100% indicates looping) is a strong quality signal — optimize for loop potential in short-form

---

## Retention-Based Cut-Point Correction Protocol

When analytics data shows a drop at a specific timestamp:

1. Identify the exact timestamp of the drop in the analytics dashboard.
2. Open the project timeline at that timestamp.
3. Identify what is happening in the edit at that point:
   - Is there a long static shot (>4s) with no visual change? → Add a cutaway or B-roll.
   - Is there a topic shift without a visual signal? → Add a motion graphic divider or title card.
   - Is there a music gap or audio dead zone? → Fill with ambient SFX or transition to a new music bed section.
   - Is the content genuinely lower-value at that point? → Log as a content strategy note (not a cut-point issue) and escalate to Art Director.
4. Write the correction as a specific note: "[18s–32s shows 22% drop. At 24s there is a 6-second static interview shot with no B-roll cutaway. Correction: insert B-roll at 26s.]"
5. Do NOT retroactively re-edit without a new brief from Art Director. Log the finding and recommendation. The new brief authorizes the re-edit.

---

## Short-Form vs. Long-Form Pacing Rules

### Short-Form (under 60s)

- Average cut duration: 1.5–3s (dense for energy content), 3–5s (slower for tutorial/demonstration)
- Visual variety: cut every 2–4s when targeting TikTok / Reels / Shorts
- Burned-in captions: default ON — 85% of users watch muted on mobile
- Music: present throughout; never silence in short-form
- Transitions: purposeful only — no transition for its own sake; reserve for major beat changes

### Long-Form (over 3 minutes)

- Average cut duration: varies by section — hook dense (1–2s cuts), body standard (3–5s cuts), B-roll sequences up to 8s
- Rhythm variation: mandatory — insert at least one "breathing frame" (single wide or establishing shot, 4–6s) every 60–90s
- Pattern interrupts: at least one new visual element (graphics overlay, clip speed change, graphic reveal, topic card) every 90–120s to prevent audience fatigue
- Music: use strategically — bridge music for transitions, silence or very low bed under key dialogue moments
- Chapters / timestamps (YouTube): required for content over 5 minutes — submit chapter titles to Social Media Manager for YouTube description

---

## Vocabulary Reference

| Term | Definition |
|---|---|
| Hook rate | % of impressions that become 3-second views |
| Hold rate | % of 3s viewers who reach the midpoint |
| Completion rate | % of 3s viewers who watch to the end |
| Re-watch rate | Average views per viewer (>1.0 = looping) |
| J-cut | Audio from the next scene begins before the video cut |
| L-cut | Audio from the current scene continues past the video cut |
| B-roll | Supplementary footage that supports, not replaces, the primary A-roll |
| Picture lock | Confirmed final visual edit — no frame changes after this point |
| Rough cut | First complete, roughly paced edit submitted for review |
| Fine cut | Pacing-refined edit with all assets placed, awaiting picture lock |
