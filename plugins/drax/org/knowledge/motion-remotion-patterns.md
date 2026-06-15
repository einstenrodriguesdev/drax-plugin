# Remotion Core Patterns
> Domain knowledge for Motion Designer agent
> Status: stub | Created: 2026-04-25 | Applies to: Motion Designer
> Source refs: remotion.dev/docs/spring, remotion.dev/docs/interpolate, remotion.dev/docs/use-current-frame, remotion.dev/docs/use-video-config, remotion.dev/docs/sequence, remotion.dev/docs/composition, remotion.dev/docs/calculate-metadata, remotion.dev/docs/reusability

---

## What this doc covers

Core Remotion API patterns required to build any composition:
- `useCurrentFrame()` / `useVideoConfig()` hooks
- `spring()` — physics-based animation
- `interpolate()` — keyframe mapping with clamping
- `<Sequence>` — scene isolation and time-shifting
- `<Composition>` — composition registration
- `calculateMetadata()` — dynamic duration from data
- FPS-safe timing formulas
- Spring preset definitions
- Reusability pattern
- Render CLI commands

---

## Core Hooks

### useCurrentFrame()

Returns the current frame number, 0-indexed. Inside a `<Sequence>`, returns frame relative to the Sequence start (not global composition frame).

```tsx
import { useCurrentFrame } from 'remotion';
const frame = useCurrentFrame();
```

### useVideoConfig()

Returns composition metadata: `fps`, `durationInFrames`, `width`, `height`.

```tsx
import { useVideoConfig } from 'remotion';
const { fps, durationInFrames, width, height } = useVideoConfig();
```

**FPS-safe timing rule:**
Never use raw frame numbers for duration calculations. Always:
```tsx
const fadeDuration = Math.round(fps * 0.5); // 0.5 seconds, any fps
const holdDuration = Math.round(fps * 2);   // 2 seconds, any fps
```

---

## spring()

Physics-based animation. Animates from 0 to 1 by default.

```tsx
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

const progress = spring({
  frame,
  fps,
  config: {
    mass: 1,
    damping: 10,
    stiffness: 100,
  },
});
// Use: opacity, translateY, scale, etc.
const translateY = (1 - progress) * 60; // slides in from 60px below
```

### Spring Preset Conventions

Define in `src/lib/motion-presets.ts`:

```ts
import { SpringConfig } from 'remotion';

export const SPRING_PRESETS: Record<string, SpringConfig> = {
  snappy: { mass: 0.5, damping: 12, stiffness: 200 }, // UI feedback, fast in
  standard: { mass: 1, damping: 10, stiffness: 100 }, // content transitions
  soft: { mass: 1.5, damping: 8, stiffness: 60 },     // brand hero moments
};
```

**Rule:** always source from `SPRING_PRESETS`. Never use inline `config` objects in components.

---

## interpolate()

Maps a range of input values to a range of output values. Use for opacity, scale, position at specific keyframes.

```tsx
import { interpolate, Easing, useCurrentFrame } from 'remotion';

const frame = useCurrentFrame();

const opacity = interpolate(
  frame,
  [0, 20],          // input range: frames 0 to 20
  [0, 1],           // output range: 0 to 1
  {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  }
);
```

**Always use clamp** on both sides to prevent values from going outside the output range before or after the keyframe window.

---

## `<Sequence>`

Wraps children and time-shifts their `useCurrentFrame()` by `from` frames. Children receive frame=0 when global frame=`from`.

```tsx
import { Sequence } from 'remotion';

// Scene 1: frames 0–89 (3s at 30fps)
<Sequence from={0} durationInFrames={Math.round(fps * 3)}>
  <IntroScene />
</Sequence>

// Scene 2: starts at frame 60, overlaps with scene 1 for 30 frames
<Sequence from={60} durationInFrames={Math.round(fps * 4)}>
  <ContentScene />
</Sequence>
```

**Rule:** every distinct scene or reusable block must be a Sequence. No flat compositions.

---

## `<Composition>`

Registers a video composition. Required props: `id`, `component`, `fps`, `width`, `height`, `durationInFrames`, `defaultProps`. Use `schema` for Zod-validated props.

```tsx
import { Composition } from 'remotion';
import { MyVideo, mySchema, defaultProps } from './MyVideo';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="reels-product-launch"
      component={MyVideo}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={Math.round(30 * 8)} // 8 seconds
      schema={mySchema}
      defaultProps={defaultProps}
    />
  </>
);
```

---

## calculateMetadata()

Derives composition metadata (duration, dimensions, fps) from async data. Used for data-driven videos where duration depends on content length.

```tsx
import { calculateMetadata } from 'remotion';

export const calculateMyMetadata = calculateMetadata({
  component: MyVideo,
  defaultProps,
  calculateMetadata: async ({ props }) => {
    const wordCount = props.text.split(' ').length;
    const durationInFrames = Math.round(30 * (wordCount * 0.4)); // 0.4s per word
    return { durationInFrames };
  },
});
```

Pass to `<Composition calculateMetadata={calculateMyMetadata}>`.

---

## Render CLI Commands

### Local render
```bash
npx remotion render src/index.ts [composition-id] output/[filename].mp4
# With input props:
npx remotion render src/index.ts [id] output/[filename].mp4 \
  --props='{"headline":"Launch Day","accentColor":"#FF5A1F"}'
# Specify concurrency:
npx remotion render src/index.ts [id] output/[filename].mp4 --concurrency=4
```

### Preview in Studio
```bash
npx remotion studio
```

### List compositions
```bash
npx remotion compositions src/index.ts
```

### Lambda render (when Lambda is deployed)
```bash
npx remotion lambda render --composition=[id] --props='[json]'
```

---

## Reusability Pattern

1. Factor each reusable block into its own component file.
2. Component calls `useCurrentFrame()` — receives relative frame from parent Sequence.
3. Parent composition uses `<Sequence from={x} durationInFrames={y}>` to place it.
4. Component accepts visual props via `props` — no hardcoded values.

```tsx
// Reusable component:
const HeadlineFade: React.FC<{ text: string; color: string }> = ({ text, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, Math.round(fps * 0.5)], [0, 1], {
    extrapolateRight: 'clamp',
  });
  return <div style={{ opacity, color }}>{text}</div>;
};

// In composition:
<Sequence from={30} durationInFrames={Math.round(fps * 3)}>
  <HeadlineFade text={props.headline} color={props.accentColor} />
</Sequence>
```

---

## Platform Dimension Reference

| Platform | Format | Width | Height | Aspect | fps | Max duration |
|---|---|---|---|---|---|---|
| Instagram Reels | 9:16 vertical | 1080 | 1920 | 9:16 | 30 | 90s |
| TikTok | 9:16 vertical | 1080 | 1920 | 9:16 | 30 | 60s (organic) |
| YouTube Shorts | 9:16 vertical | 1080 | 1920 | 9:16 | 30 | 60s |
| Instagram Feed Portrait | 4:5 | 1080 | 1350 | 4:5 | 30 | 60s |
| Instagram Feed Square | 1:1 | 1080 | 1080 | 1:1 | 30 | 60s |
| LinkedIn Video | 16:9 | 1920 | 1080 | 16:9 | 30 | 10min |
| YouTube Standard | 16:9 | 1920 | 1080 | 16:9 | 30 | — |

---

## Status note

This is a stub. Content above is derived from Remotion official documentation and agent skill files (remotion.dev/docs/ai/skills). On 90-day review, verify: API changes in @remotion/mcp, spring() parameter updates, platform dimension changes (especially TikTok and Instagram Reels), and any new calculateMetadata patterns from Remotion changelog.
