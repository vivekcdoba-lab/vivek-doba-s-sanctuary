# Technical SEO foundation follow-up

## Goal
Ensure every indexable public page ships readable HTML, complete page-specific metadata and valid structured data without changing page layouts.

## Implementation
1. **Prerender every public page**
   - Keep the existing build-time prerender pipeline and verify it emits real HTML for the homepage, all named public pages, every course, the current product, and every published blog post.
   - Keep `/admin`, `/login`, authenticated dashboards, token pages, and other private screens out of prerendering and the sitemap.
   - Make dynamic route discovery resilient so published blog posts and products are included automatically.

2. **Normalize metadata**
   - Preserve the requested homepage title and use the corrected approved review count of **805+**, not the superseded 840+ figure.
   - Verify unique titles, descriptions, self-referencing `https://vivekdoba.com` canonicals, Open Graph/Twitter tags, and English document language on every public page.
   - Remove obsolete keywords/video metadata and retain the existing 1200×630 Vivek Doba/Life’s Golden Triangle share image.

3. **Validate structured data**
   - Verify site-wide Organization and Person data, ProfessionalService on Home and Contact, BreadcrumbList on public pages, FAQPage where FAQs are visible, Article on posts, and Product on product pages.
   - Use only confirmed business details. Do not invent coordinates or opening hours.

4. **Crawler files and 404**
   - Keep robots open to public pages while disallowing `/admin` and `/login`.
   - Regenerate the sitemap from indexable prerendered routes. Remove build-date `lastmod` values unless a page-specific authoritative date exists.
   - Verify the friendly catch-all page is noindex and links to Home, Courses, and Contact.
   - Add the requested Google verification placeholder to the static document head for later replacement with the real code.

5. **Performance without redesign**
   - Audit public images for WebP delivery, explicit dimensions, below-fold lazy loading, and correct hero priority/preload.
   - Reduce safe, demonstrably unused public-page code and avoid visual or business-logic changes.

6. **Proof and report**
   - Run the production build and validate every generated public HTML file contains its H1, text, links, metadata, and parseable JSON-LD.
   - Measure Lighthouse mobile for the homepage and representative key pages before and after.
   - Provide the first 60 lines of the generated homepage source, final scores, remaining user-supplied inputs, and the completed inventory report.

## Important constraints
- No page-design changes.
- Keep **805+ reviews**, the latest confirmed number.
- Keep unknown business hours and coordinates omitted rather than fabricated.
- Performance 90+ is a target, not a guaranteed score; report measured results honestly.