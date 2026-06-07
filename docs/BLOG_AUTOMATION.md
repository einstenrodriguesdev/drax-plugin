# Blog Automation

## Boundary

Drax does not rebuild the customer's existing site. It generates a self-contained Astro editorial blog surface that can be deployed beside the existing site.

Supported attachment modes:

- subpath, such as `/blog`
- subdomain, such as `blog.example.com`

The generated blog is static, stack-independent, and safe to host on common static hosts or behind the customer's existing reverse proxy.

The V1 customer is a founder running the site on a VPS and asking Drax to automate blog deploy on that same machine. Blog deploy is local: build the surface, place it in the approved directory, and use the already configured static server or proxy.

No remote access, remote credentials, or Drax API backend is required for local blog deploy. The safety rule is approval first, backup before write, and never overwrite a working site path without a rollback path.

## Identity Source

The generator does not embed a product identity at build time. It reads identity from the founder workspace artifacts:

- `DISTRIBUTION_PLAN.md`: editorial site name, canonical site URL, editorial description, attachment mode, and public base path
- `PRODUCT_CONTEXT.md`: live URL as fallback for canonical site URL

If a value is absent, the generated blog configuration keeps `NEEDS_DECISION`.

## Generator

```bash
drax blog init --target drax-blog
```

If a value is missing in the founder docs, Drax writes `NEEDS_DECISION` into the generated blog configuration. The operator must resolve those founder docs before production deployment.

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

## Local Deployment Path

Local deploy is central to V1, but it remains gated.

Before deploy, `DISTRIBUTION_PLAN.md` must define the blog target directory, static output directory, public base path, server or proxy, backup directory, approval owner, and rollback command.

The approved deploy sequence is:

1. Build the blog surface.
2. Verify the output directory and metadata.
3. Create a timestamped backup of the target path.
4. Copy the new static output into the approved local directory.
5. Reload the already configured static server or proxy only if the approval covers reload.
6. Write a publish or deploy record with hashes, backup path, operator, and result.

Drax must stop before any step that would overwrite an existing working path without a backup and rollback command.
