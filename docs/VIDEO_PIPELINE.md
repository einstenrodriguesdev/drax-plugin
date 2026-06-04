# Video Pipeline

## Contract

Every video begins with an approved content brief and a versioned asset manifest. The renderer must produce deterministic output or record every nondeterministic input. Output files are hashed before publishing.

## Rendering Modes

### `python-ffmpeg`

Default production path for programmatic motion graphics. Pillow builds deterministic frames and FFmpeg encodes H.264 output. It is suitable for Linux, low-resource VPS environments, and ARM64.

Gate: preview frames, font availability, duration, frame count, audio levels, encode compatibility, and final hash pass.

### `remotion`

Optional TypeScript/React path for richer reusable motion systems. It adds browser/runtime and dependency cost, so it is selected only when the content format justifies that complexity.

Gate: pinned browser/runtime, deterministic props, render timeout, memory ceiling, and fallback export pass.

### `ffmpeg-template`

Contingency path for a background, images, captions, narration, music, and sound effects assembled directly by FFmpeg.

Gate: caption legibility, audio ducking, licensed inputs, duration, and platform format pass.

## Audio And Sound

- narration and music are separate inputs
- every music and sound-effect asset records its license and source
- loudness is normalized per channel target
- narration remains intelligible without relying on music
- captions are generated, reviewed, and included in the export package

## Failure Behavior

A renderer failure never triggers an unreviewed substitute post. The content package remains available for another renderer or manual export. Missing fonts, codecs, or binaries fail before the full render begins.
