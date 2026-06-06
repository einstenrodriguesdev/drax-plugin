# Blog Automation

## Boundary

Drax does not rebuild the customer's existing site. It generates a self-contained Astro editorial blog surface that can be deployed beside the existing site.

Supported attachment modes:

- subpath, such as `/blog`
- subdomain, such as `blog.example.com`

The generated blog is static, stack-independent, and safe to host on common static hosts or behind the customer's existing reverse proxy.

## Generator

```bash
drax blog init \
  --target drax-blog \
  --site-name "Customer Editorial" \
  --site-url "https://example.com" \
  --description "Editorial updates from the company" \
  --mount subpath \
  --base-path /blog
```

If a value is missing, Drax writes `NEEDS_DECISION` into the generated blog configuration. The operator must replace those values before production deployment.

## Generated Surface

The blog generator creates:

- `package.json` with Astro scripts
- `astro.config.mjs`
- typed content collection under `src/content/posts`
- post listing page
- post detail route
- RSS route
- metadata for canonical URLs, Open Graph, publish dates, tags, and cover image
- minimal responsive CSS
- `robots.txt`

## Content Flow

After the founder baseline passes, the V1 marketing team produces article drafts and metadata from `NINETY_POST_PLAN.md` and `EDITORIAL_CALENDAR.md`. Approved posts are written into `src/content/posts/` as Markdown or MDX.

The generated blog can then be built with:

```bash
npm install
npm run build
```

The static output is deployed to the chosen subpath or subdomain. Drax does not post live or change DNS without explicit approval.
