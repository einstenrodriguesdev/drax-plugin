# Video Post-Production Workflow
> Status: stub | Created: 2026-04-25 | Applies to: Video Editor
> Content to be filled on 90-day research cycle or when Video Editor encounters a platform spec change

---

## Assembly-to-Picture-Lock Stage Sequence

| Stage | Name | Gate condition to proceed |
|---|---|---|
| 1 | Ingest & Log | Proxies generated, footage tagged by scene/shot/brief section |
| 2 | Assembly Cut | All usable takes placed in brief order — duration expected at 2–3× target |
| 3 | Rough Cut | Best takes selected, target duration within 10%, narrative structure established, temp music placed — submitted for Art Director rough cut review |
| 4 | Note application | All Art Director rough cut notes addressed and documented |
| 5 | Fine Cut | Pacing refined, B-roll inserted, motion graphic files placed, copy/caption assets placed, temp audio mix at working levels |
| 6 | Picture Lock | Art Director confirmed — no frame-level changes after this point |
| 7 | Finishing | Color grade, audio mix, subtitles, export |

**Reopening picture lock after finishing has begun requires a full new export cycle and new delivery log entries.**

---

## Color Grading Protocol — Scope-First

1. Open waveform monitor and vectorscope before touching any color tools.
2. Color correction node (first): set black level 0–5 IRE; highlights 90–95 IRE; skin tones on the skin tone line of the vectorscope; neutral white balance.
3. Color grade node (second): apply LUT or manual creative grade. Never apply a grade to uncorrected footage.
4. Record scope readings in the delivery log entry: black IRE, highlight IRE, skin tone line (yes/no).

**No color grade is "complete" without scope readings documented.**

---

## Audio Mixing Levels — Broadcast Standard

| Layer | Target level | Notes |
|---|---|---|
| Dialogue / Voiceover | -12 dB to -6 dB LUFS peak | Primary layer — must be intelligible above all else |
| Music bed (under dialogue) | -20 dB LUFS | Minimum 8 dB below dialogue |
| SFX | -10 dB to -15 dB peak | Contextual — impact sounds may peak higher momentarily |
| Master output (integrated) | -14 LUFS | YouTube / Apple / Spotify normalization standard |

Verify with integrated loudness meter before declaring audio mix complete. State the integrated LUFS reading in the delivery log entry.

Apply J-cuts (audio enters before cut) and L-cuts (audio continues past cut) at scene transitions — eliminates hard audio edges.

---

## Platform Export Specification Table

| Platform | Resolution | Aspect ratio | Frame rate | Codec | Container | Max file size | Notes |
|---|---|---|---|---|---|---|---|
| YouTube (landscape) | 1920×1080 or 3840×2160 | 16:9 | 24/25/30/60fps | H.264 or H.265 | MP4 | 256 GB | AAC audio, -14 LUFS |
| YouTube Shorts | 1080×1920 | 9:16 | 30 or 60fps | H.264 | MP4 | 256 GB | Max 60s; subtitles burned in recommended |
| Instagram Reels | 1080×1920 | 9:16 | 30fps | H.264 | MP4 | 1 GB | Max 90s; avoid bottom 250px for UI |
| Instagram Feed (video) | 1080×1350 | 4:5 | 30fps | H.264 | MP4 | 1 GB | Max 60s on feed |
| TikTok | 1080×1920 | 9:16 | 30fps | H.264 | MP4 | 287.6 MB (under 10min) | Subtitles burned in recommended |
| LinkedIn (video) | 1920×1080 or 1080×1920 | 16:9 or 9:16 | 30fps | H.264 | MP4 | 5 GB | Max 10min feed; 3min recommended |
| Twitter/X | 1920×1080 | 16:9 | 30fps | H.264 | MP4 | 512 MB | Max 2:20 (140s) |
| Facebook (Reels) | 1080×1920 | 9:16 | 30fps | H.264 | MP4 | 4 GB | Max 90s |

**One export per platform variant. Do not deliver a single master file and expect the platform to resize.**

---

## Subtitle Format Requirements

| Delivery context | Format | Notes |
|---|---|---|
| Short-form (≤60s) | Burned-in | Default — 85% of users watch without sound on mobile |
| Long-form (>60s) | SRT file alongside MP4 | Platform renders on-demand; do not burn in unless brief specifies |
| Ad creative | Burned-in | Required — ads autoplay muted |
| LinkedIn | SRT preferred | Platform supports native subtitles; burning in reduces flexibility |

Caption placement: lower third zone, minimum 10% from bottom edge. Font size: minimum 28pt at 1080px canvas for readability on mobile.

---

## Proxy Generation Settings

For footage above 4K or when editing on a machine without dedicated GPU:
- Proxy codec: ProRes Proxy (Mac) or DNxHR LB (Windows/cross-platform)
- Proxy resolution: 1/4 of source resolution
- Naming: match source filename + `_proxy` suffix
- Folder: `/proxies` within project folder

Relink proxies before export — export must be from original source, not proxy files.
