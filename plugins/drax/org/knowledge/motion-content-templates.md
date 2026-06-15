# Parametric Video Template Design
> Domain knowledge for Motion Designer agent
> Status: stub | Created: 2026-04-25 | Applies to: Motion Designer
> Source refs: remotion.dev/docs/schemas, remotion.dev/docs/parameterized-rendering, remotion.dev/docs/calculate-metadata, remotion.dev/docs/lambda/rendermediaonlambda, remotion.dev/docs/dataset-render, remotion.dev/docs/visual-editing

---

## What this doc covers

Designing Remotion compositions as reusable, data-driven templates:
- Zod schema patterns for typed, editable props
- Data-driven video design principles
- `calculateMetadata()` for dynamic duration
- Render pipeline integration (`renderMediaOnLambda`, dataset renders)
- Template naming conventions
- Delivery log schema
- Campaign batch render pattern

---

## Zod Schema for Props

Every composition must define a Zod schema. This enables: (a) Remotion Studio visual editing UI, (b) type-safe inputProps for server-side renders, (c) JSON-serializability guarantee.

```ts
// src/compositions/product-launch.schema.ts
import { z } from 'zod';

export const productLaunchSchema = z.object({
  // Copy fields
  headline: z.string().default('Your Headline Here'),
  subheadline: z.string().default('Supporting message'),
  ctaText: z.string().default('Learn More'),

  // Brand tokens
  accentColor: z.string().default('#FF5A1F'),
  backgroundColor: z.string().default('#0F0F0F'),
  logoUrl: z.string().url().default('https://example.com/logo.png'),

  // Motion control
  springPreset: z.enum(['snappy', 'standard', 'soft']).default('standard'),

  // Data-driven fields (if applicable)
  dataPoints: z.array(z.object({
    label: z.string(),
    value: z.number(),
  })).optional(),
});

export type ProductLaunchProps = z.infer<typeof productLaunchSchema>;

export const defaultProps: ProductLaunchProps = productLaunchSchema.parse({});
```

**Rules:**
- All string color values: HEX format (`#RRGGBB`)
- All URL values: `z.string().url()` — validates at schema level
- All optional data fields: `.optional()` — never `z.any()`
- No functions, class instances, or React elements in schema — JSON-serializable only
- `defaultProps` is always the schema's default-parsed object

---

## Passing Props to Compositions

### In Remotion Studio (visual editing)
Schema-validated props appear as editable UI controls in Studio when `schema` prop is passed to `<Composition>`.

### Via CLI render
```bash
npx remotion render src/index.ts product-launch output/reel.mp4 \
  --props='{"headline":"Launch Day","accentColor":"#FF5A1F","springPreset":"snappy"}'
```

### Via renderMediaOnLambda (server-side)
```ts
import { renderMediaOnLambda } from '@remotion/lambda/client';

const { renderId, bucketName } = await renderMediaOnLambda({
  region: 'us-east-1',
  functionName: 'remotion-render-fn',
  composition: 'product-launch',
  serveUrl: 'https://[your-remotion-deploy].vercel.app',
  inputProps: {
    headline: 'Launch Day',
    accentColor: '#FF5A1F',
    springPreset: 'snappy',
  },
  codec: 'h264',
  downloadBehavior: { type: 'download', fileName: 'reel.mp4' },
});
```

---

## Dynamic Duration with calculateMetadata()

Used when video duration depends on the data passed as props (e.g., number of items in a list, length of narration text).

```tsx
import { calculateMetadata } from 'remotion';
import { productLaunchSchema } from './product-launch.schema';

export const calculateDuration = calculateMetadata({
  component: ProductLaunchVideo,
  defaultProps: productLaunchSchema.parse({}),
  calculateMetadata: async ({ props }) => {
    const fps = 30;
    // Duration: 3s base + 0.5s per data point
    const durationInFrames = Math.round(
      fps * (3 + (props.dataPoints?.length ?? 0) * 0.5)
    );
    return { durationInFrames };
  },
});
```

Pass to `<Composition calculateMetadata={calculateDuration} />` — omit static `durationInFrames` when using calculateMetadata.

---

## Dataset Render Pattern (Campaign Batch)

For campaigns requiring many videos from a data source (e.g., one reel per product in a catalog):

```ts
// scripts/batch-render.ts
import { renderMediaOnLambda } from '@remotion/lambda/client';
import products from './data/products.json';

for (const product of products) {
  await renderMediaOnLambda({
    composition: 'product-launch',
    inputProps: {
      headline: product.name,
      subheadline: product.tagline,
      accentColor: product.brandColor,
      logoUrl: product.logoUrl,
    },
    downloadBehavior: {
      type: 'download',
      fileName: `reel-${product.slug}-${new Date().toISOString().slice(0,10)}.mp4`,
    },
  });
}
```

---

## Template Naming Convention

### Source files
```
src/compositions/[platform]-[format]-[content-type].tsx
src/compositions/[platform]-[format]-[content-type].schema.ts
```
Examples:
- `src/compositions/reels-9x16-product-launch.tsx`
- `src/compositions/feed-1x1-engagement-quote.tsx`
- `src/compositions/linkedin-16x9-thought-leadership.tsx`

### Rendered output files
```
output/[platform]-[format]-[content-type]-[YYYY-MM-DD].mp4
```
Examples:
- `output/reels-9x16-product-launch-2026-05-01.mp4`
- `output/feed-1x1-engagement-quote-2026-05-03.mp4`

### Composition IDs (in src/index.ts)
```
[platform]-[format]-[content-type]
```
Examples:
- `reels-9x16-product-launch`
- `feed-1x1-engagement-quote`

---

## Delivery Log Schema

```markdown
# Animation Delivery Log
> Owner: Motion Designer | Updated: YYYY-MM-DD

| File name | Platform | Format | Pillar | Composition ID | Brief ref | Rendered | Brand conflicts | Props hash |
|---|---|---|---|---|---|---|---|---|
| reels-9x16-product-launch-2026-05-01.mp4 | Instagram Reels | 1080×1920 9:16 | promotional | reels-9x16-product-launch | brief-2026-W18-01 | 2026-05-01 14:32 | none | d4f3a1... |
```

**Props hash**: MD5 or SHA-1 of the JSON-stringified inputProps used for the render — enables exact reproduction of any rendered file.

---

## Motion Template Map Structure

Minimal required fields per template entry:

| Field | Required | Description |
|---|---|---|
| Composition ID | Yes | Registered ID in src/index.ts |
| Source file path | Yes | src/compositions/[filename].tsx |
| Schema file path | Yes | src/compositions/[filename].schema.ts |
| Platform | Yes | Instagram Reels, TikTok, YouTube Shorts, etc. |
| Dimensions | Yes | WxH px and aspect ratio |
| fps | Yes | 30 standard; 60 for high-quality exports |
| durationInFrames formula | Yes | e.g., `fps * 8` for 8-second reel |
| Scene list | Yes | Sequence names, from/durationInFrames |
| Spring presets used | Yes | snappy/standard/soft per scene |
| Parametric props | Yes | List of Zod schema fields |
| Sample render command | Yes | CLI command with sample props |

---

## Status note

This is a stub. Content above is derived from Remotion official documentation on schemas, parameterized rendering, calculateMetadata, and Lambda. On 90-day review, verify: Zod version compatibility with latest Remotion (Remotion locks to specific Zod versions), Lambda API changes (renderMediaOnLambda signature), dataset render tooling updates, and any new Remotion Studio visual editing capabilities.
