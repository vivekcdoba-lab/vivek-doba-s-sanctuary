# Technical SEO Foundation Upgrade

## Goal
Make every public landing page ship crawlable HTML with its real headings, copy, links, metadata, and structured data, without changing existing page designs.

## Implementation

### 1. Build-time HTML generation
- Add a post-build prerender script that runs the built Vite app in a headless browser, waits for page content and data to settle, then writes complete HTML files into `dist/<path>/index.html`.
- Use an explicit public-route allowlist and discover published course and blog slugs from the public database during the build.
- Include `/`, `/about`, `/courses`, every published `/courses/:slug`, `/shop`, `/gallery`, `/blog`, every published `/blog/:slug`, `/contact`, `/testimonials`, `/score`, and the existing public SEO pages.
- Exclude `/login`, protected pages, token links, account pages, and all admin/seeker/coach areas.
- Preserve normal client-side behavior after load and fail the build if a required page cannot be rendered.
- Verify that generated files contain each page’s H1, text, links, final Helmet tags, and JSON-LD.

### 2. Shared metadata system
- Add one reusable Helmet-based public SEO component with self-referencing canonical URLs on `https://vivekdoba.com`, no trailing slash except `/`, Open Graph, Twitter, `lang="en"`, BreadcrumbList, and optional page schemas.
- Apply it to every public page, including existing SEO landing pages and dynamic blog posts.
- Use the supplied titles/descriptions exactly where provided, shortening only titles that exceed 60 characters and descriptions that exceed 160 characters.
- Replace homepage metadata, remove keywords and all `og:video` tags, and keep the verified 1200×630 WebP share image.
- Add the Google verification placeholder requested; it remains a placeholder until the real token is supplied.

### 3. Structured data
- Keep site-wide Organization and Person schemas, update names, job title, URLs, logo, and supplied social profiles.
- Add ProfessionalService to Home and Contact using the supplied Pune address, phone, service areas, and price range.
- Do not invent geo coordinates or opening hours; those fields will remain omitted until exact values are supplied.
- Add BreadcrumbList to every public page, FAQPage only where matching FAQs are visible, Course schemas to course pages, and Article + Person author schemas to published blog posts.

### 4. New public pages and 404
- Create `/testimonials` and `/score` in the existing public visual style, using real existing testimonial/gallery data and an explanatory Golden Triangle score entry point rather than invented claims.
- Add both routes to navigation only where an existing relevant link slot exists; otherwise they remain directly accessible and sitemap-listed.
- Upgrade the friendly 404 with Home, Courses, and Contact links plus Helmet `noindex, follow` metadata.
- Preserve the platform’s SPA fallback; note that a true HTTP 404 status for arbitrary paths remains hosting-controlled.

### 5. Sitemap and crawler rules
- Replace the manually maintained sitemap with the existing mechanism only after preserving its role: generate it before dev/build from the same public route list and published course/blog records.
- Use page-specific authoritative timestamps for blog/course `lastmod`; omit `lastmod` when no reliable content timestamp exists.
- Exclude login, protected, token, redirect-only, and private routes.
- Update robots rules while preserving named crawler blocks: allow public content, disallow `/admin` and `/login`, and retain `Sitemap: https://vivekdoba.com/sitemap.xml`.

### 6. Image and loading performance
- Audit public-page images only; convert local raster assets to WebP where this reduces size without visible loss.
- Add intrinsic width/height, descriptive alt text, lazy loading below the fold, and high-priority loading only for each page’s main image.
- Preload the homepage main image and optimize font loading without changing typography or layouts.
- Remove only demonstrably unreachable public-page code; do not alter protected product features.

### 7. Verification and reporting
- Capture mobile Lighthouse baselines for every requested public route before changes, then rerun after changes and report actual Performance, SEO, and Accessibility scores without claiming 90+ where external media or runtime data prevents it.
- Run focused type/tests and browser checks for desktop/mobile page rendering, metadata uniqueness and limits, canonicals, schema validity, image loading, internal links, robots, sitemap, and no console/network errors.
- Inspect the built `dist` output directly and provide the first 60 lines of the generated homepage source showing visible page content.
- Re-run the current SEO foundations scan and mark only fully corrected findings as fixed.

## Known constraints
- Published blog data is currently empty, so the generator will support blog post discovery but produce no `/blog/:slug` files until a post is published and the site is rebuilt/published.
- Admin content changes require a new publish to refresh build-generated HTML and sitemap entries.
- Exact geo coordinates, opening hours, and the Search Console verification token were not supplied; they will not be fabricated.
- The changes reach `vivekdoba.com` only after publishing.
