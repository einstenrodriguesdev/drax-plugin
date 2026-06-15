# Visual Systems for Social Media Design
> Status: stub | Created: 2026-04-25 | Applies to: Social Media Designer, Performance Creative, Art Director
> Content pending full research pass. Schema below defines required coverage.

---

## Brand Kit Enforcement Protocol

### What a brand kit must contain (minimum viable)
- Primary, secondary, and accent color tokens with exact HEX and RGB values
- Background color token(s)
- Approved typefaces: family name, permitted weights, permitted sizes per context (headline / body / caption)
- Logo files: SVG + PNG at minimum; safe zone definition (minimum clear space around logo)
- Approved illustration or photography style descriptors
- Prohibited uses: color combinations not in palette, font substitutions, logo modifications

### How a Social Media Designer enforces the brand kit
1. Before opening any design tool: identify which brand kit tokens apply to this brief
2. In Canva: operate only from Brand Kit folder — do not use Canva's default color or font suggestions
3. In Figma: consume design tokens as defined — do not override local styles
4. If a brief requests an off-brand element: flag it in the delivery log, apply the approved alternative, and document the discrepancy

### Token substitution prohibition
Approximating brand colors ("it's close enough") is a brand drift trigger. Colors that look similar in one context (desktop monitor) look different in another (mobile OLED, printed material, dark mode). Use exact tokens. If a token is missing from the brand guide, flag it as a brand guide gap — do not fill it with a judgment call.

---

## Typography Scale Rules

### At 1080px canvas (standard social media production resolution)
- Headline: minimum 48px for single-line, minimum 36px for two-line. Must remain legible at 50% thumbnail preview.
- Body / supporting text: minimum 24px. Below 24px is illegible on mobile feed at standard scroll speed.
- Caption / label: minimum 18px, use sparingly — not as primary communication layer.
- CTA text: minimum 28px, high contrast against button background.

### Typeface weight usage
- Headlines: Bold or Black weight — not Regular or Light; headlines must establish visual hierarchy
- Body: Regular or Medium — not Bold (competes with headline)
- Do not use more than two typefaces in one asset — headline face and body face; any third face is a brand guide violation unless explicitly approved

### Line spacing
- Headlines: 1.1–1.2 line height ratio
- Body: 1.4–1.6 line height ratio
- Tight tracking (letter-spacing negative) on bold headlines above 48px improves optical alignment

---

## Visual Hierarchy Principles

### Three-layer rule
Every social media asset has exactly three visual layers:
1. Focal point (primary subject — face, product, bold headline) — largest, highest contrast
2. Supporting element (context — subtitle, secondary image, data point)
3. CTA element (call to action — button label, arrow, swipe prompt)

More than three layers creates visual noise. Fewer than two creates a blank composition. The focal point must be identifiable within 1.5 seconds at scroll speed (documented research on mobile scroll behavior).

### F-pattern and Z-pattern reading flow
- F-pattern: applies to text-heavy assets (educational carousels, data posts). Eyes scan top line, then drop to left margin, then scan less far right on each line. Place most important information top-left.
- Z-pattern: applies to visual-dominant assets (product posts, photography-led content). Eyes move top-left → top-right → diagonal → bottom-left → bottom-right. Logo and brand element at top-left; CTA at bottom-right.

### Contrast requirements (WCAG AA compliance)
- Text over background: minimum 4.5:1 contrast ratio
- Large text (≥ 18px bold or ≥ 24px regular) over background: minimum 3:1
- Tool: use Figma's built-in contrast checker or WebAIM contrast checker before finalizing any text-on-image treatment
- Platform rationale: accessibility compliance also improves legibility for all users, not only those with visual impairments

---

## Content Pillar Visual Mapping Method

### The three-template minimum
Each content pillar must have a distinct visual template so the audience can identify content type before reading text.

| Pillar | Visual characteristics | Rationale |
|---|---|---|
| Educational (30%) | High whitespace, data-forward, clean grid, muted background, sans-serif dominant | Signals credibility and clarity; skews toward saves and shares |
| Engagement (50%) | Bold contrast, faces/emotion present, question format visible, energetic color usage | Signals conversation invitation; skews toward comments and DMs |
| Promotional (20%) | Product or offer prominent, CTA visible and high-contrast, urgency cue if applicable | Signals commercial intent; expected by audience at low frequency |

### Platform calibration overlay
The same pillar gets a calibrated version per platform — not the same template forced across channels:
- LinkedIn educational: clean, professional, data table or quote format, whitespace dominant
- Instagram educational: carousel format, bold first slide hook, color illustration or infographic
- TikTok educational: text overlay on video, large font, minimal design — thumbnail is secondary to motion
- Pinterest educational: tall format (2:3), step-by-step visual, strong headline visible in feed thumbnail

### Building the Visual Template Map
For each cell in the matrix (pillar × platform × format), document: template file reference + color tokens + typography rules + element layout + safe zone notes. This document (visual_template_map.md) is the primary leverage artifact — once complete, brief execution requires only content population, not layout decisions.

---

## Placeholder Content (to be researched and expanded)

The following sections are stubs pending full research pass by HR or Social Media Designer agent:

- [ ] Motion design principles for Reels and Stories (timing, transition types, text animation patterns)
- [ ] Carousel slide-to-slide narrative structure (hook → story → proof → CTA)
- [ ] Photography brief standards for social media (lighting, composition, aspect ratio shooting specs)
- [ ] Dark mode design considerations per platform
- [ ] Accessibility beyond WCAG: alt text standards per platform, caption file requirements for video
- [ ] A/B creative variation rules (what to change between variants, what to hold constant)

---

## Sources (to be completed during full research pass)
- mediacheatsheet.com/blog/the-best-aspect-ratios-for-social-media-in-2025
- sproutsocial.com/insights/social-media-style-guide
- metricool.com/social-media-design-guide
- canva.com/learn/your-brand-needs-a-visual-style-guide
- medium.com/@inkbotdesign/the-10-biggest-social-media-challenges-to-brand-consistency
