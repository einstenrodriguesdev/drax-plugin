# CRO Research Heuristics
> Status: stub | Created: 2026-04-27 | Applies to: CRO Specialist
> Content to be researched: ResearchXL framework, LIFT model scoring rubric, PIE prioritization protocol, hypothesis template

## Contents (to be populated on first use)

- **ResearchXL Framework (6 layers)**: Full protocol for each data-gathering layer before hypothesis formation
  - Layer 1 — Heuristic analysis: applying LIFT model and UX principles to the page; what to look for, how to document findings
  - Layer 2 — Technical analysis: page speed (Core Web Vitals — LCP, INP, CLS), mobile rendering on common devices, tracking verification (does the conversion event fire correctly on test completion?)
  - Layer 3 — Digital analytics: GA4 funnel exploration setup, scroll depth tracking, exit rate by device and traffic source, time-on-page interpretation
  - Layer 4 — Mouse-tracking: Hotjar / Microsoft Clarity heatmap interpretation (click maps, scroll maps, move maps, rage click zones — what each pattern signals about user intent and confusion)
  - Layer 5 — Qualitative research: on-page poll placement and question templates (exit-intent: "What almost stopped you from completing this?"; on-completion: "What almost stopped you?"), session recording review protocol (what to note, how many recordings are sufficient for insight saturation)
  - Layer 6 — User testing: 5–7 user task session protocol, moderated vs. unmoderated, what tasks to assign, note-taking format
  - Minimum viable research: layers 1 + 2 + 3 always required; layers 4–6 required for high-stakes surfaces (checkout, pricing, onboarding dropout >40%)

- **LIFT Model Scoring Rubric (WiderFunnel / Chris Goward)**:
  - Value Proposition (1–5): What is the primary value claim above the fold? Is it specific (measurable outcome) or generic ("best solution")? Is the benefit immediately obvious or does it require effort to understand?
  - Relevance (1–5): Does the page headline match the ad headline / traffic source? Is the ICP explicitly addressed in the first screen? Would a first-time visitor recognize themselves in the page?
  - Clarity (1–5): Is the CTA button visible without scrolling on mobile? Is there one clear primary CTA or are there competing CTAs? Is the layout scannable (F-pattern or Z-pattern alignment)?
  - Anxiety (1–5): Are there security signals near the form (SSL badge, privacy policy proximity)? Are commitment words used (e.g., "sign up" triggers more anxiety than "get started")? Are pricing and commitment terms visible before the CTA?
  - Distraction (1–5): Does the navigation remain visible (pulls users off the conversion path)? Are there social links, pop-ups, or secondary CTAs competing with the primary goal?
  - Urgency (1–5): Is there a reason to act now vs. returning later? Is urgency authentic (limited availability, time-bounded offer) or manufactured (countdown timers with no real deadline)?
  - Scoring: 1 = severe problem, 3 = moderate issue, 5 = excellent. Issues scoring 1–2 are high-priority hypothesis candidates.

- **PIE Framework (Goward / WiderFunnel)**:
  - Potential (1–10): Expected conversion uplift if the hypothesis is true — calibrated against: gap between current CVR and industry benchmark for this surface type, severity of the LIFT model score for this friction point, evidence quality (3+ ResearchXL layers = higher confidence in Potential score)
  - Importance (1–10): Traffic volume to the surface (higher traffic = higher importance; a 1% lift on 10,000 monthly visitors outscore a 5% lift on 100 visitors) × revenue proximity (checkout page > onboarding step 2 > blog page)
  - Ease (1–10): 9–10 = copy change only; 7–8 = copy + single design element; 5–6 = layout restructure; 3–4 = multi-element redesign; 1–2 = full page rebuild or new flow
  - Composite: average of three scores; rank backlog in descending order
  - Tie-breaking: favor higher Importance (revenue impact) over higher Ease (implementation convenience)

- **Hypothesis Statement Template**:
  - "If we [specific change to element X] on [surface / page URL], because [research evidence from ResearchXL layers — cite specific observation], we expect [micro-metric] to improve by ≥[MDE]% relative and [macro-metric] to improve directionally, confirming that [underlying behavioral assumption]."
  - Required: at least one quantitative evidence cite (analytics data) AND one qualitative evidence cite (heuristic finding, session recording, or poll response)
  - Optional enhancement: "The control is failing because [Fogg Behavior diagnosis — Motivation / Ability / Prompt]."

## Source candidates (to populate on research)
- Goward, C. (2013). *You Should Test That*. Sybex. — LIFT Model and PIE framework origins
- Laja, P. (CXL): https://cxl.com/blog/how-to-come-up-with-more-winning-tests-using-data/ — ResearchXL framework
- https://conversion.com/framework/the-lift-model/ — LIFT model scoring
- https://croaudits.com/blog/cro-test-prioritization-frameworks/ — PIE vs. ICE vs. PXL comparison
