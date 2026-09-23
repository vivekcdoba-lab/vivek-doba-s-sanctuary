# Dynamic SEO Blog Rebuild

## Goal
Turn `/blog` into the site’s search-focused article hub, backed by admin-managed draft and published posts, without changing other public sections.

## What will be built

### 1. Blog content model
- Add a new `public.posts` table with the requested title, slug, excerpt, cover image, Markdown body, category, tags, author, publish date, SEO fields, related course, and publish status.
- Add safe defaults, unique slugs, category validation, publication indexes, explicit data-access grants, and strict rules: visitors can read published posts only; admins can manage all posts.
- Seed the six requested articles as unpublished drafts with useful English outlines only, their matching categories, SEO drafts, and related course slugs.
- Leave the older `blog_posts` table intact under the project’s preservation policy, but move the public and admin blog experience to `posts`.

### 2. Public blog index
- Rebuild `/blog` with the exact H1: **Blog: Business, Health and Family, in Balance**.
- Add category filters for Business Growth, Leadership, Mindset, Health, Family, and Sales.
- Show published posts as image-led cards with excerpt, category, author, date, reading time, and clear article links.
- Keep a trustworthy empty state while all six initial posts remain drafts.
- Add unique Blog metadata, canonical/social tags, breadcrumb data, and accessible structure.

### 3. Article page
- Rebuild `/blog/:slug` with cover image, one H1, author box using Vivek Doba’s existing photo, reading time, generated table of contents, and rendered Markdown.
- Add share links, a related-program card sourced from the matching course, and up to three related published articles.
- Add per-post metadata plus Article and Breadcrumb structured data.
- Draft or unknown slugs will not leak unpublished content publicly and will show the existing not-found experience.

### 4. Admin editor
- Add a dedicated `/admin/posts` page for creating, editing, previewing, publishing, and deleting posts.
- Include category selection, tag editing, course relation, SEO title/description, Markdown body editing, publication date, and WebP cover upload capped at 1600px.
- Keep `/admin/blog` as a redirect to `/admin/posts` so old bookmarks continue working.

### 5. Search visibility and build output
- Extend prerendering and sitemap generation to discover every published `/blog/:slug` route.
- Keep drafts excluded from public queries, prerendered output, sitemap, and search indexing.
- Preserve original `published_at` dates when the selected Blogspot articles are imported later; translation/import is not part of this step.

## Validation
- Verify admin-only draft access and public draft isolation.
- Verify category filtering, Markdown headings/table of contents, course relation, sharing links, metadata, Article JSON-LD, and related posts.
- Run type checks and the production build, then confirm published article HTML is prerendered when published posts exist.

# Contact Page Rebuild

## What will be built
- Rebuild `/contact` with the requested H1, three prominent Call, WhatsApp, and Email actions, while retaining the established brand styling.
- Expand the contact form with name, phone, email, business type, turnover range, dynamic course interest, and message fields, with clear validation and safe length limits.
- Extend the existing `contact_submissions` record additively for the new fields; keep public submission-only access and admin-only reading.
- Trigger an admin notification through the existing email setup after a successful save, while ensuring the enquiry is still saved if email delivery temporarily fails.
- Show the requested success message with the response-time placeholder until a confirmed time is supplied.
- Use the shared business-name, address, phone, and email constants so the Contact page, footer, and structured data stay identical.
- Add opening hours, a lazy Google Maps embed, directions link, three FAQs, FAQ schema, LocalBusiness data, breadcrumb data, and unique Contact metadata.

## Missing facts
Because the details question was skipped, no facts will be invented. The page will use the existing confirmed email `info@vivekdoba.com`, the shared Pune address and phone, and visible placeholders for `[LOCALITY]`, `[HOURS]`, and `[24 HOURS]` until confirmed. The map will use the confirmed address rather than invented coordinates.

## Validation
- Verify form validation, database save, notification response, success/error states, phone/WhatsApp/email actions, dynamic course list, exact shared contact details, map loading, and structured data.
- Run type checks and the production build; verify desktop and mobile layouts.
