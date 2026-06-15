# SEO Technical Audit
> Status: stub | Created: 2026-04-26 | Owner: SEO Manager
> Applies to: SEO Manager, CTO, Full Stack Developer
> Source: HR research — Screaming Frog industry standard documentation, Google Search Console Coverage report methodology, Core Web Vitals thresholds (Google PageSpeed documentation), structured data validation protocols (schema.org + Google Rich Results Test)

---

## Purpose

This doc covers the technical SEO audit protocol: how to crawl the site, what to look for, how to classify findings by severity, and how to issue fix briefs to the engineering agent. Loaded REQUIRED before any technical audit or site migration SEO review.

---

## 1. Screaming Frog Crawl Setup and Interpretation

### Crawl configuration (standard)

- Crawl mode: Spider
- Respect robots.txt: YES (to audit what Googlebot actually sees)
- Max URL: set to 0 (unlimited) for sites under 50k pages; set to 50,000 for larger sites
- Rendering: JavaScript rendering enabled if the site uses client-side routing (Next.js, React SPA)
- Custom extraction: extract H1, H2, meta description, canonical tag, noindex, structured data presence
- Crawl depth: unlimited (to find orphan pages and deep crawl issues)

### Export checklist after crawl

- [ ] All pages — internal: the full page inventory
- [ ] Response codes: filter for 3xx, 4xx, 5xx
- [ ] Redirects: full redirect chain map
- [ ] Canonical: pages where canonical tag is present; flag canonical-to-different-URL
- [ ] Directives: filter for noindex, nofollow pages — verify no production pages are noindexed
- [ ] H1: flag pages with missing H1, duplicate H1, multiple H1 tags
- [ ] Meta description: flag missing, duplicate, or truncated (>155 characters)
- [ ] Page titles: flag missing, duplicate, or too long (>60 characters)
- [ ] Structured data: flag pages where structured data is absent and it should be present per schema requirement

---

## 2. P1/P2/P3 Severity Taxonomy

### P1 — Blocking Indexation (fix immediately; blocks organic performance entirely)

| Issue type | Description | Detection method |
|---|---|---|
| Noindex on production pages | Key pages (homepage, pillar pages, landing pages, product pages) have `noindex` meta tag or X-Robots-Tag header | Screaming Frog Directives export + GSC Coverage report |
| Robots.txt blocking key sections | `/blog`, `/products`, or other key sections disallowed in robots.txt | Screaming Frog robots.txt audit + manual robots.txt review |
| Canonical pointing away from the page | Key pages have a canonical tag pointing to a different URL, telling Google to index the other URL instead | Screaming Frog Canonical export — filter for canonical ≠ self |
| Site not indexed | Google Search Console shows 0 or near-0 indexed pages; the site is effectively invisible | GSC Index Coverage → "Indexed" count |
| HTTP → HTTPS not forced | Site serves content over HTTP without redirect; Google de-prioritizes non-HTTPS sites | Test: load http://[domain] and verify 301 redirect to https:// |

### P2 — Degrading Rankings (fix within 2 sprints)

| Issue type | Description | Detection method |
|---|---|---|
| Redirect chains > 2 hops | Page A → Page B → Page C = 2-hop chain; each hop loses ~15–20% of link equity | Screaming Frog Redirects export; flag chains with 2+ redirects |
| Soft 404 (200 response, no content) | Pages returning 200 OK but containing "page not found" text — Google eventually de-indexes | GSC Coverage → "Excluded: Not found (404)" vs. actual 200 status |
| Duplicate content (without canonical) | Multiple URLs serving identical or near-identical content without a canonical tag | Screaming Frog duplicate H1/title detection; manual audit of paginated pages, tag pages, parameter URLs |
| Missing or thin pillar/cluster pages | Pillar page is under 1,500 words; cluster pages are under 800 words | Screaming Frog word count analysis; filter for pages with <1,000 words |
| Core Web Vitals: "Needs Improvement" or "Poor" on key page types | LCP > 2.5s, INP > 200ms, or CLS > 0.1 on pillar/landing pages | GSC Core Web Vitals report; PageSpeed Insights per page type |
| Broken internal links | Links from one page to another that return 4xx errors | Screaming Frog → Response Codes → 4xx; filter for internal links |
| Missing meta descriptions on key pages | Pillar pages, landing pages, product pages without meta descriptions | Screaming Frog Meta Description export → filter for "Missing" |

### P3 — Hygiene / Best Practice (fix within 60 days)

| Issue type | Description | Detection method |
|---|---|---|
| Missing schema on blog posts | Blog posts missing Article + BreadcrumbList schema | Screaming Frog Structured Data export; Google Rich Results Test |
| Image alt text missing | Key images (hero images, product screenshots, infographics) missing alt text | Screaming Frog Images export → filter for missing alt text |
| H1 missing on secondary pages | Category pages, tag pages, paginated pages missing H1 | Screaming Frog H1 export → filter for "Missing" |
| Orphan pages | Pages with no internal links pointing to them | Screaming Frog → Bulk Export → All Inlinks → identify pages with 0 inlinks |
| Low word count on cluster pages (500–800 words) | Not thin enough to be P2 but below the 1,200-word cluster page spec | Word count analysis |

---

