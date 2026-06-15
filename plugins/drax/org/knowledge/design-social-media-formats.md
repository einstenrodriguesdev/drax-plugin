# Social Media Format Specifications
> Status: stub | Created: 2026-04-25 | Applies to: Social Media Designer, Performance Creative, Traffic Manager
> Content pending full research pass. Platform specs below are current as of 2026-04-25 and require quarterly review.

---

## Aspect Ratio Decision Tree

```
Is this a vertical video/motion format? (Stories, Reels, TikTok, YouTube Shorts)
  YES → 9:16 (1080 × 1920 px)
  NO → Is this a feed post on Instagram or TikTok?
    YES → Portrait 4:5 (1080 × 1350 px) — outperforms square on mobile by up to 40%
    NO → Is this LinkedIn, Twitter/X, or Facebook?
      YES for LinkedIn/Facebook feed → 1:1 (1080 × 1080) or 1.91:1 landscape (1200 × 628)
      YES for Twitter/X → 16:9 (1600 × 900) for cards; 1:1 for simple image posts
  → Carousel/Pinterest → see platform-specific table below
```

---

## Platform Format Table (2025 — Current as of 2026-04-25)

### Instagram

| Format | Dimensions | Aspect Ratio | Max File Size | Notes |
|---|---|---|---|---|
| Feed — Square | 1080 × 1080 px | 1:1 | 8 MB (image) | Standard; safe option for repurposing |
| Feed — Portrait | 1080 × 1350 px | 4:5 | 8 MB | Preferred; occupies more screen real estate in feed |
| Feed — Landscape | 1080 × 566 px | 1.91:1 | 8 MB | Use only when horizontal composition required |
| Stories | 1080 × 1920 px | 9:16 | 30 MB video / 8 MB image | Safe zone: top 250px and bottom 250px blocked by UI |
| Reels | 1080 × 1920 px | 9:16 | 4 GB (up to 90 sec) | Cover frame: 1080 × 1350 cropped from top; thumbnail text must be in center 1080 × 1080 zone |
| Carousel | 1080 × 1080 px or 1080 × 1350 px | 1:1 or 4:5 | 8 MB per slide | Max 10 slides; first slide is the hook; last slide is CTA |

### LinkedIn

| Format | Dimensions | Aspect Ratio | Max File Size | Notes |
|---|---|---|---|---|
| Feed — Square | 1080 × 1080 px | 1:1 | 8 MB | Most common for text-overlay posts |
| Feed — Landscape | 1200 × 628 px | 1.91:1 | 8 MB | Link preview default; blog or article share |
| Feed — Portrait | 1080 × 1350 px | 4:5 | 8 MB | Strong mobile performance |
| Document/Carousel | 1080 × 1080 px per slide | 1:1 | 100 MB total PDF | Up to 300 pages; first slide = cover = scroll-stop hook |
| Video | 1920 × 1080 px | 16:9 | 5 GB | Square (1:1) also performs well natively |

### TikTok

| Format | Dimensions | Aspect Ratio | Max File Size | Notes |
|---|---|---|---|---|
| Video (primary) | 1080 × 1920 px | 9:16 | 287.6 MB (iOS), 72 MB (Android) | Full-screen vertical dominant; text overlay max 70% of frame |
| Cover | 1080 × 1920 px | 9:16 | — | Center third is most visible in profile grid |

### Pinterest

| Format | Dimensions | Aspect Ratio | Max File Size | Notes |
|---|---|---|---|---|
| Standard Pin | 1000 × 1500 px | 2:3 | 32 MB | Most saves; tall format dominates feed |
| Square Pin | 1000 × 1000 px | 1:1 | 32 MB | Acceptable; lower save rate than 2:3 |
| Idea Pin (video) | 1080 × 1920 px | 9:16 | 100 MB | Stories-equivalent |

### YouTube

| Format | Dimensions | Aspect Ratio | Notes |
|---|---|---|---|
| Shorts | 1080 × 1920 px | 9:16 | Max 60 sec |
| Thumbnail | 1280 × 720 px | 16:9 | 2 MB max; critical: visible text must survive 168 × 94px preview |