## 3. Core Web Vitals Measurement Protocol

### Thresholds

| Metric | Good | Needs Improvement | Poor |
|---|---|---|---|
| LCP (Largest Contentful Paint) | ≤ 2.5s | 2.5s – 4.0s | > 4.0s |
| INP (Interaction to Next Paint) | ≤ 200ms | 200ms – 500ms | > 500ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | 0.1 – 0.25 | > 0.25 |

### Measurement sources

1. **Google Search Console**: Core Web Vitals report — shows field data (real user measurements, 28-day rolling). The authoritative source for ranking impact. Broken down by mobile and desktop, by page type.
2. **PageSpeed Insights**: Lab data (simulated measurements) + field data. Use for individual page diagnosis. URL: https://pagespeed.web.dev/
3. **Screaming Frog**: Can integrate with PageSpeed Insights API to run LCP/INP/CLS at scale across the full site crawl.

### Fix classification by CWV issue

| CWV issue | Common causes | Fix owner |
|---|---|---|
| LCP > 2.5s | Unoptimized hero images, render-blocking scripts, slow server response time | Engineering (image optimization, lazy loading, CDN configuration) |
| INP > 200ms | Heavy JavaScript execution, long tasks on page load, event handler performance | Engineering (JS profiling, code splitting, debouncing) |
| CLS > 0.1 | Images/ads without specified dimensions, fonts causing FOUT, late-loading embeds | Engineering (explicit width/height on images, font-display: swap) |

---

## 4. Canonicalization Audit Methodology

### Canonical tag rules

- Every page must have a self-referencing canonical tag unless it is intentionally a duplicate (in which case the canonical points to the preferred URL)
- Paginated pages: use canonical pointing to the first page of the paginated series, OR use `rel="next"` / `rel="prev"` (Google deprecated these but they still signal intent)
- Print versions, AMP versions: canonical points to the main page
- HTTP and HTTPS versions: canonical must specify HTTPS; all HTTP URLs redirect 301 to HTTPS

### Canonicalization conflict detection

A canonicalization conflict occurs when:
- A page has a canonical pointing to Page B, but Page B has a canonical pointing back to Page A (circular)
- A page is linked to extensively (has backlinks and internal links) but has a canonical pointing to a lower-authority page — link equity is being sent to the wrong page
- A page is noindexed AND has a canonical pointing to a different page — conflicting directives; Google ignores noindex pages for canonicalization

Use Screaming Frog Canonical export cross-referenced with inlinks count to detect these.

---

## 5. Crawl Budget Allocation Framework

### When crawl budget matters

Crawl budget only matters for sites with 10,000+ pages. Below this threshold, Google typically crawls the full site regularly. Above this threshold, Googlebot's allocated crawl rate is finite; pages not reached in each crawl cycle take longer to get indexed.

### Crawl budget calculation

```
Estimated crawl budget = [domain's Googlebot crawl rate from GSC] × [average crawl session duration]
```

The Crawl Stats report in Google Search Console shows: average page crawled per day, response time, and crawl requests by type.

### Priority allocation

| Page tier | Crawl priority | Method |
|---|---|---|
| Tier 1: pillar pages, landing pages, product pages, homepage | Highest | Linked from homepage and sitemaps; low crawl depth (≤3 clicks from homepage) |
| Tier 2: cluster pages, blog posts | High | Linked from pillar pages; in XML sitemap |
| Tier 3: category pages, tag pages, paginated pages | Low | Link juice managed; paginated pages beyond page 3 may not need sitemap inclusion |
| No-value pages: thin duplicates, internal search results, parameter URLs | Exclude | robots.txt disallow or noindex; remove from XML sitemap |

### Programmatic pages crawl budget rule

Programmatic pages must not exceed 40% of crawl budget without a hub page architecture:
- Create hub pages (index pages listing all programmatic pages by category)
- Hub pages in sitemap; individual programmatic pages linked from hub pages
- Submit sitemap to GSC; monitor Crawl Stats for crawl frequency of programmatic pages

---

## 6. Structured Data Validation Checklist

### Pre-publish validation

- [ ] All schema types tested in Google's Rich Results Test: https://search.google.com/test/rich-results
- [ ] JSON-LD format used (not Microdata or RDFa — JSON-LD is Google's preferred format)
- [ ] No errors in Rich Results Test (warnings are acceptable; errors block rich result eligibility)
- [ ] Schema types match page content (Article schema on a product page = incorrect)
- [ ] Organization schema on homepage: includes name, url, logo, contactPoint
- [ ] Article schema on blog posts: includes datePublished, dateModified, author, publisher
- [ ] FAQPage schema: question and acceptedAnswer correctly mapped; no more than 8 FAQ items (Google's rich result limit for FAQs)
- [ ] BreadcrumbList schema: matches actual URL structure; each breadcrumb item has a valid URL

### Schema.org validator

Secondary validation: https://validator.schema.org/ — tests for schema completeness against the Schema.org specification (not just Google's Rich Results eligibility).

---

## Status legend

This is a stub document. The fix instruction templates and crawl budget benchmarks above are structurally complete. Populate the "pages affected" and "actual thresholds" fields from the first site crawl and Google Search Console audit when the SEO Manager is first activated for this domain.