### Twitter / X

| Format | Dimensions | Aspect Ratio | Notes |
|---|---|---|---|
| Feed image | 1600 × 900 px | 16:9 | Cropped to 1.91:1 in timeline; keep key elements in center |
| Profile image | 400 × 400 px | 1:1 | Displayed as circle |

---

## Safe Zone Reference

### Instagram Stories / Reels (1080 × 1920 px)
- TOP: avoid placing key content in top 250px (Instagram UI — profile icon, story label)
- BOTTOM: avoid placing key content in bottom 250px (reply bar, swipe-up CTA area)
- SIDES: 75px on each side as visual margin
- SAFE ZONE: 1080 × 1420 px centered (from y=250 to y=1670)

### TikTok (1080 × 1920 px)
- TOP: avoid top 130px (profile icon, follow button)
- BOTTOM: avoid bottom 300px (like/comment/share bar, caption)
- RIGHT SIDE: avoid rightmost 120px (interaction icons)
- SAFE ZONE: center left region — 960 × 1490 px (x=0 to x=960, y=130 to y=1620)

### YouTube Shorts (1080 × 1920 px)
- BOTTOM: avoid bottom 350px (interaction elements)
- TOP: avoid top 100px
- RIGHT SIDE: avoid rightmost 150px

---

## File Format Reference

| Use case | Format | Reason |
|---|---|---|
| Static image with transparency | PNG | Lossless, preserves transparency for logo overlays |
| Static image without transparency | JPG at 80–90% quality | Smaller file, platform-acceptable quality |
| Animated content | MP4 (H.264) | Universal platform support |
| High-quality video | MP4 (H.264 or H.265) | H.265 for smaller file at same quality |
| PDF carousel (LinkedIn) | PDF | Native document format for LinkedIn carousels |
| GIF (limited use) | GIF | Only when platform does not support MP4; GIF quality degrades at large sizes |

---

## Naming Convention

Format: `[platform]-[format]-[pillar]-[YYYY-MM-DD]-v[N].[ext]`

Examples:
- `ig-feed-portrait-edu-2026-04-28-v1.png` — Instagram portrait feed, educational pillar
- `linkedin-carousel-promo-2026-04-28-v2.pdf` — LinkedIn carousel, promotional pillar, second version
- `tiktok-video-eng-2026-04-28-v1.mp4` — TikTok video, engagement pillar

Platform codes: `ig` / `linkedin` / `tiktok` / `pinterest` / `yt` / `twitter`
Format codes: `feed-square` / `feed-portrait` / `feed-landscape` / `stories` / `reels` / `carousel` / `video` / `shorts`
Pillar codes: `edu` / `eng` / `promo`

---

## Quarterly Review Requirement

Platform specifications change frequently. This document requires verification against official platform help centers every quarter. Priority check sequence:
1. Instagram Creators Help Center
2. LinkedIn Marketing Solutions
3. TikTok Business Help Center
4. Pinterest Business Help Center
5. YouTube Creator Academy

Last verified: 2026-04-25

---

## Placeholder Content (to be expanded during full research pass)

- [ ] Animated GIF vs MP4 performance comparison per platform
- [ ] Retina/2x display considerations for asset export resolution
- [ ] Dark mode automatic inversion behavior per platform and mitigation
- [ ] Alt text character limits per platform (accessibility)
- [ ] Video caption (.srt) format requirements per platform
- [ ] Audio/music licensing notes for video assets

---

## Sources

- mediacheatsheet.com/blog/the-best-aspect-ratios-for-social-media-in-2025
- socialthrive.com/2025/04/image-video-sizes-on-social-media-profiles-2025-edition
- blog.hubspot.com/marketing/ultimate-guide-social-media-image-dimensions-infographic
- ignitesocialmedia.com/social-media-tools/2025-social-media-ad-specs-a-platform-by-platform-guide
- sendible.com/insights/social-media-video-specs
